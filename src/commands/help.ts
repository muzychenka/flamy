import { Telegraf } from 'telegraf'
import { type AppContext } from '../interfaces/context'

// CRUD
import * as userCRUD from '../crud/user'

// Utils
import usePremium from '../utils/usePremium'

export default function (bot: Telegraf<AppContext>) {
    bot.command('help', async (ctx) => {
        const id = BigInt(ctx.message.from.id)
        const user = await userCRUD.get(id)

        function addZero(value: number) {
            return value.toString().length === 1 ? '0' + value : value
        }

        let message = `
Flamy - бот для знакомств. С помощью Flamy Вы можете найти отношения, друзей или хороших знакомых\n
После заполнения анкеты Вы можете начать поиск людей (кнопка "Искать людей")\n
❤️ - Отправить лайк анкете
💌 - Отправить лайк и сообщение анкете
👎 - Пропустить анкету
↩️ - Вернуть пропущенную анкету (Премиум)
💤 - Вернуться в главное меню
        `

        if (usePremium().isPremiumActive(user!.premium)) {
            const date = new Date(user!.premium * 1000)
            message += `\n*⭐ Премиум активен до ${addZero(date.getDay())}/${addZero(
                date.getMonth() + 1
            )}/${date.getFullYear()}*`
        }

        ctx.replyWithMarkdown(message)
    })
}
