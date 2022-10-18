// After modifying your script, you can invoke it like:
// yarn rw exec startChatbot
// yarn rw exec startChatbot --param1 true
//
// To access your database
// Append api/* to import from api and web/* to import from web
import { db } from 'api/src/lib/db'
import { Telegraf } from 'telegraf'

export default async ({ args }) => {
  // Your script here...
  console.log(':: Executing script with args ::')
  console.log(args)

  const bot = new Telegraf(process.env.BOT_TOKEN)
  bot.command('oldschool', (ctx) => ctx.reply('Hello'))
  bot.command('hipster', Telegraf.reply('λ'))
  bot.command('faith', (ctx) => ctx.reply('Yes!'))
  bot.launch()

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
