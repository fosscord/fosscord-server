/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2024 Spacebar and Spacebar Contributors

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

import { dbEngine, User } from "@spacebar/util";
import { BaseClass } from "./BaseClass";
import { Entity, JoinColumn, ManyToOne, Column } from "typeorm";

export class AutomodMentionSpamRule {
	mention_total_limit: number;
	mention_raid_protection_enabled: boolean;
}

export class AutomodSuspectedSpamRule {}

export class AutomodCommonlyFlaggedWordsRule {
	allow_list: [string];
	presets: [number];
}

export class AutomodCustomWordsRule {
	allow_list: [string];
	keyword_filter: [string];
	regex_patterns: [string];
}

@Entity({
	name: "automod_rules",
	engine: dbEngine,
})
export class AutomodRule extends BaseClass {
	@JoinColumn({ name: "creator_id" })
	@ManyToOne(() => User, { onDelete: "CASCADE" })
	creator: User;

	@Column()
	enabled: boolean;

	@Column()
	event_type: number; // No idea...

	@Column({ type: "simple-array" })
	exempt_channels: [string];

	@Column({ type: "simple-array" })
	exempt_roles: [string];

	@Column()
	guild_id: string;

	@Column()
	name: string;

	@Column()
	position: number;

	@Column()
	trigger_type: number;

	@Column({
		type: "simple-json",
		nullable: true,
	})
	trigger_metadata?: // this is null for "Block suspected spam content"
	| AutomodMentionSpamRule
		| AutomodSuspectedSpamRule
		| AutomodCommonlyFlaggedWordsRule
		| AutomodCustomWordsRule;

	@Column({
		type: "simple-json",
	})
	actions: { type: number; metadata: unknown }[];
}
