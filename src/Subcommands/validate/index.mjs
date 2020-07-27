"use strict";

import fs from 'fs';

import a from '../../Helpers/Ansi.mjs';
import Terrain50 from 'terrain50';

export default async function(settings) {
	switch(settings.cli.mode) {
		case "validate":
			// Read stdin into a string - ref https://stackoverflow.com/a/56012724/1460422
			let source = fs.readFileSync(0, 'utf-8');
			
			let errors = Terrain50.Validate(source);
			display_errors(errors);
			break;
		
		case "stream":
			let i = 0, ok = 0, failed = 0;
			for await (let next of Terrain50.ParseStream(process.stdin, settings.cli.use_regex ? /\s+/ : " ")) {
				console.log(`>>> Item ${i} <<<`);
				let result = next.validate();
				display_errors(result);
				if(result.length > 0) failed++; else ok++;
				i++;
			}
			console.error(`${a.fgreen}${a.hicol}Parsed ${i} items (${ok} ok, ${failed} failed)`)
			break;
		
		default:
			console.error(`${a.fred}${a.hicol}Error: Mode '${settings.cli.mode}' was not recognised. Possible modes: validate (the default), stream.${a.reset}`);
			process.exit(1);
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
