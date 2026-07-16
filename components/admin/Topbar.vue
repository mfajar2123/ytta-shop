<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Bars3Icon, BellIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const isOpen = useState('isSidebarOpen', () => false)

const getPageTitle = () => {
  if (route.path === '/admin') return 'Dashboard'
  if (route.path.startsWith('/admin/products')) return 'Products'
  if (route.path.startsWith('/admin/orders')) return 'Orders'
  return 'Admin Area'
}

const showNotifications = ref(false)
const { data: notifications, refresh } = await useFetch<any[]>('/api/admin/notifications')

const lastReadTime = ref(0)
onMounted(() => {
  lastReadTime.value = Number(localStorage.getItem('admin_last_read_notifications')) || 0
})

const unreadCount = computed(() => {
  if (!notifications.value) return 0
  return notifications.value.filter(n => new Date(n.time).getTime() > lastReadTime.value).length
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    lastReadTime.value = Date.now()
    localStorage.setItem('admin_last_read_notifications', lastReadTime.value.toString())
  }
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(dateString))
}
</script>

<template>
  <header class="h-16 bg-white border-b border-light-gray flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
    <div class="flex items-center gap-4">
      <button @click="isOpen = !isOpen" class="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-off-white rounded-lg transition-colors">
        <Bars3Icon class="w-6 h-6" />
      </button>
      <h1 class="text-lg font-semibold text-apple-black">{{ getPageTitle() }}</h1>
    </div>

    <div class="flex items-center gap-2 relative">
      <button @click="toggleNotifications" class="p-2 text-gray-500 hover:bg-off-white rounded-full transition-colors relative">
        <BellIcon class="w-5 h-5" />
        <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
      </button>

      <!-- Dropdown -->
      <div v-if="showNotifications" class="absolute right-0 top-12 w-80 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50">
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="font-semibold text-sm text-gray-800">Notifications</h3>
          <button @click="refresh" class="text-xs text-apple-blue hover:underline">Refresh</button>
        </div>
        <div class="max-h-96 overflow-y-auto">
          <div v-if="!notifications || notifications.length === 0" class="p-8 text-center text-gray-500 text-sm">
            No new notifications
          </div>
          <NuxtLink 
            v-else
            v-for="notif in notifications" 
            :key="notif.id" 
            :to="notif.link"
            @click="showNotifications = false"
            class="block p-4 border-b border-gray-50 hover:bg-off-white transition-colors"
          >
            <p class="font-medium text-sm text-gray-900 mb-1">{{ notif.title }}</p>
            <p class="text-xs text-gray-600 mb-2">{{ notif.message }}</p>
            <p class="text-[10px] text-gray-400">{{ formatDate(notif.time) }}</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>
