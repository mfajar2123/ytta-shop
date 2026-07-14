<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-10 bg-apple-black/40 backdrop-blur-sm overflow-y-auto" @click.self="$emit('close')">
    <div class="bg-apple-white border border-apple-lightgray rounded-2xl shadow-2xl w-full max-w-5xl relative flex flex-col my-auto v-animate zoom-in">
      
      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-4 right-4 text-apple-gray hover:text-apple-black bg-apple-offwhite hover:bg-apple-lightgray w-8 h-8 flex items-center justify-center rounded-full transition-colors z-50">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>

      <div class="p-6 md:p-10">
        <!-- Breadcrumbs -->
        <nav class="text-sm text-apple-gray mb-8 font-medium">
          <NuxtLink to="/" class="hover:text-apple-blue transition-colors">Home</NuxtLink>
          <span class="mx-2">/</span>
          <NuxtLink to="/shop" class="hover:text-apple-blue transition-colors">Shop</NuxtLink>
          <span class="mx-2">/</span>
          <span class="text-apple-black">{{ product.name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <!-- Product Image -->
          <div class="bg-apple-offwhite rounded-2xl border border-apple-lightgray/50 p-8 flex items-center justify-center aspect-square relative group">
            <div class="absolute inset-0 bg-apple-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <NuxtImg :src="getImageSrc(product.imageType)" :alt="product.name" format="webp" loading="lazy" width="600" height="600" sizes="sm:100vw md:600px" class="w-4/5 h-auto object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105" />
          </div>

          <!-- Product Info -->
          <div class="flex flex-col">
            <h1 class="text-3xl md:text-4xl font-bold text-apple-black mb-4">{{ product.name }}</h1>
            <p class="text-3xl font-bold text-apple-blue mb-6">{{ product.price }}</p>

            <!-- Breakdown -->
            <div class="bg-apple-offwhite border border-apple-lightgray rounded-xl p-5 mb-8 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-apple-gray">Device</span>
                <span class="text-apple-black font-medium">{{ product.price }} / unit</span>
              </div>
              <div class="flex justify-between text-sm text-apple-gray">
                <span>*Shipping fee not included</span>
                <span>*Includes 11% PPN</span>
              </div>
            </div>

            <!-- Action Area -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 mt-auto pt-4 border-t border-apple-lightgray">
              <div class="flex items-center gap-4">
                <span class="text-sm font-bold text-apple-gray uppercase tracking-wider hidden sm:block">Quantity</span>
                <div class="bg-apple-offwhite border border-apple-lightgray rounded-full flex items-center p-1">
                  <button @click="quantity > 1 ? quantity-- : null" class="w-10 h-10 rounded-full flex items-center justify-center text-apple-gray hover:text-apple-black hover:bg-apple-lightgray/50 transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                  </button>
                  <span class="w-12 text-center text-apple-black font-bold">{{ quantity }}</span>
                  <button @click="quantity++" class="w-10 h-10 rounded-full flex items-center justify-center text-apple-gray hover:text-apple-black hover:bg-apple-lightgray/50 transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
              </div>
              
              <button @click="handleAddToCart" class="w-full sm:flex-1 py-4 bg-apple-blue hover:bg-apple-bluehover text-apple-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex justify-center items-center gap-2 group">
                <svg class="w-5 h-5 transition-transform group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        <!-- Description Section -->
        <div class="mt-12 pt-10 border-t border-apple-lightgray">
          <div class="flex gap-8 border-b border-apple-lightgray mb-8">
            <button @click="activeTab = 'description'" :class="activeTab === 'description' ? 'text-apple-blue border-apple-blue' : 'text-apple-gray hover:text-apple-black border-transparent'" class="pb-4 font-bold border-b-2 transition-all">Description</button>
            <button @click="activeTab = 'additional'" :class="activeTab === 'additional' ? 'text-apple-blue border-apple-blue' : 'text-apple-gray hover:text-apple-black border-transparent'" class="pb-4 font-bold border-b-2 transition-all">Additional Information</button>
          </div>

          <div v-if="activeTab === 'description'" class="prose prose-invert max-w-none text-apple-gray font-light leading-relaxed">
            <h3 class="text-xl font-bold text-apple-black mb-4">{{ product.name }} Vessel Monitoring System (VMS) with Solar Panel</h3>
            <p class="mb-4">
              {{ product.name }} is the latest generation of Vessel Monitoring System (VMS) owned by PT IMANI PRIMA based on orbital satellites for commercial and fishing vessels above 30 GT. This device is specifically designed to meet the latest regulatory standards of the Ministry of Marine Affairs and Fisheries (KKP) regarding marine data integration compliance.
            </p>
            <p class="mb-8">
              Utilizing dual-mode satellite and cellular connectivity, {{ product.name }} guarantees real-time transmission of vessel location, speed, and heading to the national monitoring center, optimizing licensing document validation, and supporting fleet operational efficiency.
            </p>
            <h4 class="text-lg font-bold text-apple-black mb-4">Inside the box:</h4>
            <ul class="list-disc pl-5 space-y-2 text-apple-gray">
              <li>1x {{ product.name }} Device Only</li>
              <li>2x Heavy-Duty Mounting Bracket</li>
              <li>1x Auxiliary Power Connector Cable</li>
              <li>1x KKP Security Seal</li>
              <li>1x Operation & Activation Manual</li>
            </ul>
          </div>

          <div v-else class="text-apple-gray font-light leading-relaxed space-y-6">
            <div class="bg-apple-offwhite border border-apple-lightgray rounded-xl p-6 max-w-xl">
              <h4 class="text-lg font-bold text-apple-black mb-4">Pricing Breakdown</h4>
              <table class="w-full text-left text-sm">
                <tbody>
                  <tr class="border-b border-apple-lightgray">
                    <td class="py-3 font-bold text-apple-gray">Perangkat (Device Only)</td>
                    <td class="py-3 text-right text-apple-black">Rp 5.443.000 / unit</td>
                  </tr>
                  <tr>
                    <td class="py-3 font-bold text-apple-gray">Subscriptions (1 Year)</td>
                    <td class="py-3 text-right text-apple-black">Rp 4.500.000 / Unit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
const { addToCart } = useCart()

const quantity = ref(1)
const activeTab = ref('description')

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

const handleAddToCart = () => {
  for(let i=0; i<quantity.value; i++){
    addToCart(props.product)
  }
  
  Swal.fire({
    title: 'Success!',
    text: `${quantity.value}x ${props.product.name} has been added to your cart.`,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    background: '#FFFFFF',
    color: '#1D1D1F',
    iconColor: '#34C759'
  })
  
  emit('close')
}

onMounted(() => {
  setTimeout(() => {
    document.querySelectorAll('.v-animate').forEach(el => el.classList.add('is-visible'))
  }, 50)
})
</script>
