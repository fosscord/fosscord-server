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

import { Config, Embed, EmbedImage, EmbedType } from "@spacebar/util";
import * as cheerio from "cheerio";
import crypto from "crypto";
import { promisify } from "node:util";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";
import { yellow } from "picocolors";
import probe from "probe-image-size";
import { pipeline } from "stream";
import { TransformStream } from "stream/web";

export const DEFAULT_FETCH_OPTIONS: RequestInit = {
	redirect: "follow",
	headers: {
		"user-agent":
			"Mozilla/5.0 (compatible; Spacebar/1.0; +https://github.com/spacebarchat/server)",
		"Accept-Encoding": "gzip, deflate, br",
	},
	// size: 1024 * 1024 * 5, 	// grabbed from config later
	// compress: true,
	method: "GET",
};

const makeEmbedImage = (
	url: string | undefined,
	width: number | undefined,
	height: number | undefined,
): Required<EmbedImage> | undefined => {
	if (!url || !width || !height) return undefined;
	return {
		url,
		width,
		height,
		proxy_url: getProxyUrl(new URL(url), width, height),
	};
};

let hasWarnedAboutImagor = false;

export const getProxyUrl = (
	url: URL,
	width: number,
	height: number,
): string => {
	const { resizeWidthMax, resizeHeightMax, imagorServerUrl } =
		Config.get().cdn;
	const secret = Config.get().security.requestSignature;
	width = Math.min(width || 500, resizeWidthMax || width);
	height = Math.min(height || 500, resizeHeightMax || width);

	// Imagor
	if (imagorServerUrl) {
		const path = `${width}x${height}/${url.host}${url.pathname}`;

		const hash = crypto
			.createHmac("sha1", secret)
			.update(path)
			.digest("base64")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");

		return `${imagorServerUrl}/${hash}/${path}`;
	}

	if (!hasWarnedAboutImagor) {
		hasWarnedAboutImagor = true;
		console.log(
			"[Embeds]",
			yellow(
				"Imagor has not been set up correctly. https://docs.spacebar.chat/setup/server/configuration/imagor/",
			),
		);
	}

	return url.toString();
};

const getMeta = ($: cheerio.CheerioAPI, name: string): string | undefined => {
	let elem = $(`meta[property="${name}"]`);
	if (!elem.length) elem = $(`meta[name="${name}"]`);
	const ret = elem.attr("content") || elem.text();
	return ret.trim().length == 0 ? undefined : ret;
};

const tryParseInt = (str: string | undefined) => {
	if (!str) return undefined;
	try {
		return parseInt(str);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return undefined;
	}
};

export const getMetaDescriptions = (text: string) => {
	const $ = cheerio.load(text);

	return {
		type: getMeta($, "og:type"),
		title: getMeta($, "og:title") || $("title").first().text(),
		provider_name: getMeta($, "og:site_name"),
		author: getMeta($, "article:author"),
		description: getMeta($, "og:description") || getMeta($, "description"),
		image: getMeta($, "og:image") || getMeta($, "twitter:image"),
		image_fallback: $(`image`).attr("src"),
		video_fallback: $(`video`).attr("src"),
		width: tryParseInt(getMeta($, "og:image:width")),
		height: tryParseInt(getMeta($, "og:image:height")),
		url: getMeta($, "og:url"),
		youtube_embed: getMeta($, "og:video:secure_url"),
		site_name: getMeta($, "og:site_name"),

		$,
	};
};

const pipelineAsync = promisify(pipeline);

