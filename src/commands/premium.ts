import { Telegraf } from 'telegraf'
import { type AppContext } from '../interfaces/context'

// Utils
import useInvoices from '../utils/useInvoices'

export default function (bot: Telegraf<AppContext>) {
    bot.command('premium', (ctx) => {
        ctx.replyWithInvoice(useInvoices().get(99))
    })
}
