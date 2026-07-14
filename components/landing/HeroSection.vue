<template>
  <section class="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-16 overflow-hidden bg-apple-white">
    <!-- Subtle glow behind the device -->
    <div class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <div class="w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-apple-lightgray/40 rounded-full blur-[120px] translate-y-1/4"></div>
    </div>

    <div class="container mx-auto px-6 max-w-7xl relative z-10 flex flex-col items-center text-center h-full justify-between gap-12">
      
      <!-- Text Content -->
      <div class="hero-content space-y-6 max-w-4xl mx-auto v-animate fade-up mt-12">
        <h2 class="text-apple-gray font-semibold tracking-widest uppercase text-xs sm:text-sm">
          ORBCOMM OGx Network
        </h2>
        <h1 class="text-5xl sm:text-8xl md:text-[9rem] font-black tracking-tighter text-apple-black leading-[0.9] mt-2">
          SC1000<span class="text-apple-blue">.</span>
        </h1>
        <p class="text-xl sm:text-3xl text-apple-black font-medium tracking-tight mt-6">
          Autonomous tracking. Global reach.
        </p>
        <p class="text-lg text-apple-gray font-light max-w-2xl mx-auto mt-4">
          The ultimate solar-powered Vessel Monitoring System (VMS). Experience seamless two-way satellite connectivity and rugged endurance designed for the harshest environments.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-10 w-full sm:w-auto px-4 sm:px-0">
          <NuxtLink to="/shop" class="w-full sm:w-auto px-8 py-4 bg-apple-blue text-apple-white font-semibold rounded-full hover:bg-apple-bluehover transition-colors duration-300 text-lg shadow-md shadow-apple-blue/20 text-center">
            Buy Now
          </NuxtLink>
          <a href="https://wa.me/6285866125901?text=Hello%20Imani%20Prima,%20I'm%20interested%20in%20the%20Orbcomm%20SC1000%20product." target="_blank" class="text-apple-blue hover:text-apple-bluehover transition-colors font-medium text-lg flex items-center gap-2 group">
            Contact Sales 
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>

      <!-- Device Image container -->
      <div class="hero-image relative w-full max-w-5xl mx-auto mt-auto v-animate fade-up delay-300">
        <div class="relative w-full aspect-[16/9] sm:aspect-[21/9] flex items-end justify-center overflow-visible">
          <!-- Main Product Image -->
          <NuxtImg src="/img/SC1000-No-BG.png" alt="Orbcomm SC1000 Device" format="webp" preload width="800" height="400" sizes="sm:100vw md:800px" class="w-[80%] sm:w-[60%] h-auto object-contain relative z-10 drop-shadow-[0_30px_40px_rgba(0,0,0,0.15)] transform translate-y-12 sm:translate-y-24" />
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'

useIntersectionObserver()
</script>
