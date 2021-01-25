"use strict";

import fs from 'fs';
import path from 'path';

import l from '../../Helpers/Log.mjs';
import a from '../../Helpers/Ansi.mjs';

import RenderManager from './RenderManager.mjs';

import { bounds2classes } from '../../Helpers/MathsHelpers.mjs';

export default async function(settings) {
	if(typeof settings.cli.input !== "string") {
		l.error("Error: No input file specified (try --filename path/to/file.asc)");
		process.exit(1);
	}
	if(typeof settings.cli.output !== "string") {
		l.error("Error: No output file specified (try --filename-output path/to/image.png)");
		process.exit(1);
	}
	
	if(settings.cli.input !== "-" && !fs.existsSync(settings.cli.input)) {
		l.error(`Error: The specified input file '${settings.cli.input}' does not exist (check the spelling and permissions).`);
		process.exit(1);
	}
	
	// Parse the bounaries out
	if(typeof settings.cli.boundaries == "string") {
		settings.cli.boundaries = settings.cli.boundaries
			.split(",")
			.map((value) => parseFloat(value.trim()))
			.filter((x) => typeof x == "number");
		
		settings.classes = bounds2classes(settings.cli.boundaries);
	}
	else
		settings.classes = null;
	
	let render_manager = new RenderManager(
		settings.scale_factor || 1,
		settings.cli.tolerant,
		settings.classes
	);
	
	if(settings.cli.stream) {
		await render_manager.render_many_filename(
			settings.cli.input,
			settings.cli.output
		);
	}
	else {
		await render_manager.render_one_filename(
			settings.cli.input,
			settings.cli.output
		);
	}
}
