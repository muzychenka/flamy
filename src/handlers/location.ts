import { Telegraf } from 'telegraf'
import { type AppContext } from '../interfaces/context'
import { message } from 'telegraf/filters'

// CRUD
import * as userCRUD from '../crud/user'

// Utils
import useApplication from '../utils/useApplication'

export default function (bot: Telegraf<AppContext>) {
    bot.on(message('location'), async (ctx) => {
        const id = BigInt(ctx.message.from.id)
        const { latitude, longitude } = ctx.message.location

        await userCRUD.updateLocation(id, latitude, longitude)
        await ctx.sendMessage('Геолокация анкеты была обновлена')

        const user = await userCRUD.get(id)

        if (user) {
            useApplication().show('Так выглядит твоя анкета:', user, ctx)
        }
    })
}
