import { db } from '../../db'
import { systemSettings } from '../../db/schema'

export default defineEventHandler(async () => {
  try {
    const settings = await db.select().from(systemSettings)
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, any>)

    // Only return safe public settings (e.g., if there were private keys, we wouldn't return them here)
    return {
      store_name: settingsMap.store_name || 'Imani Prima Shop',
      contact_email: settingsMap.contact_email || 'hello@imaniprima.co.id',
      bank_name: settingsMap.bank_name || 'BCA',
      bank_account: settingsMap.bank_account || '1234567890',
      bank_owner: settingsMap.bank_owner || 'PT Imani Prima',
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
