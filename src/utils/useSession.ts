import type { AppContext } from '../interfaces/context'
import { NarrowedContext } from 'telegraf'
import { Update, Message } from 'telegraf/typings/core/types/typegram'

export default function () {
    function init(
        ctx: NarrowedContext<AppContext, Update.MessageUpdate<Message>>,
        isHardReset: boolean = false
    ) {
        if (isHardReset) {
            ctx.session = {
                selectedMedia: 0,
                editStep: -1,
                isEdit: false,
                isSearch: false,
                isApplicationReady: false,
                currentApplicationId: BigInt(0),
                lastApplicationId: BigInt(0),
                matchApplicationId: BigInt(0),
                isMessaging: false
            }
        } else {
            ctx.session ??= {
                selectedMedia: 0,
                editStep: -1,
                isEdit: false,
                isSearch: false,
                isApplicationReady: false,
                currentApplicationId: BigInt(0),
                lastApplicationId: BigInt(0),
                matchApplicationId: BigInt(0),
                isMessaging: false
            }
        }
    }

    return {
        init
    }
}
