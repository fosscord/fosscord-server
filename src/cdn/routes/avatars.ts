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

import { Router, Response, Request } from "express";
import { Config, Snowflake } from "@spacebar/util";
import { storage } from "../util/Storage";
import FileType from "file-type";
import { HTTPError } from "lambert-server";
import crypto from "crypto";
import { multer } from "../util/multer";

// TODO: check premium and animated pfp are allowed in the config
// TODO: generate different sizes of icon
// TODO: generate different image types of icon
// TODO: delete old icons

const ANIMATED_MIME_TYPES = ["image/apng", "image/gif", "image/gifv"];
const STATIC_MIME_TYPES = [
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/svg+xml",
	"image/svg",
];
const ALLOWED_MIME_TYPES = [...ANIMATED_MIME_TYPES, ...STATIC_MIME_TYPES];

const router = Router();

router.post(
	"/:user_id",
	multer.single("file"),
	async (req: Request, res: Response) => {
		if (req.headers.signature !== Config.get().security.requestSignature)
			throw new HTTPError("Invalid request signature");
		if (!req.file) throw new HTTPError("Missing file");
		const { buffer, size } = req.file;
		const { user_id } = req.params;

		let hash = crypto
			.createHash("md5")
			.update(Snowflake.generate())
			.digest("hex");

		const type = await FileType.fileTypeFromBuffer(buffer);
		if (!type || !ALLOWED_MIME_TYPES.includes(type.mime))
			throw new HTTPError("Invalid file type");
		if (ANIMATED_MIME_TYPES.includes(type.mime)) hash = `a_${hash}`; // animated icons have a_ infront of the hash

		const path = `avatars/${user_id}/${hash}`;
		const endpoint =
			Config.get().cdn.endpointPublic || "http://localhost:3001";

		await storage.set(path, buffer);

		return res.json({
			id: hash,
			content_type: type.mime,
			size,
			url: `${endpoint}${req.baseUrl}/${user_id}/${hash}`,
		});
	},
);

router.get("/:user_id", async (req: Request, res: Response) => {
	let { user_id } = req.params;
	user_id = user_id.split(".")[0]; // remove .file extension
	const path = `avatars/${user_id}`;

	const file = await storage.get(path);
	if (!file) throw new HTTPError("not found", 404);
	const type = await FileType.fileTypeFromBuffer(file);

	res.set("Content-Type", type?.mime);
	res.set("Cache-Control", "public, max-age=31536000");

	return res.send(file);
});

export const getAvatar = async (req: Request, res: Response) => {
	const { user_id } = req.params;
	let { hash } = req.params;
	hash = hash.split(".")[0]; // remove .file extension
	const path = `avatars/${user_id}/${hash}`;

	const file = await storage.get(path);
	if (!file) throw new HTTPError("not found", 404);
	const type = await FileType.fileTypeFromBuffer(file);

	res.set("Content-Type", type?.mime);
	res.set("Cache-Control", "public, max-age=31536000");

	return res.send(file);
};

router.get("/:user_id/:hash", getAvatar);

router.delete("/:user_id/:id", async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature)
		throw new HTTPError("Invalid request signature");
	const { user_id, id } = req.params;
	const path = `avatars/${user_id}/${id}`;

	await storage.delete(path);

	return res.send({ success: true });
});

export default router;
