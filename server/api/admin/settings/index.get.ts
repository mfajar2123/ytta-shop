import { db } from '../../../db'
import { systemSettings } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    // Disable HTTP caching so clients always receive fresh database settings
    setResponseHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
    setResponseHeader(event, 'Pragma', 'no-cache')
    setResponseHeader(event, 'Expires', '0')

    const settings = await db.select().from(systemSettings)
    
    // Convert array to a key-value object
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
