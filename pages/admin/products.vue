<script setup lang="ts">
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/vue/24/outline'
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
        <h2 class="text-2xl font-bold text-apple-black">Products</h2>
        <p class="text-gray-500 mt-1">Manage your store products and bundles.</p>
      </div>
      <button 
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2.5 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-xl font-medium transition-colors"
      >
        <PlusIcon class="w-5 h-5" />
        Add Product
      </button>
    </div>

    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-2xl border border-light-gray shadow-sm flex gap-4">
      <div class="relative flex-1 max-w-md">
        <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search products..." 
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue transition-all"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-light-gray shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-light-gray bg-off-white/50">
              <th class="px-6 py-4 text-sm font-medium text-gray-500 w-16">Image</th>
              <th class="px-6 py-4 text-sm font-medium text-gray-500">Name & SKU</th>
              <th class="px-6 py-4 text-sm font-medium text-gray-500">Category</th>
              <th class="px-6 py-4 text-sm font-medium text-gray-500">Price</th>
              <th class="px-6 py-4 text-sm font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-light-gray">
            <tr v-if="pending" class="hover:bg-off-white/50 transition-colors">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">Loading products...</td>
            </tr>
            <tr v-else-if="filteredProducts.length === 0" class="hover:bg-off-white/50 transition-colors">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">No products found.</td>
            </tr>
            <tr v-else v-for="product in filteredProducts" :key="product.id" class="hover:bg-off-white/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-light-gray flex items-center justify-center">
                  <NuxtImg 
                    v-if="product.imageUrl" 
                    :src="product.imageUrl" 
                    class="w-full h-full object-cover" 
                  />
                  <PhotoIcon v-else class="w-6 h-6 text-gray-400" />
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-apple-black">{{ product.name }}</div>
                <div class="text-sm text-gray-500 mt-0.5">{{ product.sku }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg">
                  {{ product.category }}
                </span>
              </td>
              <td class="px-6 py-4 text-apple-black font-medium">
                {{ formatPrice(product.price) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEditModal(product)" class="p-2 text-gray-500 hover:text-apple-blue hover:bg-apple-blue/10 rounded-lg transition-colors">
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button @click="handleDelete(product)" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal -->
    <AdminProductFormModal 
      :is-open="isModalOpen" 
      :product="selectedProduct" 
      @close="closeModal" 
      @saved="refresh" 
    />
  </div>
</template>
