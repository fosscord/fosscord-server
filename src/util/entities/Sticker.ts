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
import { Guild } from "./Guild";
import { User } from "./User";
import { dbEngine } from "../util/Database";

export enum StickerType {
	STANDARD = 1,
	GUILD = 2,
}

export enum StickerFormatType {
	GIF = 0, // gif is a custom format type and not in discord spec
	PNG = 1,
	APNG = 2,
	LOTTIE = 3,
}

@Entity({
	name: "stickers",
	engine: dbEngine,
})
export class Sticker extends BaseClass {
	@Column()
	name: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ nullable: true })
	available?: boolean;

	@Column({ nullable: true })
	tags?: string;

	@Column({ nullable: true })
	@RelationId((sticker: Sticker) => sticker.pack)
	pack_id?: string;

	@JoinColumn({ name: "pack_id" })
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	@ManyToOne(() => require("./StickerPack").StickerPack, {
		onDelete: "CASCADE",
		nullable: true,
	})
	pack: import("./StickerPack").StickerPack;

	@Column({ nullable: true })
	guild_id?: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild) => guild.stickers, {
		onDelete: "CASCADE",
	})
	guild?: Guild;

	@Column({ nullable: true })
	user_id?: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user?: User;

	@Column({ type: "int" })
	type: StickerType;

	@Column({ type: "int" })
	format_type: StickerFormatType;
}
