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
			display_errors(errors, settings.cli.quiet);
			break;
		
		case "stream":
			let i = 0, ok = 0, failed = 0;
			for await (let next of Terrain50.ParseStream(process.stdin, settings.cli.tolerant ? /\s+/ : " ")) {
				if(!settings.cli.quiet) console.log(`>>> Item ${i} <<<`);
				let result = next.validate();
				if(settings.cli.quiet && result.length > 0) console.log(`>>> Item ${i} <<<`);
				display_errors(result, settings.cli.quiet);
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
 * @param	{Terrain50ValidationMessage[]}	errors	The list of validation errors to display.
 * @param	{bool}							[quiet=false]	Whether to avoid printing anything if the list of errors is empty
 */
function display_errors(errors, quiet = false) {
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
	else if(!quiet) {
		console.log(`${a.fgreen}Validation completed successfully - no issues detected :D${a.reset}`);
	}
}
