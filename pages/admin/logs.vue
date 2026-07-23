<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { user } = useAdminAuth()

// Pagination & Search State
const currentPage = ref(1)
const searchQuery = ref('')
const searchDebounce = ref<ReturnType<typeof setTimeout>>()

const queryParams = computed(() => ({
  page: currentPage.value,
  limit: 20,
  ...(searchQuery.value && { search: searchQuery.value })
}))

// Fetch logs
const { data, pending, error, refresh } = await useFetch<any>('/api/admin/logs', {
  query: queryParams
})

const logs = computed(() => data.value?.items || [])
const pagination = computed(() => data.value?.pagination || { page: 1, total: 0, totalPages: 1 })

const handleSearch = (val: string) => {
  clearTimeout(searchDebounce.value)
  searchDebounce.value = setTimeout(() => {
    searchQuery.value = val
    currentPage.value = 1
  }, 300)
}

// Mapping entity to icons and colors
const getEntityConfig = (entity: string) => {
  switch (entity.toUpperCase()) {
    case 'USER': return { icon: 'i-heroicons-user', color: 'info' as const }
    case 'PRODUCT': return { icon: 'i-heroicons-cube', color: 'primary' as const }
    case 'ORDER': return { icon: 'i-heroicons-shopping-cart', color: 'success' as const }
    case 'SETTINGS': return { icon: 'i-heroicons-cog-6-tooth', color: 'secondary' as const }
    case 'AUTH': return { icon: 'i-heroicons-key', color: 'warning' as const }
    default: return { icon: 'i-heroicons-clipboard-document-list', color: 'neutral' as const }
  }
}

// Mapping action to badges
const getActionBadgeColor = (action: string) => {
  switch (action.toUpperCase()) {
    case 'CREATE': return 'success' as const
    case 'UPDATE': return 'info' as const
    case 'DELETE': return 'error' as const
    case 'LOGIN': return 'secondary' as const
    default: return 'neutral' as const
  }
}

const columns = [
  { accessorKey: 'createdAt', header: 'Timestamp' },
  { accessorKey: 'admin', header: 'Admin' },
  { accessorKey: 'action', header: 'Action' },
  { accessorKey: 'entity', header: 'Entity' },
  { accessorKey: 'ip', header: 'IP / Device' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: '' }
]

// Modal State
const selectedLog = ref<any>(null)
const isModalOpen = ref(false)

const openDetails = (log: any) => {
  selectedLog.value = log
  isModalOpen.value = true
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Activity Logs</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Immutable audit trail of all system activities.</p>
      </div>
    </div>

    <!-- Search Bar -->
    <UCard v-if="user?.role === 'superadmin'">
      <div class="max-w-md">
        <UInput 
          :model-value="searchQuery"
          @update:model-value="handleSearch"
          icon="i-heroicons-magnifying-glass" 
          placeholder="Search logs (action, entity, admin, status)..." 
          size="md"
        />
      </div>
    </UCard>

    <!-- Security Warning (Only for unauthorized) -->
    <UAlert
      v-if="user?.role !== 'superadmin'"
      icon="i-heroicons-x-circle"
      color="error"
      variant="subtle"
      title="Access Denied"
      description="Only Super Admins can view the system activity logs."
      class="py-6"
    />

    <!-- Main Content -->
    <UCard v-else class="overflow-hidden">
      <UAlert
        v-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="subtle"
        title="Failed to load logs"
        :description="error.data?.message || 'Cannot connect to database or server is offline.'"
        class="mb-4"
      />
      
      <UTable 
        v-else
        :data="logs" 
        :columns="columns" 
        :loading="pending"
        class="w-full"
      >
        <template #empty>
          <div class="p-12 text-center text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p class="font-medium text-gray-900 dark:text-white">No activity logs found</p>
          </div>
        </template>
        
        <template #createdAt-cell="{ row }">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ new Date(row.original.createdAt).toLocaleString('id-ID') }}
          </span>
        </template>
        
        <template #admin-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar 
              :alt="row.original.adminName ? row.original.adminName.charAt(0).toUpperCase() : (row.original.action === 'LOGIN' ? '?' : 'S')"
              size="sm"
              class="bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400 font-bold"
            />
            <p class="font-medium text-gray-900 dark:text-white text-sm">{{ row.original.adminName || 'System / Anonymous' }}</p>
          </div>
        </template>
        
        <template #action-cell="{ row }">
          <UBadge :color="getActionBadgeColor(row.original.action)" variant="subtle" class="font-bold uppercase tracking-wider text-[10px]">
            {{ row.original.action }}
          </UBadge>
        </template>
        
        <template #entity-cell="{ row }">
          <div class="flex items-center gap-2">
            <UBadge :color="getEntityConfig(row.original.entity).color" variant="subtle" class="px-1.5 py-1">
              <UIcon :name="getEntityConfig(row.original.entity).icon" class="w-4 h-4" />
            </UBadge>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ row.original.entity }}</span>
            <span v-if="row.original.entityId" class="text-xs text-gray-400 dark:text-gray-500 font-mono ml-1">#{{ row.original.entityId.substring(0,8) }}</span>
          </div>
        </template>
        
        <template #ip-cell="{ row }">
          <div class="text-xs text-gray-600 dark:text-gray-400 font-mono">{{ row.original.ipAddress }}</div>
          <div class="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[150px]" :title="row.original.userAgent">{{ row.original.userAgent }}</div>
        </template>
        
        <template #status-cell="{ row }">
          <div class="flex items-center gap-1.5">
            <UIcon 
              :name="row.original.status === 'SUCCESS' ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" 
              :class="row.original.status === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'"
              class="w-5 h-5"
            />
            <span class="text-sm font-medium" :class="row.original.status === 'SUCCESS' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'">
              {{ row.original.status }}
            </span>
          </div>
        </template>
        
        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end">
            <UButton 
              v-if="row.original.details"
              icon="i-heroicons-eye" 
              color="neutral" 
              variant="ghost" 
              size="sm" 
              title="View Details"
              @click="openDetails(row.original)"
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

    <!-- Details Modal -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5 text-gray-500" />
                Log Details
              </h3>
              <UButton 
                color="neutral" 
                variant="ghost" 
                icon="i-heroicons-x-mark" 
                class="-my-1" 
                @click="isModalOpen = false" 
              />
            </div>
          </template>
          
          <div class="space-y-4 max-h-[60vh] overflow-y-auto px-2 pb-2">
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Action:</strong> <span class="uppercase font-medium text-gray-900 dark:text-white">{{ selectedLog?.action }}</span></p>
              <p><strong>Entity:</strong> <span class="font-medium text-gray-900 dark:text-white">{{ selectedLog?.entity }}</span> <span v-if="selectedLog?.entityId">(ID: {{ selectedLog?.entityId }})</span></p>
              <p><strong>Time:</strong> <span class="font-medium text-gray-900 dark:text-white">{{ new Date(selectedLog?.createdAt).toLocaleString('id-ID') }}</span></p>
            </div>
            
            <div class="bg-gray-900 dark:bg-black rounded-xl p-4 overflow-x-auto">
              <pre class="text-xs text-green-400 font-mono">{{ JSON.stringify(selectedLog?.details, null, 2) }}</pre>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton color="neutral" @click="isModalOpen = false">
                Close
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

  </div>
</template>
