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
import { multer } from "../util/multer";
import imageSize from "image-size";

const router = Router();

const SANITIZED_CONTENT_TYPE = [
	"text/html",
	"text/mhtml",
	"multipart/related",
	"application/xhtml+xml",
];

router.post(
	"/:channel_id",
	multer.single("file"),
	async (req: Request, res: Response) => {
		if (req.headers.signature !== Config.get().security.requestSignature)
			throw new HTTPError("Invalid request signature");
		if (!req.file) throw new HTTPError("file missing");

		const { buffer, mimetype, size, originalname } = req.file;
		const { channel_id } = req.params;
		const filename = originalname
			.replaceAll(" ", "_")
			.replace(/[^a-zA-Z0-9._]+/g, "");
		const id = Snowflake.generate();
		const path = `attachments/${channel_id}/${id}/${filename}`;

		const endpoint =
			Config.get()?.cdn.endpointPublic || "http://localhost:3001";

		await storage.set(path, buffer);
		let width;
		let height;
		if (mimetype.includes("image")) {
			const dimensions = imageSize(buffer);
			if (dimensions) {
				width = dimensions.width;
				height = dimensions.height;
			}
		}

		const file = {
			id,
			content_type: mimetype,
			filename: filename,
			size,
			url: `${endpoint}/${path}`,
			width,
			height,
		};

		return res.json(file);
	},
);

router.get(
	"/:channel_id/:id/:filename",
	async (req: Request, res: Response) => {
		const { channel_id, id, filename } = req.params;
		// const { format } = req.query;

		const path = `attachments/${channel_id}/${id}/${filename}`;
		const file = await storage.get(path);
		if (!file) throw new HTTPError("File not found");
		const type = await FileType.fileTypeFromBuffer(file);
		let content_type = type?.mime || "application/octet-stream";

		if (SANITIZED_CONTENT_TYPE.includes(content_type)) {
			content_type = "application/octet-stream";
		}

		res.set("Content-Type", content_type);
		res.set("Cache-Control", "public, max-age=31536000");

		return res.send(file);
	},
);

router.delete(
	"/:channel_id/:id/:filename",
	async (req: Request, res: Response) => {
		if (req.headers.signature !== Config.get().security.requestSignature)
			throw new HTTPError("Invalid request signature");

		const { channel_id, id, filename } = req.params;
		const path = `attachments/${channel_id}/${id}/${filename}`;

		await storage.delete(path);

		return res.send({ success: true });
	},
);

export default router;
