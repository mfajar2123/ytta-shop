import { db } from '../../../db'
import { systemSettings } from '../../../db/schema'
import { logAdminAction } from '../../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    // Disable HTTP caching
    setResponseHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
    
    const user = event.context.user
    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const body = await readBody(event)
    
    if (typeof body !== 'object' || body === null) {
      throw createError({ statusCode: 400, message: 'Invalid payload' })
    }

    // Fetch current settings for audit log diff
    const currentSettings = await db.select().from(systemSettings)
    const currentSettingsMap = currentSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, any>)

    const updatedKeys = Object.keys(body)

    // Batch upsert using PostgreSQL ON CONFLICT DO UPDATE
    for (const key of updatedKeys) {
      const newValue = body[key]
      await db
        .insert(systemSettings)
        .values({
          key,
          value: newValue,
          updatedBy: user.sub,
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: {
            value: newValue,
            updatedBy: user.sub,
            updatedAt: new Date()
          }
        })
    }

    // Fetch freshly updated settings map from DB
    const freshSettings = await db.select().from(systemSettings)
    const freshSettingsMap = freshSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, any>)

    // Log the batch update
    logAdminAction(event, 'UPDATE', 'SETTINGS', 'global', {
      before: currentSettingsMap,
      after: freshSettingsMap
    })

    return {
      message: 'Settings updated successfully',
      settings: freshSettingsMap
    }
  } catch (error: any) {
    console.error('Failed to update system settings:', error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'Failed to update settings' })
  }
})
