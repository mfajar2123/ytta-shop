import { db } from '../../../db'
import { systemSettings } from '../../../db/schema'

export default defineEventHandler(async () => {
  try {
    const settings = await db.select().from(systemSettings)
    // Convert array to a key-value object for easier frontend consumption
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, any>)

    return settingsMap
  } catch (error: any) {
    console.error('Failed to fetch system settings:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch settings' })
  }
})
