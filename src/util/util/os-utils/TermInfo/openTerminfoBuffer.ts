/* =========================================================================
 * Copyright (c) 2016 Eivind Storm Aarnæs
 * Licensed under the MIT license
 *    (see https://github.com/eistaa/parse-terminfo/blob/master/LICENSE)
 * ========================================================================= */

import fs from "fs";
import path from "path";
import { ParseOptions } from "./TermInfo";

const DEFAULT_DB_DIRECTORIES = [
	"/etc/terminfo",
	"/lib/terminfo",
	"/usr/share/terminfo",
];

function isDirectory(directory: string) {
	try {
		return fs.statSync(path.normalize(directory.trim())).isDirectory();
	} catch (err) {
		return false;
	}
}

function constructDBDirectories(dirs?: string[] | string) {
	/*
	 * the ordering comes from manpage 'terminfo(5)'
	 */

	const directories: string[] = [];

	// argument can be array or string
	if (dirs) {
		if (Array.isArray(dirs)) {
			dirs.filter(isDirectory).forEach((dir) => directories.push(dir));
		} else {
			if (isDirectory(dirs)) directories.push(dirs);
		}
	}

	// TERMINFO may exist
	if (process.env.TERMINFO && isDirectory(process.env.TERMINFO))
		directories.push(process.env.TERMINFO);

	// there may be a local terminfo directory
	if (
		process.env.HOME &&
		isDirectory(path.normalize(path.join(process.env.HOME, ".terminfo")))
	)
		directories.push(path.join(process.env.HOME, ".terminfo"));

	// TERMINFO_DIRS can contain a :-separated list of directories
	if (process.env.TERMINFO_DIRS) {
		const terminfoDirectories = process.env.TERMINFO_DIRS.split(":");
		terminfoDirectories
			.filter(isDirectory)
			.forEach((dir) => directories.push(dir));
	}

	// default to hardcoded directories
	DEFAULT_DB_DIRECTORIES.filter(isDirectory).forEach((dir) =>
		directories.push(dir),
	);

	return directories;
}

export function openTerminfoBuffer(
	term: string,
	opts: ParseOptions | undefined,
) {
	// determine directories
	const directories = constructDBDirectories(opts?.directories);

	if (opts?.debug) console.log("Directories:", directories);

	let filepath;

	if (directories.length === 0)
		throw new Error("No terminfo database directories exist");

	// use first valid directory
	for (let i = 0; i < directories.length; i++) {
		try {
			filepath = path.join(directories[i], term.charAt(0), term);
			if (fs.statSync(filepath).isFile()) {
				if (opts?.debug)
					console.log("Found terminfo data at", filepath);
				break;
			}
		} catch (err) {
			filepath = undefined;
		}
	}

	if (filepath === undefined)
		throw new Error("Found no terminfo database for " + term);

	// read to buffer
	return {
		path: filepath,
		buffer: fs.readFileSync(filepath),
	};
}
