import { db } from '../../db'
import { systemSettings } from '../../db/schema'

export default defineEventHandler(async (event) => {
  try {
    // Disable HTTP caching so clients always get latest public settings
    setResponseHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
    setResponseHeader(event, 'Pragma', 'no-cache')
    setResponseHeader(event, 'Expires', '0')

    const settings = await db.select().from(systemSettings)
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, any>)

    return {
      store_name: settingsMap.store_name ?? 'Imani Prima Shop',
      contact_email: settingsMap.contact_email ?? 'hello@imaniprima.co.id',
      bank_name: settingsMap.bank_name ?? 'BCA',
      bank_account: settingsMap.bank_account ?? '1234567890',
      bank_owner: settingsMap.bank_owner ?? 'PT Imani Prima',
      maintenance_mode: settingsMap.maintenance_mode === true
    }
  } catch (error) {
    console.error('Failed to fetch public settings:', error)
    return {
      store_name: 'Imani Prima Shop',
      contact_email: 'hello@imaniprima.co.id',
      bank_name: 'BCA',
      bank_account: '1234567890',
      bank_owner: 'PT Imani Prima',
      maintenance_mode: false
    }
  }
})
