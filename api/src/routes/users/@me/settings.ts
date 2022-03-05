import { Router, Response, Request } from "express";
import { User, UserSettings, emitEvent } from "@fosscord/util";
import { route } from "@fosscord/api";

const router = Router();

export interface UserSettingsSchema extends Partial<UserSettings> {}

router.patch("/", route({ body: "UserSettingsSchema" }), async (req: Request, res: Response) => {
	const body = req.body as UserSettings;
	if (body.locale === "en") body.locale = "en-US"; // fix discord client crash on unkown locale

	const user = await User.findOneOrFail({ id: req.user_id, bot: false });
	user.settings = { ...user.settings, ...body };
	await user.save();
    
	await emitEvent ({
		event: "USER_SETTINGS_UPDATE",
		user_id: req.user_id,
		data: {
			body,
		},
	});

	res.sendStatus(204);
});

export default router;