const doFetch = async (url: URL) => {
	try {
		const response = await fetch(url, {
			...DEFAULT_FETCH_OPTIONS,
			headers: {
				...DEFAULT_FETCH_OPTIONS.headers,
				"Accept-Encoding": "gzip, deflate, br",
			},
		});

		const maxSize = Config.get().limits.message.maxEmbedDownloadSize;
		const contentLength = response.headers.get("content-length");
		if (contentLength && parseInt(contentLength) > maxSize) {
			throw new Error(
				`Response size exceeds the limit of ${maxSize} bytes`,
			);
		}

		const encoding = response.headers.get("Content-Encoding");
		if (!encoding || encoding === "identity") {
			return await response.text();
		}

		let decompressedStream;
		switch (encoding) {
			case "gzip":
				decompressedStream = createGunzip();
				break;
			case "deflate":
				decompressedStream = createInflate();
				break;
			case "br":
				decompressedStream = createBrotliDecompress();
				break;
			default:
				throw new Error(`Unsupported encoding: ${encoding}`);
		}

		const decompressedChunks: Uint8Array[] = [];
		if (response.body) {
			const readableStream = response.body.pipeThrough(
				new TransformStream({
					transform(chunk, controller) {
						decompressedChunks.push(chunk);
						controller.enqueue(chunk);
					},
				}),
			);

			await pipelineAsync(readableStream, decompressedStream);
		}

		const decompressedBuffer = Buffer.concat(decompressedChunks);
		return decompressedBuffer.toString("utf-8");
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return null;
	}
};
const genericImageHandler = async (url: URL): Promise<Embed | null> => {
	const type = await fetch(url, {
		...DEFAULT_FETCH_OPTIONS,
		method: "HEAD",
	});

	let image;

	if (type.headers.get("content-type")?.indexOf("image") !== -1) {
		const result = await probe(url.href);
		image = makeEmbedImage(url.href, result.width, result.height);
	} else if (type.headers.get("content-type")?.indexOf("video") !== -1) {
		// TODO
		return null;
	} else {
		// have to download the page, unfortunately
		const response = await doFetch(url);
		if (!response) return null;
		const metas = getMetaDescriptions(await response);
		image = makeEmbedImage(
			metas.image || metas.image_fallback,
			metas.width,
			metas.height,
		);
	}

	if (!image) return null;

	return {
		url: url.href,
		type: EmbedType.image,
		thumbnail: image,
	};
};

