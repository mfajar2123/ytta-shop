<script setup lang="ts">
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending Payment', value: 'pending_payment' },
  { label: 'Payment Uploaded', value: 'payment_uploaded' },
  { label: 'Verified', value: 'verified' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const currentStatus = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const searchDebounce = ref<ReturnType<typeof setTimeout>>()

const queryParams = computed(() => ({
  page: currentPage.value,
  limit: 20,
  ...(currentStatus.value !== 'all' && { status: currentStatus.value }),
  ...(searchQuery.value && { search: searchQuery.value })
}))

const { data, pending, refresh, error } = await useFetch<any>('/api/orders', {
  query: queryParams
})

watch(error, (newError) => {
  if (newError) {
    Swal.fire({
      icon: 'error',
      title: 'Failed to load orders',
      text: newError.data?.message || newError.message || 'Server connection error.',
      confirmButtonColor: '#ef4444'
    })
  }
})

const orders = computed(() => data.value?.items || [])
const pagination = computed(() => data.value?.pagination || { page: 1, total: 0, totalPages: 1 })

const columns = [
  { accessorKey: 'invoice', header: 'Invoice & Date' },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'total', header: 'Total' },
  { id: 'actions', header: '' }
]

const handleSearch = (val: string) => {
  clearTimeout(searchDebounce.value)
  searchDebounce.value = setTimeout(() => {
    searchQuery.value = val
    currentPage.value = 1
  }, 300)
}

const changeStatus = (status: string) => {
  currentStatus.value = status
  currentPage.value = 1
}

const deleteOrder = async (orderId: number) => {
  const confirm = await Swal.fire({
    title: 'Delete Order?',
    text: "You won't be able to revert this! This will permanently delete the order and its items.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: 'Yes, delete it!'
  })

  if (confirm.isConfirmed) {
    Swal.fire({
      title: 'Deleting...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
    try {
      await $fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
      Swal.fire('Deleted!', 'The order has been deleted.', 'success')
      refresh()
    } catch (err: any) {
      Swal.fire('Error', err.data?.message || 'Failed to delete order', 'error')
    }
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(dateString))
}

const getCustomerName = (order: any) => {
  return order.billingDetails?.fullName || order.customerEmail || '-'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Orders</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Manage all customer orders and their statuses.</p>
      </div>
    </div>

    <!-- Status Filter Tabs -->
    <UCard>
      <div class="flex flex-wrap gap-2">
        <UButton 
          v-for="tab in statusOptions" 
          :key="tab.value"
          @click="changeStatus(tab.value)"
          :color="currentStatus === tab.value ? 'primary' : 'neutral'"
          :variant="currentStatus === tab.value ? 'solid' : 'ghost'"
          size="sm"
          class="font-medium rounded-lg"
        >
          {{ tab.label }}
        </UButton>
      </div>
    </UCard>

    <!-- Search Bar -->
    <UCard>
      <div class="max-w-md">
        <UInput 
          :model-value="searchQuery"
          @update:model-value="handleSearch"
          icon="i-heroicons-magnifying-glass" 
          placeholder="Search by invoice number or email..." 
          size="md"
        />
      </div>
    </UCard>

    <!-- Table -->
    <UCard class="overflow-hidden">
      <UAlert
        v-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="subtle"
        title="Failed to load orders"
        :description="error.data?.message || error.message || 'Cannot connect to database or server is offline.'"
        class="mb-4"
      />
      
      <UTable 
        v-else
        :data="orders" 
        :columns="columns" 
        :loading="pending"
        class="w-full"
      >
        <template #empty>
          <div class="p-12 text-center text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-funnel" class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p class="font-medium text-gray-900 dark:text-white">No orders found</p>
            <p class="text-sm mt-1">Try adjusting your filters or search query.</p>
          </div>
        </template>
        
        <template #invoice-cell="{ row }">
          <div class="font-medium text-gray-900 dark:text-white">{{ row.original.invoiceNumber }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ formatDate(row.original.createdAt) }}</div>
        </template>
        
        <template #customer-cell="{ row }">
          <div class="font-medium text-gray-900 dark:text-white">{{ getCustomerName(row.original) }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ row.original.customerPhone || '-' }}</div>
        </template>
        
        <template #status-cell="{ row }">
          <AdminStatusBadge :status="row.original.status" />
        </template>
        
        <template #total-cell="{ row }">
          <div class="text-gray-900 dark:text-white font-medium">
            {{ formatCurrency(row.original.total) }}
          </div>
        </template>
        
        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UButton 
              :to="`/admin/orders/${row.original.id}`"
              icon="i-heroicons-eye" 
              color="neutral" 
              variant="ghost" 
              size="sm" 
              title="View Details"
            />
            <UButton 
              icon="i-heroicons-trash" 
              color="error" 
              variant="ghost" 
              size="sm" 
              @click="deleteOrder(row.original.id)" 
              title="Delete Order"
            />
          </div>
        </template>
      </UTable>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Showing <span class="font-medium text-gray-900 dark:text-white">{{ (pagination.page - 1) * 20 + 1 }}</span> to <span class="font-medium text-gray-900 dark:text-white">{{ Math.min(pagination.page * 20, pagination.total) }}</span> of <span class="font-medium text-gray-900 dark:text-white">{{ pagination.total }}</span> results
        </p>
        <UPagination 
          v-model="currentPage" 
          :items-per-page="20" 
          :total="pagination.total" 
        />
      </div>
    </UCard>
  </div>
</template>
