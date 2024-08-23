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

import * as Sentry from "@sentry/node";
import { checkToken, Rights } from "@spacebar/util";
import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";

export const NO_AUTHORIZATION_ROUTES = [
	// Authentication routes
	"/auth/login",
	"/auth/register",
	"/auth/location-metadata",
	"/auth/mfa/totp",
	"/auth/mfa/webauthn",
	"/auth/verify",
	"/auth/forgot",
	"/auth/reset",
	// Routes with a seperate auth system
	/\/webhooks\/\d+\/\w+\/?/, // no token requires auth
	// Public information endpoints
	"/ping",
	"/gateway",
	"/experiments",
	"/updates",
	"/download",
	"/scheduled-maintenances/upcoming.json",
	// Public kubernetes integration
	"/-/readyz",
	"/-/healthz",
	// Client analytics
	"/science",
	"/track",
	// Public policy pages
	"/policies/instance",
	// Oauth callback
	"/oauth2/callback",
	// Asset delivery
	/\/guilds\/\d+\/widget\.(json|png)/,
	// Connections
	/\/connections\/\w+\/callback/,
];

export const API_PREFIX = /^\/api(\/v\d+)?/;
export const API_PREFIX_TRAILING_SLASH = /^\/api(\/v\d+)?\//;

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user_id: string;
			user_bot: boolean;
			token: { id: string; iat: number };
			rights: Rights;
		}
	}
}

export async function Authentication(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (req.method === "OPTIONS") return res.sendStatus(204);
	const url = req.url.replace(API_PREFIX, "");
	if (url.startsWith("/invites") && req.method === "GET") return next();
	if (
		NO_AUTHORIZATION_ROUTES.some((x) => {
			if (typeof x === "string") return url.startsWith(x);
			return x.test(url);
		})
	)
		return next();
	if (!req.headers.authorization)
		return next(new HTTPError("Missing Authorization Header", 401));

	Sentry.setUser({ id: req.user_id });

	try {
		const { decoded, user } = await checkToken(req.headers.authorization);

		req.token = decoded;
		req.user_id = decoded.id;
		req.user_bot = user.bot;
		req.rights = new Rights(Number(user.rights));
		return next();
	} catch (error) {
		return next(new HTTPError(error!.toString(), 400));
	}
}