export const EmbedHandlers: {
	[key: string]: (url: URL) => Promise<Embed | Embed[] | null>;
} = {
	// the url does not have a special handler
	default: async (url: URL) => {
		const type = await fetch(url, {
			...DEFAULT_FETCH_OPTIONS,
			method: "HEAD",
		});
		if (type.headers.get("content-type")?.indexOf("image") !== -1)
			return await genericImageHandler(url);

		const response = await doFetch(url);
		if (!response) return null;

		const metas = getMetaDescriptions(response);

		// TODO: handle video

		if (!metas.image) metas.image = metas.image_fallback;

		if (metas.image && (!metas.width || !metas.height)) {
			const result = await probe(metas.image);
			metas.width = result.width;
			metas.height = result.height;
		}

		if (!metas.image && (!metas.title || !metas.description)) {
			// we don't have any content to display
			return null;
		}

		let embedType = EmbedType.link;
		if (metas.type == "article") embedType = EmbedType.article;
		if (metas.type == "object") embedType = EmbedType.article; // github
		if (metas.type == "rich") embedType = EmbedType.rich;

		return {
			url: url.href,
			type: embedType,
			title: metas.title,
			thumbnail: makeEmbedImage(metas.image, metas.width, metas.height),
			description: metas.description,
			provider: metas.site_name
				? {
						name: metas.site_name,
						url: url.origin,
					}
				: undefined,
		};
	},

	"giphy.com": genericImageHandler,
	"media4.giphy.com": genericImageHandler,
	"tenor.com": genericImageHandler,
	"c.tenor.com": genericImageHandler,
	"media.tenor.com": genericImageHandler,

	"facebook.com": (url) => EmbedHandlers["www.facebook.com"](url),
	"www.facebook.com": async (url: URL) => {
		const response = await doFetch(url);
		if (!response) return null;
		const metas = getMetaDescriptions(response);

		return {
			url: url.href,
			type: EmbedType.link,
			title: metas.title,
			description: metas.description,
			thumbnail: makeEmbedImage(metas.image, 640, 640),
			color: 16777215,
		};
	},

	"twitter.com": (url) => EmbedHandlers["www.twitter.com"](url),
	"www.twitter.com": async (url: URL) => {
		const token = Config.get().external.twitter;
		if (!token) return null;

		if (!url.href.includes("/status/")) return null; // TODO;
		const id = url.pathname.split("/")[3]; // super bad lol
		if (!parseInt(id)) return null;
		const endpointUrl =
			`https://api.twitter.com/2/tweets/${id}` +
			`?expansions=author_id,attachments.media_keys` +
			`&media.fields=url,width,height` +
			`&tweet.fields=created_at,public_metrics` +
			`&user.fields=profile_image_url`;

		const response = await fetch(endpointUrl, {
			...DEFAULT_FETCH_OPTIONS,
			headers: {
				authorization: `Bearer ${token}`,
			},
		});
		const json = (await response.json()) as TwitterApiResponse;
		if (json.errors) return null;
		const author = json.includes.users[0];
		const text = json.data[0].text;
		const created_at = new Date(json.data[0].created_at);
		const metrics = json.data[0].public_metrics;
		const media = json.includes.media?.filter(
			(x: { type: string }) => x.type == "photo",
		);

		const embed: Embed = {
			type: EmbedType.rich,
			url: `${url.origin}${url.pathname}`,
			description: text,
			author: {
				url: `https://twitter.com/${author.username}`,
				name: `${author.name} (@${author.username})`,
				proxy_icon_url: getProxyUrl(
					new URL(author.profile_image_url),
					400,
					400,
				),
				icon_url: author.profile_image_url,
			},
			timestamp: created_at,
			fields: [
				{
					inline: true,
					name: "Likes",
					value: metrics.like_count.toString(),
				},
				{
					inline: true,
					name: "Retweet",
					value: metrics.retweet_count.toString(),
				},
			],
			color: 1942002,
			footer: {
				text: "Twitter",
				proxy_icon_url: getProxyUrl(
					new URL(
						"https://abs.twimg.com/icons/apple-touch-icon-192x192.png",
					),
					192,
					192,
				),
				icon_url:
					"https://abs.twimg.com/icons/apple-touch-icon-192x192.png",
			},
			// Discord doesn't send this?
			// provider: {
			// 	name: "Twitter",
			// 	url: "https://twitter.com"
			// },
		};

		if (media && media.length > 0) {
			embed.image = {
				width: media[0].width,
				height: media[0].height,
				url: media[0].url,
				proxy_url: getProxyUrl(
					new URL(media[0].url),
					media[0].width,
					media[0].height,
				),
			};
			media.shift();
		}

		return embed;

		// TODO: Client won't merge these into a single embed, for some reason.
		// return [embed, ...media.map((x: any) => ({
		// 	// generate new embeds for each additional attachment
		// 	type: EmbedType.rich,
		// 	url: url.href,
		// 	image: {
		// 		width: x.width,
		// 		height: x.height,
		// 		url: x.url,
		// 		proxy_url: getProxyUrl(new URL(x.url), x.width, x.height)
		// 	}
		// }))];
	},

	"open.spotify.com": async (url: URL) => {
		const response = await doFetch(url);
		if (!response) return null;
		const metas = getMetaDescriptions(response);

		return {
			url: url.href,
			type: EmbedType.link,
			title: metas.title,
			description: metas.description,
			thumbnail: makeEmbedImage(metas.image, 640, 640),
			provider: {
				url: "https://spotify.com",
				name: "Spotify",
			},
		};
	},

	// TODO: docs: Pixiv won't work without Imagor
	"pixiv.net": (url) => EmbedHandlers["www.pixiv.net"](url),
	"www.pixiv.net": async (url: URL) => {
		const response = await doFetch(url);
		if (!response) return null;
		const metas = getMetaDescriptions(response);

		if (!metas.image) return null;

		return {
			url: url.href,
			type: EmbedType.image,
			title: metas.title,
			description: metas.description,
			image: makeEmbedImage(
				metas.image || metas.image_fallback,
				metas.width,
				metas.height,
			),
			provider: {
				url: "https://pixiv.net",
				name: "Pixiv",
			},
		};
	},

	"store.steampowered.com": async (url: URL) => {
		const response = await doFetch(url);
		if (!response) return null;
		const metas = getMetaDescriptions(response);
		const numReviews = metas.$("#review_summary_num_reviews").val() as
			| string
			| undefined;
		const price = metas
			.$(".game_purchase_price.price")
			.data("price-final") as number | undefined;
		const releaseDate = metas
			.$(".release_date")
			.find("div.date")
			.text()
			.trim();
		const isReleased = new Date(releaseDate) < new Date();

		const fields: Embed["fields"] = [];

		if (numReviews)
			fields.push({
				name: "Reviews",
				value: numReviews,
				inline: true,
			});

		if (price)
			fields.push({
				name: "Price",
				value: `$${price / 100}`,
				inline: true,
			});

		// if the release date is in the past, it's already out
		if (releaseDate && !isReleased)
			fields.push({
				name: "Release Date",
				value: releaseDate,
				inline: true,
			});

		return {
			url: url.href,
			type: EmbedType.rich,
			title: metas.title,
			description: metas.description,
			image: {
				// TODO: meant to be thumbnail.
				// isn't this standard across all of steam?
				width: 460,
				height: 215,
				url: metas.image,
				proxy_url: metas.image
					? getProxyUrl(new URL(metas.image), 460, 215)
					: undefined,
			},
			provider: {
				url: "https://store.steampowered.com",
				name: "Steam",
			},
			fields,
			// TODO: Video
		};
	},

	"reddit.com": (url) => EmbedHandlers["www.reddit.com"](url),
	"www.reddit.com": async (url: URL) => {
		const res = await EmbedHandlers["default"](url);
		return {
			...res,
			color: 16777215,
			provider: {
				name: "reddit",
			},
		};
	},

	"youtu.be": (url) => EmbedHandlers["www.youtube.com"](url),
	"youtube.com": (url) => EmbedHandlers["www.youtube.com"](url),
	"www.youtube.com": async (url: URL): Promise<Embed | null> => {
		const response = await doFetch(url);
		if (!response) return null;
		const metas = getMetaDescriptions(response);

		return {
			video: makeEmbedImage(
				metas.youtube_embed,
				metas.width,
				metas.height,
			),
			url: url.href,
			type: metas.youtube_embed ? EmbedType.video : EmbedType.link,
			title: metas.title,
			thumbnail: makeEmbedImage(
				metas.image || metas.image_fallback,
				metas.width,
				metas.height,
			),
			provider: {
				url: "https://www.youtube.com",
				name: "YouTube",
			},
			description: metas.description,
			color: 16711680,
			author: metas.author
				? {
						name: metas.author,
						// TODO: author channel url
					}
				: undefined,
		};
	},

	"www.xkcd.com": (url) => EmbedHandlers["xkcd.com"](url),
	"xkcd.com": async (url) => {
		const response = await doFetch(url);
		if (!response) return null;

		const metas = getMetaDescriptions(response);
		const hoverText = metas.$("#comic img").attr("title");

		if (!metas.image) return null;

		const { width, height } = await probe(metas.image);

		return {
			url: url.href,
			type: EmbedType.rich,
			title: `xkcd: ${metas.title}`,
			image: makeEmbedImage(metas.image, width, height),
			footer: hoverText
				? {
						text: hoverText,
					}
				: undefined,
		};
	},

	// the url is an image from this instance
	self: async (url: URL): Promise<Embed | null> => {
		const result = await probe(url.href);

		return {
			url: url.href,
			type: EmbedType.image,
			thumbnail: {
				width: result.width,
				height: result.height,
				url: url.href,
				proxy_url: url.href,
			},
		};
	},
};

interface TweetMetrics {
	retweet_count: number;
	reply_count: number;
	like_count: number;
	quote_count: number;
}

interface Tweet {
	public_metrics: TweetMetrics;
	edit_history_tweet_ids: string[];
	text: string;
	id: string;
	created_at: string;
	author_id: string;
}

interface User {
	profile_image_url: string;
	name: string;
	created_at: string;
	id: string;
	username: string;
}
interface Media {
	url: string;
	duration_ms: number;
	type: string;
	height: number;
	media_key: string;
	public_metrics: {
		view_count: number;
	};
	preview_image_url: string;
	width: number;
}

interface TwitterApiResponse {
	errors: {
		code: number;
		message: string;
	}[];
	data: Tweet[];
	includes: {
		media: Media[];
		users: User[];
	};
}
