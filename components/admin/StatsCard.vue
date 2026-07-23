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
  <UCard :ui="{ body: { padding: 'p-6' } }">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{{ title }}</p>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{{ value }}</h3>
      </div>
      <div class="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
        <component :is="icon" class="w-6 h-6" />
      </div>
    </div>
    
    <div v-if="trend" class="mt-4 flex items-center gap-2 text-sm">
      <span 
        :class="trendUp ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-500/10' : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10'"
        class="px-2 py-0.5 rounded-md font-medium flex items-center text-xs"
      >
        <UIcon v-if="trendUp" name="i-heroicons-arrow-trending-up" class="w-3.5 h-3.5 mr-1" />
        <UIcon v-else name="i-heroicons-arrow-trending-down" class="w-3.5 h-3.5 mr-1" />
        {{ trend }}
      </span>
      <span class="text-gray-500 dark:text-gray-400 text-xs font-medium">vs last month</span>
    </div>
  </UCard>
</template>
