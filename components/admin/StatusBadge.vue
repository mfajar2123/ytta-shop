<script setup lang="ts">
const props = defineProps<{
  status: 'pending_payment' | 'payment_uploaded' | 'verified' | 'processing' | 'completed' | 'cancelled'
}>()

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string, classes: string }> = {
    pending_payment: { label: 'Pending Payment', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    payment_uploaded: { label: 'Payment Uploaded', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    verified: { label: 'Verified', classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    processing: { label: 'Processing', classes: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    completed: { label: 'Completed', classes: 'bg-green-50 text-green-700 border-green-200' },
    cancelled: { label: 'Cancelled', classes: 'bg-red-50 text-red-700 border-red-200' }
  }
  
  return configs[status] || { label: 'Unknown', classes: 'bg-gray-50 text-gray-700 border-gray-200' }
}

const config = computed(() => getStatusConfig(props.status))
</script>

<template>
  <span 
    class="px-2.5 py-1 text-xs font-medium rounded-full border"
    :class="config.classes"
  >
    {{ config.label }}
  </span>
</template>
