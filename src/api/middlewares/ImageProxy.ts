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

import { Config, JimpType } from "@spacebar/util";
import { Request, Response } from "express";
import { yellow } from "picocolors";
import crypto from "crypto";

let sharp: undefined | false | { default: typeof import("sharp") } = undefined;

let Jimp: JimpType | undefined = undefined;
try {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	Jimp = require("jimp") as JimpType;
} catch {
	// empty
}

let sentImageProxyWarning = false;

const sharpSupported = new Set([
	"image/jpeg",
	"image/png",
	"image/bmp",
	"image/tiff",
	"image/gif",
	"image/webp",
	"image/avif",
	"image/svg+xml",
]);
const jimpSupported = new Set([
	"image/jpeg",
	"image/png",
	"image/bmp",
	"image/tiff",
	"image/gif",
]);
const resizeSupported = new Set([...sharpSupported, ...jimpSupported]);

export async function ImageProxy(req: Request, res: Response) {
	const path = req.originalUrl.split("/").slice(2);

	// src/api/util/utility/EmbedHandlers.ts getProxyUrl
	const hash = crypto
		.createHmac("sha1", Config.get().security.requestSignature)
		.update(path.slice(1).join("/"))
		.digest("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

	try {
		if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(path[0])))
			throw new Error("Invalid signature");
	} catch {
		console.log("Invalid signature, expected " + hash + " got " + path[0]);
		res.status(403).send("Invalid signature");
		return;
	}

	const abort = new AbortController();
	setTimeout(() => abort.abort(), 5000);

	const request = await fetch(path.slice(2).join("/"), {
		headers: {
			"User-Agent": "SpacebarImageProxy/1.0.0 (https://spacebar.chat)",
		},
		signal: abort.signal,
	}).catch((e) => {
		if (e.name === "AbortError") res.status(504).send("Request timed out");
		else res.status(500).send("Unable to proxy origin: " + e.message);
	});
	if (!request) return;

	if (request.status !== 200) {
		res.status(request.status).send(
			"Origin failed to respond: " +
				request.status +
				" " +
				request.statusText,
		);
		return;
	}

	if (
		!request.headers.get("Content-Type") ||
		!request.headers.get("Content-Length")
	) {
		res.status(500).send(
			"Origin did not provide a Content-Type or Content-Length header",
		);
		return;
	}

	// @ts-expect-error TS doesn't believe that the header cannot be null (it's checked for falsiness above)
	if (parseInt(request.headers.get("Content-Length")) > 1024 * 1024 * 10) {
		res.status(500).send(
			"Origin provided a Content-Length header that is too large",
		);
		return;
	}

	// @ts-expect-error TS doesn't believe that the header cannot be null (it's checked for falsiness above)
	let contentType: string = request.headers.get("Content-Type");

	const arrayBuffer = await request.arrayBuffer();
	let resultBuffer = Buffer.from(arrayBuffer);

	if (
		!sentImageProxyWarning &&
		resizeSupported.has(contentType) &&
		/^\d+x\d+$/.test(path[1])
	) {
		if (sharp !== false) {
			try {
				sharp = await import("sharp");
			} catch {
				sharp = false;
			}
		}

		if (sharp === false && !Jimp) {
			try {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore Typings don't fit
				Jimp = await import("jimp");
			} catch {
				sentImageProxyWarning = true;
				console.log(
					`[ImageProxy] ${yellow(
						'Neither "sharp" or "jimp" NPM packages are installed, image resizing will be disabled',
					)}`,
				);
			}
		}

		const [width, height] = path[1].split("x").map((x) => parseInt(x));

		const buffer = Buffer.from(arrayBuffer);
		if (sharp && sharpSupported.has(contentType)) {
			resultBuffer = await sharp
				.default(buffer)
				// Sharp doesn't support "scaleToFit"
				.resize(width)
				.toBuffer();
		} else if (Jimp && jimpSupported.has(contentType)) {
			resultBuffer = await Jimp.read(buffer).then((image) => {
				contentType = image.getMIME();
				return (
					image
						.scaleToFit(width, height)
						// @ts-expect-error Jimp is defined at this point
						.getBufferAsync(Jimp.AUTO)
				);
			});
		}
	}

	res.header("Content-Type", contentType);
	res.setHeader(
		"Cache-Control",
		"public, max-age=" + Config.get().cdn.proxyCacheHeaderSeconds,
	);

	res.send(resultBuffer);
}
