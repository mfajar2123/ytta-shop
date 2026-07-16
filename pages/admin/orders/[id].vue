<script setup lang="ts">
import { 
  ArrowLeftIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  PencilIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
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
    Swal.fire('Saved!', 'Order details updated successfully.', 'success')
    isEditing.value = false
    refresh()
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
    Swal.fire({
      title: 'Processing...',
      html: 'Please wait while we update the status and send emails.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
    try {
      const response = await $fetch<any>(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus, adminNotes: adminNotes.value || undefined }
      })
      
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
      refresh()
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
  Swal.fire({
    title: 'Uploading Proof...',
    html: 'Please wait while the file is being uploaded.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })

  try {
    await $fetch('/api/upload/payment-proof', {
      method: 'POST',
      body: formData
    })
    Swal.fire('Success', 'Payment proof uploaded successfully', 'success')
    refresh()
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
    <div class="flex items-center gap-4">
      <NuxtLink to="/admin/orders" class="p-2 text-gray-500 hover:bg-off-white rounded-lg transition-colors">
        <ArrowLeftIcon class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h2 class="text-2xl font-bold text-apple-black">Order Details</h2>
        <p class="text-gray-500 mt-1" v-if="order">{{ order.invoiceNumber }}</p>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center p-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
    </div>

    <div v-else-if="!order" class="text-center p-12 text-gray-500">
      Order not found.
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left Column: Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Status Banner -->
        <div class="bg-white rounded-2xl border border-light-gray shadow-sm p-6 flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-500 mb-1">Current Status</p>
            <AdminStatusBadge :status="order.status" class="text-sm px-3 py-1.5" />
          </div>
          <div class="flex gap-2">
            <button v-if="order.status === 'payment_uploaded'" @click="updateStatus('verified')" class="px-4 py-2 bg-apple-blue text-white rounded-xl text-sm font-medium hover:bg-apple-blue-hover transition-colors flex items-center gap-2">
              <CheckCircleIcon class="w-4 h-4" /> Verify Payment
            </button>
            <button v-if="order.status === 'verified'" @click="updateStatus('completed')" class="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
              <CheckCircleIcon class="w-5 h-5" />
              Complete Order
            </button>
            <button v-if="!['completed', 'cancelled'].includes(order.status)" @click="updateStatus('cancelled')" class="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2">
              Cancel Order
            </button>
          </div>
        </div>

        <!-- Items -->
        <div class="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-lg text-apple-black">Order Items</h3>
            <a :href="`/api/orders/${order.id}/invoice-pdf`" target="_blank" class="px-3 py-1.5 bg-off-white text-apple-blue rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-2">
              <DocumentTextIcon class="w-4 h-4" /> Preview Invoice PDF
            </a>
          </div>
          <div class="space-y-4">
            <div v-for="item in order.items" :key="item.id" class="flex justify-between items-center py-2 border-b border-light-gray last:border-0">
              <div>
                <p class="font-medium text-apple-black">{{ item.productName }}</p>
                <p class="text-sm text-gray-500">SKU: {{ item.productSku }} x {{ item.quantity }}</p>
              </div>
              <p class="font-medium text-apple-black">{{ formatCurrency(item.lineTotal) }}</p>
            </div>
            
            <div class="pt-4 space-y-2">
              <div class="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{{ formatCurrency(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>Unique Code</span>
                <span>{{ formatCurrency(order.uniqueCode) }}</span>
              </div>
              <div class="flex justify-between font-bold text-lg pt-2 border-t border-light-gray text-apple-black">
                <span>Total</span>
                <span class="text-apple-blue">{{ formatCurrency(order.total) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Payment Proof -->
        <div class="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
          <h3 class="font-bold text-lg mb-4 text-apple-black">Payment Proof</h3>
          
          <div v-if="order.paymentProofUrl" class="aspect-video bg-off-white rounded-xl border border-light-gray overflow-hidden flex items-center justify-center relative group mb-4">
            <img v-if="order.paymentProofUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)" :src="order.paymentProofUrl" class="object-contain w-full h-full" />
            <div v-else class="text-center">
              <DocumentTextIcon class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p class="text-sm font-medium text-gray-600">Document File</p>
            </div>
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a :href="order.paymentProofUrl" target="_blank" class="px-4 py-2 bg-white text-apple-black rounded-lg font-medium text-sm hover:bg-gray-100">
                Open Full Size
              </a>
            </div>
          </div>
          
          <div v-else-if="order.status === 'pending_payment'" class="text-center">
            <input type="file" ref="fileInput" class="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" @change="handleUploadProof" />
            <button 
              @click="triggerUpload" 
              :disabled="isUploadingProof"
              class="w-full py-4 border-2 border-dashed border-light-gray rounded-xl flex flex-col items-center justify-center hover:bg-off-white transition-colors gap-2"
            >
              <div v-if="isUploadingProof" class="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue"></div>
              <template v-else>
                <DocumentTextIcon class="w-8 h-8 text-gray-400" />
                <span class="text-sm font-medium text-apple-black">Click to upload payment proof</span>
                <span class="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</span>
              </template>
            </button>
          </div>
          <div v-else class="text-center p-6 bg-off-white rounded-xl border border-light-gray">
            <p class="text-sm text-gray-500">No payment proof uploaded.</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Customer -->
      <div class="space-y-6">
        <div class="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-lg text-apple-black">Customer Details</h3>
            <button v-if="!isEditing" @click="startEdit" class="text-apple-blue hover:text-apple-blue-hover p-1" title="Edit Details">
              <PencilIcon class="w-5 h-5" />
            </button>
          </div>
          
          <div v-if="isEditing" class="space-y-4 text-sm">
            <div>
              <label class="block text-gray-500 mb-1">Name</label>
              <input v-model="editData.billingDetails.fullName" type="text" class="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-apple-blue" />
            </div>
            <div>
              <label class="block text-gray-500 mb-1">Email</label>
              <input v-model="editData.billingDetails.email" type="email" class="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-apple-blue" />
            </div>
            <div>
              <label class="block text-gray-500 mb-1">Phone</label>
              <input v-model="editData.billingDetails.phone" type="text" class="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-apple-blue" />
            </div>
            <div>
              <label class="block text-gray-500 mb-1">Address</label>
              <textarea v-model="editData.billingDetails.address" rows="3" class="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-apple-blue"></textarea>
            </div>
          </div>
          <div v-else class="space-y-4 text-sm">
            <div>
              <p class="text-gray-500 mb-1">Name</p>
              <p class="font-medium text-apple-black">{{ order.billingDetails.fullName }}</p>
            </div>
            <div>
              <p class="text-gray-500 mb-1">Email</p>
              <p class="font-medium text-apple-black">{{ order.billingDetails.email }}</p>
            </div>
            <div>
              <p class="text-gray-500 mb-1">Phone</p>
              <p class="font-medium text-apple-black">{{ order.billingDetails.phone }}</p>
            </div>
            <div>
              <p class="text-gray-500 mb-1">Address</p>
              <p class="font-medium text-apple-black">{{ order.billingDetails.address }}</p>
            </div>
          </div>

          <!-- Vessel Details Edit Form (inside the same block if editing) -->
          <div v-if="isEditing && editData.vesselDetails" class="mt-6 pt-6 border-t border-light-gray">
            <h3 class="font-bold text-lg mb-4 text-apple-black">Vessel Details</h3>
            <div class="space-y-4 text-sm">
              <div>
                <label class="block text-gray-500 mb-1">Vessel Name</label>
                <input v-model="editData.vesselDetails.vesselName" type="text" class="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-apple-blue" />
              </div>
              <div>
                <label class="block text-gray-500 mb-1">Vessel ID (GT)</label>
                <input v-model="editData.vesselDetails.vesselId" type="text" class="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-apple-blue" />
              </div>
            </div>
          </div>
          
          <div v-if="isEditing" class="mt-6 flex gap-2 justify-end">
            <button @click="isEditing = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button @click="saveEdit" class="px-4 py-2 text-sm font-medium bg-apple-blue text-white hover:bg-apple-blue-hover rounded-xl transition-colors shadow-sm">Save Changes</button>
          </div>
        </div>

        <!-- Vessel Details Display (separate block if not editing) -->
        <div v-if="order.vesselDetails && !isEditing" class="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
          <h3 class="font-bold text-lg mb-4 text-apple-black">Vessel Details</h3>
          <div class="space-y-4 text-sm">
            <div>
              <p class="text-gray-500 mb-1">Vessel Name</p>
              <p class="font-medium text-apple-black">{{ order.vesselDetails.vesselName || '-' }}</p>
            </div>
            <div>
              <p class="text-gray-500 mb-1">Vessel ID (GT)</p>
              <p class="font-medium text-apple-black">{{ order.vesselDetails.vesselId || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
