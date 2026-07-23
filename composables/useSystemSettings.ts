export const useSystemSettings = () => {
  const settings = useState<Record<string, any>>('global_system_settings', () => ({
    store_name: 'Imani Prima Shop',
    contact_email: 'hello@imaniprima.co.id',
    bank_name: 'BCA',
    bank_account: '1234567890',
    bank_owner: 'PT Imani Prima',
    maintenance_mode: false
  }))
  const isLoaded = useState<boolean>('global_system_settings_loaded', () => false)

  const fetchPublicSettings = async (force = false) => {
    if (isLoaded.value && !force) return settings.value
    try {
      const data = await $fetch<Record<string, any>>('/api/settings/public', {
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (data) {
        settings.value = { ...settings.value, ...data }
        isLoaded.value = true
      }
    } catch (err) {
      console.error('Error fetching public system settings:', err)
    }
    return settings.value
  }

  const fetchAdminSettings = async () => {
    try {
      const data = await $fetch<Record<string, any>>('/api/admin/settings', {
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (data) {
        settings.value = { ...settings.value, ...data }
        isLoaded.value = true
      }
      return data
    } catch (err) {
      console.error('Error fetching admin system settings:', err)
      throw err
    }
  }

  const updateSettings = async (payload: Record<string, any>) => {
    const res = await $fetch<{ message: string; settings: Record<string, any> }>('/api/admin/settings', {
      method: 'PUT',
      body: payload,
      headers: { 'Cache-Control': 'no-cache' }
    })
    if (res?.settings) {
      settings.value = { ...settings.value, ...res.settings }
    } else {
      settings.value = { ...settings.value, ...payload }
    }
    isLoaded.value = true
    
    // Clear Nuxt cache entries if any exist
    clearNuxtData('/api/admin/settings')
    clearNuxtData('/api/settings/public')
    
    return res
  }

  return {
    settings,
    isLoaded,
    fetchPublicSettings,
    fetchAdminSettings,
    updateSettings
  }
}
