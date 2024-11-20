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

export interface UserModifySchema {
	/**
	 * @minLength 2
	 */
	username?: string;
	avatar?: string | null;
	bio?: string;
	accent_color?: number;
	banner?: string | null;
	/**
	 * @minLength 1
	 * @maxLength 72
	 */
	password?: string;
	/**
	 * @minLength 1
	 * @maxLength 72
	 */
	new_password?: string;
	/**
	 * @minLength 6
	 * @maxLength 6
	 */
	code?: string;
	/**
	 * @TJS-format email
	 */
	email?: string;
	/**
	 * @minLength 4
	 * @maxLength 4
	 */
	discriminator?: string;
	extended_settings?: string;
}
