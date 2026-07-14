<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Admin List Popup -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform scale-95 opacity-0 translate-y-4"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 translate-y-4"
    >
      <div
        v-if="isOpen"
        class="mb-4 bg-apple-white border border-apple-lightgray/50 rounded-2xl shadow-xl overflow-hidden w-72"
      >
        <div class="bg-gradient-to-r from-green-500 to-green-400 p-4">
          <h3 class="text-white font-bold text-lg">Contact Us</h3>
          <p class="text-green-50 text-xs mt-1">We typically reply in a few minutes.</p>
        </div>
        <div class="p-2 space-y-1">
          <a
            v-for="admin in admins"
            :key="admin.name"
            :href="admin.link"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 p-3 rounded-xl hover:bg-apple-offwhite transition-colors group"
          >
            <div class="w-10 h-10 rounded-full bg-apple-offwhite border border-apple-lightgray/30 group-hover:bg-green-50 flex items-center justify-center flex-shrink-0 transition-colors">
              <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
            </div>
            <div>
              <p class="text-sm font-bold text-apple-black group-hover:text-green-600 transition-colors">{{ admin.name }}</p>
              <p class="text-xs text-apple-gray">{{ admin.role }}</p>
            </div>
          </a>
        </div>
      </div>
    </transition>

    <!-- FAB Button -->
    <button
      @click="isOpen = !isOpen"
      class="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      :class="{ 'rotate-180 bg-apple-gray hover:bg-apple-black shadow-none': isOpen }"
      aria-label="Chat with us on WhatsApp"
    >
      <svg v-if="!isOpen" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
      <svg v-else class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const admins = [
  {
    name: 'Rizal',
    role: 'Sales',
    link: 'https://wa.me/6285866125901?text=Hi%20Rizal,%20I%20would%20like%20to%20know%20more%20about%20your%20products.'
  },
  {
    name: 'Helpdesk',
    role: 'Support',
    link: 'https://wa.me/628119359454?text=Hi%20Helpdesk,%20I%20need%20some%20assistance.'
  },
  {
    name: 'A Arif Z',
    role: 'Technical',
    link: 'https://wa.me/62818624497?text=Hi%20Arif,%20I%20have%20a%20technical%20question.'
  }
]
</script>
