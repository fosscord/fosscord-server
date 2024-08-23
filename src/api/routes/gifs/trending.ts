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

import { route } from "@spacebar/api";
import {
	TenorCategoriesResults,
	TenorTrendingResults,
	getGifApiKey,
	parseGifResult,
} from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router();

router.get(
	"/",
	route({
		query: {
			locale: {
				type: "string",
				description: "Locale",
			},
		},
		responses: {
			200: {
				body: "TenorTrendingResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		// TODO: Custom providers
		// TODO: return gifs as mp4
		// const { media_format, locale } = req.query;
		const { locale } = req.query;

		const apiKey = getGifApiKey();

		const [responseSource, trendGifSource] = await Promise.all([
			fetch(
				`https://g.tenor.com/v1/categories?locale=${locale}&key=${apiKey}`,
				{
					method: "get",
					headers: { "Content-Type": "application/json" },
				},
			),
			fetch(
				`https://g.tenor.com/v1/trending?locale=${locale}&key=${apiKey}`,
				{
					method: "get",
					headers: { "Content-Type": "application/json" },
				},
			),
		]);

		const { tags } =
			(await responseSource.json()) as TenorCategoriesResults;
		const { results } =
			(await trendGifSource.json()) as TenorTrendingResults;

		res.json({
			categories: tags.map((x) => ({
				name: x.searchterm,
				src: x.image,
			})),
			gifs: [parseGifResult(results[0])],
		}).status(200);
	},
);

export default router;
