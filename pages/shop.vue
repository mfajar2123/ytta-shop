<template>
  <div class="pt-24 min-h-screen bg-apple-offwhite">
    <!-- Header banner -->
    <div class="bg-apple-white py-12 border-b border-apple-lightgray">
      <div class="container mx-auto px-6 max-w-7xl">
        <h1 class="text-4xl md:text-5xl font-extrabold text-apple-black tracking-tight mb-4 v-animate fade-up">Our <span class="text-apple-blue">Products</span></h1>
        <p class="text-apple-gray font-light max-w-xl v-animate fade-up delay-100">
          Leading solutions for vessel tracking with borderless technology. Choose a package that suits your operational needs.
        </p>
      </div>
    </div>

    <!-- Shop Grid -->
    <div class="container mx-auto px-6 max-w-7xl py-12">
      <div class="flex justify-between items-center mb-8 border-b border-apple-lightgray pb-4">
        <p class="text-apple-gray text-sm">Showing all {{ sortedProducts.length }} results</p>
        <select v-model="sortBy" class="bg-apple-white border border-apple-lightgray text-apple-black text-sm rounded-lg focus:ring-apple-blue focus:border-apple-blue block p-2.5 outline-none shadow-sm cursor-pointer">
          <option value="default">Default sorting</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        <ProductCard 
          v-for="(product, index) in sortedProducts" 
          :key="product.id"
          :product="product"
          :delay="index * 0.1"
          @view="openModal"
        />
      </div>
    </div>

    <!-- Product Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <ProductModal 
          v-if="selectedProduct" 
          :product="selectedProduct" 
          @close="closeModal" 
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ProductCard from '~/components/shop/ProductCard.vue'
import ProductModal from '~/components/shop/ProductModal.vue'
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'

useIntersectionObserver()

const selectedProduct = ref(null)

const openModal = (product: any) => {
  selectedProduct.value = product
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedProduct.value = null
  document.body.style.overflow = 'auto'
}


definePageMeta({
  layout: 'default'
})

const sortBy = ref('default')

// Fetch products from API with graceful fallback to hardcoded data if API fails or empty
const { data: apiProducts, pending } = await useFetch('/api/products')

const fallbackProducts = [
  {
    id: 1,
    name: 'Orbcomm SC1000',
    category: 'Device Only',
    priceValue: 5443000,
    price: 'Rp 5.443.000',
    imageType: 'device'
  },
  {
    id: 2,
    name: 'Orbcomm SC1000 + Subscription 1 Year',
    category: 'Bundle Package',
    priceValue: 9943000,
    price: 'Rp 9.943.000',
    imageType: 'bundle'
  },
  {
    id: 3,
    name: 'Subscription 1 Year',
    category: 'Subscription Only',
    priceValue: 4500000,
    price: 'Rp 4.500.000',
    imageType: 'sub'
  }
]

// Normalize API products to match component expectations
const products = computed(() => {
  if (apiProducts.value && (apiProducts.value as any[]).length > 0) {
    return (apiProducts.value as any[]).map(p => ({
      ...p,
      priceValue: p.price,
      // Format price string for compatibility with existing UI
      price: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)
    }))
  }
  return fallbackProducts
})

const sortedProducts = computed(() => {
  const arr = [...products.value]
  if (sortBy.value === 'asc') {
    arr.sort((a, b) => a.priceValue - b.priceValue)
  } else if (sortBy.value === 'desc') {
    arr.sort((a, b) => b.priceValue - a.priceValue)
  }
  return arr
})
</script>
