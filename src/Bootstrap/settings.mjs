"use strict";

import fs from 'fs';
import path from 'path';

const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"));

// Default settings object
// This is a (greatly) simplified stand-in for the much more advanced settings parsing system we have going on in our main PhD-Code codebase.
export default {
	cli: {
		program_name: "terrain50",
		description: "manipulates ordnance survey digital elevation model files"
	},
	output: {
		ansi_colour: true
	},
	package: JSON.parse(fs.readFileSync(
		path.resolve(__dirname, "../../package.json")
	))
};
