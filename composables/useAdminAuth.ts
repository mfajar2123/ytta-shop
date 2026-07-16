import { ref } from 'vue'

// Global state
const user = ref<any>(null)
const isFetching = ref(false)

export const useAdminAuth = () => {
  const fetchUser = async () => {
    isFetching.value = true
    try {
      const res = await $fetch<any>('/api/auth/me')
      user.value = res.user
    } catch (e) {
      user.value = null
    } finally {
      isFetching.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      navigateTo('/admin/login')
    } catch (e) {
      console.error('Logout failed', e)
    }
  }

  return {
    user,
    isFetching,
    fetchUser,
    logout
  }
}
