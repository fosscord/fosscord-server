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

//Role icons ---> avatars.ts modified

// TODO: check user rights and perks and animated pfp are allowed in the policies
// TODO: generate different sizes of icon
// TODO: generate different image types of icon

const STATIC_MIME_TYPES = [
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/svg+xml",
	"image/svg",
];
const ALLOWED_MIME_TYPES = [...STATIC_MIME_TYPES];

const router = Router();

router.post(
	"/:role_id",
	multer.single("file"),
	async (req: Request, res: Response) => {
		if (req.headers.signature !== Config.get().security.requestSignature)
			throw new HTTPError("Invalid request signature");
		if (!req.file) throw new HTTPError("Missing file");
		const { buffer, size } = req.file;
		const { role_id } = req.params;

		const hash = crypto
			.createHash("md5")
			.update(Snowflake.generate())
			.digest("hex");

		const type = await FileType.fileTypeFromBuffer(buffer);
		if (!type || !ALLOWED_MIME_TYPES.includes(type.mime))
			throw new HTTPError("Invalid file type");

		const path = `role-icons/${role_id}/${hash}.png`;
		const endpoint =
			Config.get().cdn.endpointPublic || "http://localhost:3001";

		await storage.set(path, buffer);

		return res.json({
			id: hash,
			content_type: type.mime,
			size,
			url: `${endpoint}${req.baseUrl}/${role_id}/${hash}`,
		});
	},
);

router.get("/:role_id", async (req: Request, res: Response) => {
	const { role_id } = req.params;
	//role_id = role_id.split(".")[0]; // remove .file extension
	const path = `role-icons/${role_id}`;

	const file = await storage.get(path);
	if (!file) throw new HTTPError("not found", 404);
	const type = await FileType.fileTypeFromBuffer(file);

	res.set("Content-Type", type?.mime);
	res.set("Cache-Control", "public, max-age=31536000, must-revalidate");

	return res.send(file);
});

router.get("/:role_id/:hash", async (req: Request, res: Response) => {
	const { role_id, hash } = req.params;
	//hash = hash.split(".")[0]; // remove .file extension
	const requested_extension = hash.split(".")[1];
	const role_icon_hash = hash.split(".")[0];
	let file: Buffer | null = null;

	const extensions_to_try = [
		requested_extension,
		"png",
		"jpg",
		"jpeg",
		"webp",
		"svg",
	];

	for (let i = 0; i < extensions_to_try.length; i++) {
		file = await storage.get(
			`role-icons/${role_id}/${role_icon_hash}.${extensions_to_try[i]}`,
		);
		if (file) break;
	}

	if (!file) throw new HTTPError("not found", 404);
	const type = await FileType.fileTypeFromBuffer(file);

	res.set("Content-Type", type?.mime);
	res.set("Cache-Control", "public, max-age=31536000, must-revalidate");

	return res.send(file);
});

router.delete("/:role_id/:id", async (req: Request, res: Response) => {
	if (req.headers.signature !== Config.get().security.requestSignature)
		throw new HTTPError("Invalid request signature");
	const { role_id, id } = req.params;
	const path = `role-icons/${role_id}/${id}`;

	await storage.delete(path);

	return res.send({ success: true });
});

export default router;
