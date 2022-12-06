"use strict";

import fs from 'fs';

import nexline from 'nexline';

import a from '../../Helpers/Ansi.mjs';
import l from '../../Helpers/Log.mjs';
import Terrain50 from 'terrain50';
import { write_safe, end_safe } from '../../Helpers/StreamHelpers.mjs';
import settings from '../../Bootstrap/settings.mjs';

async function process_filename(filepath, stream_out) {
	const stream_in = fs.createReadStream(filepath);
	let i = 0;
	for await(const frame of Terrain50.ParseStream(stream_in, settings.cli.tolerant ? /\s+/ : " ")) {
		const obj = frame.to_json();
		await write_safe(stream_out, JSON.stringify(obj) + "\n");
		i++;
	}
	return i;
}

export default async function(settings) {
	const stream_out = process.stdout;
	if(settings.cli.output !== "-")
		stream_out = fs.createWriteStream(settings.cli.output);
	
	if(!(settings.cli.input instanceof Array))
		settings.cli.input = [ settings.cli.input ];
	
	let frames = 0;
	for(let filepath of settings.cli.input) {
		l.log(`Processing ${a.hicol}${filepath}${a.reset} from CLI argument`);
		frames += await process_filename(filepath, stream_out);
	}
	
	l.log(`${a.hicol}${a.fgreen}Done${a.reset}, serialised ${a.hicol}${a.fgreen}${frames}${a.reset} frames in total`);
}
