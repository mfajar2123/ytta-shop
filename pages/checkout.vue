<template>
  <div class="pt-24 pb-12 min-h-screen bg-apple-offwhite">
    <div class="container mx-auto px-6 max-w-7xl">
      <div class="mb-8 v-animate fade-up">
        <h1 class="text-3xl font-bold text-apple-black mb-2">Checkout</h1>
        <p class="text-apple-gray">Please complete your personal details to process the order.</p>
      </div>

      <!-- Information alert -->
      <div class="bg-apple-white border border-apple-lightgray border-l-4 border-l-apple-blue p-4 rounded-lg mb-8 flex items-start gap-4 v-animate fade-up delay-100 shadow-sm">
        <svg class="w-6 h-6 text-apple-blue mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p class="text-apple-gray text-sm leading-relaxed">
          Please review your items below. The subtotal does not include potential COD shipping fees.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div class="lg:col-span-7 xl:col-span-8">
          <BillingForm />
        </div>
        <div class="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32">
          <OrderSummary />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BillingForm from '~/components/checkout/BillingForm.vue'
import OrderSummary from '~/components/checkout/OrderSummary.vue'
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'

useIntersectionObserver()

definePageMeta({
  layout: 'default'
})
</script>
