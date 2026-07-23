<script setup lang="ts">
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { data: products, pending, refresh } = await useFetch('/api/products')

const isModalOpen = ref(false)
const selectedProduct = ref<any>(null)
const searchQuery = ref('')

const filteredProducts = computed(() => {
  if (!products.value) return []
  if (!searchQuery.value) return products.value
  
  const query = searchQuery.value.toLowerCase()
  return products.value.filter((p: any) => 
    p.name.toLowerCase().includes(query) || 
    p.sku.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  )
})

const columns = [
  { accessorKey: 'image', header: 'Image' },
  { accessorKey: 'details', header: 'Name & SKU' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'price', header: 'Price' },
  { id: 'actions', header: '' }
]

const openCreateModal = () => {
  selectedProduct.value = null
  isModalOpen.value = true
}

const openEditModal = (product: any) => {
  selectedProduct.value = { ...product }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    selectedProduct.value = null
  }, 200) // wait for animation
}

const handleDelete = async (product: any) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to delete ${product.name}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Yes, delete it!'
  })

  if (result.isConfirmed) {
    try {
      await $fetch(`/api/products/${product.id}`, { method: 'DELETE' })
      Swal.fire('Deleted!', 'Product has been deleted.', 'success')
      refresh()
    } catch (error) {
      Swal.fire('Error!', 'Failed to delete product.', 'error')
    }
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Products</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your store products and bundles.</p>
      </div>
      <UButton 
        icon="i-heroicons-plus" 
        color="primary" 
        size="md" 
        class="font-medium"
        @click="openCreateModal"
      >
        Add Product
      </UButton>
    </div>

    <!-- Toolbar -->
    <UCard>
      <div class="max-w-md">
        <UInput 
          v-model="searchQuery" 
          icon="i-heroicons-magnifying-glass" 
          placeholder="Search products..." 
          size="md"
        />
      </div>
    </UCard>

    <!-- Table -->
    <UCard class="overflow-hidden">
      <UTable 
        :data="filteredProducts" 
        :columns="columns" 
        :loading="pending"
        class="w-full"
      >
        <template #empty>
          <div class="p-12 text-center text-gray-500 dark:text-gray-400">
            No products found.
          </div>
        </template>
        
        <template #image-cell="{ row }">
          <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <NuxtImg 
              v-if="row.original.imageUrl" 
              :src="row.original.imageUrl" 
              class="w-full h-full object-cover" 
            />
            <UIcon v-else name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
          </div>
        </template>
        
        <template #details-cell="{ row }">
          <div class="font-medium text-gray-900 dark:text-white">{{ row.original.name }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ row.original.sku }}</div>
        </template>
        
        <template #category-cell="{ row }">
          <UBadge color="neutral" variant="subtle" class="font-medium">{{ row.original.category }}</UBadge>
        </template>
        
        <template #price-cell="{ row }">
          <div class="text-gray-900 dark:text-white font-medium">
            {{ formatPrice(row.original.price) }}
          </div>
        </template>
        
        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UButton 
              icon="i-heroicons-pencil" 
              color="neutral" 
              variant="ghost" 
              size="sm" 
              @click="openEditModal(row.original)" 
            />
            <UButton 
              icon="i-heroicons-trash" 
              color="error" 
              variant="ghost" 
              size="sm" 
              @click="handleDelete(row.original)" 
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Form Modal -->
    <AdminProductFormModal 
      :is-open="isModalOpen" 
      :product="selectedProduct" 
      @close="closeModal" 
      @saved="refresh" 
    />
  </div>
</template>
