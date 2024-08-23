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

import "missing-native-js-functions";
import readline from "readline";
import fs from "fs/promises";
import path from "path";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

export function enableAutoUpdate(opts: {
	checkInterval: number | boolean;
	packageJsonLink: string;
	path: string;
	downloadUrl: string;
	downloadType?: "zip";
}) {
	if (!opts.checkInterval) return;
	const interval = 1000 * 60 * 60 * 24;
	if (typeof opts.checkInterval === "number")
		opts.checkInterval = 1000 * interval;

	const i = setInterval(async () => {
		const currentVersion = await getCurrentVersion(opts.path);
		const latestVersion = await getLatestVersion(opts.packageJsonLink);
		if (currentVersion !== latestVersion) {
			clearInterval(i);
			console.log(
				`[Auto Update] Current version (${currentVersion}) is out of date, updating ...`,
			);
			await download(opts.downloadUrl, opts.path);
		}
	}, interval);
	setImmediate(async () => {
		const currentVersion = await getCurrentVersion(opts.path);
		const latestVersion = await getLatestVersion(opts.packageJsonLink);
		if (currentVersion !== latestVersion) {
			rl.question(
				`[Auto Update] Current version (${currentVersion}) is out of date, would you like to update? (yes/no)`,
				(answer) => {
					if (answer.toBoolean()) {
						console.log(`[Auto update] updating ...`);
						download(opts.downloadUrl, opts.path);
					} else {
						console.log(`[Auto update] aborted`);
					}
				},
			);
		}
	});
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function download(url: string, dir: string) {
	try {
		// TODO: use file stream instead of buffer (to prevent crash because of high memory usage for big files)
		// TODO check file hash
		const response = await fetch(url);
		const buffer = await response.arrayBuffer();
		const tempDir = await fs.mkdtemp("spacebar");
		await fs.writeFile(
			path.join(tempDir, "Spacebar.zip"),
			Buffer.from(buffer),
		);
	} catch (error) {
		console.error(`[Auto Update] download failed`, error);
	}
}

async function getCurrentVersion(dir: string) {
	try {
		const content = await fs.readFile(path.join(dir, "package.json"), {
			encoding: "utf8",
		});
		return JSON.parse(content).version;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		throw new Error("[Auto update] couldn't get current version in " + dir);
	}
}

type PackageJson = {
	version: string;
};
async function getLatestVersion(url: string) {
	try {
		const response = await fetch(url);
		const content = (await response.json()) as PackageJson;
		return content.version;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		throw new Error("[Auto update] check failed for " + url);
	}
}
