"use strict";

import fs from 'fs';
import path from 'path';

import Terrain50 from 'terrain50';
import SpawnStream from 'spawn-stream';

import a from '../../Helpers/Ansi.mjs';
import l from '../../Helpers/Log.mjs';

import GzipChildProcess from '../../Helpers/GzipChildProcess.mjs';
import { end_safe } from '../../Helpers/StreamHelpers.mjs';

export default async function(settings) {
	// 1: Parse settings
	let stream_in = process.stdin;
	if(settings.cli.input !== "-") {
		l.log(`Reading from ${a.hicol}${settings.cli.input}${a.reset}`);
		stream_in = fs.createReadStream(settings.cli.input);
	}
	else
		l.log(`Reading from stdin`);
	
	if(typeof settings.cli.output != "string") {
		l.error(`Error: No output directory specified (try the --output argument).`);
	}
	
	let dir_out = settings.cli.output; 
	if(!fs.existsSync(dir_out))
		await fs.promises.mkdir(dir_out, { recursive: true, mode: 0o750 });
	l.log(`Writing to ${a.hicol}${settings.cli.output}${a.reset}`);
	
	// ------------------------------------------------------------------------
	
	let i = 0;
	for await(let next of Terrain50.ParseStream(stream_in)) {
		// Determine the output filepath
		let output_filename = `${i}.asc`;
		if(!settings.cli.no_gzip) output_filename += `.gz`;
		output_filename = path.join(dir_out, output_filename);
		
		// Create the output stream
		let stream_out = fs.createWriteStream(output_filename),
			gzip = null;
		if(!settings.cli.no_gzip) {
			gzip = new GzipChildProcess();
			gzip.stdout.pipe(stream_out);
		}
		
		let init_stream = stream_out;
		if(gzip !== null) init_stream = gzip.stdin;
		
		// Write it to the output
		await next.serialise(init_stream || stream_out, false);
		
		if(gzip !== null) await gzip.end_gracefully();
		await end_safe(stream_out);
		
		// Update the user
		l.log(`Written ${i+1} objects so far`);
		
		if(i >= settings.cli.count - 1) {
			l.log(`Reached limit of ${settings.cli.count} items, stopping here`);
			break;
		}
		
		i++;
	}
	l.log(`Splitting complete`);
	
	stream_in.destroy();
}
