#!/usr/local/bin/node --experimental-modules
"use strict";

import path from 'path';
import fs from 'fs';

import a from '../../Helpers/Ansi.mjs';
import l from '../../Helpers/Log.mjs';

import Terrain50 from 'terrain50';

// const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"));

export default async function(settings) {
	if(typeof settings.cli.input !== "string") {
		console.error(`${a.fred}${a.hicol}Error: No directory specified (try --filename path/to/directory)${a.reset}`);
		process.exit(2);
	}
	if(typeof settings.cli.output !== "string") {
		console.error(`${a.fred}${a.hicol}Error: No output file specified (try --filename-output path/to/filename.asc)${a.reset}`);
		process.exit(2);
	}
	
	let files = await fs.promises.readdir(settings.cli.input);
	
	l.log(`Parsing input files`);
	
	let input_files = [];
	let i = 0;
	for(let file of files) {
		process.stdout.write(`[${i+1} / ${files.length}] ${file}\r`);
		let next = Terrain50.Parse(await fs.promises.readFile(
			path.resolve(settings.cli.input, file),
			{ encoding: "utf-8" }
		));
		input_files.push(next);
		i++;
			
	}
	process.stdout.write("\n");
	l.log(`done!`);
	
	let big_tile = Terrain50.Merge(...input_files);
	
	l.log(`Validating merge...`);
	l.log(`Merge is ${big_tile.meta.ncols}x${big_tile.meta.nrows} @ (${big_tile.meta.xllcorner}, ${big_tile.meta.yllcorner}) on the OS National Grid`)
	let validation_errors = big_tile.validate();
	if(validation_errors.length > 0) {
		l.warn(`Warning: ${validation_errors.length} validation issues detected with merge.`);
		l.warn(`Details:`);
		for(let error of validation_errors) {
			switch(error.level) {
				case "warning":
					l.warn(error.toString());
					break;
				case "error":
					l.error(error.toString());
					break;
				default:
					l.log(error.toString());
					break;
			}
		}
	}
	else {
		l.log(`${a.fgreen}Validation complete, no issues detected${a.reset}`);
	}
	
	l.log("Serialising to file");
	let stream_out = fs.createWriteStream(settings.cli.output);
	await big_tile.serialise(stream_out);
	stream_out.end();
	l.log("done, merge complete");
}
