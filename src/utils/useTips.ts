import { NarrowedContext } from 'telegraf'
import type { AppContext } from '../interfaces/context'
import { Update, Message, KeyboardButton } from 'telegraf/typings/core/types/typegram'
import { type TUser } from '../crud/user'

// Constants
import { MENU } from '../constants/menu'
import { EActions } from '../constants/actions'

export default function () {
    async function showEdit(ctx: NarrowedContext<AppContext, Update.MessageUpdate<Message>>) {
        let menu = ''
        const keyboard: KeyboardButton[][] = [[]]

        for (const [key, value] of Object.entries(MENU)) {
            menu += `${key} - ${value.title}\n`
            keyboard[0].push({
                text: key
            })
        }

        menu += '\n❌ - чтобы выйти'
        keyboard[0].push({
            text: '❌'
        })

        await ctx.reply(
            `Если хочешь что-то изменить, воспользуйся настройками снизу:
    \n${menu}`,
            {
                reply_markup: {
                    resize_keyboard: true,
                    one_time_keyboard: true,
                    keyboard
                }
            }
        )
    }

    async function showMain(
        ctx: NarrowedContext<AppContext, Update.MessageUpdate<Message>>,
        user: TUser
    ) {
        const keyboard = []
        let replyText = ''

        if (user) {
            if (user.disabled) {
                replyText = 'Твоя анкета скрыта от других пользователей, желаешь вернуться в поиск?'

                keyboard.push([
                    {
                        text: EActions.BACK_TO_PUBLIC
                    }
                ])
            } else {
                replyText = 'Выбери действие:'

                keyboard.push(
                    [
                        {
                            text: EActions.START_SEARCH
                        }
                    ],
                    [
                        {
                            text: EActions.EDIT_APPLICATION
                        }
                    ]
                )

                if (!user.disabled) {
                    keyboard.push([
                        {
                            text: EActions.STOP
                        }
                    ])
                }

                keyboard.push([
                    {
                        request_location: true,
                        text: EActions.SEND_LOCATION
                    }
                ])
            }
        }

        await ctx.reply(replyText, {
            reply_markup: {
                resize_keyboard: true,
                one_time_keyboard: true,
                keyboard
            }
        })
    }

    return {
        showEdit,
        showMain
    }
}
