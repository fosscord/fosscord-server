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
	checkToken,
	Email,
	FieldErrors,
	generateToken,
	PasswordResetSchema,
	User,
} from "@spacebar/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";

const router = Router();

// TODO: the response interface also returns settings, but this route doesn't actually return that.
router.post(
	"/",
	route({
		requestBody: "PasswordResetSchema",
		responses: {
			200: {
				body: "TokenOnlyResponse",
			},
			400: {
				body: "APIErrorOrCaptchaResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { password, token } = req.body as PasswordResetSchema;

		let user;
		try {
			const userTokenData = await checkToken(token);
			user = userTokenData.user;
		} catch {
			throw FieldErrors({
				password: {
					message: req.t("auth:password_reset.INVALID_TOKEN"),
					code: "INVALID_TOKEN",
				},
			});
		}

		// the salt is saved in the password refer to bcrypt docs
		const hash = await bcrypt.hash(password, 12);

		const data = {
			data: {
				hash,
				valid_tokens_since: new Date(),
			},
		};
		await User.update({ id: user.id }, data);

		// come on, the user has to have an email to reset their password in the first place

		await Email.sendPasswordChanged(user, user.email!);

		res.json({ token: await generateToken(user.id) });
	},
);

export default router;
