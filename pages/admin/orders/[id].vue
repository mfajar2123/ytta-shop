<script setup lang="ts">
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const route = useRoute()
const orderId = route.params.id as string

const { data: order, pending, refresh } = await useFetch<any>(`/api/orders/${orderId}`)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'medium'
  }).format(new Date(dateString))
}

const isUpdating = ref(false)
const adminNotes = ref('')

const isEditing = ref(false)
const editData = ref<any>(null)

const startEdit = () => {
  editData.value = {
    billingDetails: { ...order.value?.billingDetails },
    vesselDetails: order.value?.vesselDetails ? { ...order.value?.vesselDetails } : null
  }
  isEditing.value = true
}

const saveEdit = async () => {
  try {
    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    })
    await $fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      body: editData.value
    })
    isEditing.value = false
    await refresh()
    Swal.fire('Saved!', 'Order details updated successfully.', 'success')
  } catch (err: any) {
    Swal.fire('Error', err.data?.message || 'Failed to update order', 'error')
  }
}

const updateStatus = async (newStatus: string) => {
  const result = await Swal.fire({
    title: 'Confirm Status Change',
    text: `Change order status to ${newStatus.replace('_', ' ').toUpperCase()}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#0071E3'
  })

  if (result.isConfirmed) {
    isUpdating.value = true
    try {
      const response = await $fetch<any>(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus, adminNotes: adminNotes.value || undefined }
      })
      await refresh()
      
      if (response._meta && !response._meta.emailSent) {
        Swal.fire({ 
          icon: 'warning', 
          title: 'Status Updated (Email Failed)', 
          text: `The status was changed, but we couldn't send the email: ${response._meta.emailError}`, 
          confirmButtonColor: '#F59E0B' 
        })
      } else {
        Swal.fire({ icon: 'success', title: 'Status Updated', text: 'Email notification has been sent.', confirmButtonColor: '#0071E3' })
      }
    } catch (error: any) {
      Swal.fire('Error', error.data?.message || 'Failed to update status', 'error')
    } finally {
      isUpdating.value = false
    }
  }
}

