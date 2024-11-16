/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2024 Spacebar and Spacebar Contributors

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
import { User, AutomodRuleSchema, AutomodRule } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router: Router = Router();

router.get(
	"/",
	route({
		permission: ["MANAGE_GUILD"],
		responses: {
			200: {
				body: "AutomodRuleSchemaWithId[]",
			},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const rules = await AutomodRule.find({ where: { guild_id } });
		return res.json(rules);
	},
);

router.post(
	"/",
	route({
		// requestBody: "AutomodRuleSchema",
		permission: ["MANAGE_GUILD"],
		responses: {
			200: {
				body: "AutomodRuleSchemaWithId",
			},
			400: {
				body: "APIErrorResponse",
			},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		if (req.user_id !== req.body.creator_id)
			throw new HTTPError(
				"You can't create a rule for someone else",
				403,
			);

		if (guild_id !== req.body.guild_id)
			throw new HTTPError(
				"You can't create a rule for another guild",
				403,
			);

		if (req.body.id) {
			throw new HTTPError("You can't specify an ID for a new rule", 400);
		}

		const data = req.body as AutomodRuleSchema;

		const created = AutomodRule.create({
			creator: await User.findOneOrFail({
				where: { id: data.creator_id },
			}),
			...data,
		});

		const savedRule = await AutomodRule.save(created);
		return res.json(savedRule);
	},
);

router.patch(
	"/:rule_id",
	route({
		// requestBody: "AutomodRuleSchema
		permission: ["MANAGE_GUILD"],
		responses: {
			200: {
				body: "AutomodRuleSchemaWithId",
			},
			400: {
				body: "APIErrorResponse",
			},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { rule_id } = req.params;
		const rule = await AutomodRule.findOneOrFail({
			where: { id: rule_id },
		});

		const data = req.body as AutomodRuleSchema;

		AutomodRule.merge(rule, data);
		const savedRule = await AutomodRule.save(rule);
		return res.json(savedRule);
	},
);

router.delete(
	"/:rule_id",
	route({
		permission: ["MANAGE_GUILD"],
		responses: {
			204: {},
			403: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { rule_id } = req.params;
		await AutomodRule.delete({ id: rule_id });
		return res.status(204).send();
	},
);

export default router;
