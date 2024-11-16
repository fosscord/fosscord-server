import { execSync } from "child_process";
import findOnPath from "./os-utils/OsUtils";
// noinspection ES6ConvertRequireIntoImport
import terminfo from "./os-utils/TermInfo/TermInfo";
import { KittyLogo } from "./KittyLogo";


export class Logo {
	public static async printLogo() {
		await KittyLogo.printLogo();
		// const chafaPath = findOnPath("chafa");
		// console.log("Chafa path: " + chafaPath);
		// const info = terminfo.parse({debug: true});
		// process.exit(0);
		return;
		// console.log(info);
		// if (chafaPath)
		// 	return execSync(
		// 			"chafa Spacebar__Logo-Blue.png -s 70",
		// 			{
		// 				env: process.env,
		// 				encoding: "utf-8",
		// 				stdio: "inherit"
		// 			}
		// 	);
		// else console.log(Logo.logoVersions["1"] as string);
	}

	private static getConsoleColors(): number {
		return 1;
		if (!process.env.TERM) return 1;
		else {
			switch (process.env.TERM) {
				case "":
					break;

				default:
					break;
			}
		}
		return 1;
	}
	private static logoVersions: any = {
		"1": `
			███████╗██████╗  █████╗  ██████╗███████╗██████╗  █████╗ ██████╗ 
			██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗██╔══██╗██╔══██╗
			███████╗██████╔╝███████║██║     █████╗  ██████╔╝███████║██████╔╝
			╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝  ██╔══██╗██╔══██║██╔══██╗
			███████║██║     ██║  ██║╚██████╗███████╗██████╔╝██║  ██║██║  ██║
			╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝`,
		"2": ``
	};
}

Logo.printLogo();