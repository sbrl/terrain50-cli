"use strict";

import fs from 'fs';

import nexline from 'nexline';
import chroma from 'chroma-js';

import a from '../../Helpers/Ansi.mjs';
import l from '../../Helpers/Log.mjs';
import Terrain50 from 'terrain50';

async function process_filename(result, filename) {
	let next_item = Terrain50.Parse(await fs.promises.readFile(filename, "utf-8"))
		.to_geojson_feature();
	
	next_item.properties.filename = filename;
	let colour = chroma.random();
	next_item.properties.fill = colour.hex();
	next_item.properties.stroke = colour.darken().hex();
	
	result.features.push(next_item);
}

export default async function(settings) {
	let result = {
		type: "FeatureCollection",
		features: []
	};
	
	if(settings.cli.input instanceof Array) {
		l.log(`Reading filenames from ${a.hicol}CLI arguments${a.reset}`);
		
		for(let filename of settings.cli.input) {
			l.log(`Processing ${a.hicol}${filename}${a.reset} from CLI argument`);
			await process_filename(result, filename);
		}
	}
	else {
		l.log(`Reading filenames from ${a.hicol}stdin${a.reset}`);
		
		let reader = nexline({
			input: process.stdin
		});
		
		while(true) {
			let filename = await reader.next();
			if(filename == null)
				break;
			if(filename.length == 0) continue;
			
			l.log(`Processing ${a.hicol}${filename}${a.reset} from stdin`);
			
			await process_filename(result, filename);
		}
	}
	
	l.log(`${a.hicol}${a.fgreen}Done${a.reset}`);
	console.log(JSON.stringify(result));
}
