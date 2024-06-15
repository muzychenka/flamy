import { Telegraf, session } from 'telegraf'
import type { AppContext } from './src/interfaces/context'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

// Handlers
import initStart from './src/handlers/start'
import initMessageHandler from './src/handlers/message'
import initVideoHandler from './src/handlers/video'
import initPhotoHandler from './src/handlers/photo'
import initSuccessfulPaymentHandler from './src/handlers/successfulPayment'
import initLocationHandler from './src/handlers/location'
import initTextHandler from './src/handlers/text'

// Commands
import initPremiumCommand from './src/commands/premium'
import initHelpCommand from './src/commands/help'

const mediaDir = process.env.MEDIA

if (!mediaDir) {
    throw new Error('No media location is provided')
}
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true })
}

if (!process.env.BOT_TOKEN) {
    throw new Error('No token is provided')
}

const bot = new Telegraf<AppContext>(process.env.BOT_TOKEN)

bot.use(session())

initStart(bot)

// Commands
initPremiumCommand(bot)
initHelpCommand(bot)

// Messages
initMessageHandler(bot)
initSuccessfulPaymentHandler(bot)
initLocationHandler(bot)
initTextHandler(bot)
initPhotoHandler(bot)
initVideoHandler(bot)

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
