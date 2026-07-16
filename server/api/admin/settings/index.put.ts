import { db } from '../../../db'
import { systemSettings } from '../../../db/schema'
import { logAdminAction } from '../../../utils/logger'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const body = await readBody(event)
    // Expecting body to be a key-value object of settings to update
    // e.g. { "maintenance_mode": true, "contact_email": "hello@example.com" }
    
    if (typeof body !== 'object' || body === null) {
       throw createError({ statusCode: 400, message: 'Invalid payload' })
    }

    const currentSettings = await db.select().from(systemSettings)
    const currentSettingsMap = currentSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, any>)

    const updatedKeys = Object.keys(body)
    
    for (const key of updatedKeys) {
      const newValue = body[key]
      
      // Upsert the setting
      const existing = currentSettings.find(s => s.key === key)
      if (existing) {
        await db.update(systemSettings)
          .set({ value: newValue, updatedBy: user.sub, updatedAt: new Date() })
          .where(eq(systemSettings.key, key))
      } else {
        await db.insert(systemSettings)
          .values({ key, value: newValue, updatedBy: user.sub })
      }
    }

    // Log the batch update
    logAdminAction(event, 'UPDATE', 'SETTINGS', 'global', {
      before: currentSettingsMap,
      after: { ...currentSettingsMap, ...body }
    })

    return { message: 'Settings updated successfully' }
  } catch (error: any) {
    console.error('Failed to update system settings:', error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Failed to update settings' })
  }
})
