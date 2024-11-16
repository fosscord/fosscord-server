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

import { ApiError } from "./ApiError";

export const WSCodes = {
	1000: "WS_CLOSE_REQUESTED",
	4004: "TOKEN_INVALID",
	4010: "SHARDING_INVALID",
	4011: "SHARDING_REQUIRED",
	4013: "INVALID_INTENTS",
	4014: "DISALLOWED_INTENTS",
};

/**
 * The current status of the client. Here are the available statuses:
 * * READY: 0
 * * CONNECTING: 1
 * * RECONNECTING: 2
 * * IDLE: 3
 * * NEARLY: 4
 * * DISCONNECTED: 5
 * * WAITING_FOR_GUILDS: 6
 * * IDENTIFYING: 7
 * * RESUMING: 8
 * @typedef {number} Status
 */
export const WsStatus = {
	READY: 0,
	CONNECTING: 1,
	RECONNECTING: 2,
	IDLE: 3,
	NEARLY: 4,
	DISCONNECTED: 5,
	WAITING_FOR_GUILDS: 6,
	IDENTIFYING: 7,
	RESUMING: 8,
};

/**
 * The current status of a voice connection. Here are the available statuses:
 * * CONNECTED: 0
 * * CONNECTING: 1
 * * AUTHENTICATING: 2
 * * RECONNECTING: 3
 * * DISCONNECTED: 4
 * @typedef {number} VoiceStatus
 */
export const VoiceStatus = {
	CONNECTED: 0,
	CONNECTING: 1,
	AUTHENTICATING: 2,
	RECONNECTING: 3,
	DISCONNECTED: 4,
};

export const OPCodes = {
	DISPATCH: 0,
	HEARTBEAT: 1,
	IDENTIFY: 2,
	STATUS_UPDATE: 3,
	VOICE_STATE_UPDATE: 4,
	VOICE_GUILD_PING: 5,
	RESUME: 6,
	RECONNECT: 7,
	REQUEST_GUILD_MEMBERS: 8,
	INVALID_SESSION: 9,
	HELLO: 10,
	HEARTBEAT_ACK: 11,
};

export const VoiceOPCodes = {
	IDENTIFY: 0,
	SELECT_PROTOCOL: 1,
	READY: 2,
	HEARTBEAT: 3,
	SESSION_DESCRIPTION: 4,
	SPEAKING: 5,
	HEARTBEAT_ACK: 6,
	RESUME: 7,
	HELLO: 8,
	RESUMED: 9,
	CLIENT_CONNECT: 12, // incorrect, op 12 is probably used for video
	CLIENT_DISCONNECT: 13, // incorrect
	VERSION: 16, //not documented
};

export const Events = {
	RATE_LIMIT: "rateLimit",
	CLIENT_READY: "ready",
	GUILD_CREATE: "guildCreate",
	GUILD_DELETE: "guildDelete",
	GUILD_UPDATE: "guildUpdate",
	GUILD_UNAVAILABLE: "guildUnavailable",
	GUILD_AVAILABLE: "guildAvailable",
	GUILD_MEMBER_ADD: "guildMemberAdd",
	GUILD_MEMBER_REMOVE: "guildMemberRemove",
	GUILD_MEMBER_UPDATE: "guildMemberUpdate",
	GUILD_MEMBER_AVAILABLE: "guildMemberAvailable",
	GUILD_MEMBER_SPEAKING: "guildMemberSpeaking",
	GUILD_MEMBERS_CHUNK: "guildMembersChunk",
	GUILD_INTEGRATIONS_UPDATE: "guildIntegrationsUpdate",
	GUILD_ROLE_CREATE: "roleCreate",
	GUILD_ROLE_DELETE: "roleDelete",
	INVITE_CREATE: "inviteCreate",
	INVITE_DELETE: "inviteDelete",
	GUILD_ROLE_UPDATE: "roleUpdate",
	GUILD_EMOJI_CREATE: "emojiCreate",
	GUILD_EMOJI_DELETE: "emojiDelete",
	GUILD_EMOJI_UPDATE: "emojiUpdate",
	GUILD_BAN_ADD: "guildBanAdd",
	GUILD_BAN_REMOVE: "guildBanRemove",
	CHANNEL_CREATE: "channelCreate",
	CHANNEL_DELETE: "channelDelete",
	CHANNEL_UPDATE: "channelUpdate",
	CHANNEL_PINS_UPDATE: "channelPinsUpdate",
	MESSAGE_CREATE: "message",
	MESSAGE_DELETE: "messageDelete",
	MESSAGE_UPDATE: "messageUpdate",
	MESSAGE_BULK_DELETE: "messageDeleteBulk",
	MESSAGE_REACTION_ADD: "messageReactionAdd",
	MESSAGE_REACTION_REMOVE: "messageReactionRemove",
	MESSAGE_REACTION_REMOVE_ALL: "messageReactionRemoveAll",
	MESSAGE_REACTION_REMOVE_EMOJI: "messageReactionRemoveEmoji",
	USER_UPDATE: "userUpdate",
	PRESENCE_UPDATE: "presenceUpdate",
	VOICE_SERVER_UPDATE: "voiceServerUpdate",
	VOICE_STATE_UPDATE: "voiceStateUpdate",
	VOICE_BROADCAST_SUBSCRIBE: "subscribe",
	VOICE_BROADCAST_UNSUBSCRIBE: "unsubscribe",
	TYPING_START: "typingStart",
	TYPING_STOP: "typingStop",
	WEBHOOKS_UPDATE: "webhookUpdate",
	ERROR: "error",
	WARN: "warn",
	DEBUG: "debug",
	SHARD_DISCONNECT: "shardDisconnect",
	SHARD_ERROR: "shardError",
	SHARD_RECONNECTING: "shardReconnecting",
	SHARD_READY: "shardReady",
	SHARD_RESUME: "shardResume",
	INVALIDATED: "invalidated",
	RAW: "raw",
};

