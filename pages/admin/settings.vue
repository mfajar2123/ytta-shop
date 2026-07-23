<script setup lang="ts">
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { user } = useAdminAuth()
const { fetchAdminSettings, updateSettings } = useSystemSettings()

const isInitialLoading = ref(true)
const isSaving = ref(false)

const form = ref({
  store_name: 'Imani Prima Shop',
  contact_email: 'hello@imaniprima.co.id',
  bank_name: 'BCA',
  bank_account: '1234567890',
  bank_owner: 'PT Imani Prima',
  maintenance_mode: false
})

// Load fresh settings from backend on mount/navigation (bypassing Nuxt payload cache)
const loadFreshSettings = async () => {
  try {
    isInitialLoading.value = true
    const data = await fetchAdminSettings()
    if (data) {
      form.value = {
        store_name: data.store_name ?? 'Imani Prima Shop',
        contact_email: data.contact_email ?? 'hello@imaniprima.co.id',
        bank_name: data.bank_name ?? 'BCA',
        bank_account: data.bank_account ?? '1234567890',
        bank_owner: data.bank_owner ?? 'PT Imani Prima',
        maintenance_mode: data.maintenance_mode === true
      }
    }
  } catch (err: any) {
    console.error('Failed to load admin settings:', err)
  } finally {
    isInitialLoading.value = false
  }
}

onMounted(() => {
  loadFreshSettings()
})

