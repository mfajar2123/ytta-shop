<script setup lang="ts">
import { XMarkIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import Swal from 'sweetalert2'

const props = defineProps<{
  isOpen: boolean
  product: any
}>()

const emit = defineEmits(['close', 'saved'])

const form = reactive({
  name: '',
  sku: '',
  category: '',
  description: '',
  price: 0,
  imageType: 'device',
  imageUrl: ''
})

const fileInput = ref<HTMLInputElement | null>(null)
const previewImage = ref('')
const isUploading = ref(false)
const isSaving = ref(false)
const errors = reactive<Record<string, string>>({})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.product) {
      Object.assign(form, props.product)
      previewImage.value = props.product.imageUrl || ''
    } else {
      Object.assign(form, {
        name: '', sku: '', category: 'Hardware', description: '', 
        price: 0, imageType: 'device', imageUrl: ''
      })
      previewImage.value = ''
    }
    // clear errors
    Object.keys(errors).forEach(key => delete errors[key])
  }
})

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validate format & size client-side (Max 5MB)
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    Swal.fire('Error', 'Only JPG, PNG and WebP are allowed', 'error')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    Swal.fire('Error', 'File size must be less than 5MB', 'error')
    return
  }

  // Preview local
  previewImage.value = URL.createObjectURL(file)
  
  // Upload to server
  const formData = new FormData()
  formData.append('image', file)

  isUploading.value = true
  try {
    const res = await $fetch<{ url: string }>('/api/upload/product-image', {
      method: 'POST',
      body: formData
    })
    form.imageUrl = res.url
  } catch (error: any) {
    Swal.fire('Upload Failed', error.data?.message || 'Something went wrong', 'error')
    previewImage.value = form.imageUrl // revert to old
  } finally {
    isUploading.value = false
  }
}

const triggerFileInput = () => fileInput.value?.click()

const handleSave = async () => {
  isSaving.value = true
  Object.keys(errors).forEach(key => delete errors[key])

  const payload = {
    ...form,
    price: Number(form.price)
  }

  try {
    if (props.product) {
      await $fetch(`/api/products/${props.product.id}`, { method: 'PUT', body: payload })
      Swal.fire('Success', 'Product updated successfully', 'success')
    } else {
      await $fetch('/api/products', { method: 'POST', body: payload })
      Swal.fire('Success', 'Product created successfully', 'success')
    }
    emit('saved')
    emit('close')
  } catch (error: any) {
    if (error.data?.data) {
      // Zod errors
      error.data.data.forEach((e: any) => {
        errors[e.path[0]] = e.message
      })
    } else {
      Swal.fire('Error', error.data?.message || 'Failed to save product', 'error')
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-light-gray">
        <h3 class="text-xl font-bold text-apple-black">
          {{ product ? 'Edit Product' : 'Add New Product' }}
        </h3>
        <button @click="emit('close')" class="p-2 text-gray-500 hover:bg-off-white rounded-full transition-colors">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 space-y-6">
        
        <!-- Image Upload -->
        <div>
          <label class="block text-sm font-medium text-apple-black mb-2">Product Image (600x313 recommended)</label>
          <div 
            class="border-2 border-dashed border-light-gray rounded-2xl p-4 text-center hover:bg-off-white transition-colors cursor-pointer group relative overflow-hidden h-48 flex flex-col items-center justify-center"
            @click="triggerFileInput"
          >
            <input type="file" ref="fileInput" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleImageUpload" />
            
            <template v-if="previewImage">
              <img :src="previewImage" class="absolute inset-0 w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <span class="bg-white/90 text-apple-black font-medium px-4 py-2 rounded-lg shadow-sm">Change Image</span>
              </div>
            </template>
            <template v-else>
              <PhotoIcon class="w-10 h-10 text-gray-400 mb-2" />
              <p class="text-sm font-medium text-apple-black">Click to upload image</p>
              <p class="text-xs text-gray-500 mt-1">PNG, JPG or WebP up to 5MB</p>
            </template>

            <!-- Loading overlay -->
            <div v-if="isUploading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-apple-black mb-1.5">Product Name</label>
            <input v-model="form.name" type="text" class="w-full px-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue" :class="{'border-red-500': errors.name}" />
            <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-apple-black mb-1.5">SKU</label>
            <input v-model="form.sku" type="text" class="w-full px-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue" :class="{'border-red-500': errors.sku}" />
            <p v-if="errors.sku" class="mt-1 text-sm text-red-500">{{ errors.sku }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-apple-black mb-1.5">Category</label>
            <select v-model="form.category" class="w-full px-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue bg-white appearance-none" :class="{'border-red-500': errors.category}">
              <option value="Hardware">Hardware</option>
              <option value="Bundle">Bundle</option>
              <option value="Subscription">Subscription</option>
            </select>
            <p v-if="errors.category" class="mt-1 text-sm text-red-500">{{ errors.category }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-apple-black mb-1.5">Price (IDR)</label>
            <input v-model="form.price" type="number" class="w-full px-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue" :class="{'border-red-500': errors.price}" />
            <p v-if="errors.price" class="mt-1 text-sm text-red-500">{{ errors.price }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-apple-black mb-1.5">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full px-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-apple-black mb-1.5">Image Display Type</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.imageType" value="device" class="text-apple-blue focus:ring-apple-blue">
              <span class="text-sm">Device Only</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.imageType" value="bundle" class="text-apple-blue focus:ring-apple-blue">
              <span class="text-sm">Bundle</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.imageType" value="sub" class="text-apple-blue focus:ring-apple-blue">
              <span class="text-sm">Subscription</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-light-gray bg-off-white/50 flex justify-end gap-3">
        <button @click="emit('close')" type="button" class="px-6 py-2.5 text-apple-black font-medium hover:bg-gray-200 rounded-xl transition-colors">
          Cancel
        </button>
        <button 
          @click="handleSave" 
          :disabled="isSaving || isUploading"
          class="px-6 py-2.5 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          Save Product
        </button>
      </div>
    </div>
  </div>
</template>