export const ShardEvents = {
	CLOSE: "close",
	DESTROYED: "destroyed",
	INVALID_SESSION: "invalidSession",
	READY: "ready",
	RESUMED: "resumed",
	ALL_READY: "allReady",
};

/**
 * The type of Structure allowed to be a partial:
 * * USER
 * * CHANNEL (only affects DMChannels)
 * * GUILD_MEMBER
 * * MESSAGE
 * * REACTION
 * <warn>Partials require you to put checks in place when handling data, read the Partials topic listed in the
 * sidebar for more information.</warn>
 * @typedef {string} PartialType
 */
export const PartialTypes = keyMirror([
	"USER",
	"CHANNEL",
	"GUILD_MEMBER",
	"MESSAGE",
	"REACTION",
]);

/**
 * The type of a websocket message event, e.g. `MESSAGE_CREATE`. Here are the available events:
 * * READY
 * * RESUMED
 * * GUILD_CREATE
 * * GUILD_DELETE
 * * GUILD_UPDATE
 * * INVITE_CREATE
 * * INVITE_DELETE
 * * GUILD_MEMBER_ADD
 * * GUILD_MEMBER_REMOVE
 * * GUILD_MEMBER_UPDATE
 * * GUILD_MEMBERS_CHUNK
 * * GUILD_INTEGRATIONS_UPDATE
 * * GUILD_ROLE_CREATE
 * * GUILD_ROLE_DELETE
 * * GUILD_ROLE_UPDATE
 * * GUILD_BAN_ADD
 * * GUILD_BAN_REMOVE
 * * GUILD_EMOJIS_UPDATE
 * * CHANNEL_CREATE
 * * CHANNEL_DELETE
 * * CHANNEL_UPDATE
 * * CHANNEL_PINS_UPDATE
 * * MESSAGE_CREATE
 * * MESSAGE_DELETE
 * * MESSAGE_UPDATE
 * * MESSAGE_DELETE_BULK
 * * MESSAGE_REACTION_ADD
 * * MESSAGE_REACTION_REMOVE
 * * MESSAGE_REACTION_REMOVE_ALL
 * * MESSAGE_REACTION_REMOVE_EMOJI
 * * USER_UPDATE
 * * PRESENCE_UPDATE
 * * TYPING_START
 * * VOICE_STATE_UPDATE
 * * VOICE_SERVER_UPDATE
 * * WEBHOOKS_UPDATE
 * @typedef {string} WSEventType
 */
export const WSEvents = keyMirror([
	"READY",
	"RESUMED",
	"GUILD_CREATE",
	"GUILD_DELETE",
	"GUILD_UPDATE",
	"INVITE_CREATE",
	"INVITE_DELETE",
	"GUILD_MEMBER_ADD",
	"GUILD_MEMBER_REMOVE",
	"GUILD_MEMBER_UPDATE",
	"GUILD_MEMBERS_CHUNK",
	"GUILD_INTEGRATIONS_UPDATE",
	"GUILD_ROLE_CREATE",
	"GUILD_ROLE_DELETE",
	"GUILD_ROLE_UPDATE",
	"GUILD_BAN_ADD",
	"GUILD_BAN_REMOVE",
	"GUILD_EMOJIS_UPDATE",
	"CHANNEL_CREATE",
	"CHANNEL_DELETE",
	"CHANNEL_UPDATE",
	"CHANNEL_PINS_UPDATE",
	"MESSAGE_CREATE",
	"MESSAGE_DELETE",
	"MESSAGE_UPDATE",
	"MESSAGE_DELETE_BULK",
	"MESSAGE_REACTION_ADD",
	"MESSAGE_REACTION_REMOVE",
	"MESSAGE_REACTION_REMOVE_ALL",
	"MESSAGE_REACTION_REMOVE_EMOJI",
	"USER_UPDATE",
	"PRESENCE_UPDATE",
	"TYPING_START",
	"VOICE_STATE_UPDATE",
	"VOICE_SERVER_UPDATE",
	"WEBHOOKS_UPDATE",
]);

/**
 * The type of a message, e.g. `DEFAULT`. Here are the available types:
 * * DEFAULT
 * * RECIPIENT_ADD
 * * RECIPIENT_REMOVE
 * * CALL
 * * CHANNEL_NAME_CHANGE
 * * CHANNEL_ICON_CHANGE
 * * PINS_ADD
 * * GUILD_MEMBER_JOIN
 * * USER_PREMIUM_GUILD_SUBSCRIPTION
 * * USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1
 * * USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2
 * * USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3
 * * CHANNEL_FOLLOW_ADD
 * * GUILD_DISCOVERY_DISQUALIFIED
 * * GUILD_DISCOVERY_REQUALIFIED
 * * REPLY
 * @typedef {string} MessageType
 */
export const MessageTypes = [
	"DEFAULT",
	"RECIPIENT_ADD",
	"RECIPIENT_REMOVE",
	"CALL",
	"CHANNEL_NAME_CHANGE",
	"CHANNEL_ICON_CHANGE",
	"PINS_ADD",
	"GUILD_MEMBER_JOIN",
	"USER_PREMIUM_GUILD_SUBSCRIPTION",
	"USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1",
	"USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2",
	"USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3",
	"CHANNEL_FOLLOW_ADD",
	null,
	"GUILD_DISCOVERY_DISQUALIFIED",
	"GUILD_DISCOVERY_REQUALIFIED",
	null,
	null,
	null,
	"REPLY",
];

