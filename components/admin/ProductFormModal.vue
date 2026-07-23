<script setup lang="ts">
import Swal from 'sweetalert2'

const props = defineProps<{
  isOpen: boolean
  product: any
}>()

const emit = defineEmits(['close', 'saved'])

const internalIsOpen = computed({
  get: () => props.isOpen,
  set: (val) => {
    if (!val) emit('close')
  }
})

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

const categoryOptions = [
  { label: 'Hardware', value: 'Hardware' },
  { label: 'Bundle', value: 'Bundle' },
  { label: 'Subscription', value: 'Subscription' }
]

const imageTypeOptions = [
  { value: 'device', label: 'Device Only' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'sub', label: 'Subscription' }
]
</script>

<template>
  <UModal v-model:open="internalIsOpen">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ product ? 'Edit Product' : 'Add New Product' }}
            </h3>
            <UButton 
              color="neutral" 
              variant="ghost" 
              icon="i-heroicons-x-mark" 
              class="-my-1" 
              @click="emit('close')" 
            />
          </div>
        </template>

        <!-- Body -->
        <div class="space-y-6 max-h-[60vh] overflow-y-auto px-2 pb-2">
          
          <!-- Image Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Product Image (600x313 recommended)</label>
            <div 
              class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group relative overflow-hidden h-48 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50"
              @click="triggerFileInput"
            >
              <input type="file" ref="fileInput" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleImageUpload" />
              
              <template v-if="previewImage">
                <img :src="previewImage" class="absolute inset-0 w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <span class="bg-white/90 dark:bg-black/90 text-gray-900 dark:text-white font-medium px-4 py-2 rounded-lg shadow-sm">Change Image</span>
                </div>
              </template>
              <template v-else>
                <UIcon name="i-heroicons-photo" class="w-10 h-10 text-gray-400 mb-2" />
                <p class="text-sm font-medium text-gray-900 dark:text-white">Click to upload image</p>
                <p class="text-xs text-gray-500 mt-1">PNG, JPG or WebP up to 5MB</p>
              </template>

              <!-- Loading overlay -->
              <div v-if="isUploading" class="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-20">
                <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Product Name" :error="errors.name">
              <UInput v-model="form.name" size="md" />
            </UFormField>
            
            <UFormField label="SKU" :error="errors.sku">
              <UInput v-model="form.sku" size="md" />
            </UFormField>
            
            <UFormField label="Category" :error="errors.category">
              <USelect 
                v-model="form.category" 
                :items="categoryOptions"
                size="md"
              />
            </UFormField>
            
            <UFormField label="Price (IDR)" :error="errors.price">
              <UInput v-model="form.price" type="number" size="md" />
            </UFormField>
          </div>

          <UFormField label="Description">
            <UTextarea v-model="form.description" :rows="3" />
          </UFormField>

          <UFormField label="Image Display Type">
            <URadioGroup 
              v-model="form.imageType"
              :items="imageTypeOptions"
            />
          </UFormField>
        </div>

        <!-- Footer -->
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton 
              color="neutral" 
              variant="ghost" 
              @click="emit('close')"
            >
              Cancel
            </UButton>
            <UButton 
              color="primary" 
              :loading="isSaving || isUploading"
              @click="handleSave"
            >
              Save Product
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
