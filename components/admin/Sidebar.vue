<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const { user } = useAdminAuth()
const isOpen = useState('isSidebarOpen', () => false)

const links = computed(() => {
  const items = [
    { label: 'Dashboard', to: '/admin', icon: 'i-heroicons-home' },
    { label: 'Products', to: '/admin/products', icon: 'i-heroicons-shopping-bag' },
    { label: 'Orders', to: '/admin/orders', icon: 'i-heroicons-inbox-stack' }
  ]
  if (user.value?.role === 'superadmin') {
    items.push({ label: 'User Management', to: '/admin/users', icon: 'i-heroicons-user-group' })
    items.push({ label: 'Activity Logs', to: '/admin/logs', icon: 'i-heroicons-clipboard-document-list' })
    items.push({ label: 'System Settings', to: '/admin/settings', icon: 'i-heroicons-cog-6-tooth' })
  }
  return items
})

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/admin/login'
}

// Close sidebar on route change on mobile
watch(() => route.path, () => {
  isOpen.value = false
})
</script>

<template>
  <div>
    <!-- Mobile Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 bg-gray-900/50 dark:bg-black/80 z-30 lg:hidden backdrop-blur-sm"></div>
    </Transition>

    <aside 
      class="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed lg:sticky top-0 h-screen z-40 transition-transform duration-300 ease-in-out shadow-sm lg:shadow-none"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <NuxtLink to="/admin" class="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center shadow-sm">
            <UIcon name="i-heroicons-squares-plus" class="w-5 h-5" />
          </div>
          <span class="tracking-tight">Admin Dashboard</span>
        </NuxtLink>
      </div>

      <nav class="flex-1 py-6 px-4 overflow-y-auto flex flex-col gap-1">
        <NuxtLink 
          v-for="link in links" 
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="route.path === link.to ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'"
        >
          <UIcon :name="link.icon" class="w-5 h-5" :class="route.path === link.to ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'" />
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <div class="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <UAvatar :alt="user?.fullName?.charAt(0) || 'U'" size="md" class="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 font-bold" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ user?.fullName || 'Loading...' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ user?.role || 'admin' }}</p>
          </div>
        </div>
        
        <UButton 
          icon="i-heroicons-arrow-right-on-rectangle" 
          color="red" 
          variant="ghost" 
          block 
          @click="handleLogout"
          class="justify-start font-medium"
        >
          Logout
        </UButton>
      </div>
    </aside>
  </div>
</template>
