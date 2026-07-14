<template>
  <div class="min-h-screen bg-apple-white text-apple-black font-sans antialiased selection:bg-apple-blue selection:text-white relative">
    <Navbar />
    
    <main ref="mainWrapper" class="relative z-10 w-full overflow-hidden">
      <slot />
    </main>

    <Footer />
    
    <WhatsAppFAB />
  </div>
</template>

<script setup lang="ts">
import Navbar from '~/components/Navbar.vue'
import Footer from '~/components/Footer.vue'
import WhatsAppFAB from '~/components/WhatsAppFAB.vue'
</script>
