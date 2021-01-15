"use strict";

import fs from 'fs';
import path from 'path';

import l from '../../Helpers/Log.mjs';
import a from '../../Helpers/Ansi.mjs';

import Terrain50 from 'terrain50';
import Terrain50Renderer from './Terrain50Renderer.mjs';

import { write_safe, end_safe } from '../../Helpers/StreamHelpers.mjs';

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
	
	let renderer = new Terrain50Renderer(settings.scale_factor | 1);
	
	if(settings.cli.stream) {
		if(!fs.existsSync(settings.cli.output))
			await fs.promises.mkdir(settings.cli.output, { recursive: true, mode: 0o755 });
		
		let reader = process.stdin;
		if(settings.cli.input !== "-")
			reader = fs.createReadStream(settings.cli.input, "utf-8");
		
		let i = 0;
		for await(let next of Terrain50.ParseStream(reader, settings.cli.tolerant ? /\s+/ : " ")) {
			process.stderr.write(`${a.fgreen}>>>>> ${a.hicol} Item ${i} ${a.reset}${a.fgreen} <<<<<${a.reset}`);
			
			await fs.promises.writeFile(
				path.join(settings.cli.output, `${i}.png`),
				await renderer.render(next)
			);
		}
		
		l.log(`Written ${a.hicol}${i}${a.reset} items to ${a.hicol}${a.fgreen}${settings.cli.output}${a.reset}`);
	}
	else {
		let terrain50 = Terrain50.Parse(
			await fs.promises.readFile(settings.cli.input, "utf-8")
		);
		let png_buffer = await renderer.render(terrain50);
		if(!(png_buffer instanceof Buffer))
			throw new Error(`Error: Renderer did not return Buffer (found unexpected ${png_buffer} instead)`);
		await fs.promises.writeFile(
			settings.cli.output,
			png_buffer
		);
		
		l.log(`Written to ${a.hicol}${settings.cli.output}${a.reset}`);
	}
}
