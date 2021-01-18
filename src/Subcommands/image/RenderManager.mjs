"use strict";

import fs from 'fs';
import path from 'path';

import Terrain50 from 'terrain50';

import l from '../../Helpers/Log.mjs';
import a from '../../Helpers/Ansi.mjs';
import Terrain50Renderer from './Terrain50Renderer.mjs';


class RenderManager {
	constructor(scale_factor = 1, in_tolerant = false, in_classes = null) {
		this.quiet = typeof process.env.QUIET == "string" ? true : false;
		
		this.tolerant = in_tolerant;
		this.classes = in_classes;
		
		this.renderer = new Terrain50Renderer(scale_factor);
	}
	
	async render_one_filename(filename_in, filename_out) {
		let terrain50 = Terrain50.Parse(
			await fs.promises.readFile(filename_in, "utf-8")
		);
		let png_buffer = await this.renderer.render(terrain50, this.classes);
		if(!(png_buffer instanceof Buffer))
			throw new Error(`Error: Renderer did not return Buffer (found unexpected ${png_buffer} instead)`);
		await fs.promises.writeFile(
			filename_out,
			png_buffer
		);
		
		if(!this.quiet) l.log(`Written to ${a.hicol}${filename_out}${a.reset}`);
	}
	
	async render_many_filename(filename_in, dir_out) {
		let reader = process.stdin;
		if(filename_in !== "-")
			reader = fs.createReadStream(filename_in, "utf-8");
		
		await this.render_many_stream(reader, dir_out);
	}
	
	async render_many_stream(stream_in, dir_out) {
		if(!fs.existsSync(dir_out))
			await fs.promises.mkdir(dir_out, { recursive: true, mode: 0o755 });
		
		let i = 0;
		for await(let next of Terrain50.ParseStream(stream_in, this.tolerant ? /\s+/ : " ")) {
			if(!this.quiet) process.stderr.write(`${a.fgreen}>>>>> ${a.hicol} Item ${i} ${a.reset}${a.fgreen} <<<<<${a.reset}\n`);
			
			await fs.promises.writeFile(
				path.join(dir_out, `${i}.png`),
				await renderer.render(next, this.classes)
			);
			
			i++;
		}
		
		if(!this.quiet) l.log(`Written ${a.hicol}${i}${a.reset} items to ${a.hicol}${a.fgreen}${dir_out}${a.reset}`);
	}
	
}

export default RenderManager;
