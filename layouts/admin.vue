<script setup lang="ts">
import { useAdminAuth } from '~/composables/useAdminAuth'
import Sidebar from '~/components/admin/Sidebar.vue'
import Topbar from '~/components/admin/Topbar.vue'

const { fetchUser, isFetching, user } = useAdminAuth()

onMounted(async () => {
  if (!user.value) {
    await fetchUser()
  }
})
</script>

<template>
  <div class="admin-layout min-h-screen bg-gray-50 dark:bg-gray-950 flex">
    <!-- Admin Sidebar -->
    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <!-- Admin Topbar -->
      <Topbar />

      <!-- Main Content -->
      <main class="flex-1 p-4 md:p-8 overflow-y-auto">
        <div v-if="isFetching" class="flex justify-center items-center h-64">
          <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-primary-500 animate-spin" />
        </div>
        <div v-else class="max-w-7xl mx-auto w-full">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style>
/* Nuxt UI standard overrides if necessary */
.admin-layout {
  /* Provide a smooth transition for background colors when switching color modes */
  transition: background-color 0.3s ease;
}
</style>
