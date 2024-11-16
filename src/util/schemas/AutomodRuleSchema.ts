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

export interface AutomodMentionSpamRuleSchema {
	mention_total_limit: number;
	mention_raid_protection_enabled: boolean;
}

export interface AutomodSuspectedSpamRuleSchema {}

export interface AutomodCommonlyFlaggedWordsRuleSchema {
	allow_list: [string];
	presets: [number];
}

export interface AutomodCustomWordsRuleSchema {
	allow_list: [string];
	keyword_filter: [string];
	regex_patterns: [string];
}

export interface AutomodRuleSchema {
	creator_id: string;
	enabled: boolean;
	event_type: number; // No idea...
	exempt_channels: [string];
	exempt_roles: [string];
	guild_id: string;
	name: string;
	position: number;
	trigger_type: number; //AutomodTriggerTypes
	trigger_metadata:
		| AutomodMentionSpamRuleSchema
		| AutomodSuspectedSpamRuleSchema
		| AutomodCommonlyFlaggedWordsRuleSchema
		| AutomodCustomWordsRuleSchema;
}

export interface AutomodRuleSchemaWithId extends AutomodRuleSchema {
	id: string;
}
