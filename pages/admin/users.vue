<script setup lang="ts">
import {
  UserGroupIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin'
})

const { user } = useAdminAuth()
const isSuperadmin = computed(() => user.value?.role === 'superadmin')

const users = ref([])
const loading = ref(true)

const fetchUsers = async () => {
  loading.value = true
  try {
    const api = useApi()
    users.value = await api.fetch('/api/admin/users')
  } catch (error) {
    console.error('Failed to fetch users', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editId = ref('')
const form = reactive({
  username: '',
  password: '',
  fullName: '',
  role: 'admin'
})
const isSubmitting = ref(false)

const openCreateModal = () => {
  modalMode.value = 'create'
  form.username = ''
  form.password = ''
  form.fullName = ''
  form.role = 'admin'
  isModalOpen.value = true
}

const openEditModal = (userData: any) => {
  modalMode.value = 'edit'
  editId.value = userData.id
  form.username = userData.username
  form.password = ''
  form.fullName = userData.fullName
  form.role = userData.role
  isModalOpen.value = true
}

const submitForm = async () => {
  if (!form.username || !form.fullName) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Please fill in all required fields (Username and Full Name).'
    })
    return
  }
  
  if (modalMode.value === 'create' && form.password.length < 6) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Password must be at least 6 characters'
    })
    return
  }

  if (modalMode.value === 'edit' && form.password && form.password.length < 6) {
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Password must be at least 6 characters if you want to change it.'
    })
    return
  }

  isSubmitting.value = true
  try {
    const api = useApi()
    
    if (modalMode.value === 'create') {
      await api.fetch('/api/admin/users', {
        method: 'POST',
        body: form
      })
      Swal.fire({
        icon: 'success',
        title: 'Created!',
        text: 'User account has been successfully created.',
        confirmButtonColor: '#0071E3',
        timer: 1500
      })
    } else {
      const payload: any = {
        username: form.username,
        fullName: form.fullName,
        role: form.role
      }
      if (form.password) {
        payload.password = form.password
      }
      await api.fetch(`/api/admin/users/${editId.value}`, {
        method: 'PUT',
        body: payload
      })
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'User account has been successfully updated.',
        confirmButtonColor: '#0071E3',
        timer: 1500
      })
    }
    
    isModalOpen.value = false
    fetchUsers()
  } catch (error: any) {
    console.error(`Failed to ${modalMode.value} user`, error)
  } finally {
    isSubmitting.value = false
  }
}

