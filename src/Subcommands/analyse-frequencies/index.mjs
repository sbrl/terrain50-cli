"use strict";

import fs from 'fs';

import Terrain50 from 'terrain50';

import a from '../../Helpers/Ansi.mjs';
import l from '../../Helpers/Log.mjs';

import { percentage } from '../../Helpers/MathsHelpers.mjs';
import { write_safe, end_safe } from '../../Helpers/StreamHelpers.mjs';

export default async function(settings) {
	// 1: Parse settings
	let stream_in = process.stdin;
	if(settings.cli.input !== "-") {
		l.log(`Reading from ${a.hicol}${settings.cli.input}${a.reset}`);
		stream_in = fs.createReadStream(settings.cli.input);
	}
	else
		l.log(`Reading from stdin`);
	
	let stream_out = process.stdout; 
	if(settings.cli.output !== "-") {
		l.log(`Writing to ${a.hicol}${settings.cli.output}${a.reset}`);
		stream_out = fs.createWriteStream(settings.cli.output);
	}
	else
		l.log(`Writing to stdout`);
	
	// ------------------------------------------------------------------------
	
	let result_map = await Terrain50.AnalyseFrequencies(
		Terrain50.ParseStream(stream_in),
		settings.cli.ignore_nodata
	);
	
	let result_arr = [];
	for(const [ key, value ] of result_map) {
		result_arr.push([ key, value ]);
	}
	result_arr.sort((a, b) => a[0] - b[0]);
	
	for(const [ key, value ] of result_arr) {
		await write_safe(stream_out, `${key}	${value}\n`);
	}
	await end_safe(stream_out);
	
	stream_in.destroy();
}
