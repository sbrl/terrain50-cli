"use strict";

import fs from 'fs';

import l from '../../Helpers/Log.mjs';
import Terrain50 from 'terrain50';

export default async function(settings) {
	if(typeof settings.cli.input !== "string") {
		l.error("Error: No input file specified (try --filename path/to/heightmap.asc)");
		process.exit(1);
	}
	if(typeof settings.cli.output !== "string") {
		l.error("Error: No output file specified (try --filename path/to/output.asc)");
		process.exit(1);
	}
	if(typeof settings.cli.find !== "number") {
		l.error("Error: No target value to find (try --find INTEGER_HERE)");
		process.exit(1);
	}
	if(typeof settings.cli.replace !== "number") {
		l.error("Error: No target value to replace (try --find INTEGER_HERE)");
		process.exit(1);
	}
	
	l.log(`Reading input files`);
	let heightmap = Terrain50.Parse(await fs.promises.readFile(settings.cli.input, "utf-8"));
	
	l.log(`Replacing ${settings.cli.find} with ${settings.cli.replace}`);
	heightmap.replace(settings.cli.find, settings.cli.replace);
	l.log(`done`);
	
	l.log(`Writing result to disk`);
	await heightmap.serialise(fs.createWriteStream(settings.cli.output));
	l.log(`Trimming complete!`);
}
