# terrain50-cli

> CLI for parsing Ordnance Survey Digital Elevation Model files

This is the CLI for the sister [`terrain50`](https://www.npmjs.com/package/terrain50) library on npm for parsing Ordnance Survey DEM files I also implemented.

 - **Current version:** ![current npm version - see the GitHub releases](https://img.shields.io/npm/v/terrain50-cli)
 - **Changelog:** https://github.com/sbrl/terrain50-cli/blob/master/Changelog.md


## Install
Install via `npm`:

```bash
npm install terrain50-cli --global
```


## Usage
The command-line interface works on a subcommand-based system using [`applause-cli`](https://npmjs.org/packages/applause-cli) (another package of mine).

Display the usage information like this:

```bash
terrain50 --help
```

If you installed it locally, you'll need to do this:

```bash
path/to/node_modules/.bin/terrain50 --help
```

### Environment Variables
Additionally, a number of environment variables are supported.

Variable    | Purpose
------------|-----------------------------
`NO_COLOR`  | Disables ANSI escape codes in output (i.e. coloured output). Not recommended unless you have a reason.
`QUIET`     | Suppress all output except for warnings and errors (not fully supported everywhere yet)


## Notes

### `image` subcommand: `--boundaries` argument
This argument's purpose is the divide the incoming data into categories so that an AI can be potentially trained on the data (e.g. water depth data, as I'm using). It takes a comma separated list of values like this:

```
0.1,0.5,1,5
```

...and turns it into a number of bins like so:

 - -Infinity ≤ value < 0.1
 - 0.1 ≤ value < 0.5
 - 0.5 ≤ value < 1
 - 1 ≤ value < 5
 - 5 ≤ value < Infinity

Each bin is assigned a colour. Then, for each value in the input, it draws the colour that's assigned to the bin that the value fits into.


## Read-world use
 - I'm using it for the main Node.js application for my PhD in Computer Science!
 - _(Are you using this project? Get in touch by [opening an issue](https://github.com/sbrl/terrain50/issues/new))_


## Contributing
Contributions are welcome as PRs! Don't forget to say that you donate your contribution under the _Mozilla Public License 2.0_ in your PR comment.


## Licence
This project is licensed under the _Mozilla Public License 2.0_. See the `LICENSE` file in this repository for the full text.