/**
 * The types of messages that are `System`. The available types are `MessageTypes` excluding:
 * * DEFAULT
 * * REPLY
 * @typedef {string} SystemMessageType
 */
export const SystemMessageTypes = MessageTypes.filter(
	(type: string | null) => type && type !== "DEFAULT" && type !== "REPLY",
);

/**
 * <info>Bots cannot set a `CUSTOM_STATUS`, it is only for custom statuses received from users</info>
 * The type of an activity of a users presence, e.g. `PLAYING`. Here are the available types:
 * * PLAYING
 * * STREAMING
 * * LISTENING
 * * WATCHING
 * * CUSTOM_STATUS
 * * COMPETING
 * @typedef {string} ActivityType
 */
export const ActivityTypes = [
	"PLAYING",
	"STREAMING",
	"LISTENING",
	"WATCHING",
	"CUSTOM_STATUS",
	"COMPETING",
];

export const ChannelTypes = {
	TEXT: 0,
	DM: 1,
	VOICE: 2,
	GROUP: 3,
	CATEGORY: 4,
	NEWS: 5,
	STORE: 6,
};

export const ClientApplicationAssetTypes = {
	SMALL: 1,
	BIG: 2,
};

export const AutomodActionTypes = {
	BLOCK_MESSAGE: 1,
	SEND_ALERT: 2,
	TIMEOUT_MEMBER: 3,
};

export const AutomodTriggerTypes = {
	CUSTOM_WORDS: 1,
	UNKNOWN_2: 2,
	SUSPECTED_SPAM_CONTENT: 3,
	COMMONLY_FLAGGED_WORDS: 4,
	MENTION_SPAM: 5,
};

export const Colors = {
	DEFAULT: 0x000000,
	WHITE: 0xffffff,
	AQUA: 0x1abc9c,
	GREEN: 0x2ecc71,
	BLUE: 0x3498db,
	YELLOW: 0xffff00,
	PURPLE: 0x9b59b6,
	LUMINOUS_VIVID_PINK: 0xe91e63,
	GOLD: 0xf1c40f,
	ORANGE: 0xe67e22,
	RED: 0xe74c3c,
	GREY: 0x95a5a6,
	NAVY: 0x34495e,
	DARK_AQUA: 0x11806a,
	DARK_GREEN: 0x1f8b4c,
	DARK_BLUE: 0x206694,
	DARK_PURPLE: 0x71368a,
	DARK_VIVID_PINK: 0xad1457,
	DARK_GOLD: 0xc27c0e,
	DARK_ORANGE: 0xa84300,
	DARK_RED: 0x992d22,
	DARK_GREY: 0x979c9f,
	DARKER_GREY: 0x7f8c8d,
	LIGHT_GREY: 0xbcc0c0,
	DARK_NAVY: 0x2c3e50,
	BLURPLE: 0x7289da,
	GREYPLE: 0x99aab5,
	DARK_BUT_NOT_BLACK: 0x2c2f33,
	NOT_QUITE_BLACK: 0x23272a,
};

/**
 * The value set for the explicit content filter levels for a guild:
 * * DISABLED
 * * MEMBERS_WITHOUT_ROLES
 * * ALL_MEMBERS
 * @typedef {string} ExplicitContentFilterLevel
 */
export const ExplicitContentFilterLevels = [
	"DISABLED",
	"MEMBERS_WITHOUT_ROLES",
	"ALL_MEMBERS",
];

/**
 * The value set for the verification levels for a guild:
 * * NONE
 * * LOW
 * * MEDIUM
 * * HIGH
 * * VERY_HIGH
 * @typedef {string} VerificationLevel
 */
export const VerificationLevels = [
	"NONE",
	"LOW",
	"MEDIUM",
	"HIGH",
	"VERY_HIGH",
];

