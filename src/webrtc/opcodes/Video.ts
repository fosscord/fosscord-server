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
import { validateSchema, VoiceVideoSchema } from "@spacebar/util";
import { channels, getClients, VoiceOPCodes } from "@spacebar/webrtc";
import {
	IncomingStream,
	IncomingStreamTrack,
	SSRCs,
	Transport,
} from "medooze-media-server";
import SemanticSDP from "semantic-sdp";

function createStream(
	this: WebSocket,
	transport: Transport,
	channel_id: string,
) {
	if (!this.webrtcClient) return;
	if (!this.webrtcClient.transport) return;

	const id = "stream" + this.user_id;

	const stream = this.webrtcClient.transport.createIncomingStream(
		SemanticSDP.StreamInfo.expand({
			id,
			tracks: [],
		}),
	);
	this.webrtcClient.in.stream = stream;

	const interval = setInterval(() => {
		for (const track of stream.getTracks()) {
			for (const layer of Object.values(track.getStats())) {
				console.log(track.getId(), layer.total);
			}
		}
	}, 5000);

	stream.on("stopped", () => {
		console.log("stream stopped");
		clearInterval(interval);
	});
	this.on("close", () => {
		transport.stop();
	});
	const out = transport.createOutgoingStream(
		SemanticSDP.StreamInfo.expand({
			id: "out" + this.user_id,
			tracks: [],
		}),
	);
	this.webrtcClient.out.stream = out;

	const clients = channels.get(channel_id);
	if (!clients) return;

	clients.forEach((client) => {
		if (client.websocket.user_id === this.user_id) return;
		if (!client.in.stream) return;

		client.in.stream?.getTracks().forEach((track) => {
			attachTrack.call(this, track, client.websocket.user_id);
		});
	});
}

export async function onVideo(this: WebSocket, payload: Payload) {
	if (!this.webrtcClient) return;
	const { transport, channel_id } = this.webrtcClient;
	if (!transport) return;
	const d = validateSchema("VoiceVideoSchema", payload.d) as VoiceVideoSchema;

	await Send(this, { op: VoiceOPCodes.MEDIA_SINK_WANTS, d: { any: 100 } });

	if (!this.webrtcClient.in.stream)
		createStream.call(this, transport, channel_id);

	if (d.audio_ssrc) {
		handleSSRC.call(this, "audio", {
			media: d.audio_ssrc,
			rtx: d.audio_ssrc + 1,
		});
	}
	if (d.video_ssrc && d.rtx_ssrc) {
		handleSSRC.call(this, "video", {
			media: d.video_ssrc,
			rtx: d.rtx_ssrc,
		});
	}
}

function attachTrack(
	this: WebSocket,
	track: IncomingStreamTrack,
	user_id: string,
) {
	if (
		!this.webrtcClient ||
		!this.webrtcClient.transport ||
		!this.webrtcClient.out.stream
	)
		return;

	const outTrack = this.webrtcClient.transport.createOutgoingStreamTrack(
		track.getMedia(),
	);
	outTrack.attachTo(track);

	this.webrtcClient.out.stream.addTrack(outTrack);
	let ssrcs = this.webrtcClient.out.tracks.get(user_id);
	if (!ssrcs)
		ssrcs = this.webrtcClient.out.tracks
			.set(user_id, { audio_ssrc: 0, rtx_ssrc: 0, video_ssrc: 0 })
			.get(user_id);

	if (!ssrcs) return; // hmm

	if (track.getMedia() === "audio") {
		ssrcs.audio_ssrc = outTrack.getSSRCs().media || 0;
	} else if (track.getMedia() === "video") {
		ssrcs.video_ssrc = outTrack.getSSRCs().media || 0;
		ssrcs.rtx_ssrc = outTrack.getSSRCs().rtx || 0;
	}

	Send(this, {
		op: VoiceOPCodes.VIDEO,
		d: {
			user_id: user_id,
			...ssrcs,
		} as VoiceVideoSchema,
	});
}

function handleSSRC(this: WebSocket, type: "audio" | "video", ssrcs: SSRCs) {
	if (!this.webrtcClient) return;
	const stream = this.webrtcClient.in.stream as IncomingStream;
	const transport = this.webrtcClient.transport as Transport;

	const id = type + ssrcs.media;
	let track = stream.getTrack(id);
	if (!track) {
		console.log("createIncomingStreamTrack", id);
		track = transport.createIncomingStreamTrack(type, { id, ssrcs });
		stream.addTrack(track);

		const clients = getClients(this.webrtcClient.channel_id);
		clients.forEach((client) => {
			if (client.websocket.user_id === this.user_id) return;
			if (!client.out.stream) return;

			attachTrack.call(client.websocket, track, this.user_id);
		});
	}
}
