<script setup lang="ts">
import { Cog6ToothIcon, CreditCardIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { user } = useAdminAuth()

const { data: settingsData, pending, refresh } = await useFetch<Record<string, any>>('/api/admin/settings')

const form = ref({
  store_name: 'Imani Prima Shop',
  contact_email: 'hello@imaniprima.co.id',
  bank_name: 'BCA',
  bank_account: '1234567890',
  bank_owner: 'PT Imani Prima',
  maintenance_mode: false
})

// Sync fetched settings to form
watch(settingsData, (newData) => {
  if (newData) {
    if (newData.store_name) form.value.store_name = newData.store_name
    if (newData.contact_email) form.value.contact_email = newData.contact_email
    if (newData.bank_name) form.value.bank_name = newData.bank_name
    if (newData.bank_account) form.value.bank_account = newData.bank_account
    if (newData.bank_owner) form.value.bank_owner = newData.bank_owner
    if (newData.maintenance_mode !== undefined) form.value.maintenance_mode = newData.maintenance_mode
  }
}, { immediate: true })

const isSaving = ref(false)

const saveSettings = async () => {
  try {
    isSaving.value = true
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: form.value
    })
    
    await Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'System settings updated successfully.',
      timer: 1500,
      showConfirmButton: false
    })
    
    await refresh()
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Failed',
      text: error.data?.message || 'Failed to update settings.'
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6 pb-12 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-apple-black">Global System Settings</h2>
        <p class="text-gray-500 mt-1">Manage core configurations for your platform.</p>
      </div>
      <button 
        v-if="user?.role === 'superadmin'"
        @click="saveSettings" 
        :disabled="isSaving || pending"
        class="bg-apple-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-semibold transition-colors disabled:opacity-50"
      >
        <span v-if="isSaving">Saving...</span>
        <span v-else>Save Changes</span>
      </button>
    </div>

    <!-- Security Warning (Only for unauthorized) -->
    <div v-if="user?.role !== 'superadmin'" class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
      <ExclamationTriangleIcon class="w-12 h-12 mb-3 text-red-500" />
      <h3 class="text-lg font-bold">Access Denied</h3>
      <p class="mt-1">Only Super Admins can view and modify global settings.</p>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <!-- Left Column (General & Bank) -->
      <div class="xl:col-span-2 space-y-8">
        
        <!-- General Settings -->
        <div class="bg-white rounded-3xl border border-light-gray shadow-sm overflow-hidden">
          <div class="p-6 border-b border-light-gray flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Cog6ToothIcon class="w-5 h-5" />
            </div>
            <h3 class="text-lg font-bold text-apple-black">General Info</h3>
          </div>
          
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-semibold text-apple-black">Store Name</label>
                <input v-model="form.store_name" type="text" class="w-full border border-gray-300 p-3 rounded-xl focus:border-apple-blue focus:ring-apple-blue transition-colors text-apple-black bg-white" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-apple-black">Contact Email</label>
                <input v-model="form.contact_email" type="email" class="w-full border border-gray-300 p-3 rounded-xl focus:border-apple-blue focus:ring-apple-blue transition-colors text-apple-black bg-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- Bank Settings -->
        <div class="bg-white rounded-3xl border border-light-gray shadow-sm overflow-hidden">
          <div class="p-6 border-b border-light-gray flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CreditCardIcon class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-apple-black">Billing & Payment Details</h3>
              <p class="text-sm text-gray-500">Displayed on customer invoices.</p>
            </div>
          </div>
          
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-semibold text-apple-black">Bank Name</label>
                <input v-model="form.bank_name" type="text" class="w-full border border-gray-300 p-3 rounded-xl focus:border-apple-blue focus:ring-apple-blue transition-colors text-apple-black bg-white" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-apple-black">Account Number</label>
                <input v-model="form.bank_account" type="text" class="w-full border border-gray-300 p-3 rounded-xl focus:border-apple-blue focus:ring-apple-blue transition-colors text-apple-black bg-white" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-semibold text-apple-black">Account Holder Name</label>
              <input v-model="form.bank_owner" type="text" class="w-full border border-gray-300 p-3 rounded-xl focus:border-apple-blue focus:ring-apple-blue transition-colors text-apple-black bg-white" />
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column (Advanced) -->
      <div class="space-y-8">
        <div class="bg-white rounded-3xl border border-light-gray shadow-sm overflow-hidden">
          <div class="p-6 border-b border-light-gray flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <InformationCircleIcon class="w-5 h-5" />
            </div>
            <h3 class="text-lg font-bold text-apple-black">Advanced</h3>
          </div>
          
          <div class="p-6">
            <label class="flex items-start gap-4 cursor-pointer p-4 border border-light-gray rounded-2xl hover:bg-off-white transition-colors">
              <div class="pt-1">
                <input v-model="form.maintenance_mode" type="checkbox" class="w-5 h-5 rounded border-gray-300 text-apple-blue focus:ring-apple-blue" />
              </div>
              <div>
                <p class="font-bold text-apple-black">Maintenance Mode</p>
                <p class="text-sm text-gray-500 mt-1">If enabled, the public shop will display a maintenance page. (This feature requires frontend integration).</p>
              </div>
            </label>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>
