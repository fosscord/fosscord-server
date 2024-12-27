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

import jwt, { VerifyOptions } from "jsonwebtoken";
import { Config } from "./Config";
import { User } from "../entities";
import crypto from "node:crypto";
import fs from "fs/promises";
import { existsSync } from "fs";
// TODO: dont use deprecated APIs lol
import {
	FindOptionsRelationByString,
	FindOptionsSelectByString,
} from "typeorm";
import * as console from "node:console";

export const JWTOptions: VerifyOptions = { algorithms: ["HS256"] };

export type UserTokenData = {
	user: User;
	decoded: { id: string; iat: number };
};

export const checkToken = (
	token: string,
	opts?: {
		select?: FindOptionsSelectByString<User>;
		relations?: FindOptionsRelationByString;
	},
): Promise<UserTokenData> =>
	new Promise((resolve, reject) => {
		token = token.replace("Bot ", ""); // there is no bot distinction in sb
		token = token.replace("Bearer ", ""); // allow bearer tokens

		const validateUser: jwt.VerifyCallback = async (err, out) => {
			const decoded = out as UserTokenData["decoded"];
			if (err || !decoded) return reject("Invalid Token meow " + err);

			const user = await User.findOne({
				where: { id: decoded.id },
				select: [
					...(opts?.select || []),
					"bot",
					"disabled",
					"deleted",
					"rights",
					"data",
				],
				relations: opts?.relations,
			});

			if (!user) return reject("User not found");

			// we need to round it to seconds as it saved as seconds in jwt iat and valid_tokens_since is stored in milliseconds
			if (
				decoded.iat * 1000 <
				new Date(user.data.valid_tokens_since).setSeconds(0, 0)
			)
				return reject("Invalid Token");

			if (user.disabled) return reject("User disabled");
			if (user.deleted) return reject("User not found");

			return resolve({ decoded, user });
		};

		const dec = jwt.decode(token, { complete: true });
		if (!dec) return reject("Could not parse token");

		if (dec.header.alg == "HS256") {
			jwt.verify(
				token,
				Config.get().security.jwtSecret,
				JWTOptions,
				validateUser,
			);
		} else if (dec.header.alg == "ES512") {
			loadOrGenerateKeypair().then((keyPair) => {
				jwt.verify(
					token,
					keyPair.publicKey,
					{ algorithms: ["ES512"] },
					validateUser,
				);
			});
		} else return reject("Invalid token algorithm");
	});

export async function generateToken(id: string) {
	const iat = Math.floor(Date.now() / 1000);
	const keyPair = await loadOrGenerateKeypair();

	return new Promise((res, rej) => {
		jwt.sign(
			{ id, iat, kid: keyPair.fingerprint },
			keyPair.privateKey,
			{
				algorithm: "ES512",
			},
			(err, token) => {
				if (err) return rej(err);
				return res(token);
			},
		);
	});
}

// Get ECDSA keypair from file or generate it
export async function loadOrGenerateKeypair() {
	let privateKey: crypto.KeyObject;
	let publicKey: crypto.KeyObject;

	if (existsSync("jwt.key") && existsSync("jwt.key.pub")) {
		const [loadedPrivateKey, loadedPublicKey] = await Promise.all([
			fs.readFile("jwt.key"),
			fs.readFile("jwt.key.pub"),
		]);

		privateKey = crypto.createPrivateKey(loadedPrivateKey);
		publicKey = crypto.createPublicKey(loadedPublicKey);
	} else {
		console.log("[JWT] Generating new keypair");
		const res = crypto.generateKeyPairSync("ec", {
			namedCurve: "secp521r1",
		});
		privateKey = res.privateKey;
		publicKey = res.publicKey;

		await Promise.all([
			fs.writeFile(
				"jwt.key",
				privateKey.export({ format: "pem", type: "sec1" }),
			),
			fs.writeFile(
				"jwt.key.pub",
				publicKey.export({ format: "pem", type: "spki" }),
			),
		]);
	}

	const fingerprint = crypto
		.createHash("sha256")
		.update(publicKey.export({ format: "pem", type: "spki" }))
		.digest("hex");

	return { privateKey, publicKey, fingerprint };
}
