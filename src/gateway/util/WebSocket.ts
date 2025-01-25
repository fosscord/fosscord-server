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

import { Intents, ListenEventOpts, Permissions } from "@spacebar/util";
import WS from "ws";
import { Deflate, Inflate } from "fast-zlib";
import { Capabilities } from "./Capabilities";
import { Client } from "@spacebar/webrtc";

export interface WebSocket extends WS {
	version: number;
	user_id: string;
	session_id: string;
	encoding: "etf" | "json";
	compress?: "zlib-stream";
	ipAddress?: string;
	shard_count?: bigint;
	shard_id?: bigint;
	deflate?: Deflate;
	inflate?: Inflate;
	heartbeatTimeout: NodeJS.Timeout;
	readyTimeout: NodeJS.Timeout;
	intents: Intents;
	sequence: number;
	permissions: Record<string, Permissions>;
	events: Record<string, undefined | (() => unknown)>;
	member_events: Record<string, () => unknown>;
	listen_options: ListenEventOpts;
	capabilities?: Capabilities;
	webrtcClient?: Client;
	large_threshold: number;
}
