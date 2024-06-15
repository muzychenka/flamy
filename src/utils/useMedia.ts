import { NarrowedContext } from 'telegraf'
import { v4 as uuidv4 } from 'uuid'
import https from 'https'
import fs from 'fs'
import { Update, Message } from 'telegraf/typings/core/types/typegram'
import { AppContext } from '../interfaces/context'

// CRUD
import * as userCRUD from '../crud/user'
import { type TUser } from '../crud/user'
import { type TAttachments } from '../crud/attachment'

// Utils
import useApplication from '../utils/useApplication'
import usePremium from '../utils/usePremium'

// Constants
import { EReactions } from '../constants/reactions'

export default function () {
    async function checkForFilled(ctx: NarrowedContext<AppContext, Update.MessageUpdate<Message>>) {
        if (ctx.session && ctx.session.selectedMedia >= 3) {
            await ctx.reply('Отлично! Вы загрузили максимальное количество медиа', {
                reply_markup: { remove_keyboard: true }
            })
            ctx.session.selectedMedia = 0
            const user = await userCRUD.get(BigInt(ctx.from.id))
            if (user) {
                useApplication().show('Так выглядит твоя анкета:', user, ctx)
            }
        }
    }

    async function upload(link: URL, callback: Function) {
        const splitPathname = link.pathname.split('/')
        const [, ext] = splitPathname[splitPathname.length - 1].split('.')
        const filename = uuidv4()
        const file = fs.createWriteStream(`${process.env.MEDIA}/${filename}.${ext}`)
        await new Promise((resolve, reject) => {
            https.get(link, (response) => {
                response.pipe(file)

                file.on('error', (e) => reject(e))

                file.on('finish', async () => {
                    file.close()
                    await callback(`${filename}.${ext}`)
                    resolve('finish')
                })
            })
        })
    }

    function getGroup(user: TUser, attachments: TAttachments, message: string = '') {
        const mediaGroup = []
        if (user) {
            for (let i = 0; i < attachments.length; i++) {
                const attachment = attachments[i]
                const source = `${process.env.MEDIA}/` + attachment.file
                if (!i) {
                    let caption = `${user.name}, ${user.age}, ${user.city} – ${user.description}`

                    if (usePremium().isPremiumActive(user.premium)) {
                        caption = '⭐ ' + caption
                    }

                    mediaGroup.push({
                        type: attachment.type,
                        media: {
                            source
                        },
                        caption
                    })

                    if (message) {
                        mediaGroup[
                            mediaGroup.length - 1
                        ].caption += `\n\n${EReactions.MESSAGE}: ${message}`
                    }
                } else {
                    mediaGroup.push({
                        type: attachment.type,
                        media: {
                            source
                        }
                    })
                }
            }
        }
        return mediaGroup
    }

    return {
        checkForFilled,
        upload,
        getGroup
    }
}
