import { db } from 'api/src/lib/db'

export const validateActivityName = (name: string): boolean => {
  return /^[a-z0-9-]+$/.test(name)
}

export const getActivityName = (message: string): string => {
  const [, activityName] = message.match(/\/create(.*)/)
  return activityName.trim().replaceAll(' ', '-')
}

export const findActivity = async (activityId: string) => {
  return db.activity.findFirst({
    where: {
      id: activityId,
    },
    include: {
      user: true,
    },
  })
}

export const findOrCreateActivity = async ({
  activityId,
  activityName,
  username,
}: {
  activityId: string
  activityName?: string
  username?: string
}) => {
  return await db.activity.upsert({
    where: {
      id: activityId,
    },
    update: {},
    create: {
      id: activityId,
      name: activityName,
      user: {
        connect: {
          id: username,
        },
      },
    },
    include: {
      user: true,
    },
  })
}

export const addNextTurnUser = async ({
  activityId,
  nextTurnUsername,
}: {
  activityId: string
  nextTurnUsername: string
}) => {
  return await db.activity.update({
    where: {
      id: activityId,
    },
    data: {
      nextTurnUserId: nextTurnUsername,
    },
  })
}

export const addLastTurnUser = async ({
  activityId,
  lastTurnUsername,
}: {
  activityId: string
  lastTurnUsername: string
}) => {
  return await db.activity.update({
    where: {
      id: activityId,
    },
    data: {
      lastTurnUserId: lastTurnUsername,
      nextTurnUserId: null,
    },
  })
}
