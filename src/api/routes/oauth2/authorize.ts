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
	ApiError,
	Application,
	ApplicationAuthorizeSchema,
	DiscordApiErrors,
	FieldErrors,
	Member,
	Permissions,
	User,
	getPermission,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

// TODO: scopes, other oauth types

router.get(
	"/",
	route({
		query: {
			client_id: {
				type: "string",
			},
		},
		responses: {
			// TODO: I really didn't feel like typing all of it out
			200: {},
			400: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		// const { client_id, scope, response_type, redirect_url } = req.query;
		const { client_id } = req.query;
		if (!client_id) {
			throw FieldErrors({
				client_id: {
					code: "BASE_TYPE_REQUIRED",
					message: req.t("common:field.BASE_TYPE_REQUIRED"),
				},
			});
		}

		const app = await Application.findOne({
			where: {
				id: client_id as string,
			},
			relations: ["bot"],
		});

		// TODO: use DiscordApiErrors
		// findOneOrFail throws code 404
		if (!app) throw DiscordApiErrors.UNKNOWN_APPLICATION;
		if (!app.bot) throw DiscordApiErrors.OAUTH2_APPLICATION_BOT_ABSENT;

		const bot = app.bot;
		delete app.bot;

		const user = await User.findOneOrFail({
			where: {
				id: req.user_id,
				bot: false,
			},
			select: [
				"id",
				"username",
				"avatar",
				"discriminator",
				"public_flags",
			],
		});

		const guilds = await Member.find({
			where: {
				user: {
					id: req.user_id,
				},
			},
			relations: ["guild", "roles"],
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			// prettier-ignore
			select: ["guild.id", "guild.name", "guild.icon", "guild.mfa_level", "guild.owner_id", "roles.id"],
		});

		const guildsWithPermissions = guilds.map((x) => {
			const perms =
				x.guild.owner_id === user.id
					? new Permissions(Permissions.FLAGS.ADMINISTRATOR)
					: Permissions.finalPermission({
							user: {
								id: user.id,
								roles: x.roles?.map((x) => x.id) || [],
							},
							guild: {
								roles: x?.roles || [],
							},
						});

			return {
				id: x.guild.id,
				name: x.guild.name,
				icon: x.guild.icon,
				mfa_level: x.guild.mfa_level,
				permissions: perms.bitfield.toString(),
			};
		});

		return res.json({
			guilds: guildsWithPermissions,
			user: {
				id: user.id,
				username: user.username,
				avatar: user.avatar,
				avatar_decoration: null, // TODO
				discriminator: user.discriminator,
				public_flags: user.public_flags,
			},
			application: {
				id: app.id,
				name: app.name,
				icon: app.icon,
				description: app.description,
				summary: app.summary,
				type: app.type,
				hook: app.hook,
				guild_id: null, // TODO support guilds
				bot_public: app.bot_public,
				bot_require_code_grant: app.bot_require_code_grant,
				verify_key: app.verify_key,
				flags: app.flags,
			},
			bot: {
				id: bot.id,
				username: bot.username,
				avatar: bot.avatar,
				avatar_decoration: null, // TODO
				discriminator: bot.discriminator,
				public_flags: bot.public_flags,
				bot: true,
				approximated_guild_count: 0, // TODO
			},
			authorized: false,
		});
	},
);

router.post(
	"/",
	route({
		requestBody: "ApplicationAuthorizeSchema",
		query: {
			client_id: {
				type: "string",
			},
		},
		responses: {
			200: {
				body: "OAuthAuthorizeResponse",
			},
			400: {
				body: "APIErrorResponse",
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
		const body = req.body as ApplicationAuthorizeSchema;
		// const { client_id, scope, response_type, redirect_url } = req.query;
		const { client_id } = req.query;

		if (!client_id) {
			throw FieldErrors({
				client_id: {
					code: "BASE_TYPE_REQUIRED",
					message: req.t("common:field.BASE_TYPE_REQUIRED"),
				},
			});
		}

		// TODO: ensure guild_id is not an empty string
		// TODO: captcha verification
		// TODO: MFA verification

		const perms = await getPermission(
			req.user_id,
			body.guild_id,
			undefined,
			{ member_relations: ["user"] },
		);
		// getPermission cache won't exist if we're owner
		if (
			Object.keys(perms.cache || {}).length > 0 &&
			perms.cache.member?.user.bot
		)
			throw DiscordApiErrors.UNAUTHORIZED;
		perms.hasThrow("MANAGE_GUILD");

		const app = await Application.findOne({
			where: {
				id: client_id as string,
			},
			relations: ["bot"],
		});

		// TODO: use DiscordApiErrors
		// findOneOrFail throws code 404
		if (!app) throw new ApiError("Unknown Application", 10002, 404);
		if (!app.bot)
			throw new ApiError(
				"OAuth2 application does not have a bot",
				50010,
				400,
			);

		await Member.addToGuild(app.id, body.guild_id);

		return res.json({
			location: "/oauth2/authorized", // redirect URL
		});
	},
);

export default router;
