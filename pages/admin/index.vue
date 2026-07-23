<script setup lang="ts">
import { 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  ClockIcon, 
  CubeIcon
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
    <div v-if="user" class="bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-primary-500/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-10 right-20 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
      
      <div class="z-10 relative">
        <h1 class="text-3xl font-bold tracking-tight mb-2">Hello, {{ user.fullName || user.username }}! 👋</h1>
        <p class="text-primary-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
          Welcome back to your Imani Admin Dashboard. Here's a quick overview of what's happening with your store today.
        </p>
      </div>
      
      <div class="hidden md:flex z-10 shrink-0 bg-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20 items-center gap-4">
        <UAvatar :alt="user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'" size="lg" class="bg-white text-primary-600 font-bold shadow-sm" />
        <div>
          <p class="text-xs text-primary-100 font-bold uppercase tracking-wider">{{ user.role === 'superadmin' ? 'Super Admin' : 'Admin' }}</p>
          <p class="font-bold text-white">{{ user.username }}</p>
        </div>
      </div>
    </div>

    <div v-else>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Overview</h2>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your store today.</p>
    </div>

    <!-- Error Alert -->
    <UAlert
      v-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      title="Failed to load dashboard data"
      :description="error.data?.message || error.message || 'Cannot connect to database or server is offline.'"
    />

    <!-- Stats Grid -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard v-for="i in 4" :key="i" :ui="{ body: { padding: 'p-6' } }">
        <div class="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 animate-pulse"></div>
        <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse"></div>
      </UCard>
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
        <UCard :ui="{ header: { padding: 'p-6' }, body: { padding: 'p-0' } }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Recent Orders</h3>
              <UButton 
                to="/admin/orders" 
                color="primary" 
                variant="link" 
                trailing-icon="i-heroicons-chevron-right" 
                class="font-medium px-0"
              >
                View All
              </UButton>
            </div>
          </template>
          
          <div v-if="pending" class="p-6 text-center text-gray-500 dark:text-gray-400">Loading orders...</div>
          <div v-else-if="!statsData?.recentOrders?.length" class="p-12 text-center text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 m-6 rounded-xl">
            No orders found.
          </div>
          <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
            <div v-for="order in statsData.recentOrders" :key="order.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">{{ order.invoiceNumber }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ new Date(order.createdAt).toLocaleDateString('id-ID') }} &bull; {{ order.billingDetails?.fullName }}</p>
              </div>
              <div class="text-right flex flex-col items-end">
                <p class="font-bold text-gray-900 dark:text-white mb-2">
                  Rp {{ order.total.toLocaleString('id-ID') }}
                </p>
                <AdminStatusBadge :status="order.status" />
              </div>
            </div>
          </div>
        </UCard>
        
        <!-- Recent Products Preview -->
        <UCard :ui="{ header: { padding: 'p-6' }, body: { padding: 'p-6' } }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Product Showcase Preview</h3>
              <UButton 
                to="/admin/products" 
                color="primary" 
                variant="link" 
                trailing-icon="i-heroicons-chevron-right" 
                class="font-medium px-0"
              >
                Manage
              </UButton>
            </div>
          </template>
          
          <div v-if="pending" class="text-center text-gray-500">Loading products...</div>
          <div v-else-if="!statsData?.recentProducts?.length" class="p-12 text-center text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            No products found.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="product in statsData.recentProducts" :key="product.id" class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-primary-500 dark:hover:border-primary-500 transition-colors group relative bg-white dark:bg-gray-900">
              <div class="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <NuxtImg :src="product.imageUrl || (product.imageType === 'device' ? '/img/shop/SC1000-No-BG-Device-Only.png' : product.imageType === 'sub' ? '/img/shop/SC1000-No-BG-Subsc-Only.png' : '/img/shop/SC1000-No-BG.png')" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div class="p-4">
                <span class="text-[10px] font-bold tracking-wider text-primary-600 dark:text-primary-400 uppercase mb-1 block">{{ product.category }}</span>
                <p class="font-medium text-gray-900 dark:text-white truncate">{{ product.name }}</p>
                <p class="text-sm font-bold text-gray-900 dark:text-white mt-1">Rp {{ product.price.toLocaleString('id-ID') }}</p>
              </div>
            </div>
          </div>
        </UCard>

      </div>

      <!-- Quick Actions -->
      <UCard class="h-fit sticky top-24" :ui="{ header: { padding: 'p-6' }, body: { padding: 'p-6' } }">
        <template #header>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Quick Actions</h3>
        </template>
        <div class="space-y-3">
          <NuxtLink to="/admin/products" class="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
            <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UIcon name="i-heroicons-cube" class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Manage Products</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Add or edit products</p>
            </div>
          </NuxtLink>
          
          <NuxtLink to="/admin/orders" class="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
            <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UIcon name="i-heroicons-clock" class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Pending Orders</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Review new orders</p>
            </div>
          </NuxtLink>
        </div>
      </UCard>
    </div>
  </div>
</template>
