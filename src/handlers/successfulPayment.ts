import { Telegraf } from 'telegraf'
import { type AppContext } from '../interfaces/context'

// CRUD
import * as userCRUD from '../crud/user'

export default function (bot: Telegraf<AppContext>) {
    bot.on('successful_payment', async (ctx) => {
        const id = BigInt(ctx.message.from.id)
        const user = await userCRUD.get(id)

        if (user) {
            const dayUnix = 86400
            const days = 30
            const date = Math.floor(Date.now() / 1000) + dayUnix * days
            await userCRUD.updatePremium(id, date)
        }
    })
}
