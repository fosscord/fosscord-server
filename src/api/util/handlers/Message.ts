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

import * as Sentry from "@sentry/node";
import { EmbedHandlers } from "@spacebar/api";
import {
	Application,
	Attachment,
	Channel,
	Config,
	Embed,
	EmbedCache,
	emitEvent,
	EVERYONE_MENTION,
	getPermission,
	getRights,
	Guild,
	HERE_MENTION,
	Message,
	MessageCreateEvent,
	MessageCreateSchema,
	MessageType,
	MessageUpdateEvent,
	Role,
	ROLE_MENTION,
	Sticker,
	User,
	//CHANNEL_MENTION,
	USER_MENTION,
	Webhook,
	handleFile,
	Permissions,
} from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { In } from "typeorm";
const allow_empty = false;
// TODO: check webhook, application, system author, stickers
// TODO: embed gifs/videos/images

const LINK_REGEX =
	/<?https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)>?/g;

export async function handleMessage(opts: MessageOptions): Promise<Message> {
	const channel = await Channel.findOneOrFail({
		where: { id: opts.channel_id },
		relations: ["recipients"],
	});
	if (!channel || !opts.channel_id)
		throw new HTTPError("Channel not found", 404);

	const stickers = opts.sticker_ids
		? await Sticker.find({ where: { id: In(opts.sticker_ids) } })
		: undefined;
	const message = Message.create({
		...opts,
		poll: opts.poll,
		sticker_items: stickers,
		guild_id: channel.guild_id,
		channel_id: opts.channel_id,
		attachments: opts.attachments || [],
		embeds: opts.embeds || [],
		reactions: /*opts.reactions ||*/ [],
		type: opts.type ?? 0,
	});

	if (
		message.content &&
		message.content.length > Config.get().limits.message.maxCharacters
	) {
		throw new HTTPError("Content length over max character limit");
	}

	if (opts.author_id) {
		message.author = await User.getPublicUser(opts.author_id);
		const rights = await getRights(opts.author_id);
		rights.hasThrow("SEND_MESSAGES");
	}
	if (opts.application_id) {
		message.application = await Application.findOneOrFail({
			where: { id: opts.application_id },
		});
	}

	let permission: undefined | Permissions;
	if (opts.webhook_id) {
		message.webhook = await Webhook.findOneOrFail({
			where: { id: opts.webhook_id },
		});

		message.author =
			(await User.findOne({
				where: { id: opts.webhook_id },
			})) || undefined;

		if (!message.author) {
			message.author = User.create({
				id: opts.webhook_id,
				username: message.webhook.name,
				discriminator: "0000",
				avatar: message.webhook.avatar,
				public_flags: 0,
				premium: false,
				premium_type: 0,
				bot: true,
				created_at: new Date(),
				verified: true,
				rights: "0",
				data: {
					valid_tokens_since: new Date(),
				},
			});

			await message.author.save();
		}

		if (opts.username) {
			message.username = opts.username;
			message.author.username = message.username;
		}
		if (opts.avatar_url) {
			const avatarData = await fetch(opts.avatar_url);
			const base64 = await avatarData
				.arrayBuffer()
				.then((x) => Buffer.from(x).toString("base64"));

			const dataUri =
				"data:" +
				avatarData.headers.get("content-type") +
				";base64," +
				base64;

			message.avatar = await handleFile(
				`/avatars/${opts.webhook_id}`,
				dataUri as string,
			);
			message.author.avatar = message.avatar;
		}
	} else {
		permission = await getPermission(
			opts.author_id,
			channel.guild_id,
			opts.channel_id,
		);
		permission.hasThrow("SEND_MESSAGES");
		if (permission.cache.member) {
			message.member = permission.cache.member;
		}

		if (opts.tts) permission.hasThrow("SEND_TTS_MESSAGES");
		if (opts.message_reference) {
			permission.hasThrow("READ_MESSAGE_HISTORY");
			// code below has to be redone when we add custom message routing
			if (message.guild_id !== null) {
				const guild = await Guild.findOneOrFail({
					where: { id: channel.guild_id },
				});
				if (!opts.message_reference.guild_id)
					opts.message_reference.guild_id = channel.guild_id;
				if (!opts.message_reference.channel_id)
					opts.message_reference.channel_id = opts.channel_id;

				if (!guild.features.includes("CROSS_CHANNEL_REPLIES")) {
					if (opts.message_reference.guild_id !== channel.guild_id)
						throw new HTTPError(
							"You can only reference messages from this guild",
						);
					if (opts.message_reference.channel_id !== opts.channel_id)
						throw new HTTPError(
							"You can only reference messages from this channel",
						);
				}

				message.message_reference = opts.message_reference;
			}
			/** Q: should be checked if the referenced message exists? ANSWER: NO
			 otherwise backfilling won't work **/
			message.type = MessageType.REPLY;
		}
	}

	// TODO: stickers/activity
	if (
		!allow_empty &&
		!opts.content &&
		!opts.embeds?.length &&
		!opts.attachments?.length &&
		!opts.sticker_ids?.length &&
		!opts.poll &&
		!opts.components?.length
	) {
		throw new HTTPError("Empty messages are not allowed", 50006);
	}

	let content = opts.content;

	// root@Rory - 20/02/2023 - This breaks channel mentions in test client. We're not sure this was used in older clients.
	//const mention_channel_ids = [] as string[];
	const mention_role_ids = [] as string[];
	const mention_user_ids = [] as string[];
	let mention_everyone = false;

	if (content) {
		// TODO: explicit-only mentions
		message.content = content.trim();
		content = content.replace(/ *`[^)]*` */g, ""); // remove codeblocks
		// root@Rory - 20/02/2023 - This breaks channel mentions in test client. We're not sure this was used in older clients.
		/*for (const [, mention] of content.matchAll(CHANNEL_MENTION)) {
			if (!mention_channel_ids.includes(mention))
				mention_channel_ids.push(mention);
		}*/

		for (const [, mention] of content.matchAll(USER_MENTION)) {
			if (!mention_user_ids.includes(mention))
				mention_user_ids.push(mention);
		}

		await Promise.all(
			Array.from(content.matchAll(ROLE_MENTION)).map(
				async ([, mention]) => {
					const role = await Role.findOneOrFail({
						where: { id: mention, guild_id: channel.guild_id },
					});
					if (
						role.mentionable ||
						opts.webhook_id ||
						permission?.has("MANAGE_ROLES")
					) {
						mention_role_ids.push(mention);
					}
				},
			),
		);

		if (opts.webhook_id || permission?.has("MENTION_EVERYONE")) {
			mention_everyone =
				!!content.match(EVERYONE_MENTION) ||
				!!content.match(HERE_MENTION);
		}
	}

	// root@Rory - 20/02/2023 - This breaks channel mentions in test client. We're not sure this was used in older clients.
	/*message.mention_channels = mention_channel_ids.map((x) =>
		Channel.create({ id: x }),
	);*/
	message.mention_roles = mention_role_ids.map((x) => Role.create({ id: x }));
	message.mentions = mention_user_ids.map((x) => User.create({ id: x }));
	message.mention_everyone = mention_everyone;

	// TODO: check and put it all in the body

	return message;
}

