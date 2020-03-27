"use strict";

import fs from 'fs';

import a from '../../Helpers/Ansi.mjs';
import Terrain50 from 'terrain50';

export default async function(_settings) {
	// Read stdin into a string - ref https://stackoverflow.com/a/56012724/1460422
	let source = fs.readFileSync(0, 'utf-8');
	
	let errors = Terrain50.Validate(source);
	
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
