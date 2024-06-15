import { MediaGroup } from 'telegraf/typings/telegram-types'
import { Update, Message } from 'telegraf/typings/core/types/typegram'
import { NarrowedContext } from 'telegraf'
import { AppContext } from '../interfaces/context'

// CRUD
import { type TUser } from '../crud/user'
import * as attachmentCRUD from '../crud/attachment'
import { type TAttachments } from '../crud/attachment'

// Utils
import useTips from '../utils/useTips'
import useMedia from '../utils/useMedia'
import useSteps from '../utils/useSteps'

// Constants
import { ESteps } from '../constants/steps'

export default function () {
    async function show(
        title: string,
        user: TUser,
        ctx: NarrowedContext<AppContext, Update.MessageUpdate<Message>>
    ) {
        if (user) {
            const id = user.id

            if (title) {
                await ctx.reply(title)
            }

            const attachments = await attachmentCRUD.get(id)

            if (attachments.length) {
                const mediaGroup = useMedia().getGroup(user, attachments)

                await ctx.replyWithMediaGroup(mediaGroup as MediaGroup)

                if (id === BigInt(ctx.from.id)) {
                    await useTips().showMain(ctx, user)
                }
            }
        }
    }

    async function showSympathy(
        user: TUser,
        ctx: NarrowedContext<AppContext, Update.MessageUpdate<Message>>,
        message: string = ''
    ) {
        if (user) {
            const id = user.id

            const attachments = await attachmentCRUD.get(id)

            if (attachments.length) {
                const mediaGroup = useMedia().getGroup(user, attachments, message)
                await ctx.replyWithMediaGroup(mediaGroup as MediaGroup)
            }
        }
    }

    const isFilled = (user: TUser, attachments: TAttachments) =>
        user &&
        user.name &&
        user.age &&
        user.city &&
        user.description &&
        user.sex &&
        user.lookingFor &&
        attachments.length &&
        user.ageRange

    function check(
        user: TUser,
        attachments: TAttachments,
        ctx: NarrowedContext<AppContext, Update.MessageUpdate<Message>>
    ) {
        if (user) {
            let step: number | undefined

            if (!user.name) {
                step = ESteps.NAME
            } else if (!user.age) {
                step = ESteps.AGE
            } else if (!user.city) {
                step = ESteps.CITY
            } else if (!user.description) {
                step = ESteps.DESCRIPTION
            } else if (!user.sex) {
                step = ESteps.SEX
            } else if (!user.lookingFor) {
                step = ESteps.LOOKING_FOR
            } else if (!attachments.length) {
                step = ESteps.ATTACHMENTS
            } else if (!user.ageRange) {
                step = ESteps.AGE_RANGE
            }

            if (step !== undefined) {
                useSteps().show(step, ctx)
            }
        }
    }

    return {
        show,
        showSympathy,
        isFilled,
        check
    }
}