/**
 * An error encountered while performing an API request. Here are the potential errors:
 * * GENERAL_ERROR
 * * UNKNOWN_ACCOUNT
 * * UNKNOWN_APPLICATION
 * * UNKNOWN_CHANNEL
 * * UNKNOWN_GUILD
 * * UNKNOWN_INTEGRATION
 * * UNKNOWN_INVITE
 * * UNKNOWN_MEMBER
 * * UNKNOWN_MESSAGE
 * * UNKNOWN_OVERWRITE
 * * UNKNOWN_PROVIDER
 * * UNKNOWN_ROLE
 * * UNKNOWN_TOKEN
 * * UNKNOWN_USER
 * * UNKNOWN_EMOJI
 * * UNKNOWN_WEBHOOK
 * * UNKNOWN_WEBHOOK_SERVICE
 * * UNKNOWN_SESSION
 * * UNKNOWN_BAN
 * * UNKNOWN_SKU
 * * UNKNOWN_STORE_LISTING
 * * UNKNOWN_ENTITLEMENT
 * * UNKNOWN_BUILD
 * * UNKNOWN_LOBBY
 * * UNKNOWN_BRANCH
 * * UNKNOWN_STORE_DIRECTORY_LAYOUT
 * * UNKNOWN_REDISTRIBUTABLE
 * * UNKNOWN_GIFT_CODE
 * * UNKNOWN_STREAM
 * * UNKNOWN_PREMIUM_SERVER_SUBSCRIBE_COOLDOWN
 * * UNKNOWN_GUILD_TEMPLATE
 * * UNKNOWN_DISCOVERABLE_SERVER_CATEGORY
 * * UNKNOWN_STICKER
 * * UNKNOWN_INTERACTION
 * * UNKNOWN_APPLICATION_COMMAND
 * * UNKNOWN_APPLICATION_COMMAND_PERMISSIONS
 * * UNKNOWN_STAGE_INSTANCE
 * * UNKNOWN_GUILD_MEMBER_VERIFICATION_FORM
 * * UNKNOWN_GUILD_WELCOME_SCREEN
 * * UNKNOWN_GUILD_SCHEDULED_EVENT
 * * UNKNOWN_GUILD_SCHEDULED_EVENT_USER
 * * BOT_PROHIBITED_ENDPOINT
 * * BOT_ONLY_ENDPOINT
 * * EXPLICIT_CONTENT_CANNOT_BE_SENT_TO_RECIPIENT
 * * ACTION_NOT_AUTHORIZED_ON_APPLICATION
 * * SLOWMODE_RATE_LIMIT
 * * ONLY_OWNER
 * * ANNOUNCEMENT_RATE_LIMITS
 * * CHANNEL_WRITE_RATELIMIT
 * * WORDS_NOT_ALLOWED
 * * GUILD_PREMIUM_LEVEL_TOO_LOW
 * * MAXIMUM_GUILDS
 * * MAXIMUM_FRIENDS
 * * MAXIMUM_PINS
 * * MAXIMUM_NUMBER_OF_RECIPIENTS_REACHED
 * * MAXIMUM_ROLES
 * * MAXIMUM_WEBHOOKS
 * * MAXIMUM_NUMBER_OF_EMOJIS_REACHED
 * * MAXIMUM_REACTIONS
 * * MAXIMUM_CHANNELS
 * * MAXIMUM_ATTACHMENTS
 * * MAXIMUM_INVITES
 * * MAXIMUM_ANIMATED_EMOJIS
 * * MAXIMUM_SERVER_MEMBERS
 * * MAXIMUM_SERVER_CATEGORIES
 * * GUILD_ALREADY_HAS_TEMPLATE
 * * MAXIMUM_THREAD_PARTICIPANTS
 * * MAXIMUM_BANS_FOR_NON_GUILD_MEMBERS
 * * MAXIMUM_BANS_FETCHES
 * * MAXIMUM_STICKERS
 * * MAXIMUM_PRUNE_REQUESTS
 * * UNAUTHORIZED
 * * ACCOUNT_VERIFICATION_REQUIRED
 * * OPENING_DIRECT_MESSAGES_TOO_FAST
 * * REQUEST_ENTITY_TOO_LARGE
 * * FEATURE_TEMPORARILY_DISABLED
 * * USER_BANNED
 * * TARGET_USER_IS_NOT_CONNECTED_TO_VOICE
 * * ALREADY_CROSSPOSTED
 * * APPLICATION_COMMAND_ALREADY_EXISTS
 * * MISSING_ACCESS
 * * INVALID_ACCOUNT_TYPE
 * * CANNOT_EXECUTE_ON_DM
 * * EMBED_DISABLED
 * * CANNOT_EDIT_MESSAGE_BY_OTHER
 * * CANNOT_SEND_EMPTY_MESSAGE
 * * CANNOT_MESSAGE_USER
 * * CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL
 * * CHANNEL_VERIFICATION_LEVEL_TOO_HIGH
 * * OAUTH2_APPLICATION_BOT_ABSENT
 * * MAXIMUM_OAUTH2_APPLICATIONS
 * * INVALID_OAUTH_STATE
 * * MISSING_PERMISSIONS
 * * INVALID_AUTHENTICATION_TOKEN
 * * NOTE_TOO_LONG
 * * INVALID_BULK_DELETE_QUANTITY
 * * CANNOT_PIN_MESSAGE_IN_OTHER_CHANNEL
 * * INVALID_OR_TAKEN_INVITE_CODE
 * * CANNOT_EXECUTE_ON_SYSTEM_MESSAGE
 * * CANNOT_EXECUTE_ON_THIS_CHANNEL_TYPE
 * * INVALID_OAUTH_TOKEN
 * * MISSING_REQUIRED_OAUTH2_SCOPE
 * * INVALID_WEBHOOK_TOKEN_PROVIDED
 * * INVALID_ROLE
 * * INVALID_RECIPIENT
 * * BULK_DELETE_MESSAGE_TOO_OLD
 * * INVALID_FORM_BODY
 * * INVITE_ACCEPTED_TO_GUILD_NOT_CONTAINING_BOT
 * * INVALID_API_VERSION
 * * FILE_EXCEEDS_MAXIMUM_SIZE
 * * INVALID_FILE_UPLOADED
 * * CANNOT_SELF_REDEEM_GIFT
 * * PAYMENT_SOURCE_REQUIRED
 * * CANNOT_DELETE_COMMUNITY_REQUIRED_CHANNEL
 * * INVALID_STICKER_SENT
 * * CANNOT_EDIT_ARCHIVED_THREAD
 * * INVALID_THREAD_NOTIFICATION_SETTINGS
 * * BEFORE_EARLIER_THAN_THREAD_CREATION_DATE
 * * SERVER_NOT_AVAILABLE_IN_YOUR_LOCATION
 * * SERVER_NEEDS_MONETIZATION_ENABLED
 * * TWO_FACTOR_REQUIRED
 * * NO_USERS_WITH_DISCORDTAG_EXIST
 * * REACTION_BLOCKED
 * * RESOURCE_OVERLOADED
 * * STAGE_ALREADY_OPEN
 * * THREAD_ALREADY_CREATED_FOR_THIS_MESSAGE
 * * THREAD_IS_LOCKED
 * * MAXIMUM_NUMBER_OF_ACTIVE_THREADS
 * * MAXIMUM_NUMBER_OF_ACTIVE_ANNOUNCEMENT_THREADS
 * * INVALID_JSON_FOR_UPLOADED_LOTTIE_FILE
 * * LOTTIES_CANNOT_CONTAIN_RASTERIZED_IMAGES
 * * STICKER_MAXIMUM_FRAMERATE
 * * STICKER_MAXIMUM_FRAME_COUNT
 * * LOTTIE_ANIMATION_MAXIMUM_DIMENSIONS
 * * STICKER_FRAME_RATE_TOO_SMALL_OR_TOO_LARGE
 * * STICKER_ANIMATION_DURATION_MAXIMUM
 * * AUTOMODERATOR_BLOCK
 * * BULK_BAN_FAILED
 * * UNKNOWN_VOICE_STATE
 * @typedef {string} APIError
 */
