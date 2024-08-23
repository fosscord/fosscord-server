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

import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { dbEngine } from "../util/Database";

@Entity({
	name: "recipients",
	engine: dbEngine,
})
export class Recipient extends BaseClass {
	@Column()
	@RelationId((recipient: Recipient) => recipient.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	@ManyToOne(() => require("./Channel").Channel, {
		onDelete: "CASCADE",
	})
	channel: import("./Channel").Channel;

	@Column()
	@RelationId((recipient: Recipient) => recipient.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	@ManyToOne(() => require("./User").User, {
		onDelete: "CASCADE",
	})
	user: import("./User").User;

	@Column({ default: false })
	closed: boolean;

	// TODO: settings/mute/nick/added at/encryption keys/read_state
}
