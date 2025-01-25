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

import "missing-native-js-functions";
import dotenv from "dotenv";
dotenv.config();
import {
	closeDatabase,
	Config,
	initDatabase,
	initEvent,
	Sentry,
} from "@spacebar/util";
import ws from "ws";
import { Connection } from "./events/Connection";
import http from "http";

export class Server {
	public ws: ws.Server;
	public port: number;
	public server: http.Server;
	public production: boolean;

	constructor({
		port,
		server,
		production,
	}: {
		port: number;
		server?: http.Server;
		production?: boolean;
	}) {
		this.port = port;
		this.production = production || false;

		if (server) this.server = server;
		else {
			this.server = http.createServer(function (req, res) {
				res.writeHead(200).end("Online");
			});
		}

		this.server.on("upgrade", (request, socket, head) => {
			if (request.url?.includes("voice")) return;
			this.ws.handleUpgrade(request, socket, head, (socket) => {
				this.ws.emit("connection", socket, request);
			});
		});

		this.ws = new ws.Server({
			maxPayload: 4096,
			noServer: true,
		});
		this.ws.on("connection", Connection);
		this.ws.on("error", console.error);
	}

	async start(): Promise<void> {
		await initDatabase();
		await Config.init();
		await initEvent();
		await Sentry.init();

		if (!this.server.listening) {
			this.server.listen(this.port);
			console.log(`[Gateway] online on 0.0.0.0:${this.port}`);
		}
	}

	async stop() {
		this.ws.clients.forEach((x) => x.close());
		this.ws.close(() => {
			this.server.close(() => {
				closeDatabase();
			});
		});
	}
}