export const DiscordApiErrors = {
	//https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes
	GENERAL_ERROR: new ApiError(
		"General error (such as a malformed request body, amongst other things)",
		0,
	),
	UNKNOWN_ACCOUNT: new ApiError("Unknown account", 10001),
	UNKNOWN_APPLICATION: new ApiError("Unknown application", 10002),
	UNKNOWN_CHANNEL: new ApiError("Unknown channel", 10003),
	UNKNOWN_GUILD: new ApiError("Unknown guild", 10004),
	UNKNOWN_INTEGRATION: new ApiError("Unknown integration", 10005),
	UNKNOWN_INVITE: new ApiError("Unknown invite", 10006),
	UNKNOWN_MEMBER: new ApiError("Unknown member", 10007),
	UNKNOWN_MESSAGE: new ApiError("Unknown message", 10008),
	UNKNOWN_OVERWRITE: new ApiError("Unknown permission overwrite", 10009),
	UNKNOWN_PROVIDER: new ApiError("Unknown provider", 10010),
	UNKNOWN_ROLE: new ApiError("Unknown role", 10011),
	UNKNOWN_TOKEN: new ApiError("Unknown token", 10012),
	UNKNOWN_USER: new ApiError("Unknown user", 10013),
	UNKNOWN_EMOJI: new ApiError("Unknown emoji", 10014),
	UNKNOWN_WEBHOOK: new ApiError("Unknown webhook", 10015, 404),
	UNKNOWN_WEBHOOK_SERVICE: new ApiError("Unknown webhook service", 10016),
	UNKNOWN_CONNECTION: new ApiError("Unknown connection", 10017, 400),
	UNKNOWN_SESSION: new ApiError("Unknown session", 10020),
	UNKNOWN_BAN: new ApiError("Unknown ban", 10026),
	UNKNOWN_SKU: new ApiError("Unknown SKU", 10027),
	UNKNOWN_STORE_LISTING: new ApiError("Unknown Store Listing", 10028),
	UNKNOWN_ENTITLEMENT: new ApiError("Unknown entitlement", 10029),
	UNKNOWN_BUILD: new ApiError("Unknown build", 10030),
	UNKNOWN_LOBBY: new ApiError("Unknown lobby", 10031),
	UNKNOWN_BRANCH: new ApiError("Unknown branch", 10032),
	UNKNOWN_STORE_DIRECTORY_LAYOUT: new ApiError(
		"Unknown store directory layout",
		10033,
	),
	UNKNOWN_REDISTRIBUTABLE: new ApiError("Unknown redistributable", 10036),
	UNKNOWN_GIFT_CODE: new ApiError("Unknown gift code", 10038),
	UNKNOWN_STREAM: new ApiError("Unknown stream", 10049),
	UNKNOWN_PREMIUM_SERVER_SUBSCRIBE_COOLDOWN: new ApiError(
		"Unknown premium server subscribe cooldown",
		10050,
	),
	UNKNOWN_GUILD_TEMPLATE: new ApiError("Unknown guild template", 10057),
	UNKNOWN_DISCOVERABLE_SERVER_CATEGORY: new ApiError(
		"Unknown discoverable server category",
		10059,
	),
	UNKNOWN_STICKER: new ApiError("Unknown sticker", 10060),
	UNKNOWN_INTERACTION: new ApiError("Unknown interaction", 10062),
	UNKNOWN_APPLICATION_COMMAND: new ApiError(
		"Unknown application command",
		10063,
	),
	UNKNOWN_APPLICATION_COMMAND_PERMISSIONS: new ApiError(
		"Unknown application command permissions",
		10066,
	),
	UNKNOWN_STAGE_INSTANCE: new ApiError("Unknown Stage Instance", 10067),
	UNKNOWN_GUILD_MEMBER_VERIFICATION_FORM: new ApiError(
		"Unknown Guild Member Verification Form",
		10068,
	),
	UNKNOWN_GUILD_WELCOME_SCREEN: new ApiError(
		"Unknown Guild Welcome Screen",
		10069,
	),
	UNKNOWN_GUILD_SCHEDULED_EVENT: new ApiError(
		"Unknown Guild Scheduled Event",
		10070,
	),
	UNKNOWN_GUILD_SCHEDULED_EVENT_USER: new ApiError(
		"Unknown Guild Scheduled Event User",
		10071,
	),
	BOT_PROHIBITED_ENDPOINT: new ApiError(
		"Bots cannot use this endpoint",
		20001,
	),
	BOT_ONLY_ENDPOINT: new ApiError("Only bots can use this endpoint", 20002),
	EXPLICIT_CONTENT_CANNOT_BE_SENT_TO_RECIPIENT: new ApiError(
		"Explicit content cannot be sent to the desired recipient(s)",
		20009,
	),
	ACTION_NOT_AUTHORIZED_ON_APPLICATION: new ApiError(
		"You are not authorized to perform this action on this application",
		20012,
	),
	SLOWMODE_RATE_LIMIT: new ApiError(
		"This action cannot be performed due to slowmode rate limit",
		20016,
	),
	ONLY_OWNER: new ApiError(
		"Only the owner of this account can perform this action",
		20018,
	),
	ANNOUNCEMENT_RATE_LIMITS: new ApiError(
		"This message cannot be edited due to announcement rate limits",
		20022,
	),
	CHANNEL_WRITE_RATELIMIT: new ApiError(
		"The channel you are writing has hit the write rate limit",
		20028,
	),
	WORDS_NOT_ALLOWED: new ApiError(
		"Your Stage topic, server name, server description, or channel names contain words that are not allowed",
		20031,
	),
	GUILD_PREMIUM_LEVEL_TOO_LOW: new ApiError(
		"Guild premium subscription level too low",
		20035,
	),
	MAXIMUM_GUILDS: new ApiError(
		"Maximum number of guilds reached ({})",
		30001,
		undefined,
		["100"],
	),
	MAXIMUM_FRIENDS: new ApiError(
		"Maximum number of friends reached ({})",
		30002,
		undefined,
		["1000"],
	),
	MAXIMUM_PINS: new ApiError(
		"Maximum number of pins reached for the channel ({})",
		30003,
		undefined,
		["50"],
	),
	MAXIMUM_NUMBER_OF_RECIPIENTS_REACHED: new ApiError(
		"Maximum number of recipients reached ({})",
		30004,
		undefined,
		["10"],
	),
	MAXIMUM_ROLES: new ApiError(
		"Maximum number of guild roles reached ({})",
		30005,
		undefined,
		["250"],
	),
	MAXIMUM_WEBHOOKS: new ApiError(
		"Maximum number of webhooks reached ({})",
		30007,
		undefined,
		["10"],
	),
	MAXIMUM_NUMBER_OF_EMOJIS_REACHED: new ApiError(
		"Maximum number of emojis reached",
		30008,
	),
	MAXIMUM_REACTIONS: new ApiError(
		"Maximum number of reactions reached ({})",
		30010,
		undefined,
		["20"],
	),
	MAXIMUM_CHANNELS: new ApiError(
		"Maximum number of guild channels reached ({})",
		30013,
		undefined,
		["500"],
	),
	MAXIMUM_ATTACHMENTS: new ApiError(
		"Maximum number of attachments in a message reached ({})",
		30015,
		undefined,
		["10"],
	),
	MAXIMUM_INVITES: new ApiError(
		"Maximum number of invites reached ({})",
		30016,
		undefined,
		["1000"],
	),
	MAXIMUM_ANIMATED_EMOJIS: new ApiError(
		"Maximum number of animated emojis reached",
		30018,
	),
	MAXIMUM_SERVER_MEMBERS: new ApiError(
		"Maximum number of server members reached",
		30019,
	),
	MAXIMUM_SERVER_CATEGORIES: new ApiError(
		"Maximum number of server categories has been reached ({})",
		30030,
		undefined,
		["5"],
	),
	GUILD_ALREADY_HAS_TEMPLATE: new ApiError(
		"Guild already has a template",
		30031,
	),
	MAXIMUM_THREAD_PARTICIPANTS: new ApiError(
		"Max number of thread participants has been reached",
		30033,
	),
	MAXIMUM_BANS_FOR_NON_GUILD_MEMBERS: new ApiError(
		"Maximum number of bans for non-guild members have been exceeded",
		30035,
	),
	MAXIMUM_BANS_FETCHES: new ApiError(
		"Maximum number of bans fetches has been reached",
		30037,
	),
	MAXIMUM_STICKERS: new ApiError("Maximum number of stickers reached", 30039),
	MAXIMUM_PRUNE_REQUESTS: new ApiError(
		"Maximum number of prune requests has been reached. Try again later",
		30040,
	),
	UNAUTHORIZED: new ApiError(
		"Unauthorized. Provide a valid token and try again",
		40001,
	),
	ACCOUNT_VERIFICATION_REQUIRED: new ApiError(
		"You need to verify your account in order to perform this action",
		40002,
	),
	OPENING_DIRECT_MESSAGES_TOO_FAST: new ApiError(
		"You are opening direct messages too fast",
		40003,
	),
	REQUEST_ENTITY_TOO_LARGE: new ApiError(
		"Request entity too large. Try sending something smaller in size",
		40005,
	),
	FEATURE_TEMPORARILY_DISABLED: new ApiError(
		"This feature has been temporarily disabled server-side",
		40006,
	),
	USER_BANNED: new ApiError("The user is banned from this guild", 40007),
	CONNECTION_REVOKED: new ApiError(
		"The connection has been revoked",
		40012,
		400,
	),
	TARGET_USER_IS_NOT_CONNECTED_TO_VOICE: new ApiError(
		"Target user is not connected to voice",
		40032,
	),
	ALREADY_CROSSPOSTED: new ApiError(
		"This message has already been crossposted",
		40033,
	),
	APPLICATION_COMMAND_ALREADY_EXISTS: new ApiError(
		"An application command with that name already exists",
		40041,
	),
	MISSING_ACCESS: new ApiError("Missing access", 50001),
	INVALID_ACCOUNT_TYPE: new ApiError("Invalid account type", 50002),
	CANNOT_EXECUTE_ON_DM: new ApiError(
		"Cannot execute action on a DM channel",
		50003,
	),
	EMBED_DISABLED: new ApiError("Widget Disabled", 50004),
	CANNOT_EDIT_MESSAGE_BY_OTHER: new ApiError(
		"Cannot edit a message authored by another user",
		50005,
	),
	CANNOT_SEND_EMPTY_MESSAGE: new ApiError(
		"Cannot send an empty message",
		50006,
	),
	CANNOT_MESSAGE_USER: new ApiError(
		"Cannot send messages to this user",
		50007,
	),
	CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL: new ApiError(
		"Cannot send messages in a voice channel",
		50008,
	),
	CHANNEL_VERIFICATION_LEVEL_TOO_HIGH: new ApiError(
		"Channel verification level is too high for you to gain access",
		50009,
	),
	OAUTH2_APPLICATION_BOT_ABSENT: new ApiError(
		"OAuth2 application does not have a bot",
		50010,
	),
	MAXIMUM_OAUTH2_APPLICATIONS: new ApiError(
		"OAuth2 application limit reached",
		50011,
	),
	INVALID_OAUTH_STATE: new ApiError("Invalid OAuth2 state", 50012),
	MISSING_PERMISSIONS: new ApiError(
		"You lack permissions to perform that action ({})",
		50013,
		undefined,
		[""],
	),
	INVALID_AUTHENTICATION_TOKEN: new ApiError(
		"Invalid authentication token provided",
		50014,
	),
	NOTE_TOO_LONG: new ApiError("Note was too long", 50015),
	INVALID_BULK_DELETE_QUANTITY: new ApiError(
		"Provided too few or too many messages to delete. Must provide at least {} and fewer than {} messages to delete",
		50016,
		undefined,
		["2", "100"],
	),
	CANNOT_PIN_MESSAGE_IN_OTHER_CHANNEL: new ApiError(
		"A message can only be pinned to the channel it was sent in",
		50019,
	),
	INVALID_OR_TAKEN_INVITE_CODE: new ApiError(
		"Invite code was either invalid or taken",
		50020,
	),
	CANNOT_EXECUTE_ON_SYSTEM_MESSAGE: new ApiError(
		"Cannot execute action on a system message",
		50021,
	),
	CANNOT_EXECUTE_ON_THIS_CHANNEL_TYPE: new ApiError(
		"Cannot execute action on this channel type",
		50024,
	),
	INVALID_OAUTH_TOKEN: new ApiError(
		"Invalid OAuth2 access token provided",
		50025,
	),
	MISSING_REQUIRED_OAUTH2_SCOPE: new ApiError(
		"Missing required OAuth2 scope",
		50026,
	),
	INVALID_WEBHOOK_TOKEN_PROVIDED: new ApiError(
		"Invalid webhook token provided",
		50027,
	),
	INVALID_ROLE: new ApiError("Invalid role", 50028),
	INVALID_RECIPIENT: new ApiError("Invalid Recipient(s)", 50033),
	BULK_DELETE_MESSAGE_TOO_OLD: new ApiError(
		"A message provided was too old to bulk delete",
		50034,
	),
	INVALID_FORM_BODY: new ApiError(
		"Invalid form body (returned for both application/json and multipart/form-data bodies), or invalid Content-Type provided",
		50035,
	),
	INVITE_ACCEPTED_TO_GUILD_NOT_CONTAINING_BOT: new ApiError(
		"An invite was accepted to a guild the application's bot is not in",
		50036,
	),
	INVALID_API_VERSION: new ApiError("Invalid API version provided", 50041),
	FILE_EXCEEDS_MAXIMUM_SIZE: new ApiError(
		"File uploaded exceeds the maximum size",
		50045,
	),
	INVALID_FILE_UPLOADED: new ApiError("Invalid file uploaded", 50046),
	CANNOT_SELF_REDEEM_GIFT: new ApiError(
		"Cannot self-redeem this gift",
		50054,
	),
	PAYMENT_SOURCE_REQUIRED: new ApiError(
		"Payment source required to redeem gift",
		50070,
	),
	CANNOT_DELETE_COMMUNITY_REQUIRED_CHANNEL: new ApiError(
		"Cannot delete a channel required for Community guilds",
		50074,
	),
	INVALID_STICKER_SENT: new ApiError("Invalid sticker sent", 50081),
	CANNOT_EDIT_ARCHIVED_THREAD: new ApiError(
		"Tried to perform an operation on an archived thread, such as editing a message or adding a user to the thread",
		50083,
	),
	INVALID_THREAD_NOTIFICATION_SETTINGS: new ApiError(
		"Invalid thread notification settings",
		50084,
	),
	BEFORE_EARLIER_THAN_THREAD_CREATION_DATE: new ApiError(
		"before value is earlier than the thread creation date",
		50085,
	),
	SERVER_NOT_AVAILABLE_IN_YOUR_LOCATION: new ApiError(
		"This server is not available in your location",
		50095,
	),
	SERVER_NEEDS_MONETIZATION_ENABLED: new ApiError(
		"This server needs monetization enabled in order to perform this action",
		50097,
	),
	TWO_FACTOR_REQUIRED: new ApiError(
		"Two factor is required for this operation",
		60003,
	),
	NO_USERS_WITH_DISCORDTAG_EXIST: new ApiError(
		"No users with DiscordTag exist",
		80004,
	),
	REACTION_BLOCKED: new ApiError("Reaction was blocked", 90001),
	RESOURCE_OVERLOADED: new ApiError(
		"API resource is currently overloaded. Try again a little later",
		130000,
	),
	STAGE_ALREADY_OPEN: new ApiError("The Stage is already open", 150006),
	THREAD_ALREADY_CREATED_FOR_THIS_MESSAGE: new ApiError(
		"A thread has already been created for this message",
		160004,
	),
	THREAD_IS_LOCKED: new ApiError("Thread is locked", 160005),
	MAXIMUM_NUMBER_OF_ACTIVE_THREADS: new ApiError(
		"Maximum number of active threads reached",
		160006,
	),
	MAXIMUM_NUMBER_OF_ACTIVE_ANNOUNCEMENT_THREADS: new ApiError(
		"Maximum number of active announcement threads reached",
		160007,
	),
	INVALID_JSON_FOR_UPLOADED_LOTTIE_FILE: new ApiError(
		"Invalid JSON for uploaded Lottie file",
		170001,
	),
	LOTTIES_CANNOT_CONTAIN_RASTERIZED_IMAGES: new ApiError(
		"Uploaded Lotties cannot contain rasterized images such as PNG or JPEG",
		170002,
	),
	STICKER_MAXIMUM_FRAMERATE: new ApiError(
		"Sticker maximum framerate exceeded",
		170003,
	),
	STICKER_MAXIMUM_FRAME_COUNT: new ApiError(
		"Sticker frame count exceeds maximum of {} frames",
		170004,
		undefined,
		["1000"],
	),
	LOTTIE_ANIMATION_MAXIMUM_DIMENSIONS: new ApiError(
		"Lottie animation maximum dimensions exceeded",
		170005,
	),
	STICKER_FRAME_RATE_TOO_SMALL_OR_TOO_LARGE: new ApiError(
		"Sticker frame rate is either too small or too large",
		170006,
	),
	STICKER_ANIMATION_DURATION_MAXIMUM: new ApiError(
		"Sticker animation duration exceeds maximum of {} seconds",
		170007,
		undefined,
		["5"],
	),
	AUTOMODERATOR_BLOCK: new ApiError(
		"Message was blocked by automatic moderation",
		200000,
	),
	BULK_BAN_FAILED: new ApiError("Failed to ban users", 500000),

	//Other errors
	UNKNOWN_VOICE_STATE: new ApiError("Unknown Voice State", 10065, 404),
};

