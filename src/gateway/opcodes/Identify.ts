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
	CLOSECODES,
	Capabilities,
	OPCODES,
	Payload,
	Send,
	WebSocket,
	setupListener,
} from "@spacebar/gateway";
import {
	Application,
	Config,
	DMChannel,
	DefaultUserGuildSettings,
	EVENTEnum,
	Guild,
	GuildOrUnavailable,
	IdentifySchema,
	Intents,
	Member,
	MemberPrivateProjection,
	OPCodes,
	Permissions,
	PresenceUpdateEvent,
	PrivateSessionProjection,
	PrivateUserProjection,
	PublicUser,
	PublicUserProjection,
	ReadState,
	ReadyEventData,
	ReadyGuildDTO,
	ReadyUserGuildSettingsEntries,
	Recipient,
	Session,
	SessionsReplace,
	UserSettings,
	checkToken,
	emitEvent,
	getDatabase,
} from "@spacebar/util";
import { check } from "./instanceOf";

// TODO: user sharding
// TODO: check privileged intents, if defined in the config

const tryGetUserFromToken = async (...args: Parameters<typeof checkToken>) => {
	try {
		return (await checkToken(...args)).user;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return null;
	}
};

export async function onIdentify(this: WebSocket, data: Payload) {
	if (this.user_id) {
		// we've already identified
		return this.close(CLOSECODES.Already_authenticated);
	}

	clearTimeout(this.readyTimeout);

	// Check payload matches schema
	check.call(this, IdentifySchema, data.d);
	const identify: IdentifySchema = data.d;

	this.capabilities = new Capabilities(identify.capabilities || 0);
	this.large_threshold = identify.large_threshold || 250;

	const user = await tryGetUserFromToken(identify.token, {
		relations: ["relationships", "relationships.to", "settings"],
		select: [...PrivateUserProjection, "relationships"],
	});
	if (!user) return this.close(CLOSECODES.Authentication_failed);
	this.user_id = user.id;

	// Check intents
	if (!identify.intents) identify.intents = 30064771071n; // TODO: what is this number?
	this.intents = new Intents(identify.intents);

	// TODO: actually do intent things.

	// Validate sharding
	if (identify.shard) {
		this.shard_id = identify.shard[0];
		this.shard_count = identify.shard[1];

		if (
			this.shard_count == null ||
			this.shard_id == null ||
			this.shard_id > this.shard_count ||
			this.shard_id < 0 ||
			this.shard_count <= 0
		) {
			// TODO: why do we even care about this right now?
			console.log(
				`[Gateway] Invalid sharding from ${user.id}: ${identify.shard}`,
			);
			return this.close(CLOSECODES.Invalid_shard);
		}
	}

	// Generate a new gateway session ( id is already made, just save it in db )
	const session = Session.create({
		user_id: this.user_id,
		session_id: this.session_id,
		status: identify.presence?.status || "online",
		client_info: {
			client: identify.properties?.device || identify.properties?.$device,
			os: identify.properties?.os || identify.properties?.$os,
			version: 0,
		},
		client_status: {},
		activities: identify.presence?.activities, // TODO: validation
	});

	// Get from database:
	// * the users read states
	// * guild members for this user
	// * recipients ( dm channels )
	// * the bot application, if it exists
	const [, application, read_states, members, recipients] = await Promise.all(
		[
			session.save(),

			Application.findOne({
				where: { id: this.user_id },
				select: ["id", "flags"],
			}),

			ReadState.find({
				where: { user_id: this.user_id },
				select: [
					"id",
					"channel_id",
					"last_message_id",
					"last_pin_timestamp",
					"mention_count",
				],
			}),

			Member.find({
				where: { id: this.user_id },
				select: {
					// We only want some member props
					...Object.fromEntries(
						MemberPrivateProjection.map((x) => [x, true]),
					),
					settings: true, // guild settings
					roles: { id: true }, // the full role is fetched from the `guild` relation

					// TODO: we don't really need every property of
					// guild channels, emoji, roles, stickers
					// but we do want almost everything from guild.
					// How do you do that without just enumerating the guild props?
					guild: Object.fromEntries(
						getDatabase()!
							.getMetadata(Guild)
							.columns.map((x) => [x.propertyName, true]),
					),
				},
				relations: [
					"guild",
					"guild.channels",
					"guild.emojis",
					"guild.roles",
					"guild.stickers",
					"roles",

					// For these entities, `user` is always just the logged in user we fetched above
					// "user",
				],
			}),

			Recipient.find({
				where: { user_id: this.user_id, closed: false },
				relations: [
					"channel",
					"channel.recipients",
					"channel.recipients.user",
				],
				select: {
					channel: {
						id: true,
						flags: true,
						// is_spam: true,	// TODO
						last_message_id: true,
						last_pin_timestamp: true,
						type: true,
						icon: true,
						name: true,
						owner_id: true,
						recipients: {
							// we don't actually need this ID or any other information about the recipient info,
							// but typeorm does not select anything from the users relation of recipients unless we select
							// at least one column.
							id: true,
							// We only want public user data for each dm channel
							user: Object.fromEntries(
								PublicUserProjection.map((x) => [x, true]),
							),
						},
					},
				},
			}),
		],
	);

	// We forgot to migrate user settings from the JSON column of `users`
	// to the `user_settings` table theyre in now,
	// so for instances that migrated, users may not have a `user_settings` row.
	if (!user.settings) {
		user.settings = new UserSettings();
		await user.settings.save();
	}

	// Generate merged_members
	const merged_members = members.map((x) => {
		return [
			{
				...x,
				roles: x.roles.map((x) => x.id),

				// add back user, which we don't fetch from db
				// TODO: For guild profiles, this may need to be changed.
				// TODO: The only field required in the user prop is `id`,
				// but our types are annoying so I didn't bother.
				user: user.toPublicUser(),

				guild: {
					id: x.guild.id,
				},
				settings: undefined,
			},
		];
	});

	// Populated with guilds 'unavailable' currently
	// Just for bots
	const pending_guilds: Guild[] = [];

	// Generate guilds list ( make them unavailable if user is bot )
	const guilds: GuildOrUnavailable[] = members.map((member) => {
		// filter guild channels we don't have permission to view
		// TODO: check if this causes issues when the user is granted other roles?
		member.guild.channels = member.guild.channels
			.filter((channel) => {
				const perms = Permissions.finalPermission({
					user: {
						id: member.id,
						roles: member.roles.map((x) => x.id),
					},
					guild: member.guild,
					channel,
				});

				return perms.has("VIEW_CHANNEL");
			})
			.map((channel) => {
				channel.position = member.guild.channel_ordering.indexOf(
					channel.id,
				);
				return channel;
			})
			.sort((a, b) => a.position - b.position);

		if (user.bot) {
			pending_guilds.push(member.guild);
			return { id: member.guild.id, unavailable: true };
		}

		return {
			...member.guild.toJSON(),
			joined_at: member.joined_at,

			threads: [],
		};
	});

	// Generate user_guild_settings
	const user_guild_settings_entries: ReadyUserGuildSettingsEntries[] =
		members.map((x) => ({
			...DefaultUserGuildSettings,
			...x.settings,
			guild_id: x.guild_id,
			channel_overrides: Object.entries(
				x.settings.channel_overrides ?? {},
			).map((y) => ({
				...y[1],
				channel_id: y[0],
			})),
		}));

	// Popultaed with users from private channels, relationships.
	// Uses a set to dedupe for us.
	const users: Set<PublicUser> = new Set();

	// Generate dm channels from recipients list. Append recipients to `users` list
	const channels = recipients
		.filter(({ channel }) => channel.isDm())
		.map((r) => {
			// TODO: fix the types of Recipient
			// Their channels are only ever private (I think) and thus are always DM channels
			const channel = r.channel as DMChannel;

			// Remove ourself from the list of other users in dm channel
			channel.recipients = channel.recipients.filter(
				(recipient) => recipient.user.id !== this.user_id,
			);

			const channelUsers = channel.recipients?.map((recipient) =>
				recipient.user.toPublicUser(),
			);

			if (channelUsers && channelUsers.length > 0)
				channelUsers.forEach((user) => users.add(user));

			return {
				id: channel.id,
				flags: channel.flags,
				last_message_id: channel.last_message_id,
				type: channel.type,
				recipients: channelUsers || [],
				is_spam: false, // TODO
			};
		});

	// From user relationships ( friends ), also append to `users` list
	user.relationships.forEach((x) => users.add(x.to.toPublicUser()));

	// Send SESSIONS_REPLACE and PRESENCE_UPDATE
	const allSessions = (
		await Session.find({
			where: { user_id: this.user_id },
			select: PrivateSessionProjection,
		})
	).map((x) => ({
		// TODO how is active determined?
		// in our lazy request impl, we just pick the 'most relevant' session
		active: x.session_id == session.session_id,
		activities: x.activities ?? [],
		client_info: x.client_info,
		session_id: x.session_id, // TODO: discord.com sends 'all', what is that???
		status: x.status,
	}));

	Promise.all([
		emitEvent({
			event: "SESSIONS_REPLACE",
			user_id: this.user_id,
			data: allSessions,
		} as SessionsReplace),
		emitEvent({
			event: "PRESENCE_UPDATE",
			user_id: this.user_id,
			data: {
				user: user.toPublicUser(),
				activities: session.activities,
				client_status: session.client_status,
				status: session.status,
			},
		} as PresenceUpdateEvent),
	]);

	// Build READY

	read_states.forEach((x) => {
		x.id = x.channel_id;
	});

	const d: ReadyEventData = {
		v: 9,
		application: application
			? { id: application.id, flags: application.flags }
			: undefined,
		user: user.toPrivateUser(),
		user_settings: user.settings,
		guilds: this.capabilities.has(Capabilities.FLAGS.CLIENT_STATE_V2)
			? guilds.map((x) => new ReadyGuildDTO(x).toJSON())
			: guilds,
		relationships: user.relationships.map((x) => x.toPublicRelationship()),
		read_state: {
			entries: read_states,
			partial: false,
			version: 0, // TODO
		},
		user_guild_settings: {
			entries: user_guild_settings_entries,
			partial: false,
			version: 0, // TODO
		},
		private_channels: channels,
		session_id: this.session_id,
		country_code: user.settings.locale, // TODO: do ip analysis instead
		users: Array.from(users),
		merged_members: merged_members,
		sessions: allSessions,

		resume_gateway_url:
			Config.get().gateway.endpointClient ||
			Config.get().gateway.endpointPublic ||
			"ws://127.0.0.1:3001",

		// lol hack whatever
		required_action:
			Config.get().login.requireVerification && !user.verified
				? "REQUIRE_VERIFIED_EMAIL"
				: undefined,

		consents: {
			personalization: {
				consented: false, // TODO
			},
		},
		experiments: [],
		guild_join_requests: [],
		connected_accounts: [],
		guild_experiments: [],
		geo_ordered_rtc_regions: [],
		api_code_version: 1,
		friend_suggestion_count: 0,
		analytics_token: "",
		tutorial: null,
		session_type: "normal", // TODO
		auth_session_id_hash: "", // TODO
		notification_settings: {
			// ????
			flags: 0,
		},
	};

	// Send READY
	await Send(this, {
		op: OPCODES.Dispatch,
		t: EVENTEnum.Ready,
		s: this.sequence++,
		d,
	});

	// If we're a bot user, send GUILD_CREATE for each unavailable guild
	await Promise.all(
		pending_guilds.map((x) =>
			Send(this, {
				op: OPCODES.Dispatch,
				t: EVENTEnum.GuildCreate,
				s: this.sequence++,
				d: x,
			})?.catch((e) =>
				console.error(`[Gateway] error when sending bot guilds`, e),
			),
		),
	);

	// TODO: ready supplemental
	await Send(this, {
		op: OPCodes.DISPATCH,
		t: EVENTEnum.ReadySupplemental,
		s: this.sequence++,
		d: {
			merged_presences: {
				guilds: [],
				friends: [],
			},
			// these merged members seem to be all users currently in vc in your guilds
			merged_members: [],
			lazy_private_channels: [],
			guilds: [], // { voice_states: [], id: string, embedded_activities: [] }
			// embedded_activities are users currently in an activity?
			disclose: [], // Config.get().general.uniqueUsernames ? ["pomelo"] : []
		},
	});

	//TODO send GUILD_MEMBER_LIST_UPDATE
	//TODO send VOICE_STATE_UPDATE to let the client know if another device is already connected to a voice channel

	await setupListener.call(this);
}
