<template>
  <div class="fixed inset-0 z-[9999] flex flex-col items-center p-4 sm:p-6 md:p-12 bg-apple-black/40 backdrop-blur-sm shadow-2xl modal-container print:bg-white print:p-0 overflow-hidden">
    
    <!-- Invoice Control Panel (Hidden on Print) -->
    <div class="w-full max-w-4xl flex justify-end gap-3 mb-4 print:hidden shrink-0 v-animate fade-down">
      <button @click="$emit('close')" class="px-4 sm:px-6 py-2 sm:py-3 bg-apple-white hover:bg-apple-offwhite text-apple-gray hover:text-apple-black font-bold rounded-xl transition-colors border border-apple-lightgray shadow-sm text-sm sm:text-base">
        Close
      </button>
      <button @click="printPDF" class="px-4 sm:px-6 py-2 sm:py-3 bg-apple-blue hover:bg-apple-bluehover text-apple-white font-bold rounded-xl transition-colors shadow-md flex items-center gap-2 text-sm sm:text-base">
        <svg class="w-5 h-5 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
        Download PDF
      </button>
    </div>

    <!-- The actual Invoice Document -->
    <div class="bg-white text-apple-black w-full max-w-4xl rounded-sm shadow-2xl overflow-y-auto flex-1 print:flex-none print:max-h-none print:shadow-none print:rounded-none invoice-document relative font-['Raleway'] p-8 md:p-16">
      
      <!-- LUNAS Watermark Stamp -->
      <div class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.08] print:opacity-[0.15]">
        <div class="border-[8px] border-red-600 text-red-600 font-black text-8xl md:text-[150px] px-12 py-6 -rotate-45 tracking-widest uppercase rounded-3xl" style="font-family: 'El Messiri', sans-serif;">
          PAID
        </div>
      </div>

      <div class="relative z-10">
        <!-- Header -->
        <div class="flex justify-between items-start border-b-2 border-apple-lightgray pb-6 mb-8">
          <div>
            <h1 class="text-2xl font-bold text-apple-black mb-1">Imani Prima Shop</h1>
            <p class="text-sm text-apple-gray">Graha STR, 2nd Floor</p>
            <p class="text-sm text-apple-gray">Jalan Ampera Raya no. 11</p>
            <p class="text-sm text-apple-gray">Jakarta Selatan, 12550</p>
          </div>
          <div class="text-right">
            <h2 class="text-4xl font-black text-apple-black tracking-widest">INVOICE</h2>
          </div>
        </div>

        <!-- Meta Data Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          <!-- Billed To -->
          <div>
            <table class="text-sm w-full text-apple-black">
              <tbody>
                <tr>
                  <td class="font-bold py-1 w-36 text-apple-gray">Name</td>
                  <td class="py-1 font-medium">: {{ billingDetails.fullName || 'N/A' }}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 align-top text-apple-gray">KTP Address</td>
                  <td class="py-1 font-medium">: {{ billingDetails.address || 'N/A' }}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-apple-gray">NPWP</td>
                  <td class="py-1 font-medium">: {{ billingDetails.npwp || 'N/A' }}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-apple-gray">NIK</td>
                  <td class="py-1 font-medium">: {{ billingDetails.nik || 'N/A' }}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-apple-gray">Phone Number</td>
                  <td class="py-1 font-medium">: {{ billingDetails.phone || 'N/A' }}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-apple-gray">Email</td>
                  <td class="py-1 font-medium">: {{ billingDetails.email || 'N/A' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Ship To & Meta -->
          <div>
            <div class="mb-4">
              <h3 class="font-bold text-sm mb-1 text-apple-gray">Ship To:</h3>
              <p class="text-sm text-apple-black font-medium leading-relaxed">
                {{ billingDetails.address || 'N/A' }}
              </p>
            </div>
            <table class="text-sm w-full text-apple-black">
              <tbody>
                <tr>
                  <td class="font-bold py-1 text-apple-gray">Invoice number</td>
                  <td class="py-1 font-medium">: {{ invoiceNumber }}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-apple-gray">Order Date</td>
                  <td class="py-1 font-medium">: {{ orderDate }}</td>
                </tr>
                <tr>
                  <td class="font-bold py-1 text-apple-gray">Payment Method</td>
                  <td class="py-1 font-medium">: Bank Transfer Payment</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Order Table -->
        <div class="mb-8 border border-apple-lightgray overflow-hidden rounded-md">
          <table class="w-full text-left text-sm">
            <thead class="bg-apple-offwhite border-b border-apple-lightgray">
              <tr>
                <th class="py-3 px-4 font-bold text-apple-black border-r border-apple-lightgray w-3/5">Product</th>
                <th class="py-3 px-4 font-bold text-apple-black border-r border-apple-lightgray text-center w-1/5">Quantity</th>
                <th class="py-3 px-4 font-bold text-apple-black text-right w-1/5">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartItems" :key="item.id" class="border-b border-apple-lightgray last:border-none">
                <td class="py-4 px-4 border-r border-apple-lightgray align-top">
                  <p class="font-bold text-base text-apple-black mb-1">{{ item.name }}</p>
                  <p class="text-apple-gray mb-2">SKU: {{ getSku(item.id) }}</p>
                  
                  <!-- Dynamic Breakdown details -->
                  <div v-if="hasDevice(item.id)">
                    <p class="text-apple-black font-medium text-xs">Perangkat : Rp 5.443.000 / unit</p>
                    <p class="text-apple-gray italic text-[10px] mb-2">*include PPN</p>
                  </div>
                  <div v-if="hasSubscription(item.id)">
                    <p class="text-apple-black font-medium text-xs">Subscriptions: Rp 4.500.000 / Unit</p>
                    <p class="text-apple-gray italic text-[10px]">*include PPN</p>
                  </div>
                </td>
                <td class="py-4 px-4 border-r border-apple-lightgray text-center align-top font-bold text-lg text-apple-black">{{ item.quantity }}</td>
                <td class="py-4 px-4 text-right align-top font-bold text-lg text-apple-black">{{ formatCurrency(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vessel Details -->
        <div class="mb-8 bg-apple-offwhite p-4 border border-apple-lightgray rounded-md" v-if="billingDetails.vesselName || billingDetails.vesselId">
          <h3 class="font-bold text-sm mb-2 text-apple-gray underline">Vessel Details:</h3>
          <table class="text-sm text-apple-black">
            <tbody>
              <tr>
                <td class="py-1 w-32 font-bold text-apple-gray">Vessel Name</td>
                <td class="py-1 font-medium">: {{ billingDetails.vesselName || 'N/A' }}</td>
              </tr>
              <tr>
                <td class="py-1 font-bold text-apple-gray">Vessel ID Book</td>
                <td class="py-1 font-medium">: {{ billingDetails.vesselId || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
          <h3 class="font-bold text-sm mt-3 mb-1 text-apple-gray underline">Notes:</h3>
          <table class="text-sm text-apple-black">
            <tbody>
              <tr>
                <td class="py-1 w-32 font-bold text-apple-gray">Serial Number</td>
                <td class="py-1 font-medium">: {{ serialNumber }}</td>
              </tr>
              <tr>
                <td class="py-1 font-bold text-apple-gray">ID Transmitter</td>
                <td class="py-1 font-medium">: {{ transmitterId }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="flex justify-end mb-16">
          <div class="space-y-2 mt-4 text-sm font-medium w-72">
            <div class="flex justify-between text-apple-gray">
              <span>Subtotal</span>
              <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-apple-gray">
              <span>Unique Payment Code</span>
              <span>{{ formatCurrency(uniqueCode) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold text-apple-black pt-2 border-t border-apple-lightgray">
              <span>Total</span>
              <span class="text-apple-blue">{{ formatCurrency(finalTotal) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-right">
          <p class="text-sm mb-16 text-apple-black font-medium">Jakarta, {{ orderDate }}</p>
          <p class="text-xs text-apple-gray italic">*This invoice is computer-generated<br/>and does not require a physical signature</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  order?: any
}>()

const emit = defineEmits(['close'])

const { cartItems, subtotal, formatCurrency, clearCart } = useCart()
const { billingDetails } = useCheckout()

// Stable generated invoice number and values
const invoiceNumber = ref('')
const orderDate = ref('')
const serialNumber = ref('')
const transmitterId = ref('')
const uniqueCode = ref(0)
const finalTotal = ref(0)

const getSku = (id: number) => {
  if (id === 1) return 'OSC1000-DEV'
  if (id === 3) return 'OSC1000-SUB'
  return 'OSC1000'
}

const hasDevice = (id: number) => {
  return id === 1 || id === 2
}

const hasSubscription = (id: number) => {
  return id === 3 || id === 2
}

const router = useRouter()

const printPDF = () => {
  window.print()
  // Clear cart and redirect after a small timeout to let the print dialog initialize
  setTimeout(() => {
    clearCart()
    emit('close')
    router.push('/shop')
  }, 1000)
}

onMounted(() => {
  document.querySelectorAll('.v-animate').forEach(el => el.classList.add('is-visible'))
  
  // Initialize dynamic stable values using order prop if available
  if (props.order) {
    invoiceNumber.value = props.order.invoiceNumber
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    orderDate.value = new Date(props.order.createdAt).toLocaleDateString('en-US', options)
    uniqueCode.value = props.order.uniqueCode
    finalTotal.value = props.order.total
  } else {
    // Fallback if no order prop
    invoiceNumber.value = `INV.${new Date().getFullYear()}.SC.${Math.floor(10000 + Math.random() * 90000)}`
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    orderDate.value = new Date().toLocaleDateString('en-US', options)
    uniqueCode.value = 22
    finalTotal.value = subtotal.value + uniqueCode.value
  }
  
  serialNumber.value = `KAAB125060${Math.floor(100 + Math.random() * 900)}`
  transmitterId.value = `${Math.floor(1000000 + Math.random() * 9000000)}`
})
</script>

<style>
/* 
  Global print styles to ensure ONLY the invoice modal is printed
*/
@media print {
  /* Hide the main Nuxt app completely */
  #__nuxt {
    display: none !important;
  }
  
  /* Reset background and modal layout for printing */
  body {
    background-color: white !important;
  }
  
  .modal-container {
    position: relative !important;
    inset: auto !important;
    background: transparent !important;
    padding: 0 !important;
    display: block !important;
  }

  .invoice-document {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }
}
</style>
