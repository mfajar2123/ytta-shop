export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return

  const { user, fetchUser } = useAdminAuth()
  
  if (!user.value) {
    await fetchUser()
  }

  if (!user.value && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }

  if (user.value && to.path === '/admin/login') {
    return navigateTo('/admin')
  }
})
