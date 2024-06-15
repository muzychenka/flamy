import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { MediaGroup } from 'telegraf/typings/telegram-types'
import { type AppContext } from '../interfaces/context'

// CRUD
import * as userCRUD from '../crud/user'
import * as attachmentCRUD from '../crud/attachment'
import * as matchCRUD from '../crud/match'

// Utils
import useMedia from '../utils/useMedia'
import useApplication from '../utils/useApplication'
import useMatcher from '../utils/useMatcher'
import useMarkups from '../utils/useMarkups'
import useSteps from '../utils/useSteps'
import usePremium from '../utils/usePremium'
import useTips from '../utils/useTips'
import useValidators from '../utils/useValidators'

// Constants
import { ESteps } from '../constants/steps'
import { EActions } from '../constants/actions'
import { ESex, SEX_MALE_LINE } from '../constants/sex'
import { EReactions } from '../constants/reactions'
import { SPECIAL_CHARS } from '../constants/chars'
import { MENU } from '../constants/menu'
import { LOOKING_FOR_FEMALE, LOOKING_FOR_MALE } from '../constants/lookingFor'

export default function (bot: Telegraf<AppContext>) {
    bot.on(message('text'), async (ctx) => {
        if (!ctx.from.username) {
            ctx.reply(
                'Прежде чем искать людей, пожалуйста, задай имя пользователя в настройках Telegram'
            )
            return
        }

        const id = BigInt(ctx.message.from.id)
        const user = await userCRUD.get(id)
        const attachments = await attachmentCRUD.get(id)

        const { isFilled, check, show, showSympathy } = useApplication()
        const { notifySecondPerson, showNextPerson } = useMatcher()
        const { getReaction } = useMarkups()

        if (user) {
            if (!isFilled(user, attachments) && ctx.session?.editStep === -1) {
                check(user, attachments, ctx)
                return
            }

            if (ctx.session?.editStep === -1) {
                if (
                    ctx.message.text === EReactions.SLEEP &&
                    (ctx.session.isSearch || ctx.session.matchApplicationId) &&
                    !ctx.session.isMessaging
                ) {
                    await ctx.reply(
                        'Поиск выключен, но твоя анкета все еще видна другим пользователям'
                    )

                    ctx.session.isApplicationReady = false
                    ctx.session.isSearch = false
                    ctx.session.isEdit = false
                    ctx.session.matchApplicationId = BigInt(0)

                    const updatedUser = await userCRUD.get(id)

                    if (updatedUser) {
                        show('Так выглядит твоя анкета:', updatedUser, ctx)
                    }

                    return
                }

                if (ctx.session.isMessaging) {
                    await ctx.reply('Сообщение отправлено, ждем ответа')
                    if (!(await matchCRUD.get(id, ctx.session.currentApplicationId))) {
                        await matchCRUD.create(
                            id,
                            ctx.session.currentApplicationId,
                            ctx.message.text
                        )
                        notifySecondPerson(bot, ctx.session.currentApplicationId)
                    }
                    ctx.session.isMessaging = false
                    showNextPerson(user.city, ctx)
                    return
                }

                const uncheckedMatch = await matchCRUD.getLastUnchecked(id)

                if (ctx.message.text === EActions.SHOW_APPLICATION && uncheckedMatch) {
                    const matchUser = await userCRUD.get(uncheckedMatch.firstUserId)

                    if (matchUser) {
                        await ctx.reply('Кому-то понравилась твоя анкета:', {
                            reply_markup: getReaction({ oneTime: true })
                        })
                        showSympathy(matchUser, ctx, uncheckedMatch.message)
                        ctx.session!.currentApplicationId = matchUser.id
                        ctx.session!.matchApplicationId = uncheckedMatch.id
                        ctx.session!.isApplicationReady = true
                        return
                    }
                }

                if (ctx.message.text === EActions.CONTINUE_SEARCH && ctx.session.isSearch) {
                    await ctx.reply('Идем дальше...', {
                        reply_markup: getReaction({ withReply: true })
                    })
                    showNextPerson(user.city, ctx)
                    return
                }

                if (!ctx.session.isSearch) {
                    for (const [key, value] of Object.entries(MENU)) {
                        if (ctx.message.text === key) {
                            useSteps().show(value.step, ctx)
                            ctx.session.isEdit = true
                            return
                        }
                    }
                }

                if (ctx.session.isSearch || uncheckedMatch) {
                    if (ctx.session.isApplicationReady) {
                        switch (ctx.message.text) {
                            case EReactions.LIKE: {
                                if (uncheckedMatch && ctx.session.matchApplicationId) {
                                    await matchCRUD.updateConfirmation(true, uncheckedMatch.id)
                                    ctx.session.isApplicationReady = false
                                    ctx.session.matchApplicationId = BigInt(0)
                                    const firstUser = await bot.telegram.getChatMember(
                                        uncheckedMatch.firstUserId.toString(),
                                        +uncheckedMatch.firstUserId.toString()
                                    )
                                    const firstUserData = await userCRUD.get(
                                        uncheckedMatch.firstUserId
                                    )
                                    const secondUserAttachments = await attachmentCRUD.get(id)
                                    const secondUserMediaGroup = useMedia().getGroup(
                                        user,
                                        secondUserAttachments
                                    )

                                    ctx.session.isSearch = true
                                    ctx.session.lastApplicationId = BigInt(0)

                                    let firstUserName = firstUserData?.name || ''
                                    let secondUserName = user.name || ''

                                    SPECIAL_CHARS.forEach(
                                        (char) =>
                                            (firstUserName = firstUserName.replaceAll(
                                                char,
                                                `\\${char}`
                                            ))
                                    )
                                    SPECIAL_CHARS.forEach(
                                        (char) =>
                                            (secondUserName = secondUserName.replaceAll(
                                                char,
                                                `\\${char}`
                                            ))
                                    )

                                    await ctx.reply(
                                        `Надеюсь, вы хорошо проведете время вместе\\!\nНаписать [${firstUserName}](https://t.me/${firstUser.user.username})`,
                                        {
                                            parse_mode: 'MarkdownV2',
                                            reply_markup: {
                                                resize_keyboard: true,
                                                one_time_keyboard: true,
                                                keyboard: [
                                                    [
                                                        {
                                                            text: EActions.CONTINUE_SEARCH
                                                        }
                                                    ]
                                                ]
                                            }
                                        }
                                    )

                                    await bot.telegram.sendMediaGroup(
                                        uncheckedMatch.firstUserId.toString(),
                                        secondUserMediaGroup as MediaGroup
                                    )

                                    await bot.telegram.sendMessage(
                                        uncheckedMatch.firstUserId.toString(),
                                        `Есть взаимная симпатия\\!\nНаписать [${secondUserName}](https://t.me/${ctx.from.username})`,
                                        {
                                            parse_mode: 'MarkdownV2',
                                            reply_markup: {
                                                resize_keyboard: true,
                                                one_time_keyboard: true,
                                                keyboard: [
                                                    [
                                                        {
                                                            text: EActions.CONTINUE_SEARCH
                                                        }
                                                    ]
                                                ]
                                            }
                                        }
                                    )
                                } else {
                                    if (ctx.session.currentApplicationId) {
                                        await ctx.reply(
                                            'Отлично! Ждем ответа от данного пользователя'
                                        )

                                        if (
                                            !(await matchCRUD.get(
                                                id,
                                                ctx.session.currentApplicationId
                                            ))
                                        ) {
                                            await matchCRUD.create(
                                                id,
                                                ctx.session.currentApplicationId
                                            )
                                            notifySecondPerson(
                                                bot,
                                                ctx.session.currentApplicationId
                                            )
                                        }
                                    }

                                    showNextPerson(user.city, ctx)
                                }
                                break
                            }
                            case EReactions.MESSAGE: {
                                if (ctx.session.isSearch && ctx.session.currentApplicationId) {
                                    await ctx.reply(
                                        `${EReactions.MESSAGE} Напиши сообщение для этого пользователя`
                                    )
                                    ctx.session.isMessaging = true
                                    return
                                } else {
                                    showNextPerson(user.city, ctx)
                                }
                                break
                            }
                            case EReactions.DISLIKE: {
                                ctx.session.isSearch = true

                                if (uncheckedMatch) {
                                    await matchCRUD.updateConfirmation(false, uncheckedMatch.id)
                                    await ctx.reply('Анкета отклонена', {
                                        reply_markup: useMarkups().getReaction({ withReply: true })
                                    })
                                }

                                ctx.session.lastApplicationId = ctx.session.currentApplicationId

                                showNextPerson(user.city, ctx)
                                break
                            }
                            case EReactions.BACK: {
                                if (usePremium().isPremiumActive(user.premium)) {
                                    if (
                                        !ctx.session.lastApplicationId ||
                                        ctx.session.lastApplicationId ===
                                            ctx.session.currentApplicationId
                                    ) {
                                        await ctx.reply('Невозможно вернуться к предыдущей анкете')
                                        return
                                    }

                                    const lastUser = await userCRUD.get(
                                        ctx.session.lastApplicationId
                                    )
                                    show('', lastUser, ctx)
                                    ctx.session.currentApplicationId = ctx.session.lastApplicationId
                                    ctx.session.isApplicationReady = true
                                    ctx.session.lastApplicationId = BigInt(0)
                                } else {
                                    await ctx.reply(
                                        '❌ У Вас нет премиум подписки для того чтобы вернуть прошлую анкету\n\n/premium чтобы купить подписку'
                                    )
                                }

                                break
                            }
                            default: {
                                await ctx.reply('Нет такого варианта')
                                break
                            }
                        }
                        return
                    }
                }

                switch (ctx.message.text) {
                    case EActions.EDIT_APPLICATION: {
                        if (!ctx.session.isEdit) {
                            ctx.session.isEdit = true
                            await useTips().showEdit(ctx)
                            return
                        }
                        break
                    }
                    case EActions.STOP: {
                        if (!user.disabled) {
                            await userCRUD.updateDisabled(id, true)
                            await ctx.reply('Твоя анкета была убрана из поиска', {
                                reply_markup: {
                                    resize_keyboard: true,
                                    one_time_keyboard: true,
                                    keyboard: [
                                        [
                                            {
                                                text: EActions.BACK_TO_PUBLIC
                                            }
                                        ]
                                    ]
                                }
                            })

                            return
                        }
                        break
                    }
                    case EActions.BACK_TO_PUBLIC: {
                        if (user.disabled) {
                            await userCRUD.updateDisabled(id, false)
                            await ctx.reply('Теперь твоя анкета видна другим пользователям')
                        }
                        break
                    }
                    case EActions.START_SEARCH: {
                        ctx.session.isSearch = true
                        await userCRUD.updateDisabled(id, false)
                        await ctx.reply('Начинаем поиск...', {
                            reply_markup: useMarkups().getReaction({ withReply: true })
                        })
                        showNextPerson(user.city, ctx)
                        return
                    }
                }
            } else {
                switch (ctx.session?.editStep) {
                    case ESteps.NAME: {
                        await userCRUD.updateName(id, ctx.message.text)
                        if (!ctx.session.isEdit) {
                            useSteps().show(ESteps.AGE, ctx)
                            return
                        }
                        break
                    }
                    case ESteps.AGE: {
                        if (!useValidators().isAgeValid(ctx.message.text)) {
                            ctx.reply('Неверное значение')
                            useSteps().show(ESteps.AGE, ctx)
                            return
                        }

                        await userCRUD.updateAge(id, +ctx.message.text)

                        if (!ctx.session.isEdit) {
                            useSteps().show(ESteps.CITY, ctx)
                            return
                        }

                        break
                    }
                    case ESteps.CITY: {
                        await userCRUD.updateCity(id, ctx.message.text)

                        if (!ctx.session.isEdit) {
                            useSteps().show(ESteps.DESCRIPTION, ctx)
                            return
                        }

                        break
                    }
                    case ESteps.DESCRIPTION: {
                        await userCRUD.updateDescription(id, ctx.message.text)

                        if (!ctx.session.isEdit) {
                            useSteps().show(ESteps.SEX, ctx)

                            return
                        }

                        break
                    }
                    case ESteps.ATTACHMENTS: {
                        if (ctx.message.text === EActions.SET_LAST_ATTACHMENTS) {
                            break
                        }

                        if (ctx.message.text === EActions.CONTINUE) {
                            if (!ctx.session?.selectedMedia) {
                                ctx.reply('Необходимо выбрать хотя бы одно медиа')
                                return
                            }

                            await ctx.reply('Медиа анкеты были обновлены', {
                                reply_markup: { remove_keyboard: true }
                            })

                            if (!ctx.session.isEdit) {
                                useSteps().show(ESteps.AGE_RANGE, ctx)
                                return
                            }
                        } else {
                            return
                        }

                        break
                    }
                    case ESteps.SEX: {
                        if (useValidators().isSexValid(ctx.message.text)) {
                            await userCRUD.updateSex(
                                id,
                                ctx.message.text === SEX_MALE_LINE ? ESex.MALE : ESex.FEMALE
                            )

                            if (!ctx.session.isEdit) {
                                useSteps().show(ESteps.LOOKING_FOR, ctx)
                                return
                            }
                        } else {
                            await ctx.reply('Неверное значение')
                            return
                        }

                        break
                    }
                    case ESteps.LOOKING_FOR: {
                        if (useValidators().isLookingForValid(ctx.message.text)) {
                            let lookingFor = ESex.NOT_IMPORTANT

                            if (ctx.message.text === LOOKING_FOR_FEMALE) {
                                lookingFor = ESex.FEMALE
                            } else if (ctx.message.text === LOOKING_FOR_MALE) {
                                lookingFor = ESex.MALE
                            }

                            await userCRUD.updateLookingFor(id, lookingFor)

                            if (!ctx.session.isEdit) {
                                useSteps().show(ESteps.ATTACHMENTS, ctx)
                                return
                            }
                        } else {
                            await ctx.reply('Неверное значение')
                            return
                        }

                        break
                    }
                    case ESteps.AGE_RANGE: {
                        const range = ctx.message.text.split(',').map((value) => Math.abs(+value))

                        if (
                            !useValidators().isAgeRangeValid([
                                range[0],
                                range[1] ? range[1] : range[0]
                            ])
                        ) {
                            await ctx.reply('Неверное значение')
                            return
                        }

                        // Means that account is creating, activate it after creation
                        if (!user.ageRange) {
                            await userCRUD.updateDisabled(id, false)
                        }

                        await userCRUD.updateAgeRange(id, range[0], range[1])
                        break
                    }
                }
            }

            if (ctx.session) {
                ctx.session.editStep = -1
                ctx.session.isEdit = false
            }

            const updatedUser = await userCRUD.get(id)

            if (updatedUser) {
                show('Так выглядит твоя анкета:', updatedUser, ctx)
            }
        }
    })
}
