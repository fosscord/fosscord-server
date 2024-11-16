import { existsSync, statSync } from "fs";
import os from "os";

export default function findOnPath(binary: string): string | null {
	const paths =
		(os.platform() == "win32"
			? process.env.PATH?.split(";")
			: process.env.PATH?.split(":")) || [];

	if (os.platform() == "win32") {
		binary += ".exe";
	}

	for (const path of paths) {
		if (existsSync(`${path}/${binary}`)) {
			const stat = statSync(`${path}/${binary}`);
			if (stat.isFile() && stat.mode & 0o111) return `${path}/${binary}`;
		}
	}
	return null;
}
