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
import { SelectProtocolSchema, validateSchema } from "@spacebar/util";
import { PublicIP, VoiceOPCodes, endpoint } from "@spacebar/webrtc";
import MediaServer from "medooze-media-server";
import SemanticSDP, { MediaInfo } from "semantic-sdp";
import DefaultSDP from "./sdp.json";

export async function onSelectProtocol(this: WebSocket, payload: Payload) {
	if (!this.webrtcClient) return;

	const data = validateSchema(
		"SelectProtocolSchema",
		payload.d,
	) as SelectProtocolSchema;

	const offer = SemanticSDP.SDPInfo.parse("m=audio\n" + data.sdp);
	//@ts-ignore
	offer.getMedias()[0].type = "audio";
	this.webrtcClient.sdp.setICE(offer.getICE());
	this.webrtcClient.sdp.setDTLS(offer.getDTLS());

	const transport = endpoint.createTransport(this.webrtcClient.sdp);
	this.webrtcClient.transport = transport;
	transport.setRemoteProperties(this.webrtcClient.sdp);
	transport.setLocalProperties(this.webrtcClient.sdp);

	const dtls = transport.getLocalDTLSInfo();
	const ice = transport.getLocalICEInfo();
	const port = endpoint.getLocalPort();
	const fingerprint = dtls.getHash() + " " + dtls.getFingerprint();
	const candidates = transport.getLocalCandidates();
	const candidate = candidates[0];

	// discord answer
	/*
		m=audio 50026 ICE/SDP\n
		a=fingerprint:sha-256 4A:79:94:16:44:3F:BD:05:41:5A:C7:20:F3:12:54:70:00:73:5D:33:00:2D:2C:80:9B:39:E1:9F:2D:A7:49:87\n
		c=IN IP4 66.22.206.174\n
		a=rtcp:50026\n
		a=ice-ufrag:XxnE\n
		a=ice-pwd:GLQatPT3Q9dCZVVgVf3J1F\n
		a=fingerprint:sha-256 4A:79:94:16:44:3F:BD:05:41:5A:C7:20:F3:12:54:70:00:73:5D:33:00:2D:2C:80:9B:39:E1:9F:2D:A7:49:87\n
		a=candidate:1 1 UDP 4261412862 66.22.206.174 50026 typ host\n
	*/

	const answer =
		`m=audio ${port} ICE/SDP\n` +
		`a=fingerprint:${fingerprint}\n` +
		`c=IN IP4 ${PublicIP}\n` +
		`a=rtcp:${port}\n` +
		`a=ice-ufrag:${ice.getUfrag()}\n` +
		`a=ice-pwd:${ice.getPwd()}\n` +
		`a=fingerprint:${fingerprint}\n` +
		`a=candidate:1 1 ${candidate.getTransport()} ${candidate.getFoundation()} ${candidate.getAddress()} ${candidate.getPort()} typ host\n`;

	await Send(this, {
		op: VoiceOPCodes.SESSION_DESCRIPTION,
		d: {
			video_codec: "VP8",
			sdp: answer.toString(),
			media_session_id: this.session_id,
			audio_codec: "opus",
		},
	});
}
