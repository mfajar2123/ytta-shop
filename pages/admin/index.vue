<script setup lang="ts">
import { 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  ClockIcon, 
  CubeIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const { user } = useAdminAuth()

const { data: statsData, pending, error } = await useFetch<any>('/api/dashboard/stats')

watch(error, (newError) => {
  if (newError) {
    Swal.fire({
      icon: 'error',
      title: 'Dashboard Error',
      text: newError.data?.message || newError.message || 'Cannot connect to database or server is offline.',
      confirmButtonColor: '#ef4444'
    })
  }
})

const stats = computed(() => {
  if (!statsData.value) {
    return [
      { title: 'Total Revenue', value: 'Rp 0', icon: CurrencyDollarIcon },
      { title: 'Total Orders', value: '0', icon: ShoppingCartIcon },
      { title: 'Pending Payment', value: '0', icon: ClockIcon },
      { title: 'Active Products', value: '0', icon: CubeIcon }
    ]
  }

  const { totalRevenue, totalOrders, pendingOrders, totalProducts } = statsData.value

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return [
    { title: 'Total Revenue', value: formatPrice(totalRevenue), icon: CurrencyDollarIcon },
    { title: 'Total Orders', value: totalOrders.toString(), icon: ShoppingCartIcon },
    { title: 'Pending Payment', value: pendingOrders.toString(), icon: ClockIcon },
    { title: 'Active Products', value: totalProducts.toString(), icon: CubeIcon }
  ]
})
</script>

<template>
  <div class="space-y-8 pb-12 animate-fade-in">
    <!-- Welcome Banner -->
    <div v-if="user" class="bg-gradient-to-r from-apple-blue to-blue-600 rounded-3xl p-8 text-white shadow-lg shadow-apple-blue/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-10 right-20 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
      
      <div class="z-10 relative">
        <h1 class="text-3xl font-bold tracking-tight mb-2">Hello, {{ user.fullName || user.username }}! 👋</h1>
        <p class="text-blue-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
          Welcome back to your Imani Admin Dashboard. Here's a quick overview of what's happening with your store today.
        </p>
      </div>
      
      <div class="hidden md:flex z-10 shrink-0 bg-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20 items-center gap-4">
        <div class="w-12 h-12 bg-white text-apple-blue rounded-xl flex items-center justify-center font-bold text-xl shadow-sm">
          {{ user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A' }}
        </div>
        <div>
          <p class="text-xs text-blue-100 font-bold uppercase tracking-wider">{{ user.role === 'superadmin' ? 'Super Admin' : 'Admin' }}</p>
          <p class="font-bold text-white">{{ user.username }}</p>
        </div>
      </div>
    </div>

    <div v-else>
      <h2 class="text-2xl font-bold text-apple-black">Overview</h2>
      <p class="text-gray-500 mt-1">Here's what's happening with your store today.</p>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <div>
        <p class="font-bold text-sm">Failed to load dashboard data</p>
        <p class="text-sm mt-0.5">{{ error.data?.message || error.message || 'Cannot connect to database or server is offline.' }}</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="i in 4" :key="i" class="bg-white rounded-2xl border border-light-gray p-6 h-32 animate-pulse">
        <div class="h-10 w-10 bg-gray-200 rounded-lg mb-4"></div>
        <div class="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <AdminStatsCard 
        v-for="stat in stats" 
        :key="stat.title"
        v-bind="stat"
      />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <!-- Left Column: Recent Orders & Products Preview -->
      <div class="xl:col-span-2 space-y-8">
        
        <!-- Recent Orders -->
        <div class="bg-white rounded-2xl border border-light-gray shadow-sm overflow-hidden">
          <div class="flex items-center justify-between p-6 border-b border-light-gray">
            <h3 class="text-lg font-bold text-apple-black">Recent Orders</h3>
            <NuxtLink to="/admin/orders" class="text-sm font-medium text-apple-blue hover:underline flex items-center">
              View All <ChevronRightIcon class="w-4 h-4 ml-1" />
            </NuxtLink>
          </div>
          
          <div v-if="pending" class="p-6 text-center text-gray-500">Loading orders...</div>
          <div v-else-if="!statsData?.recentOrders?.length" class="p-12 text-center text-gray-500 border-2 border-dashed border-light-gray m-6 rounded-xl">
            No orders found.
          </div>
          <div v-else class="divide-y divide-light-gray">
            <div v-for="order in statsData.recentOrders" :key="order.id" class="p-4 hover:bg-off-white/50 transition-colors flex items-center justify-between">
              <div>
                <p class="font-medium text-apple-black">{{ order.invoiceNumber }}</p>
                <p class="text-sm text-gray-500">{{ new Date(order.createdAt).toLocaleDateString('id-ID') }} &bull; {{ order.billingDetails?.fullName }}</p>
              </div>
              <div class="text-right flex flex-col items-end">
                <p class="font-medium text-apple-black mb-1">
                  Rp {{ order.total.toLocaleString('id-ID') }}
                </p>
                <AdminStatusBadge :status="order.status" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Products Preview -->
        <div class="bg-white rounded-2xl border border-light-gray shadow-sm overflow-hidden">
          <div class="flex items-center justify-between p-6 border-b border-light-gray">
            <h3 class="text-lg font-bold text-apple-black">Product Showcase Preview</h3>
            <NuxtLink to="/admin/products" class="text-sm font-medium text-apple-blue hover:underline flex items-center">
              Manage <ChevronRightIcon class="w-4 h-4 ml-1" />
            </NuxtLink>
          </div>
          
          <div v-if="pending" class="p-6 text-center text-gray-500">Loading products...</div>
          <div v-else-if="!statsData?.recentProducts?.length" class="p-12 text-center text-gray-500 border-2 border-dashed border-light-gray m-6 rounded-xl">
            No products found.
          </div>
          <div v-else class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="product in statsData.recentProducts" :key="product.id" class="border border-light-gray rounded-xl overflow-hidden hover:border-apple-blue transition-colors group relative">
              <div class="aspect-[16/9] w-full bg-gray-100 overflow-hidden">
                <NuxtImg :src="product.imageUrl || (product.imageType === 'device' ? '/img/shop/SC1000-No-BG-Device-Only.png' : product.imageType === 'sub' ? '/img/shop/SC1000-No-BG-Subsc-Only.png' : '/img/shop/SC1000-No-BG.png')" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div class="p-4 bg-white">
                <span class="text-[10px] font-bold tracking-wider text-apple-blue uppercase mb-1 block">{{ product.category }}</span>
                <p class="font-medium text-apple-black truncate">{{ product.name }}</p>
                <p class="text-sm font-bold text-gray-900 mt-1">Rp {{ product.price.toLocaleString('id-ID') }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl border border-light-gray shadow-sm p-6 h-fit sticky top-6">
        <h3 class="text-lg font-bold text-apple-black mb-6">Quick Actions</h3>
        <div class="space-y-3">
          <NuxtLink to="/admin/products" class="flex items-center gap-3 p-4 rounded-xl border border-light-gray hover:border-apple-blue hover:bg-off-white transition-all group">
            <div class="w-10 h-10 rounded-lg bg-apple-blue/10 text-apple-blue flex items-center justify-center group-hover:scale-110 transition-transform">
              <CubeIcon class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-apple-black">Manage Products</p>
              <p class="text-sm text-gray-500">Add or edit products</p>
            </div>
          </NuxtLink>
          
          <NuxtLink to="/admin/orders" class="flex items-center gap-3 p-4 rounded-xl border border-light-gray hover:border-apple-blue hover:bg-off-white transition-all group">
            <div class="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClockIcon class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-apple-black">Pending Orders</p>
              <p class="text-sm text-gray-500">Review new orders</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
