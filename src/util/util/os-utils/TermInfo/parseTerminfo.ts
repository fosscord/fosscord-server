"use strict";

/* =========================================================================
 * Copyright (c) 2016 Eivind Storm Aarnæs
 * Licensed under the MIT license
 *    (see https://github.com/eistaa/parse-terminfo/blob/master/LICENSE)
 * ========================================================================= */

import { ALL_VARS, VARORDER } from "./Constants";

/*
 * based of on the format description in the term(5) manual page.
 */

export class TermInfo {
	description?: string;
	term?: string[];
	capabilities: {
		booleans: Record<string, boolean>;
		numbers: Record<string, number>;
		strings: Record<string, string>;
	};
	path: string;
	integerSize: number;
}

export function parseTerminfo(
	buffer: Buffer,
	term: string,
	opts?: { debug: boolean },
): TermInfo {
	let offset = 0;

	function readInt() {
		const result = buffer.readInt16LE(offset);
		console.log("Read int @", offset, ":", result);
		offset += 2;
		return result;
	}

	/// @type {{ description: string | undefined; term: string[] | undefined; capabilities: { booleans: {}; numbers: {}; strings: {}; }; }}
	const result: TermInfo = {
		capabilities: {
			booleans: {},
			numbers: {},
			strings: {},
		},
		path: "",
		description: undefined,
		term: undefined,
		integerSize: 0,
	};

	// check the magic number
	const magic = readInt();

	// if (magic !== 0x011a)
	// 	throw new Error("invalid magic number in buffer for " + term + ": " + magic.toString(16));
	switch (magic) {
		case 0x011a:
			result.integerSize = 16;
			break;
		case 0x21e:
			result.integerSize = 32;
			break;
		default:
			throw new Error(
				"invalid magic number in buffer for " +
					term +
					": " +
					magic.toString(16),
			);
	}

	if (opts?.debug) console.log("Magic number:", magic, "Integer size:", result.integerSize);

	//offset += 2;

	// parse section sizes
	const sizes = {
		names: readInt(),
		booleans: readInt(),
		numbers: readInt(),
		strings: readInt(),
		table: readInt(),
	};

	if (opts?.debug) console.log("Section sizes:", sizes);

	//offset += 10;

	// parse names section
	const names = buffer
		.toString("ascii", offset, offset + sizes.names - 1)
		.split("|");
	result.term = names[0].split("|");
	result.description = names[1];
	if (opts?.debug)
		console.log("Got info:", {
			term: result.term,
			description: result.description,
		});
	offset += sizes.names;

	// parse booleans
	let boolean;
	const numBools = Math.min(VARORDER.booleans.length, sizes.booleans);
	for (let i = 0; i < numBools; i++) {
		if (i >= VARORDER.booleans.length) {
			if (opts?.debug) console.log("Read boolean overran length");
			continue;
		} // doesn't (yet) support extended terminfo

		const data = buffer.readInt8(offset + i);
		if (opts?.debug && data != 0 && data != 1)
			console.log("Invalid boolean data:", data.toString(16));

		boolean = !!data;
		if (boolean)
			result.capabilities.booleans[ALL_VARS[VARORDER.booleans[i]]] = true;
	}
	offset += sizes.booleans + ((offset + sizes.booleans) % 2); // padded to short boundary

	// parse numbers
	let number;
	const numNumbers = Math.min(VARORDER.numbers.length, sizes.numbers);
	for (let i = 0; i < numNumbers; i++) {
		if (i >= VARORDER.numbers.length) continue; // doesn't (yet) support extended terminfo

		number = buffer.readInt16LE(offset + 2 * i);
		if (number !== -1)
			result.capabilities.numbers[ALL_VARS[VARORDER.numbers[i]]] = number;
	}
	offset += 2 * sizes.numbers;
	if (opts?.debug)
		console.log("Read numbers up to", offset, ":", result.capabilities.numbers);

	// parse strings
	let tableOffset, valueEnd;
	const tableStart = offset + 2 * sizes.strings;
	const numStrings = Math.min(VARORDER.strings.length, sizes.strings);
	for (let i = 0; i < numStrings; i++) {
		if (i >= VARORDER.strings.length) continue; // doesn't (yet) support extended terminfo

		tableOffset = buffer.readInt16LE(offset + 2 * i);
		if (tableOffset !== -1) {
			valueEnd = tableStart + tableOffset;
			while (buffer[valueEnd++] !== 0); // string values are null terminated
			result.capabilities.strings[ALL_VARS[VARORDER.strings[i]]] =
				buffer.toString(
					"ascii",
					tableStart + tableOffset,
					valueEnd - 1,
				);
		}
	}

	return result;
}
