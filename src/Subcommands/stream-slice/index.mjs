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
	for await(let next of Terrain50.ParseStream(stream_in, settings.cli.tolerant ? /\s+/ : " ")) {
		i++;
		
		if(i < offset) continue;
		
		// Write it to the output
		let is_last = i - offset >= count - 1;
		await next.serialise(stream_out, is_last);
		
		// Update the user
		l.log(`Written ${(i - offset) + 1} / ${count} objects (~${percentage((i - offset) + 1, count).toFixed(2)}%)`);
		
		// Don't go further than we need to
		if(is_last) break;
	}
	l.log(`Slicing complete`);
	
	stream_in.destroy();
}
