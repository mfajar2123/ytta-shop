<template>
  <div class="bg-apple-white border border-apple-lightgray p-6 md:p-8 rounded-2xl shadow-sm">
    <h2 class="text-2xl font-bold text-apple-black mb-8 pb-4 border-b border-apple-lightgray">Billing Details</h2>

    <form class="space-y-6" @submit.prevent>
      
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-apple-black">Full Name <span class="text-red-500">*</span></label>
        <input v-model="billingDetails.fullName" type="text" class="w-full bg-apple-offwhite border border-apple-lightgray rounded-lg px-4 py-3 text-apple-black focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-apple-blue transition-all placeholder:text-apple-gray" placeholder="John Doe" required>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-semibold text-apple-black">WhatsApp Number <span class="text-red-500">*</span></label>
        <input v-model="billingDetails.phone" type="tel" class="w-full bg-apple-offwhite border border-apple-lightgray rounded-lg px-4 py-3 text-apple-black focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-apple-blue transition-all placeholder:text-apple-gray" placeholder="0812xxxxxx" required>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-semibold text-apple-black">Registered Address <span class="text-red-500">*</span></label>
        <textarea v-model="billingDetails.address" rows="3" class="w-full bg-apple-offwhite border border-apple-lightgray rounded-lg px-4 py-3 text-apple-black focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-apple-blue transition-all placeholder:text-apple-gray resize-none" placeholder="Street name and house number" required></textarea>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-apple-black">Tax ID (NPWP)</label>
          <input v-model="billingDetails.npwp" type="text" class="w-full bg-apple-offwhite border border-apple-lightgray rounded-lg px-4 py-3 text-apple-black focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-apple-blue transition-all placeholder:text-apple-gray">
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-apple-black">National ID (NIK)</label>
          <input v-model="billingDetails.nik" type="text" class="w-full bg-apple-offwhite border border-apple-lightgray rounded-lg px-4 py-3 text-apple-black focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-apple-blue transition-all placeholder:text-apple-gray">
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-semibold text-apple-black">Email Address <span class="text-red-500">*</span></label>
        <input v-model="billingDetails.email" type="email" class="w-full bg-apple-offwhite border border-apple-lightgray rounded-lg px-4 py-3 text-apple-black focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-apple-blue transition-all placeholder:text-apple-gray" required>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-apple-black">Vessel Name</label>
          <input v-model="billingDetails.vesselName" type="text" class="w-full bg-apple-offwhite border border-apple-lightgray rounded-lg px-4 py-3 text-apple-black focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-apple-blue transition-all placeholder:text-apple-gray">
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-apple-black">Vessel ID Book</label>
          <input v-model="billingDetails.vesselId" type="text" class="w-full bg-apple-offwhite border border-apple-lightgray rounded-lg px-4 py-3 text-apple-black focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-apple-blue transition-all placeholder:text-apple-gray">
        </div>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
const { billingDetails } = useCheckout()
</script>
