<template>
  <div class="pt-24 pb-12 min-h-screen bg-apple-offwhite">
    <div class="container mx-auto px-6 max-w-7xl">
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-extrabold text-apple-black tracking-tight mb-2">Shopping Cart</h1>
        <p class="text-apple-gray">Review the items you have added before proceeding to checkout.</p>
      </div>

      <div v-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <!-- Cart Items List -->
        <div class="lg:col-span-8 space-y-6">
          <div 
            v-for="item in cartItems" 
            :key="item.id" 
            class="bg-apple-white border border-apple-lightgray rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 relative"
          >
            <!-- Product Image -->
            <div class="w-full sm:w-32 aspect-square bg-apple-offwhite rounded-xl flex items-center justify-center shrink-0 border border-apple-lightgray/50 p-2 overflow-hidden">
              <NuxtImg :src="getImageSrc(item.imageType)" :alt="item.name" format="webp" loading="lazy" width="200" height="200" sizes="sm:100px md:200px" class="w-full h-full object-contain drop-shadow-sm" />
            </div>

            <!-- Product Details -->
            <div class="flex-1 w-full text-center sm:text-left">
              <h3 class="text-lg font-bold text-apple-black mb-2">{{ item.name }}</h3>
              <p class="text-apple-blue font-medium mb-4">{{ formatCurrency(item.price) }}</p>
              
              <div class="flex items-center justify-center sm:justify-start gap-6">
                <!-- Quantity Controls -->
                <div class="bg-apple-offwhite border border-apple-lightgray rounded-full flex items-center p-1">
                  <button @click="updateQuantity(item.id, -1)" class="w-8 h-8 rounded-full flex items-center justify-center text-apple-gray hover:text-apple-black hover:bg-apple-lightgray/50 transition-colors" :disabled="item.quantity <= 1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                  </button>
                  <span class="w-10 text-center text-apple-black font-medium text-sm">{{ item.quantity }}</span>
                  <button @click="updateQuantity(item.id, 1)" class="w-8 h-8 rounded-full flex items-center justify-center text-apple-gray hover:text-apple-black hover:bg-apple-lightgray/50 transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                
                <!-- Remove Action -->
                <button @click="removeItem(item.id)" class="text-apple-gray hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-1 group">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
            
            <!-- Item Subtotal -->
            <div class="hidden sm:block text-right self-stretch pt-2">
              <span class="block text-xs text-apple-gray mb-1 uppercase font-bold tracking-wider">Subtotal</span>
              <span class="font-bold text-apple-black text-lg">{{ formatCurrency(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <!-- Cart Totals Sidebar -->
        <div class="lg:col-span-4 lg:sticky lg:top-32 v-animate fade-left">
          <div class="bg-apple-white border border-apple-lightgray rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-apple-blue"></div>

            <h3 class="text-xl font-bold text-apple-black mb-6">Order Summary</h3>

            <div class="space-y-4 text-sm mb-6">
              <div class="flex justify-between text-apple-gray">
                <span>Total Price ({{ totalItems }} items)</span>
                <span class="text-apple-black">{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-apple-gray">
                <span>Discount</span>
                <span class="text-apple-black">Rp 0</span>
              </div>
              <div class="pt-4 border-t border-apple-lightgray flex justify-between font-bold text-xl items-center">
                <span class="text-apple-black">Total Amount</span>
                <span class="text-apple-blue">{{ formatCurrency(subtotal) }}</span>
              </div>
            </div>

            <NuxtLink to="/checkout" class="w-full py-4 rounded-xl bg-apple-blue hover:bg-apple-bluehover text-apple-white font-bold transition-colors shadow-md flex justify-center items-center gap-2 group mb-4">
              Proceed to Checkout
              <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </NuxtLink>
            
            <NuxtLink to="/shop" class="w-full py-3 rounded-xl border border-apple-lightgray hover:bg-apple-lightgray/50 text-apple-gray hover:text-apple-black font-medium transition-colors flex justify-center items-center">
              Continue Shopping
            </NuxtLink>
          </div>
        </div>

      </div>

      <!-- Empty Cart State -->
      <div v-else class="py-20 text-center bg-apple-white border border-apple-lightgray rounded-3xl shadow-sm">
        <div class="w-24 h-24 bg-apple-offwhite rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-apple-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
        <h3 class="text-2xl font-bold text-apple-black mb-3">Your Cart is Empty</h3>
        <p class="text-apple-gray mb-8 max-w-md mx-auto">You haven't added any products to your cart yet. Please check out our featured products.</p>
        <NuxtLink to="/shop" class="inline-block px-8 py-4 bg-apple-blue text-apple-white font-bold rounded-full hover:bg-apple-bluehover transition-colors">
          Start Shopping Now
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'

useIntersectionObserver()

definePageMeta({
  layout: 'default'
})

const { 
  cartItems, 
  updateQuantity, 
  removeItem, 
  totalItems, 
  subtotal, 
  formatCurrency 
} = useCart()

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
</script>
