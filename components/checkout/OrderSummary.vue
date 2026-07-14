<template>
  <div class="bg-apple-white border border-apple-lightgray rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
    <div class="absolute top-0 left-0 w-full h-1 bg-apple-blue"></div>

    <h3 class="text-xl font-bold text-apple-black mb-6">Your Order</h3>
    
    <div class="space-y-4 text-sm mb-6">
      <div class="flex justify-between text-apple-gray font-semibold pb-2 border-b border-apple-lightgray">
        <span>Product</span>
        <span>Subtotal</span>
      </div>
      
      <!-- Dynamic Cart Items -->
      <div v-for="item in cartItems" :key="item.id" class="flex justify-between items-start text-apple-gray gap-4">
        <span>{{ item.name }} <span class="text-apple-blue ml-1 text-xs font-bold">× {{ item.quantity }}</span></span>
        <span class="whitespace-nowrap font-semibold text-apple-black">{{ formatCurrency(item.price * item.quantity) }}</span>
      </div>

      <div class="pt-4 border-t border-apple-lightgray flex justify-between text-apple-gray">
        <span>Subtotal</span>
        <span class="text-apple-black">{{ formatCurrency(subtotal) }}</span>
      </div>

      <div class="flex justify-between text-apple-gray">
        <span>Unique Payment Code</span>
        <span class="text-apple-black">Rp 22</span>
      </div>

      <div class="pt-4 border-t border-apple-lightgray flex justify-between font-bold text-lg">
        <span class="text-apple-black">Total</span>
        <span class="text-apple-blue">{{ formatCurrency(subtotal + 22) }}</span>
      </div>
    </div>

    <div class="bg-apple-offwhite rounded-xl p-5 mb-8 border border-apple-lightgray">
      <h4 class="text-apple-black font-bold text-sm mb-3">Bank Transfer Payment</h4>
      <div class="text-apple-gray text-xs leading-relaxed space-y-2">
        <p><strong class="text-apple-black">1.</strong> Make your payment directly into our bank account. Please clear the exact specified amount. Your order will not be shipped until the funds have cleared in our account.</p>
        <p><strong class="text-apple-black">2.</strong> Price excludes shipping. Shipping costs will be paid directly (COD) when the item arrives.</p>
      </div>
    </div>

    <p class="text-xs text-apple-gray leading-relaxed mb-6">
      Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <a href="#" class="text-apple-blue hover:underline">privacy policy</a>.
    </p>

    <button @click="handleOrder" class="w-full py-4 rounded-xl bg-apple-blue hover:bg-apple-bluehover text-apple-white font-bold transition-colors shadow-md flex justify-center items-center gap-2 group">
      Place Order
      <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
    </button>

    <!-- Invoice Modal -->
    <Teleport to="body">
      <InvoiceModal v-if="showInvoice" @close="showInvoice = false" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InvoiceModal from '~/components/checkout/InvoiceModal.vue'
import Swal from 'sweetalert2'

const { cartItems, subtotal, formatCurrency } = useCart()
const { isValid } = useCheckout()
const showInvoice = ref(false)

const handleOrder = () => {
  if (cartItems.value.length === 0) {
    Swal.fire({
      title: 'Cart Empty',
      text: 'Please add items to your cart before proceeding.',
      icon: 'warning',
      confirmButtonColor: '#0071E3',
      background: '#FFFFFF',
      color: '#1D1D1F'
    })
    return
  }

  if (!isValid()) {
    Swal.fire({
      title: 'Incomplete Data',
      text: 'Please complete all required fields (Full Name, WhatsApp, Address, Email) before placing an order.',
      icon: 'error',
      confirmButtonColor: '#0071E3',
      background: '#FFFFFF',
      color: '#1D1D1F'
    })
    return
  }
  
  showInvoice.value = true
}
</script>
