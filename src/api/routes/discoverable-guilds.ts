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
				body: "DiscoverableGuildsResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { offset, limit, categories } = req.query;
		const showAllGuilds = Config.get().guild.discovery.showAllGuilds;
		const configLimit = Config.get().guild.discovery.limit;
		let guilds;
		if (categories == undefined) {
			guilds = showAllGuilds
				? await Guild.find({
						take: Math.abs(Number(limit || configLimit)),
					})
				: await Guild.find({
						where: { features: Like(`%DISCOVERABLE%`) },
						take: Math.abs(Number(limit || configLimit)),
					});
		} else {
			guilds = showAllGuilds
				? await Guild.find({
						where: { primary_category_id: categories.toString() },
						take: Math.abs(Number(limit || configLimit)),
					})
				: await Guild.find({
						where: {
							primary_category_id: categories.toString(),
							features: Like("%DISCOVERABLE%"),
						},
						take: Math.abs(Number(limit || configLimit)),
					});
		}

		const total = guilds ? guilds.length : undefined;

		res.send({
			total: total,
			guilds: guilds,
			offset: Number(offset || Config.get().guild.discovery.offset),
			limit: Number(limit || configLimit),
		});
	},
);

export default router;
