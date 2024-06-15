import { Telegraf } from 'telegraf'
import { type AppContext } from '../interfaces/context'

// Utils
import useSession from '../utils/useSession'

export default function (bot: Telegraf<AppContext>) {
    bot.on('message', (ctx, next) => {
        useSession().init(ctx)
        next()
    })
}
