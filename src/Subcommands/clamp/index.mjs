"use strict";

import fs from 'fs';

import l from '../../Helpers/Log.mjs';
import a from '../../Helpers/Ansi.mjs';
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
	
	l.log(`Reading input files`);
	let heightmap = Terrain50.Parse(await fs.promises.readFile(settings.cli.input, "utf-8"));
	
	if(typeof settings.cli.min == "number") {
		l.log(`Clamping values to a minimum of ${a.hicol}${settings.cli.min}${a.reset}`);
		heightmap.min_value = settings.cli.min;
		l.log(`done`);
	}
	if(typeof settings.cli.max == "number") {
		l.log(`Clamping values to a maximum of ${a.hicol}${settings.cli.max}${a.reset}`);
		heightmap.max_value = settings.cli.max;
		l.log(`done`);
	}
	
	l.log(`Writing result to disk`);
	await heightmap.serialise(fs.createWriteStream(settings.cli.output));
	l.log(`Trimming complete!`);
}
