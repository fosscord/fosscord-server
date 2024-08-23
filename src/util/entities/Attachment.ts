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

import {
	BeforeRemove,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	RelationId,
} from "typeorm";
import { URL } from "url";
import { deleteFile } from "../util/cdn";
import { BaseClass } from "./BaseClass";
import { dbEngine } from "../util/Database";

@Entity({
	name: "attachments",
	engine: dbEngine,
})
export class Attachment extends BaseClass {
	@Column()
	filename: string; // name of file attached

	@Column()
	size: number; // size of file in bytes

	@Column()
	url: string; // source url of file

	@Column()
	proxy_url: string; // a proxied url of file

	@Column({ nullable: true })
	height?: number; // height of file (if image)

	@Column({ nullable: true })
	width?: number; // width of file (if image)

	@Column({ nullable: true })
	content_type?: string;

	@Column({ nullable: true })
	@RelationId((attachment: Attachment) => attachment.message)
	message_id: string;

	@JoinColumn({ name: "message_id" })
	@ManyToOne(
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		() => require("./Message").Message,
		(message: import("./Message").Message) => message.attachments,
		{
			onDelete: "CASCADE",
		},
	)
	message: import("./Message").Message;

	@BeforeRemove()
	onDelete() {
		return deleteFile(new URL(this.url).pathname);
	}
}