const fileInput = ref<HTMLInputElement | null>(null)
const isUploadingProof = ref(false)

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleUploadProof = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const confirm = await Swal.fire({
    title: 'Upload Proof?',
    text: `Are you sure you want to upload ${file.name}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#0071E3'
  })

  if (!confirm.isConfirmed) {
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  const formData = new FormData()
  formData.append('proof', file)
  formData.append('orderId', orderId)

  isUploadingProof.value = true
  try {
    await $fetch('/api/upload/payment-proof', {
      method: 'POST',
      body: formData
    })
    await refresh()
    Swal.fire('Success', 'Payment proof uploaded successfully', 'success')
  } catch (error: any) {
    Swal.fire('Error', error.data?.message || 'Failed to upload proof', 'error')
  } finally {
    isUploadingProof.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton to="/admin/orders" icon="i-heroicons-arrow-left" color="neutral" variant="ghost" />
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1" v-if="order">{{ order.invoiceNumber }}</p>
        </div>
      </div>
    </div>

    <!-- Spinner for initial load only -->
    <div v-if="pending && !order" class="flex justify-center p-12">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary-500" />
    </div>
    
    <div v-else-if="!pending && !order" class="text-center p-12 text-gray-500">
      Order not found.
    </div>

    <div v-show="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left Column: Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Status Banner -->
        <UCard :ui="{ body: { padding: 'px-4 py-5 sm:p-6' } }">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Status</p>
              <AdminStatusBadge :status="order.status" class="text-base px-3 py-1.5" />
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton :loading="isUpdating" v-if="order.status === 'payment_uploaded'" @click="updateStatus('verified')" icon="i-heroicons-check-circle" color="primary" class="font-semibold">
                Verify Payment
              </UButton>
              <UButton :loading="isUpdating" v-if="order.status === 'verified'" @click="updateStatus('completed')" icon="i-heroicons-check-badge" color="success" class="font-semibold">
                Complete Order
              </UButton>
              <UButton :loading="isUpdating" v-if="!['completed', 'cancelled'].includes(order.status)" @click="updateStatus('cancelled')" color="error" variant="subtle" class="font-semibold">
                Cancel Order
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Items -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-lg text-gray-900 dark:text-white">Order Items</h3>
              <UButton :to="`/api/orders/${order.id}/invoice-pdf`" target="_blank" icon="i-heroicons-document-text" color="primary" variant="soft" size="sm">
                Preview Invoice
              </UButton>
            </div>
          </template>

          <div class="space-y-4">
            <div v-for="item in order.items" :key="item.id" class="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">{{ item.productName }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">SKU: {{ item.productSku }} <span class="mx-1">&bull;</span> Qty: {{ item.quantity }}</p>
              </div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(item.lineTotal) }}</p>
            </div>
            
            <div class="pt-4 space-y-3">
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{{ formatCurrency(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Unique Code</span>
                <span>{{ formatCurrency(order.uniqueCode) }}</span>
              </div>
              <div class="flex justify-between font-bold text-xl pt-4 border-t border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
                <span>Total</span>
                <span class="text-primary-500">{{ formatCurrency(order.total) }}</span>
              </div>
            </div>
          </div>
        </UCard>
        
        <!-- Payment Proof -->
        <UCard>
          <template #header>
            <h3 class="font-bold text-lg text-gray-900 dark:text-white">Payment Proof</h3>
          </template>
          
          <div v-if="order.paymentProofUrl" class="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center relative group">
            <img v-if="order.paymentProofUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)" :src="order.paymentProofUrl" class="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105" />
            <div v-else class="text-center">
              <UIcon name="i-heroicons-document" class="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Document File</p>
            </div>
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <UButton :to="order.paymentProofUrl" target="_blank" icon="i-heroicons-arrow-top-right-on-square" color="white" variant="solid">
                Open Full Size
              </UButton>
            </div>
          </div>
          
          <div v-else-if="order.status === 'pending_payment'" class="text-center">
            <input type="file" ref="fileInput" class="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" @change="handleUploadProof" />
            <button 
              @click="triggerUpload" 
              :disabled="isUploadingProof"
              class="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors gap-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <UIcon v-if="isUploadingProof" name="i-heroicons-arrow-path" class="animate-spin w-10 h-10 text-primary-500" />
              <template v-else>
                <UIcon name="i-heroicons-arrow-up-tray" class="w-10 h-10 text-gray-400" />
                <span class="text-sm font-semibold text-gray-900 dark:text-white">Click to upload payment proof</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, PDF up to 5MB</span>
              </template>
            </button>
          </div>
          <div v-else class="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">No payment proof uploaded.</p>
          </div>
        </UCard>
      </div>

      <!-- Right Column: Customer -->
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-lg text-gray-900 dark:text-white">Customer Details</h3>
              <UButton v-if="!isEditing" @click="startEdit" icon="i-heroicons-pencil" color="neutral" variant="ghost" size="sm" />
            </div>
          </template>
          
          <div v-if="isEditing" class="space-y-4">
            <UFormField label="Name">
              <UInput v-model="editData.billingDetails.fullName" />
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="editData.billingDetails.email" type="email" />
            </UFormField>
            <UFormField label="Phone">
              <UInput v-model="editData.billingDetails.phone" />
            </UFormField>
            <UFormField label="Address">
              <UTextarea v-model="editData.billingDetails.address" :rows="3" />
            </UFormField>
          </div>
          <div v-else class="space-y-5">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">Name</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ order.billingDetails.fullName }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">Email</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ order.billingDetails.email }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">Phone</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ order.billingDetails.phone }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">Address</p>
              <p class="font-medium text-gray-900 dark:text-white leading-relaxed">{{ order.billingDetails.address }}</p>
            </div>
          </div>

          <!-- Vessel Details Edit Form (inside the same block if editing) -->
          <template v-if="isEditing && editData.vesselDetails">
            <div class="mt-8 mb-4 border-t border-gray-200 dark:border-gray-800"></div>
            <h3 class="font-bold text-lg mb-4 text-gray-900 dark:text-white">Vessel Details</h3>
            <div class="space-y-4">
              <UFormField label="Vessel Name">
                <UInput v-model="editData.vesselDetails.vesselName" />
              </UFormField>
              <UFormField label="Vessel ID (GT)">
                <UInput v-model="editData.vesselDetails.vesselId" />
              </UFormField>
            </div>
          </template>
          
          <template #footer v-if="isEditing">
            <div class="flex gap-3 justify-end w-full">
              <UButton @click="isEditing = false" color="neutral" variant="soft">Cancel</UButton>
              <UButton @click="saveEdit" color="primary">Save Changes</UButton>
            </div>
          </template>
        </UCard>

        <!-- Vessel Details Display (separate block if not editing) -->
        <UCard v-if="order.vesselDetails && !isEditing">
          <template #header>
            <h3 class="font-bold text-lg text-gray-900 dark:text-white">Vessel Details</h3>
          </template>
          <div class="space-y-5">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">Vessel Name</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ order.vesselDetails.vesselName || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">Vessel ID (GT)</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ order.vesselDetails.vesselId || '-' }}</p>
            </div>
          </div>
        </UCard>
      </div>

    </div>
  </div>
</template>
