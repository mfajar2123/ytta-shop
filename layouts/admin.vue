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
  <div class="admin-layout min-h-screen bg-off-white flex">
    <!-- Admin Sidebar -->
    <Sidebar v-if="user" />

    <div class="flex-1 flex flex-col min-w-0">
      <!-- Admin Topbar -->
      <Topbar v-if="user" />

      <!-- Main Content -->
      <main class="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div v-if="isFetching" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
        </div>
        <slot v-else />
      </main>
    </div>
  </div>
</template>

<style>
/* High performance mode: Disable all animations/transitions in admin dashboard */
.admin-layout * {
  transition: none !important;
  animation-duration: 0ms !important;
}
.admin-layout .animate-spin {
  /* Keep loading spinners working if necessary, or let them spin fast */
}
</style>
