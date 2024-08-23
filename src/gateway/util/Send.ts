/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Payload, WebSocket } from "@spacebar/gateway";
import fs from "fs/promises";
import path from "path";

import { ErlpackType, JSONReplacer } from "@spacebar/util";
let erlpack: ErlpackType | null = null;
try {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	erlpack = require("erlpack") as ErlpackType;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
	// empty
}

// don't care
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const recurseJsonReplace = (json: any) => {
	for (const key in json) {
		// eslint-disable-next-line no-prototype-builtins
		if (!json.hasOwnProperty(key)) continue;

		json[key] = JSONReplacer.call(json, key, json[key]);

		if (typeof json[key] == "object" && json[key] !== null)
			json[key] = recurseJsonReplace(json[key]);
	}
	return json;
};

export function Send(socket: WebSocket, data: Payload) {
	if (process.env.WS_VERBOSE)
		console.log(`[Websocket] Outgoing message: ${JSON.stringify(data)}`);

	if (process.env.WS_DUMP) {
		const id = socket.session_id || "unknown";

		(async () => {
			await fs.mkdir(path.join("dump", id), {
				recursive: true,
			});
			await fs.writeFile(
				path.join("dump", id, `${Date.now()}.out.json`),
				JSON.stringify(data, null, 2),
			);
		})();
	}

	let buffer: Buffer | string;
	if (socket.encoding === "etf" && erlpack) {
		// Erlpack doesn't like Date objects, encodes them as {}
		data = recurseJsonReplace(data);
		buffer = erlpack.pack(data);
	}
	// TODO: encode circular object
	else if (socket.encoding === "json")
		buffer = JSON.stringify(data, JSONReplacer);
	else return;
	// TODO: compression
	if (socket.deflate) {
		buffer = socket.deflate.process(buffer) as Buffer;
	}

	return new Promise((res, rej) => {
		if (socket.readyState !== 1) {
			// return rej("socket not open");
			socket.close();
			return;
		}

		socket.send(buffer, (err) => {
			if (err) return rej(err);
			return res(null);
		});
	});
}
