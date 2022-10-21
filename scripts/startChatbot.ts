// After modifying your script, you can invoke it like:
// yarn rw exec startChatbot
// yarn rw exec startChatbot --param1 true
//
// To access your database
// Append api/* to import from api and web/* to import from web
import {
  validateActivityName,
  findOrCreateActivity,
  addNextTurnUser,
  addLastTurnUser,
  findActivity,
} from 'api/src/lib/activities/activities'

import { findOrCreateUser } from 'api/src/lib/users/users'
import { Telegraf } from 'telegraf'

const sendInstructions = async (ctx: any) => {
  await ctx.reply(`Los comandos disponibles son:`)
  await ctx.reply(`/crear mi tarea\nTe creará la tarea tu-usuario:mi-tarea`)
  await ctx.reply(`/siguiente usuario:mi-tarea otro-usuario\nAsignará a otro-usuario como la siguiente persona designada
 en hacer la actividad.`)
  await ctx.reply(`/ultimo usuario:mi-tarea otro-usuario\nAsignará a otro-usuario como la última persona que
 hizo la actividad.`)
  await ctx.reply(`/turno usuario:mi-tarea\nTe dará la información de la última persona en hacer la actividad, y de la
 siguiente que debería hacerla.`)
  await ctx.reply(
    `/actividades\nTe dará todas las actividades registradas con tu usuario.`
  )
}

export default async ({ args }) => {
  console.log(':: Executing script with args ::')
  console.log(args)

  const bot = new Telegraf(process.env.BOT_TOKEN)

  bot.command('crear', async (ctx) => {
    try {
      const username = ctx.message.from.username
      if (username === null) {
        await ctx.reply('Tu usario no es válido. Intenta usar otro.')
        return
      }

      const user = await findOrCreateUser(username)

      // /crear bicis
      const [, rawActivityName] = ctx.message.text
        .toLowerCase()
        .match(/\/crear(.*)/)
      const activityName = rawActivityName.trim().replaceAll(' ', '-')

      if (!validateActivityName(activityName)) {
        await ctx.reply('Ese no es un nombre de actividad válido')
        return
      }

      const activityId = `${user.id}:${activityName}`
      const activity = await findOrCreateActivity({
        activityId,
        activityName,
        username: user.id,
      })

      await ctx.reply(`Actividad creada -> ${activity.id}`)
    } catch (e) {
      await ctx.reply(`No entendí tu mensaje, lo siento.`)
      await sendInstructions(ctx)
    }
  })

  bot.command('siguiente', async (ctx) => {
    try {
      const username = ctx.message.from.username

      // /siguiente roeeyn:bicis hoeeyn
      const [, rawActivityName] = ctx.message.text
        .toLowerCase()
        .match(/\/siguiente(.*)/)
      const [activityId, nextTurnUsername] = rawActivityName.trim().split(' ')
      const activity = await findActivity(activityId)

      if (activity === null || activity.user.id !== username) {
        await ctx.reply('No puedes editar una actividad que no creaste')
        return
      }

      const updatedActivity = await addNextTurnUser({
        activityId,
        nextTurnUsername,
      })

      await ctx.reply(
        `Siguiente turno de la actividad ${updatedActivity.name} fue asignado a ${updatedActivity.nextTurnUserId}`
      )
    } catch (e) {
      await ctx.reply(`No entendí tu mensaje, lo siento.`)
      await sendInstructions(ctx)
    }
  })

  bot.command('ultimo', async (ctx) => {
    try {
      const username = ctx.message.from.username

      // /ultimo roeeyn:actividad-uno hoeeyn
      const [, rawActivityName] = ctx.message.text
        .toLowerCase()
        .match(/\/ultimo(.*)/)
      const [activityId, lastTurnUsername] = rawActivityName.trim().split(' ')

      const activity = await findActivity(activityId)

      if (activity === null || activity.user.id !== username) {
        await ctx.reply('No puedes editar una actividad que no creaste')
        return
      }

      const updatedActivity = await addLastTurnUser({
        activityId,
        lastTurnUsername,
      })

      await ctx.reply(
        `Último turno de la actividad ${updatedActivity.name} fue asignado a ${updatedActivity.lastTurnUserId}`
      )
    } catch (e) {
      await ctx.reply(`No entendí tu mensaje, lo siento.`)
      await sendInstructions(ctx)
    }
  })

  bot.command('turno', async (ctx) => {
    try {
      // /turno roeeyn:actividad-uno
      const [, rawActivityName] = ctx.message.text
        .toLowerCase()
        .match(/\/turno(.*)/)
      const activityId = rawActivityName.trim()

      const activity = await findActivity(activityId)

      await ctx.reply(`De la actividad: ${activity.name}`)
      activity.lastTurnUserId &&
        (await ctx.reply(`El último turno fue: ${activity.lastTurnUserId}`))
      activity.nextTurnUserId &&
        (await ctx.reply(`El siguiente turno es: ${activity.nextTurnUserId}`))
      await ctx.reply(`Última actualización: ${activity.updatedAt}`)
    } catch (e) {
      await ctx.reply(`No entendí tu mensaje, lo siento.`)
      await sendInstructions(ctx)
    }
  })

  bot.command('actividades', async (ctx) => {
    try {
      const username = ctx.message.from.username
      const user = await findOrCreateUser(username)

      const message = user.activities
        .map((activity) => activity.id)
        .reduce((previousValue, currentValue) => {
          return `${previousValue}\n- ${currentValue}`
        }, 'Actividades:')

      await ctx.reply(message)
    } catch (e) {
      await ctx.reply(`No entendí tu mensaje, lo siento.`)
      await sendInstructions(ctx)
    }
  })

  bot.on('text', async (ctx) => {
    const username = ctx.message.from.username || 'desconocido'
    await ctx.reply(`Hola ${username}! 👋`)
    await sendInstructions(ctx)
  })

  bot.launch()

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
