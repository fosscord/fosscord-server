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

import { WebSocket } from "@spacebar/gateway";
import MediaServer, {
	IncomingStream,
	OutgoingStream,
	Transport,
} from "medooze-media-server";
import SemanticSDP from "semantic-sdp";
MediaServer.enableLog(true);

export const PublicIP = process.env.PUBLIC_IP || "127.0.0.1";

try {
	const range = process.env.WEBRTC_PORT_RANGE || "3690-3960";
	var ports = range.split("-");
	const min = Number(ports[0]);
	const max = Number(ports[1]);

	MediaServer.setPortRange(min, max);
} catch (error) {
	console.error(
		"Invalid env var: WEBRTC_PORT_RANGE",
		process.env.WEBRTC_PORT_RANGE,
		error,
	);
	process.exit(1);
}

export const endpoint = MediaServer.createEndpoint(PublicIP);

export const channels = new Map<string, Set<Client>>();

export interface Client {
	transport?: Transport;
	websocket: WebSocket;
	out: {
		stream?: OutgoingStream;
		tracks: Map<
			string,
			{
				audio_ssrc: number;
				video_ssrc: number;
				rtx_ssrc: number;
			}
		>;
	};
	in: {
		stream?: IncomingStream;
		audio_ssrc: number;
		video_ssrc: number;
		rtx_ssrc: number;
	};
	sdp: SemanticSDP.SDPInfo;
	channel_id: string;
}

export function getClients(channel_id: string) {
	if (!channels.has(channel_id)) channels.set(channel_id, new Set());
	return channels.get(channel_id) as Set<Client>;
}
