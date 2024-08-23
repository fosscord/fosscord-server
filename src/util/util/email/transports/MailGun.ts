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
import nodemailer from "nodemailer";

export default async function () {
	// get configuration
	const { apiKey, domain } = Config.get().email.mailgun;

	// ensure all required configuration values are set
	if (!apiKey || !domain)
		return console.error(
			"[Email] Mailgun has not been configured correctly.",
		);

	let mg;
	try {
		// try to import the transporter package
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		mg = require("nodemailer-mailgun-transport");
	} catch {
		// if the package is not installed, log an error and return void so we don't set the transporter
		console.error(
			"[Email] Mailgun transport is not installed. Please run `npm install nodemailer-mailgun-transport --save-optional` to install it.",
		);
		return;
	}

	// create the transporter configuration object
	const auth = {
		auth: {
			api_key: apiKey,
			domain: domain,
		},
	};

	// create the transporter and return it
	return nodemailer.createTransport(mg(auth));
}
