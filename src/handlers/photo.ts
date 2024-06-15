import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { type AppContext } from '../interfaces/context'

// CRUD
import * as attachmentCRUD from '../crud/attachment'

// Utils
import useMedia from '../utils/useMedia'

// Constants
import { ESteps } from '../constants/steps'
import { EActions } from '../constants/actions'

export default function (bot: Telegraf<AppContext>) {
    bot.on(message('photo'), async (ctx, next) => {
        if (ctx.session?.editStep === ESteps.ATTACHMENTS) {
            const id = BigInt(ctx.message.from.id)
            const link = await bot.telegram.getFileLink(
                ctx.message.photo[ctx.message.photo.length - 1].file_id
            )

            try {
                await useMedia().upload(link, async (filename: string) => {
                    if (ctx.session) {
                        const attachments = await attachmentCRUD.get(id)

                        if (attachments.length && !ctx.session.selectedMedia) {
                            await attachmentCRUD.clear(id)
                        }

                        await attachmentCRUD.create(id, filename, 'photo')
                        ctx.session.selectedMedia++
                        await ctx.reply(`Изображение добавлено (${ctx.session.selectedMedia}/3)`, {
                            reply_markup: {
                                resize_keyboard: true,
                                one_time_keyboard: true,
                                keyboard: [
                                    [
                                        {
                                            text: EActions.CONTINUE
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
