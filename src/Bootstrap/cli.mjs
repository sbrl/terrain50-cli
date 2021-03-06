"use strict";

import fs from 'fs';
import path from 'path';

import TOML from '@iarna/toml';

import CliParser from 'applause-cli';

import l from '../Helpers/Log.mjs';
import { LOG_LEVELS } from '../Helpers/Log.mjs';

import a from '../Helpers/Ansi.mjs';
import settings from './settings.mjs';

import { get_version } from 'terrain50';


const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"));

const subcommand_directory = "../Subcommands";

async function get_actions() {
	let dirs = await fs.promises.readdir(
		path.resolve(
			__dirname,
			subcommand_directory
		)
	);
	return dirs.map((dir) => {
		let index_file = path.resolve(__dirname, `${subcommand_directory}/${dir}/`, "index.mjs");
		if(!fs.existsSync(index_file))
			return null;
		
		return path.basename(path.dirname(index_file));
	}).filter(x => x !== null);
}

async function get_actions_metadata() {
	let result = {};
	for (let action of await get_actions()) {
		let filepath = path.resolve(
			__dirname,
			`${subcommand_directory}/${action}/`,
			`meta.toml`
		);
		if(!fs.existsSync(filepath)) {
			result[action] = {
				description: `${a.locol}${a.italics}(No description found)${a.reset}`,
				arguments: []
			};
			continue;
		}
		
		result[action] = TOML.parse(await fs.promises.readFile(filepath));
	}
	return result;
}

export default async function() {
	let cli = new CliParser(path.resolve(__dirname, "../../package.json"));
	cli.set_name("terrain50"); // The command name is actually terrain50, even though the package name is terrain50-cli
	cli.set_description_extended(`With terrain50 ${await get_version()}`);
	cli.argument("log-level", "The logging level. Possible values: debug (default), info, log, warn, error, none", "debug", "string");
	cli.argument("tolerant", "When parsing streams of data, be more tolerant of whitespace inconsistencies and other errors at the cost of decreased performance (otherwise it is assumed a single space separates elements on a line).", false, "boolean");
	
	// Disable ansi escape codes if requested
	if(!settings.output.ansi_colour) {
	    a.enabled = false;
	    a.escape_codes();
	}
	
	let actions_meta = await get_actions_metadata();
	for(let action in actions_meta) {
		let subcommand = cli.subcommand(action, actions_meta[action].description);
		if(!(actions_meta[action].arguments instanceof Array))
			continue;
		for(let argument of actions_meta[action].arguments) {
			subcommand.argument(
				argument.name,
				argument.description,
				argument.default_value,
				argument.type
			);
		}
	}
	
	// 2: CLI Argument Parsing
	
	settings.cli = cli.parse(process.argv.slice(2));
	
	let action = cli.current_subcommand;
	
	if(action == null) {
		console.error(`${a.hicol}${a.fred}Error: No subcommand specified (try --help for usage information).${a.reset}`);
		return;
	}
	
	if(typeof LOG_LEVELS[settings.cli.log_level.toUpperCase()] == "undefined") {
		console.error(`${a.hicol}${a.fred}Error: Unknown log level '${settings.cli.log_level}' (possible values: debug, info, log, warn, error, none)`);
		process.exit(1);
	}
	l.level = LOG_LEVELS[settings.cli.log_level.toUpperCase()];
	
	// 3: Environment Variable Parsing
	
	// process.env.XYZ
	
	
	// 4: Run
	console.error(`${a.fgreen}***** ${a.hicol}${action}${a.reset}${a.fgreen} *****${a.reset}`);
	
	try {
		await (await import(`${subcommand_directory}/${action}/index.mjs`)).default(settings);
	}
	catch(error) {
		console.error(`\n\n`);
		throw error;
	}
	
	// 5: Cleanup
	
	
}