// TODO: cache link result in db
export async function postHandleMessage(message: Message) {
	const content = message.content?.replace(/ *`[^)]*` */g, ""); // remove markdown
	let links = content?.match(LINK_REGEX);
	if (!links) return;

	const data = { ...message };
	data.embeds = data.embeds.filter((x) => x.type !== "link");

	links = links.slice(0, 20) as RegExpMatchArray; // embed max 20 links — TODO: make this configurable with instance policies

	const cachePromises = [];

	for (const link of links) {
		// Don't embed links in <>
		if (link.startsWith("<") && link.endsWith(">")) continue;

		const url = new URL(link);

		const cached = await EmbedCache.findOne({ where: { url: link } });
		if (cached) {
			data.embeds.push(cached.embed);
			continue;
		}

		// bit gross, but whatever!
		const endpointPublic =
			Config.get().cdn.endpointPublic || "http://127.0.0.1"; // lol
		const handler =
			url.hostname == new URL(endpointPublic).hostname
				? EmbedHandlers["self"]
				: EmbedHandlers[url.hostname] || EmbedHandlers["default"];

		try {
			let res = await handler(url);
			if (!res) continue;
			// tried to use shorthand but types didn't like me L
			if (!Array.isArray(res)) res = [res];

			for (const embed of res) {
				const cache = EmbedCache.create({
					url: link,
					embed: embed,
				});
				cachePromises.push(cache.save());
				data.embeds.push(embed);
			}
		} catch (e) {
			console.error(`[Embeds] Error while generating embed`, e);
			Sentry.captureException(e, (scope) => {
				scope.clear();
				scope.setContext("request", { url });
				return scope;
			});
			continue;
		}
	}

	if (!data.embeds) return;

	await Promise.all([
		emitEvent({
			event: "MESSAGE_UPDATE",
			channel_id: message.channel_id,
			data,
		} as MessageUpdateEvent),
		Message.update(
			{ id: message.id, channel_id: message.channel_id },
			{ embeds: data.embeds },
		),
		...cachePromises,
	]);
}

export async function sendMessage(opts: MessageOptions) {
	const message = await handleMessage({ ...opts, timestamp: new Date() });

	await Promise.all([
		Message.insert(message),
		emitEvent({
			event: "MESSAGE_CREATE",
			channel_id: opts.channel_id,
			data: message.toJSON(),
		} as MessageCreateEvent),
	]);

	// no await as it should catch error non-blockingly
	postHandleMessage(message).catch((e) =>
		console.error("[Message] post-message handler failed", e),
	);

	return message;
}

interface MessageOptions extends MessageCreateSchema {
	id?: string;
	type?: MessageType;
	pinned?: boolean;
	author_id?: string;
	webhook_id?: string;
	application_id?: string;
	embeds?: Embed[];
	channel_id?: string;
	attachments?: Attachment[];
	edited_timestamp?: Date;
	timestamp?: Date;
	username?: string;
	avatar_url?: string;
}
