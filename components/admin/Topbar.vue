<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const isOpen = useState('isSidebarOpen', () => false)

const getPageTitle = () => {
  if (route.path === '/admin') return 'Dashboard'
  if (route.path.startsWith('/admin/products')) return 'Products'
  if (route.path.startsWith('/admin/orders')) return 'Orders'
  if (route.path.startsWith('/admin/users')) return 'User Management'
  if (route.path.startsWith('/admin/logs')) return 'Activity Logs'
  if (route.path.startsWith('/admin/settings')) return 'System Settings'
  return 'Admin Area'
}

const showNotifications = ref(false)
const notifications = ref<any[]>([])
const notificationsError = ref(false)

const fetchNotifications = async () => {
  try {
    notifications.value = await $fetch<any[]>('/api/admin/notifications')
    notificationsError.value = false
  } catch (e) {
    notificationsError.value = true
    notifications.value = []
  }
}

onMounted(() => {
  fetchNotifications()
})

const lastReadTime = ref(0)
onMounted(() => {
  lastReadTime.value = Number(localStorage.getItem('admin_last_read_notifications')) || 0
})

const unreadCount = computed(() => {
  if (!notifications.value) return 0
  return notifications.value.filter(n => new Date(n.time).getTime() > lastReadTime.value).length
})

const markAsRead = () => {
  lastReadTime.value = Date.now()
  localStorage.setItem('admin_last_read_notifications', lastReadTime.value.toString())
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(dateString))
}
</script>

<template>
  <header class="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shrink-0">
    <div class="flex items-center gap-4">
      <UButton 
        class="lg:hidden" 
        icon="i-heroicons-bars-3" 
        color="neutral" 
        variant="ghost" 
        @click="isOpen = !isOpen" 
      />
      <h1 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{{ getPageTitle() }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <UPopover @update:open="(val: boolean) => { if (val) markAsRead() }">
        <UButton 
          icon="i-heroicons-bell" 
          color="neutral" 
          variant="ghost"
          class="relative"
        >
          <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </UButton>

        <template #content>
          <div class="w-80 sm:w-96 overflow-hidden">
            <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 class="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
              <UButton label="Refresh" color="primary" variant="link" size="xs" @click="fetchNotifications" />
            </div>
            
            <div class="max-h-96 overflow-y-auto">
              <div v-if="!notifications || notifications.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No new notifications
              </div>
              <NuxtLink 
                v-else
                v-for="notif in notifications" 
                :key="notif.id" 
                :to="notif.link"
                class="block p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg shrink-0 mt-0.5">
                    <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="font-medium text-sm text-gray-900 dark:text-white mb-1">{{ notif.title }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">{{ notif.message }}</p>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{{ formatDate(notif.time) }}</p>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </template>
      </UPopover>
    </div>
  </header>
</template>
