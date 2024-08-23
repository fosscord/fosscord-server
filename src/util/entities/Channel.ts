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

import { HTTPError } from "lambert-server";
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	RelationId,
} from "typeorm";
import { DmChannelDTO } from "../dtos";
import { ChannelCreateEvent, ChannelRecipientRemoveEvent } from "../interfaces";
import {
	InvisibleCharacters,
	Snowflake,
	containsAll,
	emitEvent,
	getPermission,
	trimSpecial,
} from "../util";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Invite } from "./Invite";
import { Message } from "./Message";
import { ReadState } from "./ReadState";
import { Recipient } from "./Recipient";
import { PublicUserProjection, User } from "./User";
import { VoiceState } from "./VoiceState";
import { Webhook } from "./Webhook";
import { dbEngine } from "../util/Database";

export enum ChannelType {
	GUILD_TEXT = 0, // a text channel within a guild
	DM = 1, // a direct message between users
	GUILD_VOICE = 2, // a voice channel within a guild
	GROUP_DM = 3, // a direct message between multiple users
	GUILD_CATEGORY = 4, // an organizational category that contains zero or more channels
	GUILD_NEWS = 5, // a channel that users can follow and crosspost into a guild or route
	GUILD_STORE = 6, // a channel in which game developers can sell their things
	ENCRYPTED = 7, // end-to-end encrypted channel
	ENCRYPTED_THREAD = 8, // end-to-end encrypted thread channel
	TRANSACTIONAL = 9, // event chain style transactional channel
	GUILD_NEWS_THREAD = 10, // a temporary sub-channel within a GUILD_NEWS channel
	GUILD_PUBLIC_THREAD = 11, // a temporary sub-channel within a GUILD_TEXT channel
	GUILD_PRIVATE_THREAD = 12, // a temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission
	GUILD_STAGE_VOICE = 13, // a voice channel for hosting events with an audience
	DIRECTORY = 14, // guild directory listing channel
	GUILD_FORUM = 15, // forum composed of IM threads
	TICKET_TRACKER = 33, // ticket tracker, individual ticket items shall have type 12
	KANBAN = 34, // confluence like kanban board
	VOICELESS_WHITEBOARD = 35, // whiteboard but without voice (whiteboard + voice is the same as stage)
	CUSTOM_START = 64, // start custom channel types from here
	UNHANDLED = 255, // unhandled unowned pass-through channel type
}

@Entity({
	name: "channels",
	engine: dbEngine,
})
export class Channel extends BaseClass {
	@Column()
	created_at: Date;

	@Column({ nullable: true })
	name?: string;

	@Column({ type: "text", nullable: true })
	icon?: string | null;

	@Column({ type: "int" })
	type: ChannelType;

