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

import { Config } from "@spacebar/util";

export interface hcaptchaResponse {
	success: boolean;
	challenge_ts: string;
	hostname: string;
	credit: boolean;
	"error-codes": string[];
	score: number; // enterprise only
	score_reason: string[]; // enterprise only
}

export interface recaptchaResponse {
	success: boolean;
	score: number; // between 0 - 1
	action: string;
	challenge_ts: string;
	hostname: string;
	"error-codes"?: string[];
}

const verifyEndpoints = {
	hcaptcha: "https://hcaptcha.com/siteverify",
	recaptcha: "https://www.google.com/recaptcha/api/siteverify",
};

export async function verifyCaptcha(response: string, ip?: string) {
	const { security } = Config.get();
	const { service, secret, sitekey } = security.captcha;

	if (!service || !secret || !sitekey)
		throw new Error(
			"CAPTCHA is not configured correctly. https://docs.spacebar.chat/setup/server/security/captcha/",
		);

	const res = await fetch(verifyEndpoints[service], {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body:
			`response=${encodeURIComponent(response)}` +
			`&secret=${encodeURIComponent(secret)}` +
			`&sitekey=${encodeURIComponent(sitekey)}` +
			(ip ? `&remoteip=${encodeURIComponent(ip)}` : ""),
	});

	return (await res.json()) as hcaptchaResponse | recaptchaResponse;
}
