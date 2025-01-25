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

import { CLOSECODES, Payload, WebSocket } from "@spacebar/gateway";
import { Tuple } from "lambert-server";
import OPCodeHandlers from "../opcodes";
import { VoiceOPCodes } from "../util";

const PayloadSchema = {
	op: Number,
	$d: new Tuple(Object, Number), // or number for heartbeat sequence
	$s: Number,
	$t: String,
};

export async function onMessage(this: WebSocket, buffer: Buffer) {
	try {
		const data: Payload = JSON.parse(buffer.toString());
		if (data.op !== VoiceOPCodes.IDENTIFY && !this.user_id)
			return this.close(CLOSECODES.Not_authenticated);

		const OPCodeHandler = OPCodeHandlers[data.op];
		if (!OPCodeHandler) {
			console.error("[WebRTC] Unkown opcode " + VoiceOPCodes[data.op]);
			// TODO: if all opcodes are implemented comment this out:
			// this.close(CloseCodes.Unknown_opcode);
			return;
		}

		if (
			![VoiceOPCodes.HEARTBEAT, VoiceOPCodes.SPEAKING].includes(
				data.op as VoiceOPCodes,
			)
		) {
			console.log("[WebRTC] Opcode " + VoiceOPCodes[data.op]);
		}

		return await OPCodeHandler.call(this, data);
	} catch (error) {
		console.error("[WebRTC] error", error);
		// if (!this.CLOSED && this.CLOSING) return this.close(CloseCodes.Unknown_error);
	}
}
