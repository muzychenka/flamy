import { Telegraf } from 'telegraf'
import { type AppContext } from '../interfaces/context'

// CRUD
import * as userCRUD from '../crud/user'
import * as attachmentCRUD from '../crud/attachment'

// Utils
import useSession from '../utils/useSession'
import useApplication from '../utils/useApplication'
import useSteps from '../utils/useSteps'

// Constants
import { ESteps } from '../constants/steps'

export default function (bot: Telegraf<AppContext>) {
    bot.start(async (ctx) => {
        useSession().init(ctx, true)

        const id = BigInt(ctx.message.from.id)
        const user = await userCRUD.get(id)
        const attachments = await attachmentCRUD.get(id)

        if (!ctx.from.username) {
            ctx.reply(
                'Прежде чем искать людей, пожалуйста, задай имя пользователя в настройках Telegram'
            )
            return
        }

        const { isFilled, check, show } = useApplication()

        if (user) {
            if (!isFilled(user, attachments)) {
                check(user, attachments, ctx)
            } else {
                show('Привет! Мы тебя помним, вот твоя анкета:', user, ctx)
            }
        } else {
            await userCRUD.create(id)
            await ctx.reply('Привет! Flamy - бот для знакомств', {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [
                            {
                                text: ctx.message.from.first_name
                            }
                        ]
                    ]
                }
            })
            useSteps().show(ESteps.NAME, ctx)
        }
    })
}
