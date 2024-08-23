const ENDPOINT = process.env.API || "http://localhost:3001";

async function main() {
	const ret = await fetch(`${ENDPOINT}/api/auth/login`, {
		method: "POST",
		body: JSON.stringify({
			login: process.argv[2],
			password: process.argv[3],
		}),
		headers: { "content-type": "application/json " },
	});

	console.log((await ret.json()).token);
}

main();
