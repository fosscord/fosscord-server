// SOURCE: https://github.com/eistaa/parse-terminfo
/* =========================================================================
 * Copyright (c) 2016 Eivind Storm Aarnæs
 * Licensed under the MIT license
 *    (see https://github.com/eistaa/parse-terminfo/blob/master/LICENSE)
 * ========================================================================= */

import { openTerminfoBuffer } from "./openTerminfoBuffer";
import { parseTerminfo, TermInfo } from "./parseTerminfo";

export class ParseOptions {
	term?: string;
	directories?: string[];
	debug: boolean = false;
}

export function parse(opts?: ParseOptions): TermInfo {
	let term;

	if (process.platform === "win32")
		throw new Error("no terminfo for windows...");

	// get term
	if (opts?.term) {
		term = String(opts.term);
	} else {
		if (process.env.TERM && process.env.TERM !== "") {
			term = process.env.TERM;
		} else {
			throw new Error(
				"No terminal specified (`opts.term`) and TERM is undefined",
			);
		}
	}

	if(opts?.debug) console.log("Parsing terminfo for", term);

	const bufferData = openTerminfoBuffer(term, opts);
	const capabilities = parseTerminfo(bufferData.buffer, term, opts);
	capabilities.path = bufferData.path;

	if(opts?.debug) console.log("Parsed terminfo for", term, ":", capabilities);

	return capabilities;
}

export default {
	VARIABLES: require("./Constants").ALL_VARS,
	parse
};
