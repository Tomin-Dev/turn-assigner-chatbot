import { findActivity } from 'api/src/lib/activities/activities'

scenario('retrieves all users', async (scenario) => {
  const activity = await findActivity('uno')

  expect(activity.id).toEqual(scenario.activity.one.id)
})
