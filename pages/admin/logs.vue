<script setup lang="ts">
import { 
  ClipboardDocumentListIcon,
  UserIcon,
  CubeIcon,
  ShoppingCartIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { user } = useAdminAuth()

// Fetch logs
const { data: logs, pending, error } = await useFetch<any[]>('/api/admin/logs')

// Mapping entity to icons and colors
const getEntityConfig = (entity: string) => {
  switch (entity.toUpperCase()) {
    case 'USER': return { icon: UserIcon, bg: 'bg-blue-100', text: 'text-blue-600' }
    case 'PRODUCT': return { icon: CubeIcon, bg: 'bg-indigo-100', text: 'text-indigo-600' }
    case 'ORDER': return { icon: ShoppingCartIcon, bg: 'bg-emerald-100', text: 'text-emerald-600' }
    case 'SETTINGS': return { icon: Cog6ToothIcon, bg: 'bg-purple-100', text: 'text-purple-600' }
    case 'AUTH': return { icon: KeyIcon, bg: 'bg-amber-100', text: 'text-amber-600' }
    default: return { icon: ClipboardDocumentListIcon, bg: 'bg-gray-100', text: 'text-gray-600' }
  }
}

// Mapping action to badges
const getActionBadge = (action: string) => {
  switch (action.toUpperCase()) {
    case 'CREATE': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'UPDATE': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'DELETE': return 'bg-red-50 text-red-700 border-red-200'
    case 'LOGIN': return 'bg-purple-50 text-purple-700 border-purple-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

// Modal State
const selectedLog = ref<any>(null)
const isModalOpen = ref(false)

const openDetails = (log: any) => {
  selectedLog.value = log
  isModalOpen.value = true
}

const closeDetails = () => {
  isModalOpen.value = false
  selectedLog.value = null
}
</script>

<template>
  <div class="space-y-6 pb-12 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-apple-black">Activity Logs</h2>
        <p class="text-gray-500 mt-1">Immutable audit trail of all system activities.</p>
      </div>
    </div>

    <!-- Security Warning (Only for unauthorized) -->
    <div v-if="user?.role !== 'superadmin'" class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
      <XCircleIcon class="w-12 h-12 mb-3 text-red-500" />
      <h3 class="text-lg font-bold">Access Denied</h3>
      <p class="mt-1">Only Super Admins can view the system activity logs.</p>
    </div>

    <!-- Main Content -->
    <div v-else class="bg-white rounded-3xl border border-light-gray shadow-sm overflow-hidden">
      <div v-if="pending" class="p-12 text-center text-gray-500">
        Loading logs...
      </div>
      <div v-else-if="error" class="p-12 text-center text-red-500">
        {{ error.data?.message || 'Failed to load logs' }}
      </div>
      <div v-else-if="!logs || logs.length === 0" class="p-12 text-center text-gray-500">
        No activity logs found.
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-off-white/50 border-b border-light-gray text-sm text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-4 font-semibold">Timestamp</th>
              <th class="px-6 py-4 font-semibold">Admin</th>
              <th class="px-6 py-4 font-semibold">Action</th>
              <th class="px-6 py-4 font-semibold">Entity</th>
              <th class="px-6 py-4 font-semibold">IP / Device</th>
              <th class="px-6 py-4 font-semibold">Status</th>
              <th class="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-light-gray">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-off-white/50 transition-colors">
              <!-- Timestamp -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(log.createdAt).toLocaleString('id-ID') }}
              </td>
              
              <!-- Admin -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center font-bold text-xs">
                    {{ log.adminName ? log.adminName.charAt(0).toUpperCase() : (log.action === 'LOGIN' ? '?' : 'S') }}
                  </div>
                  <div>
                    <p class="font-medium text-apple-black text-sm">{{ log.adminName || 'System / Anonymous' }}</p>
                  </div>
                </div>
              </td>
              
              <!-- Action -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 text-xs font-bold uppercase rounded-full border" :class="getActionBadge(log.action)">
                  {{ log.action }}
                </span>
              </td>
              
              <!-- Entity -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md flex items-center justify-center" :class="getEntityConfig(log.entity).bg">
                    <component :is="getEntityConfig(log.entity).icon" class="w-4 h-4" :class="getEntityConfig(log.entity).text" />
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ log.entity }}</span>
                  <span v-if="log.entityId" class="text-xs text-gray-400 font-mono ml-1">#{{ log.entityId.substring(0,8) }}</span>
                </div>
              </td>

              <!-- IP & User Agent -->
              <td class="px-6 py-4">
                <div class="text-xs text-gray-600 font-mono">{{ log.ipAddress }}</div>
                <div class="text-[10px] text-gray-400 truncate max-w-[150px]" :title="log.userAgent">{{ log.userAgent }}</div>
              </td>
              
              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-1">
                  <CheckCircleIcon v-if="log.status === 'SUCCESS'" class="w-5 h-5 text-emerald-500" />
                  <XCircleIcon v-else class="w-5 h-5 text-red-500" />
                  <span class="text-sm font-medium" :class="log.status === 'SUCCESS' ? 'text-emerald-700' : 'text-red-700'">
                    {{ log.status }}
                  </span>
                </div>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button 
                  v-if="log.details"
                  @click="openDetails(log)"
                  class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  title="View Details"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" @click.self="closeDetails">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div class="px-6 py-4 border-b border-light-gray flex justify-between items-center bg-off-white">
          <h3 class="text-lg font-bold text-apple-black flex items-center gap-2">
            <ClipboardDocumentListIcon class="w-5 h-5 text-gray-500" />
            Log Details
          </h3>
          <button @click="closeDetails" class="text-gray-400 hover:text-gray-700 transition-colors">
            <XCircleIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto">
          <div class="mb-4 text-sm text-gray-600">
            <p><strong>Action:</strong> <span class="uppercase">{{ selectedLog?.action }}</span></p>
            <p><strong>Entity:</strong> {{ selectedLog?.entity }} <span v-if="selectedLog?.entityId">(ID: {{ selectedLog?.entityId }})</span></p>
            <p><strong>Time:</strong> {{ new Date(selectedLog?.createdAt).toLocaleString('id-ID') }}</p>
          </div>
          <div class="bg-gray-900 rounded-xl p-4 overflow-x-auto">
            <pre class="text-xs text-green-400 font-mono">{{ JSON.stringify(selectedLog?.details, null, 2) }}</pre>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-light-gray bg-off-white flex justify-end">
          <button @click="closeDetails" class="px-5 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
