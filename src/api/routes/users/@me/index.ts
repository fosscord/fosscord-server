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
	emitEvent,
	FieldErrors,
	generateToken,
	handleFile,
	PrivateUserProjection,
	User,
	UserModifySchema,
	UserUpdateEvent,
} from "@spacebar/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "APIPrivateUser",
			},
		},
	}),
	async (req: Request, res: Response) => {
		res.json(
			await User.findOne({
				select: PrivateUserProjection,
				where: { id: req.user_id },
			}),
		);
	},
);

router.patch(
	"/",
	route({
		requestBody: "UserModifySchema",
		responses: {
			200: {
				body: "UserUpdateResponse",
			},
			400: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const body = req.body as UserModifySchema;

		const user = await User.findOneOrFail({
			where: { id: req.user_id },
			select: [...PrivateUserProjection, "data"],
		});

		// Populated on password change
		let newToken: string | undefined;

		if (body.avatar)
			body.avatar = await handleFile(
				`/avatars/${req.user_id}`,
				body.avatar as string,
			);
		if (body.banner)
			body.banner = await handleFile(
				`/banners/${req.user_id}`,
				body.banner as string,
			);

		if (body.password) {
			if (user.data?.hash) {
				const same_password = await bcrypt.compare(
					body.password,
					user.data.hash || "",
				);
				if (!same_password) {
					throw FieldErrors({
						password: {
							message: req.t("auth:login.INVALID_PASSWORD"),
							code: "INVALID_PASSWORD",
						},
					});
				}
			} else {
				user.data.hash = await bcrypt.hash(body.password, 12);
			}
		}

		if (body.email) {
			if (!body.email && Config.get().register.email.required)
				throw FieldErrors({
					email: {
						message: req.t("auth:register.EMAIL_INVALID"),
						code: "EMAIL_INVALID",
					},
				});
			if (!body.password)
				throw FieldErrors({
					password: {
						message: req.t("auth:login.INVALID_PASSWORD"),
						code: "INVALID_PASSWORD",
					},
				});
		}

		if (body.new_password) {
			if (!body.password && user.email) {
				throw FieldErrors({
					password: {
						code: "BASE_TYPE_REQUIRED",
						message: req.t("common:field.BASE_TYPE_REQUIRED"),
					},
				});
			}
			user.data.hash = await bcrypt.hash(body.new_password, 12);
			user.data.valid_tokens_since = new Date();
			newToken = (await generateToken(user.id)) as string;
		}

		if (body.username) {
			const check_username = body?.username?.replace(/\s/g, "");
			if (!check_username) {
				throw FieldErrors({
					username: {
						code: "BASE_TYPE_REQUIRED",
						message: req.t("common:field.BASE_TYPE_REQUIRED"),
					},
				});
			}

			const { maxUsername } = Config.get().limits.user;
			if (check_username.length > maxUsername) {
				throw FieldErrors({
					username: {
						code: "BASE_TYPE_BAD_LENGTH",
						message: `Must be between 2 and ${maxUsername} in length.`,
					},
				});
			}

			if (!body.password) {
				throw FieldErrors({
					password: {
						message: req.t("auth:login.INVALID_PASSWORD"),
						code: "INVALID_PASSWORD",
					},
				});
			}
		}

		if (body.discriminator) {
			if (
				await User.findOne({
					where: {
						discriminator: body.discriminator,
						username: body.username || user.username,
					},
				})
			) {
				throw FieldErrors({
					discriminator: {
						code: "INVALID_DISCRIMINATOR",
						message: "This discriminator is already in use.",
					},
				});
			}
		}

		if (body.bio) {
			const { maxBio } = Config.get().limits.user;
			if (body.bio.length > maxBio) {
				throw FieldErrors({
					bio: {
						code: "BIO_INVALID",
						message: `Bio must be less than ${maxBio} in length`,
					},
				});
			}
		}

		user.assign(body);
		user.validate();
		await user.save();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		delete user.data;

		// TODO: send update member list event in gateway
		await emitEvent({
			event: "USER_UPDATE",
			user_id: req.user_id,
			data: user,
		} as UserUpdateEvent);

		res.json({
			...user,
			newToken,
		});
	},
);

export default router;
// {"message": "Invalid two-factor code", "code": 60008}
