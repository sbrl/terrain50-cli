# Changelog
This is the master changelog for [`terrain50-cli`](https://npmjs.org/packages/terrain50-cli).

Release template text:

-----

Install or update from npm:

```bash
npm install --save terrain50-cli
```

-----


## Unreleased
 - `split`: Fix invalid gzip file generation
 - Update terrain50


## v1.6
 - Add new `split` subcommand
 - `validate` subcommand: Add new `--quiet` argument


## v1.5
 - Update dependencies
 - Add new `analyse-frequencies` subcommand


## v1.4.1
 - `validate` subcommand in `stream` mode: Write aggregated stats when validation is complete


## v1.4
 - [BREAKING] Add new `--use-regex` flag to `validate` subcommand (only takes effect in stream mode: `--mode stream`)


## v1.3
 - Added new `identify` subcommand
 - Added new `stream-slice` subcommand


## v1.2
 - Update `terrain50` to v1.5
 - Update `applause-cli` to v1.2.3 to fix subcommand argument default value issue
 - **Breaking:** Rename `validator` subcommand to `validate` to better fit with the others


## v1.1.1
 - Update `terrain50` to v1.4.1


## v1.1.0
 - Add support for `Terrain50.ParseStream()` via new --mode flag for the validator subcommand


## v1.0.1
 - Update README


## v1.0
 - Initial release! Refactored out from my main PhD codebase.
