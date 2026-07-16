<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  HomeIcon,
  ShoppingBagIcon,
  InboxStackIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const { user } = useAdminAuth()
const isOpen = useState('isSidebarOpen', () => false)

const menu = [
  { name: 'Dashboard', path: '/admin', icon: HomeIcon },
  { name: 'Products', path: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Orders', path: '/admin/orders', icon: InboxStackIcon }
]

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
      <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>
    </Transition>

    <aside 
      class="w-64 bg-white border-r border-light-gray flex flex-col fixed lg:sticky top-0 h-screen z-40 transition-transform duration-300 ease-in-out"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="h-16 flex items-center px-6 border-b border-light-gray">
        <NuxtLink to="/admin" class="font-semibold text-lg text-apple-black flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-apple-blue text-white flex items-center justify-center font-bold">I</span>
          Imani Admin
        </NuxtLink>
      </div>

      <div class="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <NuxtLink 
          v-for="item in menu" 
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
          :class="[
            route.path === item.path 
              ? 'bg-off-white text-apple-blue font-medium' 
              : 'text-gray-500 hover:text-apple-black hover:bg-off-white/50'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.name }}
        </NuxtLink>
      </div>

      <div class="p-4 border-t border-light-gray">
        <div class="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-off-white/50">
          <div class="w-8 h-8 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center font-bold text-sm">
            {{ user?.fullName?.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-apple-black truncate">{{ user?.fullName }}</p>
            <p class="text-xs text-gray-500 capitalize">{{ user?.role }}</p>
          </div>
        </div>
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  </div>
</template>