/**
 * An error encountered while performing an API request (Spacebar only). Here are the potential errors:
 */
export const SpacebarApiErrors = {
	MANUALLY_TRIGGERED_ERROR: new ApiError(
		"This is an artificial error",
		1,
		500,
	),
	PREMIUM_DISABLED_FOR_GUILD: new ApiError(
		"This guild cannot be boosted",
		25001,
	),
	NO_FURTHER_PREMIUM: new ApiError(
		"This guild does not receive further boosts",
		25002,
	),
	GUILD_PREMIUM_DISABLED_FOR_YOU: new ApiError(
		"This guild cannot be boosted by you",
		25003,
		403,
	),
	CANNOT_FRIEND_SELF: new ApiError("Cannot friend oneself", 25009),
	USER_SPECIFIC_INVITE_WRONG_RECIPIENT: new ApiError(
		"This invite is not meant for you",
		25010,
	),
	USER_SPECIFIC_INVITE_FAILED: new ApiError("Failed to invite user", 25011),
	CANNOT_MODIFY_USER_GROUP: new ApiError(
		"This user cannot manipulate this group",
		25050,
		403,
	),
	CANNOT_REMOVE_SELF_FROM_GROUP: new ApiError(
		"This user cannot remove oneself from user group",
		25051,
	),
	CANNOT_BAN_OPERATOR: new ApiError(
		"Non-OPERATOR cannot ban OPERATOR from instance",
		25052,
	),
	CANNOT_LEAVE_GUILD: new ApiError(
		"You are not allowed to leave guilds that you joined by yourself",
		25059,
		403,
	),
	EDITS_DISABLED: new ApiError(
		"You are not allowed to edit your own messages",
		25060,
		403,
	),
	DELETE_MESSAGE_DISABLED: new ApiError(
		"You are not allowed to delete your own messages",
		25061,
		403,
	),
	FEATURE_PERMANENTLY_DISABLED: new ApiError(
		"This feature has been disabled server-side",
		45006,
		501,
	),
	FEATURE_IS_IMMUTABLE: new ApiError(
		"The feature ({}) cannot be edited.",
		45007,
		403,
	),
	MISSING_RIGHTS: new ApiError(
		"You lack rights to perform that action ({})",
		50013,
		undefined,
		[""],
	),
	CANNOT_REPLACE_BY_BACKFILL: new ApiError(
		"Cannot backfill to message ID that already exists",
		55002,
		409,
	),
	CANNOT_BACKFILL_TO_THE_FUTURE: new ApiError(
		"You cannot backfill messages in the future",
		55003,
	),
	CANNOT_GRANT_PERMISSIONS_EXCEEDING_RIGHTS: new ApiError(
		"You cannot grant permissions exceeding your own rights",
		50050,
	),
	ROUTES_LOOPING: new ApiError(
		"Loops in the route definition ({})",
		50060,
		undefined,
		[""],
	),
	CANNOT_REMOVE_ROUTE: new ApiError(
		"Cannot remove message route while it is in effect and being used",
		50061,
	),
};

/**
 * The value set for a guild's default message notifications, e.g. `ALL`. Here are the available types:
 * * ALL
 * * MENTIONS
 * * MUTED (Spacebar extension)
 * @typedef {string} DefaultMessageNotifications
 */
export const DefaultMessageNotifications = ["ALL", "MENTIONS", "MUTED"];

/**
 * The value set for a team members's membership state:
 * * INVITED
 * * ACCEPTED
 * * INSERTED (Spacebar extension)
 * @typedef {string} MembershipStates
 */
export const MembershipStates = ["INSERTED", "INVITED", "ACCEPTED"];

/**
 * The value set for a webhook's type:
 * * Incoming
 * * Channel Follower
 * * Custom (Spacebar extension)
 * @typedef {string} WebhookTypes
 */
export const WebhookTypes = ["Custom", "Incoming", "Channel Follower"];

function keyMirror(arr: string[]) {
	const tmp = Object.create(null);
	for (const value of arr) tmp[value] = value;
	return tmp;
}
