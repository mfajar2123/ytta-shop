<template>
  <section class="py-32 bg-apple-offwhite border-t border-apple-lightgray relative" id="spec-section">
    <div class="container mx-auto px-6 max-w-7xl">
      <div class="text-center mb-24 spec-header v-animate fade-up">
        <h2 class="text-4xl md:text-6xl font-bold tracking-tighter text-apple-black">
          Technical Specifications.
        </h2>
      </div>

      <div class="flex flex-col-reverse lg:flex-row gap-16 lg:gap-24 relative">
        
        <!-- Left side Specs list -->
        <div class="w-full lg:w-3/5 space-y-0 v-animate fade-right delay-200">
          
          <!-- Comm & Sensors -->
          <div class="border-t border-apple-lightgray py-10 flex flex-col sm:flex-row gap-6">
            <h3 class="w-full sm:w-1/3 text-xl font-semibold text-apple-black">Communication</h3>
            <div class="w-full sm:w-2/3 space-y-4 text-apple-gray">
              <p>ORBCOMM OGx two-way global satellite service</p>
              <div class="space-y-1 mt-4">
                <p class="text-apple-black font-medium mb-2">Built-in Sensors</p>
                <p>• 3-axis accelerometer</p>
                <p>• Device temperature</p>
                <p>• BLE door sensor compatibility</p>
              </div>
            </div>
          </div>

          <!-- Dimensions -->
          <div class="border-t border-apple-lightgray py-10 flex flex-col sm:flex-row gap-6">
            <h3 class="w-full sm:w-1/3 text-xl font-semibold text-apple-black">Dimensions</h3>
            <div class="w-full sm:w-2/3 space-y-6 text-apple-gray">
              <div>
                <span class="block text-apple-black mb-1 font-medium">Size</span>
                <span>8.8 x 3.0 x 1.1 in (224 x 76 x 28 mm)</span>
              </div>
              <div>
                <span class="block text-apple-black mb-1 font-medium">Material</span>
                <span>Industrial Grade Polycarbonate</span>
              </div>
              <div>
                <span class="block text-apple-black mb-1 font-medium">Color</span>
                <span>Matte White</span>
              </div>
            </div>
          </div>

          <!-- Battery -->
          <div class="border-t border-apple-lightgray py-10 flex flex-col sm:flex-row gap-6">
            <h3 class="w-full sm:w-1/3 text-xl font-semibold text-apple-black">Power & Battery</h3>
            <div class="w-full sm:w-2/3 space-y-6 text-apple-gray">
              <div>
                <span class="block text-apple-black mb-1 font-medium">Type</span>
                <span>Rechargeable Li-ion with Solar Panels</span>
              </div>
              <div>
                <span class="block text-apple-black mb-1 font-medium">Operating Temperature</span>
                <span>-30°C to 70°C (-22°F to 158°F)</span>
              </div>
              <div>
                <span class="block text-apple-black mb-1 font-medium">Storage Temperature</span>
                <span>-40°C to 85°C (-40°F to 185°F)</span>
              </div>
            </div>
          </div>

          <!-- Environmental -->
          <div class="border-t border-apple-lightgray py-10 flex flex-col sm:flex-row gap-6">
            <h3 class="w-full sm:w-1/3 text-xl font-semibold text-apple-black">Environmental</h3>
            <div class="w-full sm:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 text-apple-gray">
              <div>
                <span class="block text-apple-black mb-1 font-medium">Protection Rating</span>
                <span>IP67 & IPX9K</span>
              </div>
              <div>
                <span class="block text-apple-black mb-1 font-medium">Vibration Standard</span>
                <span>AAR-S-9401</span>
              </div>
              <div>
                <span class="block text-apple-black mb-1 font-medium">Shock Resistance</span>
                <span>MIL-STD-810HG</span>
              </div>
            </div>
          </div>

          <!-- GPS & Wireless -->
          <div class="border-t border-apple-lightgray py-10 flex flex-col sm:flex-row gap-6">
            <h3 class="w-full sm:w-1/3 text-xl font-semibold text-apple-black">Wireless</h3>
            <div class="w-full sm:w-2/3 space-y-6 text-apple-gray">
              <div>
                <span class="block text-apple-black mb-2 font-medium">Global Positioning Constellations</span>
                <div class="flex flex-wrap gap-3">
                  <span class="px-3 py-1 bg-apple-white rounded-full text-sm border border-apple-lightgray">GPS</span>
                  <span class="px-3 py-1 bg-apple-white rounded-full text-sm border border-apple-lightgray">GLONASS</span>
                  <span class="px-3 py-1 bg-apple-white rounded-full text-sm border border-apple-lightgray">BeiDou</span>
                  <span class="px-3 py-1 bg-apple-white rounded-full text-sm border border-apple-lightgray">Galileo</span>
                </div>
              </div>
              <div>
                <span class="block text-apple-black mb-1 font-medium">Bluetooth</span>
                <span>BLE 5.2</span>
              </div>
            </div>
          </div>

          <!-- Certifications -->
          <div class="border-t border-apple-lightgray py-10 flex flex-col sm:flex-row gap-6">
            <h3 class="w-full sm:w-1/3 text-xl font-semibold text-apple-black">Certifications</h3>
            <div class="w-full sm:w-2/3">
              <div class="flex flex-wrap gap-x-6 gap-y-2 text-apple-gray text-sm">
                <span>Inmarsat type approval</span>
                <span>FCC/IC</span>
                <span>CE RED 2014/53/EU</span>
                <span>ATEX Zone 2</span>
                <span>CID2</span>
                <span>ROHS</span>
                <span>WEEE</span>
                <span>HERO</span>
              </div>
            </div>
          </div>
          
          <div class="border-t border-apple-lightgray"></div>
        </div>

        <!-- Right side images (Sticky) -->
        <div class="w-full lg:w-2/5 relative">
          <!-- Wrapper container that handles vertical distribution or sticky -->
          <div class="sticky top-32 w-full flex flex-col gap-12 pb-10">
            <!-- Image Container -->
            <div class="w-full max-w-sm mx-auto aspect-[3/4] bg-apple-white border border-apple-lightgray/50 p-8 rounded-[2.5rem] flex flex-col items-center justify-between shadow-xl overflow-hidden group v-animate zoom-in delay-300">
               <NuxtImg src="/img/SC1000-No-BG.png" alt="Orbcomm SC1000 Front Side" format="webp" loading="lazy" width="400" height="200" sizes="sm:100vw md:400px" class="w-full h-auto object-contain transition-transform duration-1000 group-hover:scale-105 drop-shadow-[0_20px_20px_rgba(0,0,0,0.1)]" />
               <NuxtImg src="/img/SC1000-Belakang.png" alt="Orbcomm SC1000 Back Perspective" format="webp" loading="lazy" width="400" height="200" sizes="sm:100vw md:400px" class="w-[85%] h-auto object-contain transition-transform duration-1000 group-hover:translate-y-[-10px] drop-shadow-[0_20px_20px_rgba(0,0,0,0.1)] mt-8" />
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