	@OneToMany(() => Recipient, (recipient: Recipient) => recipient.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	recipients?: Recipient[];

	@Column({ nullable: true })
	last_message_id?: string;

	@Column({ nullable: true })
	@RelationId((channel: Channel) => channel.guild)
	guild_id?: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild) => guild.channels, {
		onDelete: "CASCADE",
		nullable: true,
	})
	guild?: Guild;

	@Column({ nullable: true })
	@RelationId((channel: Channel) => channel.parent)
	parent_id: string | null;

	@JoinColumn({ name: "parent_id" })
	@ManyToOne(() => Channel)
	parent?: Channel;

	// for group DMs and owned custom channel types
	@Column({ nullable: true })
	@RelationId((channel: Channel) => channel.owner)
	owner_id?: string;

	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User)
	owner: User;

	@Column({ nullable: true })
	last_pin_timestamp?: number;

	@Column({ nullable: true })
	default_auto_archive_duration?: number;

	@Column({ type: "simple-json", nullable: true })
	permission_overwrites?: ChannelPermissionOverwrite[];

	@Column({ nullable: true })
	video_quality_mode?: number;

	@Column({ nullable: true })
	bitrate?: number;

	@Column({ nullable: true })
	user_limit?: number;

	@Column()
	nsfw: boolean = false;

	@Column({ nullable: true })
	rate_limit_per_user?: number;

	@Column({ nullable: true })
	topic?: string;

	@OneToMany(() => Invite, (invite: Invite) => invite.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	invites?: Invite[];

	@Column({ nullable: true })
	retention_policy_id?: string;

	@OneToMany(() => Message, (message: Message) => message.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	messages?: Message[];

	@OneToMany(
		() => VoiceState,
		(voice_state: VoiceState) => voice_state.channel,
		{
			cascade: true,
			orphanedRowAction: "delete",
		},
	)
	voice_states?: VoiceState[];

	@OneToMany(() => ReadState, (read_state: ReadState) => read_state.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	read_states?: ReadState[];

	@OneToMany(() => Webhook, (webhook: Webhook) => webhook.channel, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	webhooks?: Webhook[];

	@Column()
	flags: number = 0;

	@Column()
	default_thread_rate_limit_per_user: number = 0;

	/** Must be calculated Channel.calculatePosition */
	position: number;

	// TODO: DM channel
	static async createChannel(
		channel: Partial<Channel>,
		user_id: string = "0",
		opts?: {
			keepId?: boolean;
			skipExistsCheck?: boolean;
			skipPermissionCheck?: boolean;
			skipEventEmit?: boolean;
			skipNameChecks?: boolean;
		},
	) {
		if (!opts?.skipPermissionCheck) {
			// Always check if user has permission first
			const permissions = await getPermission(user_id, channel.guild_id);
			permissions.hasThrow("MANAGE_CHANNELS");
		}

		const guild = await Guild.findOneOrFail({
			where: { id: channel.guild_id },
			select: {
				features: !opts?.skipNameChecks,
				channel_ordering: true,
				id: true,
			},
		});

		if (!opts?.skipNameChecks) {
			if (
				!guild.features.includes("ALLOW_INVALID_CHANNEL_NAMES") &&
				channel.name
			) {
				for (const character of InvisibleCharacters)
					if (channel.name.includes(character))
						throw new HTTPError(
							"Channel name cannot include invalid characters",
							403,
						);

				// Categories skip these checks on discord.com
				if (
					channel.type !== ChannelType.GUILD_CATEGORY ||
					guild.features.includes("IRC_LIKE_CATEGORY_NAMES")
				) {
					if (channel.name.includes(" "))
						throw new HTTPError(
							"Channel name cannot include invalid characters",
							403,
						);

					if (channel.name.match(/--+/g))
						throw new HTTPError(
							"Channel name cannot include multiple adjacent dashes.",
							403,
						);

					if (
						channel.name.charAt(0) === "-" ||
						channel.name.charAt(channel.name.length - 1) === "-"
					)
						throw new HTTPError(
							"Channel name cannot start/end with dash.",
							403,
						);
				} else channel.name = channel.name.trim(); //category names are trimmed client side on discord.com
			}

			if (!guild.features.includes("ALLOW_UNNAMED_CHANNELS")) {
				if (!channel.name)
					throw new HTTPError("Channel name cannot be empty.", 403);
			}
		}

		switch (channel.type) {
			case ChannelType.GUILD_TEXT:
			case ChannelType.GUILD_NEWS:
			case ChannelType.GUILD_VOICE:
				if (channel.parent_id && !opts?.skipExistsCheck) {
					const exists = await Channel.findOneOrFail({
						where: { id: channel.parent_id },
					});
					if (!exists)
						throw new HTTPError(
							"Parent id channel doesn't exist",
							400,
						);
					if (exists.guild_id !== channel.guild_id)
						throw new HTTPError(
							"The category channel needs to be in the guild",
						);
				}
				break;
			case ChannelType.GUILD_CATEGORY:
			case ChannelType.UNHANDLED:
				break;
			case ChannelType.DM:
			case ChannelType.GROUP_DM:
				throw new HTTPError("You can't create a dm channel in a guild");
			case ChannelType.GUILD_STORE:
			default:
				throw new HTTPError("Not yet supported");
		}

		if (!channel.permission_overwrites) channel.permission_overwrites = [];
		// TODO: eagerly auto generate position of all guild channels

		const position =
			(channel.type === ChannelType.UNHANDLED ? 0 : channel.position) ||
			0;

		channel = {
			...channel,
			...(!opts?.keepId && { id: Snowflake.generate() }),
			created_at: new Date(),
			position,
		};

		const ret = Channel.create(channel);

		await Promise.all([
			ret.save(),
			!opts?.skipEventEmit
				? emitEvent({
						event: "CHANNEL_CREATE",
						data: channel,
						guild_id: channel.guild_id,
					} as ChannelCreateEvent)
				: Promise.resolve(),
			Guild.insertChannelInOrder(guild.id, ret.id, position, guild),
		]);

		return ret;
	}

	static async createDMChannel(
		recipients: string[],
		creator_user_id: string,
		name?: string,
	) {
		recipients = recipients.unique().filter((x) => x !== creator_user_id);
		// TODO: check config for max number of recipients
		/** if you want to disallow note to self channels, uncomment the conditional below

		const otherRecipientsUsers = await User.find({ where: recipients.map((x) => ({ id: x })) });
		if (otherRecipientsUsers.length !== recipients.length) {
			throw new HTTPError("Recipient/s not found");
		}
		**/

		const type =
			recipients.length > 1 ? ChannelType.GROUP_DM : ChannelType.DM;

		let channel = null;

		const channelRecipients = [...recipients, creator_user_id];

		const userRecipients = await Recipient.find({
			where: { user_id: creator_user_id },
			relations: ["channel", "channel.recipients"],
		});

		for (const ur of userRecipients) {
			if (!ur.channel.recipients) continue;
			const re = ur.channel.recipients.map((r) => r.user_id);
			if (re.length === channelRecipients.length) {
				if (containsAll(re, channelRecipients)) {
					if (channel == null) {
						channel = ur.channel;
						await ur.assign({ closed: false }).save();
					}
				}
			}
		}

		if (channel == null) {
			name = trimSpecial(name);

			channel = await Channel.create({
				name,
				type,
				owner_id: undefined,
				created_at: new Date(),
				last_message_id: undefined,
				recipients: channelRecipients.map((x) =>
					Recipient.create({
						user_id: x,
						closed: !(
							type === ChannelType.GROUP_DM ||
							x === creator_user_id
						),
					}),
				),
				nsfw: false,
			}).save();
		}

		const channel_dto = await DmChannelDTO.from(channel);

		if (type === ChannelType.GROUP_DM && channel.recipients) {
			for (const recipient of channel.recipients) {
				await emitEvent({
					event: "CHANNEL_CREATE",
					data: channel_dto.excludedRecipients([recipient.user_id]),
					user_id: recipient.user_id,
				});
			}
		} else {
			await emitEvent({
				event: "CHANNEL_CREATE",
				data: channel_dto,
				user_id: creator_user_id,
			});
		}

		if (recipients.length === 1) return channel_dto;
		else return channel_dto.excludedRecipients([creator_user_id]);
	}

	static async removeRecipientFromChannel(channel: Channel, user_id: string) {
		await Recipient.delete({ channel_id: channel.id, user_id: user_id });
		channel.recipients = channel.recipients?.filter(
			(r) => r.user_id !== user_id,
		);

		if (channel.recipients?.length === 0) {
			await Channel.deleteChannel(channel);
			await emitEvent({
				event: "CHANNEL_DELETE",
				data: await DmChannelDTO.from(channel, [user_id]),
				user_id: user_id,
			});
			return;
		}

		await emitEvent({
			event: "CHANNEL_DELETE",
			data: await DmChannelDTO.from(channel, [user_id]),
			user_id: user_id,
		});

		//If the owner leave the server user is the new owner
		if (channel.owner_id === user_id) {
			channel.owner_id = "1"; // The channel is now owned by the server user
			await emitEvent({
				event: "CHANNEL_UPDATE",
				data: await DmChannelDTO.from(channel, [user_id]),
				channel_id: channel.id,
			});
		}

		await channel.save();

		await emitEvent({
			event: "CHANNEL_RECIPIENT_REMOVE",
			data: {
				channel_id: channel.id,
				user: await User.findOneOrFail({
					where: { id: user_id },
					select: PublicUserProjection,
				}),
			},
			channel_id: channel.id,
		} as ChannelRecipientRemoveEvent);
	}

	static async deleteChannel(channel: Channel) {
		// TODO Delete attachments from the CDN for messages in the channel
		await Channel.delete({ id: channel.id });

		const guild = await Guild.findOneOrFail({
			where: { id: channel.guild_id },
			select: { channel_ordering: true },
		});

		const updatedOrdering = guild.channel_ordering.filter(
			(id) => id != channel.id,
		);
		await Guild.update(
			{ id: channel.guild_id },
			{ channel_ordering: updatedOrdering },
		);
	}

	static async calculatePosition(
		channel_id: string,
		guild_id: string,
		guild?: Guild,
	) {
		if (!guild)
			guild = await Guild.findOneOrFail({
				where: { id: guild_id },
				select: { channel_ordering: true },
			});

		return guild.channel_ordering.findIndex((id) => channel_id == id);
	}

	static async getOrderedChannels(guild_id: string, guild?: Guild) {
		if (!guild)
			guild = await Guild.findOneOrFail({
				where: { id: guild_id },
				select: { channel_ordering: true },
			});

		const channels = await Promise.all(
			guild.channel_ordering.map((id) =>
				Channel.findOne({ where: { id } }),
			),
		);

		return channels
			.filter((channel) => channel !== null)
			.reduce((r, v) => {
				v = v as Channel;

				v.position = (guild as Guild).channel_ordering.indexOf(v.id);
				r[v.position] = v;
				return r;
			}, [] as Array<Channel>);
	}

	isDm() {
		return (
			this.type === ChannelType.DM || this.type === ChannelType.GROUP_DM
		);
	}

	// Does the channel support sending messages ( eg categories do not )
	isWritable() {
		const disallowedChannelTypes = [
			ChannelType.GUILD_CATEGORY,
			ChannelType.GUILD_STAGE_VOICE,
			ChannelType.VOICELESS_WHITEBOARD,
		];
		return disallowedChannelTypes.indexOf(this.type) == -1;
	}

	toJSON() {
		return {
			...this,

			// these fields are not returned depending on the type of channel
			bitrate: this.bitrate || undefined,
			user_limit: this.user_limit || undefined,
			rate_limit_per_user: this.rate_limit_per_user || undefined,
			owner_id: this.owner_id || undefined,
		};
	}
}

export interface ChannelPermissionOverwrite {
	allow: string;
	deny: string;
	id: string;
	type: ChannelPermissionOverwriteType;
}

export enum ChannelPermissionOverwriteType {
	role = 0,
	member = 1,
	group = 2,
}

export interface DMChannel extends Omit<Channel, "type" | "recipients"> {
	type: ChannelType.DM | ChannelType.GROUP_DM;
	recipients: Recipient[];
}

// TODO: probably more props
export function isTextChannel(type: ChannelType): boolean {
	switch (type) {
		case ChannelType.GUILD_STORE:
		case ChannelType.GUILD_STAGE_VOICE:
		case ChannelType.GUILD_CATEGORY:
		case ChannelType.GUILD_FORUM:
		case ChannelType.DIRECTORY:
			throw new HTTPError("not a text channel", 400);
		case ChannelType.DM:
		case ChannelType.GROUP_DM:
		case ChannelType.GUILD_NEWS:
		case ChannelType.GUILD_VOICE:
		case ChannelType.GUILD_NEWS_THREAD:
		case ChannelType.GUILD_PUBLIC_THREAD:
		case ChannelType.GUILD_PRIVATE_THREAD:
		case ChannelType.GUILD_TEXT:
		case ChannelType.ENCRYPTED:
		case ChannelType.ENCRYPTED_THREAD:
			return true;
		default:
			throw new HTTPError("unimplemented", 400);
	}
}
