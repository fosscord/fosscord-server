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
	BaseEntity,
	BeforeInsert,
	BeforeUpdate,
	FindOptionsWhere,
	ObjectIdColumn,
	PrimaryColumn,
} from "typeorm";
import { Snowflake } from "../util/Snowflake";
import { getDatabase } from "../util/Database";
import { OrmUtils } from "../imports/OrmUtils";

export class BaseClassWithoutId extends BaseEntity {
	private get construct() {
		return this.constructor;
	}

	private get metadata() {
		return getDatabase()?.getMetadata(this.construct);
	}

	assign(props: object) {
		OrmUtils.mergeDeep(this, props);
		return this;
	}

	// TODO: fix eslint
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toJSON(): any {
		return Object.fromEntries(
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			this.metadata!.columns // @ts-ignore
				.map((x) => [x.propertyName, this[x.propertyName]])
				.concat(
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					this.metadata.relations.map((x) => [
						x.propertyName,
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						this[x.propertyName],
					]),
				),
		);
	}

	static increment<T extends BaseClass>(
		conditions: FindOptionsWhere<T>,
		propertyPath: string,
		value: number | string,
	) {
		const repository = this.getRepository();
		return repository.increment(conditions, propertyPath, value);
	}

	static decrement<T extends BaseClass>(
		conditions: FindOptionsWhere<T>,
		propertyPath: string,
		value: number | string,
	) {
		const repository = this.getRepository();
		return repository.decrement(conditions, propertyPath, value);
	}
}

export const PrimaryIdColumn = process.env.DATABASE?.startsWith("mongodb")
	? ObjectIdColumn
	: PrimaryColumn;

export class BaseClass extends BaseClassWithoutId {
	@PrimaryIdColumn()
	id: string = Snowflake.generate();

	@BeforeUpdate()
	@BeforeInsert()
	_do_validate() {
		if (!this.id) this.id = Snowflake.generate();
	}
}
