<script setup lang="ts">
import { CogIcon } from '@heroicons/vue/24/outline'
const route = useRoute()
const { data: settings } = await useFetch<any>('/api/settings/public')

const isMaintenance = computed(() => {
  if (!settings.value?.maintenance_mode) return false
  return !route.path.startsWith('/admin')
})
</script>

<template>
  <div>
    <!-- Maintenance Screen -->
    <div v-if="isMaintenance" class="min-h-screen bg-off-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div class="bg-white p-12 rounded-3xl shadow-lg border border-light-gray max-w-lg w-full">
        <div class="w-20 h-20 bg-apple-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CogIcon class="w-10 h-10 text-apple-blue animate-[spin_4s_linear_infinite]" />
        </div>
        <h1 class="text-3xl font-bold text-apple-black mb-4">We'll be back soon!</h1>
        <p class="text-gray-500 mb-8 leading-relaxed">
          {{ settings?.store_name || 'Our store' }} is currently undergoing scheduled maintenance to improve your experience. We apologize for the inconvenience and will be back online shortly.
        </p>
        <p class="text-sm text-gray-400">
          Need urgent help? Contact us at <a :href="'mailto:' + settings?.contact_email" class="text-apple-blue hover:underline">{{ settings?.contact_email || 'support@example.com' }}</a>
        </p>
      </div>
    </div>

    <!-- Normal App -->
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