const handleSaveSettings = async () => {
  try {
    isSaving.value = true
    const result = await updateSettings(form.value)
    
    // Sync form with returned server data to guarantee consistency
    if (result?.settings) {
      form.value = {
        store_name: result.settings.store_name ?? form.value.store_name,
        contact_email: result.settings.contact_email ?? form.value.contact_email,
        bank_name: result.settings.bank_name ?? form.value.bank_name,
        bank_account: result.settings.bank_account ?? form.value.bank_account,
        bank_owner: result.settings.bank_owner ?? form.value.bank_owner,
        maintenance_mode: result.settings.maintenance_mode === true
      }
    }

    await Swal.fire({
      icon: 'success',
      title: 'Settings Saved',
      text: 'Global system settings have been updated permanently.',
      timer: 1800,
      showConfirmButton: false
    })
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Failed to Save',
      text: error.data?.message || 'Failed to update system settings.',
      confirmButtonColor: '#0071E3'
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6 pb-16">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Global System Settings</h2>
          <UBadge 
            v-if="!isInitialLoading"
            :color="form.maintenance_mode ? 'warning' : 'success'" 
            variant="subtle"
            class="font-semibold gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="form.maintenance_mode ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'"></span>
            {{ form.maintenance_mode ? 'Maintenance Active' : 'System Live' }}
          </UBadge>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage core platform configurations, payment details, and maintenance mode.</p>
      </div>

      <div class="flex items-center gap-3">
        <UButton
          icon="i-heroicons-arrow-path"
          color="neutral"
          variant="ghost"
          :loading="isInitialLoading"
          @click="loadFreshSettings"
          :disabled="isInitialLoading || isSaving"
          title="Refresh Settings"
        />

        <UButton 
          v-if="user?.role === 'superadmin'"
          icon="i-heroicons-check"
          color="primary"
          :loading="isSaving"
          :disabled="isSaving || isInitialLoading"
          @click="handleSaveSettings" 
          class="font-semibold"
        >
          Save Changes
        </UButton>
      </div>
    </div>

    <!-- Security Warning (Non-superadmin) -->
    <UAlert
      v-if="user?.role !== 'superadmin'"
      icon="i-heroicons-exclamation-triangle"
      color="error"
      variant="subtle"
      title="Access Restricted"
      description="Only Super Admin accounts are authorized to modify global system settings."
      class="py-8"
    />

    <!-- Loading Skeleton -->
    <div v-else-if="isInitialLoading" class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div class="xl:col-span-2 space-y-6">
        <UCard v-for="i in 3" :key="i">
          <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4 animate-pulse"></div>
          <div class="h-10 bg-gray-100 dark:bg-gray-900 rounded mb-4 animate-pulse"></div>
          <div class="h-10 bg-gray-100 dark:bg-gray-900 rounded animate-pulse"></div>
        </UCard>
      </div>
    </div>

    <!-- Settings Form Content -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <!-- Left Column: Form Fields -->
      <div class="xl:col-span-2 space-y-8">
        
        <!-- General Store Info -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <UIcon name="i-heroicons-building-storefront" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">General Identity</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Store branding & primary contact details</p>
              </div>
            </div>
          </template>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Store Name" name="store_name">
              <UInput v-model="form.store_name" placeholder="e.g. Imani Prima Shop" size="md" />
            </UFormField>
            
            <UFormField label="Support / Contact Email" name="contact_email">
              <UInput v-model="form.contact_email" type="email" placeholder="e.g. hello@imaniprima.co.id" icon="i-heroicons-envelope" size="md" />
            </UFormField>
          </div>
        </UCard>

        <!-- Bank & Billing Settings -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UIcon name="i-heroicons-credit-card" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Billing & Bank Transfer Info</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Displayed on customer checkout & proforma invoices</p>
              </div>
            </div>
          </template>
          
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Bank Name" name="bank_name">
                <UInput v-model="form.bank_name" placeholder="e.g. Bank BCA / Mandiri / BNI" size="md" />
              </UFormField>
              
              <UFormField label="Account Number" name="bank_account">
                <UInput v-model="form.bank_account" placeholder="e.g. 1234567890" size="md" class="font-mono font-semibold" />
              </UFormField>
            </div>
            
            <UFormField label="Account Owner Name (a.n.)" name="bank_owner">
              <UInput v-model="form.bank_owner" placeholder="e.g. PT Imani Prima" size="md" />
            </UFormField>
          </div>
        </UCard>

        <!-- System Maintenance Mode -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">System Status & Maintenance</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Control public access to the storefront</p>
              </div>
            </div>
          </template>
          
          <div 
            class="flex items-start gap-4 p-5 rounded-2xl border transition-all"
            :class="form.maintenance_mode ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'"
          >
            <div class="pt-0.5">
              <USwitch v-model="form.maintenance_mode" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <p class="font-bold text-gray-900 dark:text-white text-base cursor-pointer" @click="form.maintenance_mode = !form.maintenance_mode">Enable Maintenance Mode</p>
                <UBadge 
                  :color="form.maintenance_mode ? 'warning' : 'neutral'" 
                  variant="subtle"
                  class="font-bold uppercase tracking-wider text-[10px]"
                >
                  {{ form.maintenance_mode ? 'Active' : 'Disabled' }}
                </UBadge>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                When Maintenance Mode is active, all public customer routes will immediately redirect to a maintenance screen. Admin dashboard routes remain accessible.
              </p>
            </div>
          </div>
        </UCard>

      </div>

      <!-- Right Column: Live Customer Preview -->
      <div class="space-y-6">
        <UCard class="sticky top-24">
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
            <UIcon name="i-heroicons-eye" class="w-5 h-5 text-primary-500" />
            <h4 class="font-bold text-gray-900 dark:text-white text-sm">Live Customer Preview</h4>
          </div>

          <!-- Checkout Bank Info Preview -->
          <div class="space-y-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">How your payment info looks at Checkout:</p>
            
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
              <div class="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                <span>Bank Transfer</span>
                <span class="text-primary-600 dark:text-primary-400 font-semibold">{{ form.bank_name || 'BCA' }}</span>
              </div>
              <div class="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Number</p>
                <p class="font-mono text-base font-bold text-gray-900 dark:text-white tracking-wide">{{ form.bank_account || '1234567890' }}</p>
                <p class="text-xs text-gray-500 font-medium">a.n. {{ form.bank_owner || 'PT Imani Prima' }}</p>
              </div>
            </div>

            <!-- Maintenance Preview Card -->
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Storefront Status:</p>
              <div 
                class="p-4 rounded-2xl border text-center space-y-1"
                :class="form.maintenance_mode ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-400' : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400'"
              >
                <p class="font-bold text-sm">{{ form.store_name || 'Imani Prima Shop' }}</p>
                <p class="text-xs opacity-80">
                  {{ form.maintenance_mode ? '⚠️ Under Maintenance' : '✅ Store is Publicly Online' }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

    </div>
  </div>
</template>
