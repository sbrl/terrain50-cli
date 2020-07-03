"use strict";

import fs from 'fs';

import a from '../../Helpers/Ansi.mjs';
import Terrain50 from 'terrain50';

function summarise_obj(obj) {
	console.log(`Format: ASC`);
	console.log(`Claimed size: ${obj.meta.ncols}x${obj.meta.nrows}`);
	console.log(`Actual size: ${obj.data[0].length}x${obj.data.length}`);
	console.log(`Lower-left corner: (${obj.meta.xllcorner}, ${obj.meta.yllcorner})`);
	console.log(`Cell size: ${obj.meta.cellsize}`);
	if(typeof obj.meta.NODATA_value !== "undefined")
		console.log(`NODATA value: ${obj.meta.NODATA_value}`);
	console.log(`Metadata keys: ${Object.keys(obj.meta).join(", ")}`);
}

export default async function(settings) {
	let iterator = null;
	switch(settings.cli.mode) {
		case "single":
			let obj = Terrain50.Parse(
				await fs.promises.readFile(settings.cli.input == "-" ? 0 : settings.cli.input, "utf-8")
			);
			summarise_obj(obj);
			break;
		
		case "stream":
			let stream = process.stdin;
			if(settings.cli.input !== "-")
				stream = fs.createReadStream(settings.cli.input, "utf-8");
			
			let i = 0;
			for await(let next of Terrain50.ParseStream(stream)) {
				console.log(`>>>>> Item ${i} <<<<<`);
				summarise_obj(next);
				
				i++;
			}
	}
}

/**
 * Displays the errors returned by a Terrain50 validation function.
 * (e.g. `Terrain50.Validate(str)`, or `obj.validate()`)
 * @param  {[type]} errors [description]
 * @return {[type]}        [description]
 */
function display_errors(errors) {
	if(errors.length > 0) {
		for(let error of errors) {
			switch(error.level) {
				case "warning":
					console.log(`${a.fyellow}${a.hicol}${error}${a.reset}`);
					break;
				case "error":
					console.log(`${a.fred}${a.hicol}${error}${a.reset}`);
					break;
				default:
					console.log(error);
					break;
			}
		}
		process.exit(1);
	}
	else {
		console.log(`${a.fgreen}Validation completed successfully - no issues detected :D${a.reset}`);
	}
}
