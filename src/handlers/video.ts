import { Telegraf } from 'telegraf'
import { type AppContext } from '../interfaces/context'
import { message } from 'telegraf/filters'

// CRUD
import * as attachmentCRUD from '../crud/attachment'

// Utils
import useMedia from '../utils/useMedia'

// Constants
import { ESteps } from '../constants/steps'
import { MAX_VIDEO_DURATION } from '../constants/limitations'

export default function (bot: Telegraf<AppContext>) {
    bot.on(message('video'), async (ctx, next) => {
        if (ctx.session?.editStep === ESteps.ATTACHMENTS) {
            const id = BigInt(ctx.message.from.id)

            if (ctx.message.video.duration > MAX_VIDEO_DURATION) {
                ctx.reply(
                    `Видео не было добавлено так как оно длится более ${MAX_VIDEO_DURATION} секунд`
                )
                return
            }

            const link = await bot.telegram.getFileLink(ctx.message.video.file_id)

            try {
                await useMedia().upload(link, async (filename: string) => {
                    if (ctx.session) {
                        const attachments = await attachmentCRUD.get(id)

                        if (attachments.length && !ctx.session.selectedMedia) {
                            await attachmentCRUD.clear(id)
                        }

                        await attachmentCRUD.create(id, filename, 'video')
                        ctx.session.selectedMedia++
                        await ctx.reply(`Видео добавлено (${ctx.session.selectedMedia}/3)`, {
                            reply_markup: {
                                resize_keyboard: true,
                                one_time_keyboard: true,
                                keyboard: [
                                    [
                                        {
                                            text: 'Продолжить'
                                        }
                                    ]
                                ]
                            }
                        })
                        await useMedia().checkForFilled(ctx)
                        next()
                    }
                })
            } catch (e) {
                ctx.reply('Ошибка при загрузке, попробуйте снова')
            }
        }
    })
}
