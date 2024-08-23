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

import { Storage } from "./Storage";
import fs from "fs";
import { join, dirname } from "path";
import "missing-native-js-functions";
import { Readable } from "stream";
import ExifTransformer from "exif-be-gone";

// TODO: split stored files into separate folders named after cloned route

function getPath(path: string) {
	// STORAGE_LOCATION has a default value in start.ts
	const root = process.env.STORAGE_LOCATION || "../";
	const filename = join(root, path);

	if (path.indexOf("\0") !== -1 || !filename.startsWith(root))
		throw new Error("invalid path");
	return filename;
}

export class FileStorage implements Storage {
	async get(path: string): Promise<Buffer | null> {
		path = getPath(path);
		try {
			return fs.readFileSync(path);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			try {
				const files = fs.readdirSync(path);
				if (!files.length) return null;
				return fs.readFileSync(join(path, files[0]));
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (error) {
				return null;
			}
		}
	}

	async set(path: string, value: Buffer) {
		path = getPath(path);
		if (!fs.existsSync(dirname(path)))
			fs.mkdirSync(dirname(path), { recursive: true });

		const ret = Readable.from(value);
		const cleaned_file = fs.createWriteStream(path);

		ret.pipe(new ExifTransformer()).pipe(cleaned_file);
	}

	async delete(path: string) {
		//TODO we should delete the parent directory if empty
		fs.unlinkSync(getPath(path));
	}
}
