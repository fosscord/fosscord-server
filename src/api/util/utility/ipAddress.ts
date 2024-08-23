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
import { Request } from "express";
// use ipdata package instead of simple fetch because of integrated caching

const exampleData = {
	ip: "",
	is_eu: true,
	city: "",
	region: "",
	region_code: "",
	country_name: "",
	country_code: "",
	continent_name: "",
	continent_code: "",
	latitude: 0,
	longitude: 0,
	postal: "",
	calling_code: "",
	flag: "",
	emoji_flag: "",
	emoji_unicode: "",
	asn: {
		asn: "",
		name: "",
		domain: "",
		route: "",
		type: "isp",
	},
	languages: [
		{
			name: "",
			native: "",
		},
	],
	currency: {
		name: "",
		code: "",
		symbol: "",
		native: "",
		plural: "",
	},
	time_zone: {
		name: "",
		abbr: "",
		offset: "",
		is_dst: true,
		current_time: "",
	},
	threat: {
		is_tor: false,
		is_proxy: false,
		is_anonymous: false,
		is_known_attacker: false,
		is_known_abuser: false,
		is_threat: false,
		is_bogon: false,
	},
	count: 0,
	status: 200,
};

//TODO add function that support both ip and domain names
export async function IPAnalysis(ip: string): Promise<typeof exampleData> {
	const { ipdataApiKey } = Config.get().security;
	if (!ipdataApiKey) return { ...exampleData, ip };

	return (
		await fetch(`https://api.ipdata.co/${ip}?api-key=${ipdataApiKey}`)
	).json() as Promise<typeof exampleData>;
}

export function isProxy(data: typeof exampleData) {
	if (!data || !data.asn || !data.threat) return false;
	if (data.asn.type !== "isp") return true;
	if (Object.values(data.threat).some((x) => x)) return true;

	return false;
}

export function getIpAdress(req: Request): string {
	// TODO: express can do this (trustProxies: true)?

	return (
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		req.headers[Config.get().security.forwardedFor] ||
		req.socket.remoteAddress
	);
}

type Location = { latitude: number; longitude: number };
export function distanceBetweenLocations(
	loc1: Location,
	loc2: Location,
): number {
	return distanceBetweenCoords(
		loc1.latitude,
		loc1.longitude,
		loc2.latitude,
		loc2.longitude,
	);
}

//Haversine function
function distanceBetweenCoords(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
) {
	const p = 0.017453292519943295; // Math.PI / 180
	const c = Math.cos;
	const a =
		0.5 -
		c((lat2 - lat1) * p) / 2 +
		(c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

	return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
