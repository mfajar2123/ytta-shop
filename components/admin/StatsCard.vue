<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  trend?: string
  trendUp?: boolean
  icon: any
}>()
</script>

<template>
  <div class="bg-white p-6 rounded-2xl border border-light-gray shadow-sm">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500 mb-1">{{ title }}</p>
        <h3 class="text-2xl font-semibold text-apple-black">{{ value }}</h3>
      </div>
      <div class="w-12 h-12 rounded-xl bg-off-white flex items-center justify-center text-apple-blue">
        <component :is="icon" class="w-6 h-6" />
      </div>
    </div>
    
    <div v-if="trend" class="mt-4 flex items-center gap-2 text-sm">
      <span 
        :class="trendUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'"
        class="px-2 py-0.5 rounded-full font-medium flex items-center"
      >
        <svg v-if="trendUp" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <svg v-else class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        {{ trend }}
      </span>
      <span class="text-gray-500">vs last month</span>
    </div>
  </div>
</template>
