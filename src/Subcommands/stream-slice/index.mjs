"use strict";

import fs from 'fs';

import Terrain50 from 'terrain50';

import a from '../../Helpers/Ansi.mjs';
import l from '../../Helpers/Log.mjs';

import { percentage } from '../../Helpers/MathsHelpers.mjs';

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
	
	let count = settings.cli.count,
		offset = settings.cli.offset;
	
	// ------------------------------------------------------------------------
	
	let i = -1;
	for await(let next of Terrain50.ParseStream(stream_in)) {
		i++;
		
		if(i < offset) continue;
		
		let is_last = i - offset >= count;
		await next.serialise(stream_out, is_last);
		
		if(is_last) break;
		
		process.stderr.write(`Written ${i - offset} / count objects (~${percentage(i - offset, count).toFixed(2)}%)       \r`);
	}
	l.log(`Slicing complete`);
	
	stream_in.destroy();
}
