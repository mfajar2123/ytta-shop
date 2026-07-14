<template>
  <section class="py-32 bg-apple-white relative z-10 overflow-hidden">
    <div class="container mx-auto px-6 max-w-7xl relative z-10">
      <div class="text-center mb-12 md:mb-20 v-animate fade-up">
        <h2 class="text-4xl md:text-7xl font-bold text-apple-black tracking-tighter mb-6">
          Powerful features.<br/>Packed in one device.
        </h2>
      </div>

      <!-- Bento Box Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[300px]">
        
        <!-- Box 1: Solar Power (Large) -->
        <div class="md:col-span-2 md:row-span-2 bg-apple-offwhite border border-apple-lightgray/50 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden relative group v-animate fade-up min-h-[300px] md:min-h-0">
          <div class="relative z-10 max-w-md">
            <h3 class="text-3xl font-bold text-apple-black mb-4 tracking-tight">Solar-Powered Autonomy.</h3>
            <p class="text-apple-gray text-lg leading-relaxed">
              Equipped with a built-in solar panel and highly efficient lithium-ion battery, the SC1000 operates autonomously without requiring any external power source.
            </p>
          </div>
          <!-- Abstract Graphic for Solar -->
          <div class="absolute bottom-0 right-0 w-3/4 h-3/4 translate-x-1/4 translate-y-1/4 group-hover:scale-105 transition-transform duration-700">
            <div class="w-full h-full rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 blur-3xl opacity-50"></div>
          </div>
          <div class="absolute bottom-10 right-10 z-10 text-yellow-500 opacity-90 drop-shadow-md">
            <svg class="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </div>
        </div>

        <!-- Box 2: Satellite -->
        <div class="md:col-span-1 md:row-span-1 bg-apple-offwhite border border-apple-lightgray/50 rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden relative group v-animate fade-up delay-100 min-h-[250px] md:min-h-0">
          <div class="relative z-10">
            <h3 class="text-2xl font-bold text-apple-black mb-2 tracking-tight">OGx Network.</h3>
            <p class="text-apple-gray text-sm leading-relaxed">
              Next-generation two-way satellite connectivity powered by ORBCOMM OGx for global monitoring.
            </p>
          </div>
          <div class="absolute bottom-6 right-6 text-apple-blue group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform duration-500">
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>

        <!-- Box 3: Rugged -->
        <div class="md:col-span-1 md:row-span-1 bg-apple-offwhite border border-apple-lightgray/50 rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden relative group v-animate fade-up delay-200 min-h-[250px] md:min-h-0">
          <div class="relative z-10">
            <h3 class="text-2xl font-bold text-apple-black mb-2 tracking-tight">Built to Survive.</h3>
            <p class="text-apple-gray text-sm leading-relaxed">
              IP67 and IPX9K rated. Withstands extreme shock, vibration, and harsh temperatures (-30°C to 70°C).
            </p>
          </div>
          <div class="absolute bottom-6 right-6 text-apple-gray group-hover:scale-110 transition-transform duration-500">
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
        </div>

        <!-- Box 4: Integration (Wide) -->
        <div class="md:col-span-3 md:row-span-1 bg-apple-offwhite border border-apple-lightgray/50 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden relative group v-animate fade-up delay-300 min-h-[250px] md:min-h-0">
          <div class="relative z-10 max-w-xl mb-6 md:mb-0">
            <h3 class="text-3xl font-bold text-apple-black mb-4 tracking-tight">Versatile Sensor Integration.</h3>
            <p class="text-apple-gray text-lg leading-relaxed">
              Featuring built-in 3-axis accelerometers and BLE 5.2 connectivity to seamlessly pair with wireless door, temperature, and other specialized sensors.
            </p>
          </div>
          <div class="flex items-center gap-4 relative z-10">
            <div class="w-16 h-16 rounded-full bg-apple-white flex items-center justify-center border border-apple-lightgray group-hover:border-apple-gray transition-colors">
              <svg class="w-8 h-8 text-apple-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            </div>
            <div class="w-16 h-16 rounded-full bg-apple-blue text-apple-white flex items-center justify-center font-bold text-xl shadow-md">
              BLE
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'

useIntersectionObserver()
</script>
