import { Update, Message } from 'telegraf/typings/core/types/typegram'
import { NarrowedContext, Telegraf } from 'telegraf'
import { AppContext } from '../interfaces/context'

// CRUD
import * as userCRUD from '../crud/user'
import * as matchCRUD from '../crud/match'

// Utils
import useMarkups from './useMarkups'
import useApplication from './useApplication'

// Constants
import { EActions } from '../constants/actions'

function parseAgeRange(ageRange: string | null | undefined, index: number) {
    return typeof ageRange === 'string' ? +ageRange.split(',')[index] : 0
}

export default function () {
    async function showNextPerson(
        city: string | null,
        ctx: NarrowedContext<AppContext, Update.MessageUpdate<Message>>
    ) {
        ctx.session!.isApplicationReady = false
        ctx.session!.currentApplicationId = BigInt(0)

        const id = BigInt(ctx.from.id)
        const currentUser = await userCRUD.get(id)
        const lastMatch = await matchCRUD.getLastUnchecked(id)

        if (
            !currentUser ||
            !currentUser.sex ||
            !currentUser.lookingFor ||
            !currentUser.age ||
            !city
        ) {
            return
        }

        if (lastMatch) {
            const matchUser = await userCRUD.get(lastMatch.firstUserId)

            if (matchUser) {
                await ctx.reply('Кому-то понравилась твоя анкета:', {
                    reply_markup: useMarkups().getReaction({ oneTime: true })
                })
                useApplication().showSympathy(matchUser, ctx, lastMatch.message)
                ctx.session!.currentApplicationId = matchUser.id
                ctx.session!.isApplicationReady = true
                ctx.session!.matchApplicationId = lastMatch.id
                return
            }
        }

        const minAgeRange = parseAgeRange(currentUser?.ageRange, 0)
        const maxAgeRange = parseAgeRange(currentUser?.ageRange, 1) || minAgeRange

        const user = await userCRUD.getRandom(
            id,
            currentUser.sex,
            currentUser.lookingFor,
            city,
            minAgeRange,
            maxAgeRange,
            currentUser.lat || 0,
            currentUser.lng || 0
        )

        if (user.length) {
            useApplication().show('', user[0], ctx)
            ctx.session!.currentApplicationId = user[0].id
            ctx.session!.isApplicationReady = true
        } else {
            ctx.session!.isApplicationReady = true
            await ctx.reply(
                'Не удалось найти подходящие анкеты в твоем регионе :(\nПожалуйста, повтори позже'
            )
        }
    }

    async function notifySecondPerson(bot: Telegraf<AppContext>, id: bigint) {
        try {
            await bot.telegram.sendMessage(
                id.toString(),
                'Кому-то понравилась твоя анкета, хочешь увидеть?',
                {
                    reply_markup: {
                        resize_keyboard: true,
                        one_time_keyboard: true,
                        keyboard: [
                            [
                                {
                                    text: EActions.SHOW_APPLICATION
                                }
                            ]
                        ]
                    }
                }
            )
        } catch (e) {}
    }

    return {
        showNextPerson,
        notifySecondPerson
    }
}
