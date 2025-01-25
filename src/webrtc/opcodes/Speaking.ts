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

import { Payload, Send, WebSocket } from "@spacebar/gateway";
import { getClients, VoiceOPCodes } from "../util";

// {"speaking":1,"delay":5,"ssrc":2805246727}

export async function onSpeaking(this: WebSocket, data: Payload) {
	if (!this.webrtcClient) return;

	getClients(this.webrtcClient.channel_id).forEach((client) => {
		if (client === this.webrtcClient) return;
		if (!this.webrtcClient) return;
		const ssrc = this.webrtcClient.out.tracks.get(client.websocket.user_id);

		Send(client.websocket, {
			op: VoiceOPCodes.SPEAKING,
			d: {
				user_id: client.websocket.user_id,
				speaking: data.d.speaking,
				ssrc: ssrc?.audio_ssrc || 0,
			},
		});
	});
}
