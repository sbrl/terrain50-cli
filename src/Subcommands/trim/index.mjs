"use strict";

import fs from 'fs';

import l from '../../Helpers/Log.mjs';
import Terrain50 from 'terrain50';

export default async function(settings) {
	if(typeof settings.cli.input !== "string") {
		l.error("Error: No input file specified (try --filename path/to/heightmap.asc)");
		process.exit(1);
	}
	if(typeof settings.cli.reference !== "string") {
		l.error("Error: No reference file specified (try --filename-reference path/to/another.asc)");
		process.exit(1);
	}
	if(typeof settings.cli.output !== "string") {
		l.error("Error: No output filename specified (try --filename-output path/to/file.asc)");
		process.exit(1);
	}
	
	l.log(`Reading input files`);
	let heightmap = Terrain50.Parse(await fs.promises.readFile(settings.cli.input, "utf-8")),
		reference = Terrain50.Parse(await fs.promises.readFile(settings.cli.reference, "utf-8"));
	
	l.log(`Trimming heightmap according to reference`);
	heightmap.trim(reference.meta);
	
	if(typeof settings.cli.replace !== "undefined") {
		let [old_value, new_value] = settings.cli.replace.split(/,/g).map((x) => parseInt(x, 10));
		l.log(`Replacing ${old_value} with ${new_value}`);
		heightmap.replace(old_value, new_value);
		l.log(`done`);
	}
	
	l.log(`Writing result to disk`);
	await heightmap.serialise(fs.createWriteStream(settings.cli.output));
	l.log(`Trimming complete!`);
}
