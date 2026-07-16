<script setup lang="ts">
import { 
  EyeIcon, 
  MagnifyingGlassIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FunnelIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const statusTabs = [
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
  query: queryParams,
  watch: [queryParams]
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
        <h2 class="text-2xl font-bold text-apple-black">Orders</h2>
        <p class="text-gray-500 mt-1">Manage all customer orders and their statuses.</p>
      </div>
    </div>

    <!-- Status Filter Tabs -->
    <div class="bg-white rounded-2xl border border-light-gray shadow-sm p-2">
      <div class="flex flex-wrap gap-1">
        <button 
          v-for="tab in statusTabs" 
          :key="tab.value"
          @click="changeStatus(tab.value)"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
          :class="currentStatus === tab.value 
            ? 'bg-apple-blue text-white shadow-sm' 
            : 'text-gray-600 hover:bg-off-white hover:text-apple-black'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-4 rounded-2xl border border-light-gray shadow-sm">
      <div class="relative max-w-md">
        <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          :value="searchQuery"
          @input="handleSearch(($event.target as HTMLInputElement).value)"
          placeholder="Search by invoice number or email..." 
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue transition-all"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-light-gray shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-light-gray bg-off-white/50">
              <th class="px-6 py-4 text-sm font-medium text-gray-500">Invoice & Date</th>
              <th class="px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
              <th class="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th class="px-6 py-4 text-sm font-medium text-gray-500">Total</th>
              <th class="px-6 py-4 text-sm font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-light-gray">
            <!-- Loading skeleton -->
            <template v-if="pending">
              <tr v-for="i in 5" :key="i">
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div><div class="h-3 bg-gray-100 rounded animate-pulse w-20"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded animate-pulse w-28 mb-2"></div><div class="h-3 bg-gray-100 rounded animate-pulse w-20"></div></td>
                <td class="px-6 py-4"><div class="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div></td>
                <td class="px-6 py-4"><div class="h-8 bg-gray-200 rounded animate-pulse w-8 ml-auto"></div></td>
              </tr>
            </template>

            <tr v-else-if="error">
              <td colspan="5" class="px-6 py-16 text-center text-red-600 bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <p class="font-bold">Failed to load orders</p>
                <p class="text-sm mt-1 opacity-80">{{ error.data?.message || error.message || 'Cannot connect to database or server is offline.' }}</p>
                <button @click="refresh()" class="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors">
                  Try Again
                </button>
              </td>
            </tr>

            <tr v-else-if="orders.length === 0">
              <td colspan="5" class="px-6 py-16 text-center">
                <FunnelIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 font-medium">No orders found</p>
                <p class="text-sm text-gray-400 mt-1">Try adjusting your filters or search query.</p>
              </td>
            </tr>
            
            <tr v-else v-for="order in orders" :key="order.id" class="hover:bg-off-white/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="font-medium text-apple-black">{{ order.invoiceNumber }}</div>
                <div class="text-sm text-gray-500 mt-0.5">{{ formatDate(order.createdAt) }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-apple-black">{{ getCustomerName(order) }}</div>
                <div class="text-sm text-gray-500 mt-0.5">{{ order.customerPhone || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                <AdminStatusBadge :status="order.status" />
              </td>
              <td class="px-6 py-4 text-apple-black font-medium">
                {{ formatCurrency(order.total) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <NuxtLink :to="`/admin/orders/${order.id}`" class="p-2 text-gray-500 hover:text-apple-blue hover:bg-apple-blue/10 rounded-lg transition-colors" title="View Details">
                    <EyeIcon class="w-5 h-5" />
                  </NuxtLink>
                  <button @click="deleteOrder(order.id)" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Order">
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-light-gray bg-off-white/30">
        <p class="text-sm text-gray-500">
          Showing {{ (pagination.page - 1) * 20 + 1 }}–{{ Math.min(pagination.page * 20, pagination.total) }} of {{ pagination.total }} orders
        </p>
        <div class="flex items-center gap-2">
          <button 
            @click="currentPage--" 
            :disabled="currentPage <= 1"
            class="p-2 rounded-lg border border-light-gray hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </button>
          
          <template v-for="p in pagination.totalPages" :key="p">
            <button 
              v-if="p === 1 || p === pagination.totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
              @click="currentPage = p"
              class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
              :class="currentPage === p ? 'bg-apple-blue text-white' : 'hover:bg-white border border-light-gray text-gray-600'"
            >
              {{ p }}
            </button>
            <span v-else-if="p === currentPage - 2 || p === currentPage + 2" class="text-gray-400">...</span>
          </template>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage >= pagination.totalPages"
            class="p-2 rounded-lg border border-light-gray hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
