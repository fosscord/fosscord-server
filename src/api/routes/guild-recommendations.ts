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

import { Config, Guild } from "@spacebar/util";

import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
import { Like } from "typeorm";

const router = Router();

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "GuildRecommendationsResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		// const { limit, personalization_disabled } = req.query;
		const { limit } = req.query;
		const showAllGuilds = Config.get().guild.discovery.showAllGuilds;

		const genLoadId = (size: number) =>
			[...Array(size)]
				.map(() => Math.floor(Math.random() * 16).toString(16))
				.join("");

		const guilds = showAllGuilds
			? await Guild.find({ take: Math.abs(Number(limit || 24)) })
			: await Guild.find({
					where: { features: Like("%DISCOVERABLE%") },
					take: Math.abs(Number(limit || 24)),
				});
		res.send({
			recommended_guilds: guilds,
			load_id: `server_recs/${genLoadId(32)}`,
		}).status(200);
	},
);

export default router;
