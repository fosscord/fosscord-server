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

require("dotenv").config();
const count = Number(process.env.COUNT) || 50;
const endpoint = process.env.API || "http://localhost:3001";

async function main() {
	for (let i = 0; i < count; i++) {
		fetch(`${endpoint}/api/auth/register`, {
			method: "POST",
			body: JSON.stringify({
				fingerprint: `${i}.wR8vi8lGlFBJerErO9LG5NViJFw`,
				username: `test${i}`,
				invite: null,
				consent: true,
				date_of_birth: "2000-01-01",
				gift_code_sku_id: null,
				captcha_key: null,
			}),
			headers: { "content-type": "application/json" },
		});
		console.log(i);
	}
}

main();