const deleteUser = async (id: string, name: string) => {
  if (id === user.value?.sub) {
    Swal.fire({
      icon: 'warning',
      title: 'Restricted Action',
      text: 'You cannot delete your own account.',
      confirmButtonColor: '#0071E3'
    })
    return
  }

  const result = await Swal.fire({
    title: 'Delete User?',
    html: `Are you sure you want to delete <b>${name}</b>?<br>This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#DC2626',
    cancelButtonColor: '#F3F4F6',
    cancelButtonText: '<span class="text-gray-700">Cancel</span>',
    confirmButtonText: 'Yes, Delete',
    reverseButtons: true
  })

  if (result.isConfirmed) {
    try {
      const api = useApi()
      await api.fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'User has been removed from the system.',
        confirmButtonColor: '#0071E3',
        timer: 1500
      })
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user', error)
    }
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-apple-black flex items-center gap-3">
          <UserGroupIcon class="w-8 h-8 text-apple-blue" />
          User Management
        </h1>
        <p class="text-gray-500 mt-1">Manage system administrators and staff access levels</p>
      </div>
      
      <button 
        v-if="isSuperadmin"
        @click="openCreateModal" 
        class="bg-apple-blue hover:bg-apple-blue-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-apple-blue/20 flex items-center justify-center gap-2 active:scale-95"
      >
        <PlusIcon class="w-5 h-5" />
        Add New User
      </button>
    </div>

    <!-- Users List -->
    <div class="bg-white rounded-3xl border border-light-gray shadow-sm shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
      <div v-if="loading" class="p-16 flex justify-center">
        <div class="w-10 h-10 border-4 border-light-gray border-t-apple-blue rounded-full animate-spin"></div>
      </div>
      <div v-else-if="users.length === 0" class="p-16 text-center text-gray-500 flex flex-col items-center">
        <UserGroupIcon class="w-12 h-12 text-gray-300 mb-3" />
        <p class="text-lg font-medium text-apple-black">No Users Found</p>
        <p class="text-sm">There are currently no users in the system.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr class="bg-off-white/80 border-b border-light-gray text-gray-500 text-xs uppercase tracking-wider">
              <th class="px-6 py-4 font-semibold">User Profile</th>
              <th class="px-6 py-4 font-semibold">Role</th>
              <th class="px-6 py-4 font-semibold">Created Date</th>
              <th v-if="isSuperadmin" class="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-light-gray">
            <tr v-for="u in users" :key="u.id" class="hover:bg-off-white/40 transition-colors group">
              <td class="px-6 py-5">
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-apple-blue flex items-center justify-center font-bold shadow-sm">
                    {{ u.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-bold text-apple-black text-sm">{{ u.fullName }}</div>
                    <div class="text-xs text-gray-500 mt-0.5 font-medium">@{{ u.username }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5">
                <span 
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border"
                  :class="u.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'"
                >
                  <ShieldCheckIcon v-if="u.role === 'superadmin'" class="w-4 h-4" />
                  <UserIcon v-else class="w-4 h-4" />
                  {{ u.role === 'superadmin' ? 'Super Admin' : 'Admin' }}
                </span>
              </td>
              <td class="px-6 py-5 text-sm text-gray-600 font-medium">
                {{ new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) }}
              </td>
              <td v-if="isSuperadmin" class="px-6 py-5">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click="openEditModal(u)" 
                    class="p-2 text-gray-400 hover:text-apple-blue hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit User"
                  >
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button 
                    v-if="u.id !== user?.sub"
                    @click="deleteUser(u.id, u.fullName)" 
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit User Modal (Industry Standard UI) -->
    <Transition name="modal">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-apple-black/40 backdrop-blur-md">
        <div class="bg-white rounded-[24px] max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-full">
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-light-gray flex justify-between items-center bg-off-white/50">
            <div>
              <h3 class="text-xl font-bold text-apple-black">
                {{ modalMode === 'create' ? 'Add New User' : 'Edit User Profile' }}
              </h3>
              <p class="text-xs text-gray-500 mt-1 font-medium">
                {{ modalMode === 'create' ? 'Fill in the details to create an account.' : 'Update the user information below.' }}
              </p>
            </div>
            <button @click="isModalOpen = false" class="p-2 text-gray-400 hover:text-apple-black bg-white hover:bg-gray-100 rounded-full transition-colors border border-light-gray shadow-sm">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto">
            <form @submit.prevent="submitForm" class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-apple-black mb-1.5">Full Name</label>
                <input 
                  v-model="form.fullName" 
                  type="text" 
                  class="w-full px-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all bg-off-white/50 focus:bg-white"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-apple-black mb-1.5">Username</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span class="text-gray-400 font-medium">@</span>
                  </div>
                  <input 
                    v-model="form.username" 
                    type="text" 
                    class="w-full pl-9 pr-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all bg-off-white/50 focus:bg-white"
                    placeholder="johndoe"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-apple-black mb-1.5">
                  Password 
                  <span v-if="modalMode === 'edit'" class="text-xs font-normal text-gray-400 ml-1">(Leave empty to keep current)</span>
                </label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  class="w-full px-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all bg-off-white/50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-apple-black mb-1.5">Role Access</label>
                <div class="relative">
                  <select 
                    v-model="form.role" 
                    class="w-full px-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all bg-off-white/50 focus:bg-white appearance-none font-medium"
                  >
                    <option value="admin">Admin (Standard Access)</option>
                    <option value="superadmin">Super Admin (Full Access)</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-5 border-t border-light-gray bg-off-white/30 flex justify-end gap-3">
            <button 
              type="button" 
              @click="isModalOpen = false" 
              class="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors border border-light-gray shadow-sm"
            >
              Cancel
            </button>
            <button 
              @click="submitForm"
              :disabled="isSubmitting"
              class="px-6 py-2.5 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-xl font-semibold transition-all shadow-sm shadow-apple-blue/20 flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span v-else>{{ modalMode === 'create' ? 'Create User' : 'Save Changes' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
