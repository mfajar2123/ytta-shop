<template>
  <div class="product-card bg-apple-white rounded-2xl border border-apple-lightgray/60 p-6 flex flex-col items-center hover:shadow-xl transition-all duration-300 relative group overflow-hidden v-animate fade-up" :style="`transition-delay: ${delay * 1000}ms`">
    <!-- Hover glow effect -->
    <div class="absolute inset-0 bg-apple-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

    <div class="w-full aspect-square bg-apple-offwhite rounded-xl mb-6 relative overflow-hidden flex items-center justify-center p-6 border border-apple-lightgray/40">
      <NuxtImg :src="product.imageUrl || getImageSrc(product.imageType)" :alt="product.name" format="webp" loading="lazy" width="600" height="313" sizes="sm:100vw md:400px" class="max-w-[95%] max-h-[95%] w-auto h-auto object-contain relative z-10 transition-transform duration-500 group-hover:scale-105 drop-shadow-sm" />
    </div>
    
    <div class="text-center flex-1 w-full flex flex-col pb-4">
      <span class="text-xs font-bold text-apple-gray tracking-wider uppercase mb-2">{{ product.category }}</span>
      <h3 class="text-lg font-bold text-apple-black mb-2 leading-tight flex-1">{{ product.name }}</h3>
      <p class="text-xl font-semibold text-apple-blue">{{ product.price }}</p>
    </div>

    <div class="flex flex-col xl:flex-row gap-3 w-full mt-auto">
      <button @click="$emit('view', product)" class="flex-1 py-3 px-4 rounded-xl font-semibold text-xs tracking-wide transition-all duration-300 bg-apple-offwhite hover:bg-apple-lightgray/50 text-apple-gray border border-apple-lightgray/60 hover:text-apple-black flex items-center justify-center gap-2 active:scale-95">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        View Details
      </button>
      <button @click="handleInstantAdd(product)" class="flex-1 py-3 px-4 rounded-xl font-semibold text-xs tracking-wide transition-all duration-300 bg-apple-blue text-apple-white hover:bg-apple-bluehover active:scale-95 flex items-center justify-center gap-2 shadow-sm shadow-apple-blue/20">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        Add to Cart
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  delay: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['view'])
const { addToCart } = useCart()
import Swal from 'sweetalert2'

const handleInstantAdd = (product: any) => {
  Swal.fire({
    title: 'Add to Cart?',
    text: `Do you want to add ${product.name} to your cart?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#0071E3',
    cancelButtonColor: '#6E6E73',
    confirmButtonText: 'Yes, add it',
    cancelButtonText: 'Cancel',
    background: '#FFFFFF',
    color: '#1D1D1F'
  }).then((result) => {
    if (result.isConfirmed) {
      addToCart(product)
      Swal.fire({
        title: 'Success!',
        text: `${product.name} has been added to your cart.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#FFFFFF',
        color: '#1D1D1F',
        iconColor: '#34C759'
      })
    }
  })
}

const getImageSrc = (type: string) => {
  switch (type) {
    case 'device':
      return '/img/shop/SC1000-No-BG-Device-Only.png'
    case 'sub':
      return '/img/shop/SC1000-No-BG-Subsc-Only.png'
    default:
      return '/img/shop/SC1000-No-BG.png'
  }
}



useIntersectionObserver()
</script>
