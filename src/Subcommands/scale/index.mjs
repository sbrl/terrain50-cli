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
	if(typeof settings.cli.scale_factor !== "number") {
		l.error("Error: No scale factor specified (try --scale-factor NUMBER_HERE)");
		process.exit(1);
	}
	
	l.log(`Reading input files`);
	let heightmap = Terrain50.Parse(await fs.promises.readFile(settings.cli.input, "utf-8"));
	
	
	l.log(`Applying scale factor`);
	heightmap.scale(settings.cli.scale_factor);
	
	l.log(`Scaled by scale factor ${settings.cli.scale_factor}`);
	
	l.log(`Writing result to disk`);
	await heightmap.serialise(fs.createWriteStream(settings.cli.output));
	l.log(`Scaling complete!`);
}
