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

import {
	Config,
	ConnectionConfig,
	ConnectionLoader,
	Email,
	JSONReplacer,
	Sentry,
	WebAuthn,
	initDatabase,
	initEvent,
	registerRoutes,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { Server, ServerOptions } from "lambert-server";
import "missing-native-js-functions";
import morgan from "morgan";
import path from "path";
import { red } from "picocolors";
import { Authentication, CORS, ImageProxy } from "./middlewares/";
import { BodyParser } from "./middlewares/BodyParser";
import { ErrorHandler } from "./middlewares/ErrorHandler";
import { initRateLimits } from "./middlewares/RateLimit";
import { initTranslation } from "./middlewares/Translation";
import { initInstance } from "./util/handlers/Instance";

const PUBLIC_ASSETS_FOLDER = path.join(
	__dirname,
	"..",
	"..",
	"assets",
	"public",
);

export type SpacebarServerOptions = ServerOptions;

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			server: SpacebarServer;
		}
	}
}

export class SpacebarServer extends Server {
	public declare options: SpacebarServerOptions;

	constructor(opts?: Partial<SpacebarServerOptions>) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		super({ ...opts, errorHandler: false, jsonBody: false });
	}

	async start() {
		await initDatabase();
		await Config.init();
		await initEvent();
		await Email.init();
		await ConnectionConfig.init();
		await initInstance();
		await Sentry.init(this.app);
		WebAuthn.init();

		const logRequests = process.env["LOG_REQUESTS"] != undefined;
		if (logRequests) {
			this.app.use(
				morgan("combined", {
					skip: (req, res) => {
						let skip = !(
							process.env["LOG_REQUESTS"]?.includes(
								res.statusCode.toString(),
							) ?? false
						);
						if (process.env["LOG_REQUESTS"]?.charAt(0) == "-")
							skip = !skip;
						return skip;
					},
				}),
			);
		}

		this.app.set("json replacer", JSONReplacer);
		this.app.disable("x-powered-by");

		const trustedProxies = Config.get().security.trustedProxies;
		if (trustedProxies) this.app.set("trust proxy", trustedProxies);

		this.app.use(CORS);
		this.app.use(BodyParser({ inflate: true, limit: "10mb" }));

		const app = this.app;
		const api = Router();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.app = api;

		api.use(Authentication);
		await initRateLimits(api);
		await initTranslation(api);

		this.routes = await registerRoutes(
			this,
			path.join(__dirname, "routes", "/"),
		);

		// 404 is not an error in express, so this should not be an error middleware
		// this is a fine place to put the 404 handler because its after we register the routes
		// and since its not an error middleware, our error handler below still works.
		api.use("*", (req: Request, res: Response) => {
			res.status(404).json({
				message: "404 endpoint not found",
				code: 0,
			});
		});

		this.app = app;

		//app.use("/__development", )
		//app.use("/__internals", )
		app.use("/api/v6", api);
		app.use("/api/v7", api);
		app.use("/api/v8", api);
		app.use("/api/v9", api);
		app.use("/api", api); // allow unversioned requests

		app.use("/imageproxy/:hash/:size/:url", ImageProxy);

		app.get("/", (req, res) =>
			res.sendFile(path.join(PUBLIC_ASSETS_FOLDER, "index.html")),
		);

		app.get("/verify", (req, res) =>
			res.sendFile(path.join(PUBLIC_ASSETS_FOLDER, "verify.html")),
		);

		this.app.use(ErrorHandler);

		Sentry.errorHandler(this.app);

		ConnectionLoader.loadConnections();

		if (logRequests)
			console.log(
				red(
					`Warning: Request logging is enabled! This will spam your console!\nTo disable this, unset the 'LOG_REQUESTS' environment variable!`,
				),
			);

		return super.start();
	}
}
