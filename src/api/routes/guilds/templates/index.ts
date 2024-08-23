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
	Config,
	DiscordApiErrors,
	Guild,
	GuildTemplateCreateSchema,
	Member,
	Role,
	Snowflake,
	Template,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
const router: Router = Router();

router.get(
	"/:code",
	route({
		responses: {
			200: {
				body: "Template",
			},
			403: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { allowDiscordTemplates, allowRaws, enabled } =
			Config.get().templates;
		if (!enabled)
			res.json({
				code: 403,
				message:
					"Template creation & usage is disabled on this instance.",
			}).sendStatus(403);

		const { code } = req.params;

		if (code.startsWith("discord:")) {
			if (!allowDiscordTemplates)
				return res
					.json({
						code: 403,
						message:
							"Discord templates cannot be used on this instance.",
					})
					.sendStatus(403);
			const discordTemplateID = code.split("discord:", 2)[1];

			const discordTemplateData = await fetch(
				`https://discord.com/api/v9/guilds/templates/${discordTemplateID}`,
				{
					method: "get",
					headers: { "Content-Type": "application/json" },
				},
			);
			return res.json(await discordTemplateData.json());
		}

		if (code.startsWith("external:")) {
			if (!allowRaws)
				return res
					.json({
						code: 403,
						message: "Importing raws is disabled on this instance.",
					})
					.sendStatus(403);

			return res.json(code.split("external:", 2)[1]);
		}

		const template = await Template.findOneOrFail({
			where: { code: code },
		});
		res.json(template);
	},
);

router.post(
	"/:code",
	route({ requestBody: "GuildTemplateCreateSchema" }),
	async (req: Request, res: Response) => {
		const {
			enabled,
			allowTemplateCreation,
			// allowDiscordTemplates,
			// allowRaws,
		} = Config.get().templates;
		if (!enabled)
			return res
				.json({
					code: 403,
					message:
						"Template creation & usage is disabled on this instance.",
				})
				.sendStatus(403);
		if (!allowTemplateCreation)
			return res
				.json({
					code: 403,
					message: "Template creation is disabled on this instance.",
				})
				.sendStatus(403);

		const { code } = req.params;
		const body = req.body as GuildTemplateCreateSchema;

		const { maxGuilds } = Config.get().limits.user;

		const guild_count = await Member.count({ where: { id: req.user_id } });
		if (guild_count >= maxGuilds) {
			throw DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
		}

		const template = await Template.findOneOrFail({
			where: { code: code },
		});

		const guild_id = Snowflake.generate();

		const [guild] = await Promise.all([
			Guild.create({
				...body,
				...template.serialized_source_guild,
				id: guild_id,
				owner_id: req.user_id,
			}).save(),
			Role.create({
				id: guild_id,
				guild_id: guild_id,
				color: 0,
				hoist: false,
				managed: true,
				mentionable: true,
				name: "@everyone",
				permissions: BigInt("2251804225").toString(), // TODO: where did this come from?
				position: 0,
			}).save(),
		]);

		await Member.addToGuild(req.user_id, guild_id);

		res.status(201).json({ id: guild.id });
	},
);

export default router;
