import { db } from 'api/src/lib/db'

export const findOrCreateUser = async (username: string) => {
  return await db.user.upsert({
    where: {
      id: username,
    },
    update: {},
    create: {
      id: username,
    },
    include: {
      activities: true,
    },
  })
}
