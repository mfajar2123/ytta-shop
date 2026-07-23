<script setup lang="ts">
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

const columns = computed(() => {
  const cols = [
    { accessorKey: 'profile', header: 'User Profile' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'createdAt', header: 'Created Date' },
  ]
  if (isSuperadmin.value) {
    cols.push({ accessorKey: 'actions', header: '' })
  }
  return cols
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

const roleOptions = [
  { label: 'Admin (Standard Access)', value: 'admin' },
  { label: 'Super Admin (Full Access)', value: 'superadmin' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <UIcon name="i-heroicons-user-group" class="w-8 h-8 text-primary-500" />
          User Management
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Manage system administrators and staff access levels</p>
      </div>
      
      <UButton 
        v-if="isSuperadmin"
        icon="i-heroicons-plus" 
        color="primary" 
        size="md" 
        @click="openCreateModal" 
        class="font-medium"
      >
        Add New User
      </UButton>
    </div>

    <!-- Users List -->
    <UCard class="overflow-hidden">
      <UTable 
        :data="users" 
        :columns="columns" 
        :loading="loading"
      >
        <template #empty>
          <div class="p-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <UIcon name="i-heroicons-user-group" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p class="text-lg font-medium text-gray-900 dark:text-white">No Users Found</p>
            <p class="text-sm mt-1">There are currently no users in the system.</p>
          </div>
        </template>
        
        <template #profile-cell="{ row }">
          <div class="flex items-center gap-4">
            <UAvatar 
              :alt="row.original.fullName.charAt(0).toUpperCase()" 
              size="md" 
              class="bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400 font-bold" 
            />
            <div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">{{ row.original.fullName }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">@{{ row.original.username }}</div>
            </div>
          </div>
        </template>
        
        <template #role-cell="{ row }">
          <UBadge 
            :color="row.original.role === 'superadmin' ? 'secondary' : 'info'" 
            variant="subtle"
            class="font-semibold gap-1.5"
          >
            <UIcon :name="row.original.role === 'superadmin' ? 'i-heroicons-shield-check' : 'i-heroicons-user'" class="w-4 h-4" />
            {{ row.original.role === 'superadmin' ? 'Super Admin' : 'Admin' }}
          </UBadge>
        </template>
        
        <template #createdAt-cell="{ row }">
          <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {{ new Date(row.original.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) }}
          </span>
        </template>
        
        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UButton 
              icon="i-heroicons-pencil" 
              color="neutral" 
              variant="ghost" 
              size="sm" 
              title="Edit User"
              @click="openEditModal(row.original)" 
            />
            <UButton 
              v-if="row.original.id !== user?.sub"
              icon="i-heroicons-trash" 
              color="error" 
              variant="ghost" 
              size="sm" 
              title="Delete User"
              @click="deleteUser(row.original.id, row.original.fullName)" 
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Create/Edit User Modal -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ modalMode === 'create' ? 'Add New User' : 'Edit User Profile' }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  {{ modalMode === 'create' ? 'Fill in the details to create an account.' : 'Update the user information below.' }}
                </p>
              </div>
              <UButton 
                color="neutral" 
                variant="ghost" 
                icon="i-heroicons-x-mark" 
                class="-my-1" 
                @click="isModalOpen = false" 
              />
            </div>
          </template>
          
          <form @submit.prevent="submitForm" class="space-y-5 max-h-[60vh] overflow-y-auto px-2 pb-2">
            <UFormField label="Full Name" name="fullName" required>
              <UInput v-model="form.fullName" placeholder="e.g. John Doe" />
            </UFormField>
            
            <UFormField label="Username" name="username" required>
              <UInput v-model="form.username" placeholder="johndoe">
                <template #leading>
                  <span class="text-gray-500 dark:text-gray-400">@</span>
                </template>
              </UInput>
            </UFormField>
            
            <UFormField 
              label="Password" 
              name="password" 
              :hint="modalMode === 'edit' ? 'Leave empty to keep current' : ''"
              :required="modalMode === 'create'"
            >
              <UInput v-model="form.password" type="password" placeholder="••••••••" />
            </UFormField>
            
            <UFormField label="Role Access" name="role">
              <USelect 
                v-model="form.role" 
                :items="roleOptions" 
              />
            </UFormField>
          </form>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton color="neutral" variant="ghost" @click="isModalOpen = false">
                Cancel
              </UButton>
              <UButton color="primary" @click="submitForm" :loading="isSubmitting">
                {{ modalMode === 'create' ? 'Create User' : 'Save Changes' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
