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
import { Channel } from "./Channel";
import { Guild } from "./Guild";
import { Member } from "./Member";
import { User } from "./User";
import { dbEngine } from "../util/Database";

//https://gist.github.com/vassjozsef/e482c65df6ee1facaace8b3c9ff66145#file-voice_state-ex
@Entity({
	name: "voice_states",
	engine: dbEngine,
})
export class VoiceState extends BaseClass {
	@Column({ nullable: true })
	@RelationId((voice_state: VoiceState) => voice_state.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild) => guild.voice_states, {
		onDelete: "CASCADE",
	})
	guild?: Guild;

	@Column({ nullable: true })
	@RelationId((voice_state: VoiceState) => voice_state.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, {
		onDelete: "CASCADE",
	})
	channel: Channel;

	@Column({ nullable: true })
	@RelationId((voice_state: VoiceState) => voice_state.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user: User;

	// @JoinColumn([{ name: "user_id", referencedColumnName: "id" },{ name: "guild_id", referencedColumnName: "guild_id" }])
	// @ManyToOne(() => Member, {
	// 	onDelete: "CASCADE",
	// })
	//TODO find a way to make it work without breaking Guild.voice_states
	member: Member;

	@Column()
	session_id: string;

	@Column({ nullable: true })
	token: string;

	@Column()
	deaf: boolean;

	@Column()
	mute: boolean;

	@Column()
	self_deaf: boolean;

	@Column()
	self_mute: boolean;

	@Column({ nullable: true })
	self_stream?: boolean;

	@Column({ nullable: true })
	self_video: boolean;

	@Column()
	suppress: boolean; // whether this user is muted by the current user

	@Column({ nullable: true, default: null })
	request_to_speak_timestamp?: Date;
}
