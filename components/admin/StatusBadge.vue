<script setup lang="ts">
const props = defineProps<{
  status: 'pending_payment' | 'payment_uploaded' | 'verified' | 'processing' | 'completed' | 'cancelled'
}>()

const getStatusConfig = (status: string): { label: string, color: any } => {
  const configs: Record<string, { label: string, color: any }> = {
    pending_payment: { label: 'Pending Payment', color: 'warning' },
    payment_uploaded: { label: 'Payment Uploaded', color: 'info' },
    verified: { label: 'Verified', color: 'primary' },
    processing: { label: 'Processing', color: 'secondary' },
    completed: { label: 'Completed', color: 'success' },
    cancelled: { label: 'Cancelled', color: 'error' }
  }
  
  return configs[status] || { label: 'Unknown', color: 'neutral' }
}

const config = computed(() => getStatusConfig(props.status))
</script>

<template>
  <UBadge 
    :color="config.color" 
    variant="subtle" 
    class="font-medium"
  >
    {{ config.label }}
  </UBadge>
</template>
