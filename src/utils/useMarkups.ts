import { KeyboardButton, ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram'

// Constants
import { EReactions } from '../constants/reactions'

export default function () {
    function getReaction({
        withReply = false,
        oneTime = false
    }: { withReply?: boolean; oneTime?: boolean } = {}) {
        const keyboard: KeyboardButton[][] = [
            [
                {
                    text: EReactions.LIKE
                }
            ]
        ]

        const markup: ReplyKeyboardMarkup = {
            resize_keyboard: true,
            one_time_keyboard: oneTime,
            keyboard: []
        }

        if (withReply) {
            keyboard[0].push({
                text: EReactions.MESSAGE
            })
        }

        keyboard[0].push(
            {
                text: EReactions.DISLIKE
            },
            {
                text: EReactions.BACK
            },
            {
                text: EReactions.SLEEP
            }
        )

        markup.keyboard = keyboard

        return markup
    }

    return {
        getReaction
    }
}
