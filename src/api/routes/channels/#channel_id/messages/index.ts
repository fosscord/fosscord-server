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

import { handleMessage, postHandleMessage, route } from "@spacebar/api";
import {
	Attachment,
	Channel,
	Config,
	DmChannelDTO,
	FieldErrors,
	Member,
	Message,
	MessageCreateEvent,
	MessageCreateSchema,
	Reaction,
	ReadState,
	Rights,
	Snowflake,
	User,
	emitEvent,
	getPermission,
	isTextChannel,
	uploadFile,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import multer from "multer";
import {
	FindManyOptions,
	FindOperator,
	LessThan,
	MoreThan,
	MoreThanOrEqual,
} from "typeorm";
import { URL } from "url";

const router: Router = Router();

// https://discord.com/developers/docs/resources/channel#create-message
// get messages
router.get(
	"/",
	route({
		query: {
			around: {
				type: "string",
			},
			before: {
				type: "string",
			},
			after: {
				type: "string",
			},
			limit: {
				type: "number",
				description:
					"max number of messages to return (1-100). defaults to 50",
			},
		},
		responses: {
			200: {
				body: "APIMessageArray",
			},
			400: {
				body: "APIErrorResponse",
			},
			403: {},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		const channel_id = req.params.channel_id;
		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
		});
		if (!channel) throw new HTTPError("Channel not found", 404);

		isTextChannel(channel.type);
		const around = req.query.around ? `${req.query.around}` : undefined;
		const before = req.query.before ? `${req.query.before}` : undefined;
		const after = req.query.after ? `${req.query.after}` : undefined;
		const limit = Number(req.query.limit) || 50;
		if (limit < 1 || limit > 100)
			throw new HTTPError("limit must be between 1 and 100", 422);

		const permissions = await getPermission(
			req.user_id,
			channel.guild_id,
			channel_id,
		);
		permissions.hasThrow("VIEW_CHANNEL");
		if (!permissions.has("READ_MESSAGE_HISTORY")) return res.json([]);

		const query: FindManyOptions<Message> & {
			where: { id?: FindOperator<string> | FindOperator<string>[] };
		} = {
			order: { timestamp: "DESC" },
			take: limit,
			where: { channel_id },
			relations: [
				"author",
				"webhook",
				"application",
				"mentions",
				"mention_roles",
				"mention_channels",
				"sticker_items",
				"attachments",
			],
		};

		let messages: Message[];

		if (around) {
			query.take = Math.floor(limit / 2);
			if (query.take != 0) {
				const [right, left] = await Promise.all([
					Message.find({
						...query,
						where: { channel_id, id: LessThan(around) },
					}),
					Message.find({
						...query,
						where: { channel_id, id: MoreThanOrEqual(around) },
						order: { timestamp: "ASC" },
					}),
				]);
				left.push(...right);
				messages = left.sort(
					(a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
				);
			} else {
				query.take = 1;
				const message = await Message.findOne({
					...query,
					where: { channel_id, id: around },
				});
				messages = message ? [message] : [];
			}
		} else {
			if (after) {
				if (BigInt(after) > BigInt(Snowflake.generate()))
					throw new HTTPError(
						"after parameter must not be greater than current time",
						422,
					);

				query.where.id = MoreThan(after);
				query.order = { timestamp: "ASC" };
			} else if (before) {
				if (BigInt(before) > BigInt(Snowflake.generate()))
					throw new HTTPError(
						"before parameter must not be greater than current time",
						422,
					);

				query.where.id = LessThan(before);
			}

			messages = await Message.find(query);
		}

		const endpoint = Config.get().cdn.endpointPublic;

		const ret = messages.map((x: Message) => {
			x = x.toJSON();

			(x.reactions || []).forEach((y: Partial<Reaction>) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				if ((y.user_ids || []).includes(req.user_id)) y.me = true;
				delete y.user_ids;
			});
			if (!x.author)
				x.author = User.create({
					id: "4",
					discriminator: "0000",
					username: "Spacebar Ghost",
					public_flags: 0,
				});
			x.attachments?.forEach((y: Attachment) => {
				// dynamically set attachment proxy_url in case the endpoint changed
				const uri = y.proxy_url.startsWith("http")
					? y.proxy_url
					: `https://example.org${y.proxy_url}`;

				let pathname = new URL(uri).pathname;
				while (
					pathname.split("/")[0] != "attachments" &&
					pathname.length > 30
				) {
					pathname = pathname.split("/").slice(1).join("/");
				}
				if (!endpoint?.endsWith("/")) pathname = "/" + pathname;

				y.proxy_url = `${endpoint == null ? "" : endpoint}${pathname}`;
			});

			/**
			Some clients ( discord.js ) only check if a property exists within the response,
			which causes errors when, say, the `application` property is `null`.
			**/

			// for (var curr in x) {
			// 	if (x[curr] === null)
			// 		delete x[curr];
			// }

			return x;
		});

		return res.json(ret);
	},
);

// TODO: config max upload size
const messageUpload = multer({
	limits: {
		fileSize: Config.get().limits.message.maxAttachmentSize,
		fields: 10,
		// files: 1
	},
	storage: multer.memoryStorage(),
}); // max upload 50 mb
/**
 TODO: dynamically change limit of MessageCreateSchema with config

 https://discord.com/developers/docs/resources/channel#create-message
 TODO: text channel slowdown (per-user and across-users)
 Q: trim and replace message content and every embed field A: NO, given this cannot be implemented in E2EE channels
 TODO: only dispatch notifications for mentions denoted in allowed_mentions
**/
// Send message
router.post(
	"/",
	messageUpload.any(),
	(req, res, next) => {
		if (req.body.payload_json) {
			req.body = JSON.parse(req.body.payload_json);
		}

		next();
	},
	route({
		requestBody: "MessageCreateSchema",
		permission: "SEND_MESSAGES",
		right: "SEND_MESSAGES",
		responses: {
			200: {
				body: "Message",
			},
			400: {
				body: "APIErrorResponse",
			},
			403: {},
			404: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { channel_id } = req.params;
		const body = req.body as MessageCreateSchema;
		const attachments: Attachment[] = [];

		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
			relations: ["recipients", "recipients.user"],
		});
		if (!channel.isWritable()) {
			throw new HTTPError(
				`Cannot send messages to channel of type ${channel.type}`,
				400,
			);
		}

		if (body.nonce) {
			const existing = await Message.findOne({
				where: {
					nonce: body.nonce,
					channel_id: channel.id,
					author_id: req.user_id,
				},
			});
			if (existing) {
				return res.json(existing);
			}
		}

		if (!req.rights.has(Rights.FLAGS.BYPASS_RATE_LIMITS)) {
			const limits = Config.get().limits;
			if (limits.absoluteRate.register.enabled) {
				const count = await Message.count({
					where: {
						channel_id,
						timestamp: MoreThan(
							new Date(
								Date.now() -
									limits.absoluteRate.sendMessage.window,
							),
						),
					},
				});

				if (count >= limits.absoluteRate.sendMessage.limit)
					throw FieldErrors({
						channel_id: {
							code: "TOO_MANY_MESSAGES",
							message: req.t("common:toomany.MESSAGE"),
						},
					});
			}
		}

		const files = (req.files as Express.Multer.File[]) ?? [];
		for (const currFile of files) {
			try {
				const file = await uploadFile(
					`/attachments/${channel.id}`,
					currFile,
				);
				attachments.push(
					Attachment.create({ ...file, proxy_url: file.url }),
				);
			} catch (error) {
				return res.status(400).json({ message: error?.toString() });
			}
		}

		const embeds = body.embeds || [];
		if (body.embed) embeds.push(body.embed);
		const message = await handleMessage({
			...body,
			type: 0,
			pinned: false,
			author_id: req.user_id,
			embeds,
			channel_id,
			attachments,
			timestamp: new Date(),
		});
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore dont care2
		message.edited_timestamp = null;

		channel.last_message_id = message.id;

		if (channel.isDm()) {
			const channel_dto = await DmChannelDTO.from(channel);

			// Only one recipients should be closed here, since in group DMs the recipient is deleted not closed
			await Promise.all(
				channel.recipients?.map((recipient) => {
					if (recipient.closed) {
						recipient.closed = false;
						return Promise.all([
							recipient.save(),
							emitEvent({
								event: "CHANNEL_CREATE",
								data: channel_dto.excludedRecipients([
									recipient.user_id,
								]),
								user_id: recipient.user_id,
							}),
						]);
					}
				}) || [],
			);
		}

		if (message.guild_id) {
			// handleMessage will fetch the Member, but only if they are not guild owner.
			// have to fetch ourselves otherwise.
			if (!message.member) {
				message.member = await Member.findOneOrFail({
					where: { id: req.user_id, guild_id: message.guild_id },
					relations: ["roles"],
				});
			}

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			message.member.roles = message.member.roles
				.filter((x) => x.id != x.guild_id)
				.map((x) => x.id);
		}

		let read_state = await ReadState.findOne({
			where: { user_id: req.user_id, channel_id },
		});
		if (!read_state)
			read_state = ReadState.create({ user_id: req.user_id, channel_id });
		read_state.last_message_id = message.id;

		await Promise.all([
			read_state.save(),
			message.save(),
			emitEvent({
				event: "MESSAGE_CREATE",
				channel_id: channel_id,
				data: message,
			} as MessageCreateEvent),
			message.guild_id
				? Member.update(
						{ id: req.user_id, guild_id: message.guild_id },
						{ last_message_id: message.id },
					)
				: null,
			channel.save(),
		]);

		// no await as it shouldnt block the message send function and silently catch error
		postHandleMessage(message).catch((e) =>
			console.error("[Message] post-message handler failed", e),
		);

		return res.json(message);
	},
);

export default router;
