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

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

import http from "http";
import * as Api from "@spacebar/api";
import * as Gateway from "@spacebar/gateway";
import { CDNServer } from "@spacebar/cdn";
import * as Webrtc from "@spacebar/webrtc";
import express from "express";
import { green, bold } from "picocolors";
import { Config, initDatabase, Sentry } from "@spacebar/util";

const app = express();
const server = http.createServer();
const port = Number(process.env.PORT) || 3001;
const production = process.env.NODE_ENV == "development" ? false : true;
server.on("request", app);

const api = new Api.SpacebarServer({ server, port, production, app });
const cdn = new CDNServer({ server, port, production, app });
const gateway = new Gateway.Server({ server, port, production });
const webrtc = new Webrtc.Server({ server, port, production });

process.on("SIGTERM", async () => {
	console.log("Shutting down due to SIGTERM");
	await gateway.stop();
	await cdn.stop();
	await api.stop();
	await webrtc.stop();
	server.close();
	Sentry.close();
});

async function main() {
	await initDatabase();
	await Config.init();
	await Sentry.init(app);

	await new Promise((resolve) =>
		server.listen({ port }, () => resolve(undefined)),
	);
	await Promise.all([
		api.start(),
		cdn.start(),
		gateway.start(),
		webrtc.start(),
	]);

	Sentry.errorHandler(app);

	console.log(`[Server] ${green(`listening on port ${bold(port)}`)}`);
}

main().catch(console.error);
