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

import { random, route } from "@spacebar/api";
import { Config, ValidRegistrationToken } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router: Router = Router();
export default router;

router.get(
	"/",
	route({
		query: {
			count: {
				type: "number",
				description:
					"The number of registration tokens to generate. Defaults to 1.",
			},
			length: {
				type: "number",
				description:
					"The length of each registration token. Defaults to 255.",
			},
		},
		right: "CREATE_REGISTRATION_TOKENS",
		responses: { 200: { body: "GenerateRegistrationTokensResponse" } },
	}),
	async (req: Request, res: Response) => {
		const count = req.query.count ? parseInt(req.query.count as string) : 1;
		const length = req.query.length
			? parseInt(req.query.length as string)
			: 255;

		const tokens: ValidRegistrationToken[] = [];

		for (let i = 0; i < count; i++) {
			const token = ValidRegistrationToken.create({
				token: random(length),
				expires_at:
					Date.now() +
					Config.get().security.defaultRegistrationTokenExpiration,
			});
			tokens.push(token);
		}

		// Why are these options used, exactly?
		await ValidRegistrationToken.save(tokens, {
			chunk: 1000,
			reload: false,
			transaction: false,
		});

		const ret = req.query.include_url
			? tokens.map(
					(x) =>
						`${Config.get().general.frontPage}/register?token=${
							x.token
						}`,
				)
			: tokens.map((x) => x.token);

		if (req.query.plain) return res.send(ret.join("\n"));

		return res.json({ tokens: ret });
	},
);
