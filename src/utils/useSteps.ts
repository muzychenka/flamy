import { Update, Message } from 'telegraf/typings/core/types/typegram'
import { NarrowedContext } from 'telegraf'
import { AppContext } from '../interfaces/context'

// CRUD
import * as userCRUD from '../crud/user'
import * as attachmentCRUD from '../crud/attachment'

// Constants
import { ESteps } from '../constants/steps'
import { SEX_FEMALE_LINE, SEX_MALE_LINE } from '../constants/sex'
import {
    LOOKING_FOR_FEMALE,
    LOOKING_FOR_MALE,
    LOOKING_FOR_NOT_IMPORTANT
} from '../constants/lookingFor'
import { EActions } from '../constants/actions'
import { MAX_VIDEO_DURATION } from '../constants/limitations'

export default function () {
    async function show(
        step: number,
        ctx: NarrowedContext<AppContext, Update.MessageUpdate<Message>>
    ) {
        const id = BigInt(ctx.message.from.id)
        const user = await userCRUD.get(id)
        let replyMarkup = {}

        switch (step) {
            case ESteps.NAME: {
                const keyboard = []

                if (user?.name) {
                    keyboard.push([
                        {
                            text: user.name
                        }
                    ])
                }

                keyboard.push([
                    {
                        text: ctx.message.from.first_name
                    }
                ])

                ctx.reply('Укажи свое имя', {
                    reply_markup: {
                        one_time_keyboard: true,
                        resize_keyboard: true,
                        keyboard
                    }
                })
                break
            }
            case ESteps.AGE: {
                if (user?.age) {
                    replyMarkup = {
                        reply_markup: {
                            one_time_keyboard: true,
                            resize_keyboard: true,
                            keyboard: [
                                [
                                    {
                                        text: user.age
                                    }
                                ]
                            ]
                        }
                    }
                }

                ctx.reply('Укажи свой возраст', replyMarkup)
                break
            }
            case ESteps.CITY: {
                if (user?.city) {
                    replyMarkup = {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: [
                                [
                                    {
                                        text: user.city
                                    }
                                ]
                            ]
                        }
                    }
                }

                ctx.reply('Укажи свой город', replyMarkup)
                break
            }
            case ESteps.DESCRIPTION: {
                if (user?.description) {
                    replyMarkup = {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: [
                                [
                                    {
                                        text: user.description
                                    }
                                ]
                            ]
                        }
                    }
                }

                ctx.reply(
                    'Расскажи о себе, кого хочешь найти, чем предлагаешь заняться:',
                    replyMarkup
                )
                break
            }
            case ESteps.SEX: {
                ctx.reply('Выбери свой пол', {
                    reply_markup: {
                        one_time_keyboard: true,
                        resize_keyboard: true,
                        keyboard: [
                            [
                                {
                                    text: SEX_MALE_LINE
                                },
                                {
                                    text: SEX_FEMALE_LINE
                                }
                            ]
                        ]
                    }
                })
                break
            }
            case ESteps.LOOKING_FOR: {
                ctx.reply('Кто для тебя интересен?', {
                    reply_markup: {
                        one_time_keyboard: true,
                        resize_keyboard: true,
                        keyboard: [
                            [
                                {
                                    text: LOOKING_FOR_MALE
                                },
                                {
                                    text: LOOKING_FOR_FEMALE
                                },
                                {
                                    text: LOOKING_FOR_NOT_IMPORTANT
                                }
                            ]
                        ]
                    }
                })
                break
            }
            case ESteps.ATTACHMENTS: {
                const attachments = await attachmentCRUD.get(id)

                if (ctx.session) {
                    ctx.session.selectedMedia = 0
                }

                if (attachments.length) {
                    replyMarkup = {
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: [
                                [
                                    {
                                        text: EActions.SET_LAST_ATTACHMENTS
                                    }
                                ]
                            ]
                        }
                    }
                } else {
                    replyMarkup = {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    }
                }

                ctx.reply(
                    `Отправь изображение или короткое видео (до 3-х вложений, видео до ${MAX_VIDEO_DURATION} секунд):`,
                    replyMarkup
                )
                break
            }
            case ESteps.AGE_RANGE: {
                ctx.reply(`Укажи возрастной диапазон для поиска собеседника, например:\n
18, 25 - собеседник от 18 до 25 лет
24 - собеседник 24-х лет
                `)
                break
            }
        }
        ctx.session!.editStep = step
    }

    return {
        show
    }
}
