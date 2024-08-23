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
import { User } from "./User";
import { dbEngine } from "../util/Database";

export enum TeamMemberState {
	INVITED = 1,
	ACCEPTED = 2,
}

@Entity({
	name: "team_members",
	engine: dbEngine,
})
export class TeamMember extends BaseClass {
	@Column({ type: "int" })
	membership_state: TeamMemberState;

	@Column({ type: "simple-array" })
	permissions: string[];

	@Column({ nullable: true })
	@RelationId((member: TeamMember) => member.team)
	team_id: string;

	@JoinColumn({ name: "team_id" })
	@ManyToOne(
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		() => require("./Team").Team,
		(team: import("./Team").Team) => team.members,
		{
			onDelete: "CASCADE",
		},
	)
	team: import("./Team").Team;

	@Column({ nullable: true })
	@RelationId((member: TeamMember) => member.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user: User;
}
