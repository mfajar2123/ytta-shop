<template>
  <header class="fixed top-0 left-0 w-full z-50 transition-all duration-300" :class="[isScrolled ? 'bg-apple-white/80 backdrop-blur-md border-b border-apple-lightgray/50 py-3' : 'bg-transparent py-5 border-b border-transparent']">
    <div class="container mx-auto px-6 max-w-7xl flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <span class="text-xl font-bold tracking-tight text-apple-black group-hover:text-apple-gray transition-colors">SHOP</span>
        <div class="h-5 w-px bg-apple-lightgray"></div>
        <span class="text-lg font-medium tracking-tight text-apple-black">Imani</span>
      </NuxtLink>
      
      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink to="/" class="text-sm font-medium text-apple-gray hover:text-apple-black transition-colors tracking-tight">Home</NuxtLink>
        <NuxtLink to="/shop" class="text-sm font-medium text-apple-gray hover:text-apple-black transition-colors tracking-tight">Shop</NuxtLink>
      </nav>

      <div class="flex items-center gap-4">
        <NuxtLink to="/cart" class="flex items-center justify-center h-8 px-4 rounded-full bg-apple-blue text-apple-white font-medium text-xs tracking-wide hover:bg-apple-bluehover transition-colors shadow-sm">
          <span>Cart ({{ totalItems }})</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const { totalItems } = useCart()

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
nav .router-link-exact-active {
  color: #1D1D1F !important;
}
</style>
