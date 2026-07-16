<script setup lang="ts">
import { z } from 'zod'
import Swal from 'sweetalert2'

definePageMeta({
  layout: false
})

const { user, fetchUser } = useAdminAuth()
const router = useRouter()

// If already logged in, redirect
onMounted(async () => {
  if (user.value === null) {
    await fetchUser()
  }
  if (user.value) {
    router.push('/admin')
  }
})

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})
const loading = ref(false)
const errors = reactive({
  email: '',
  password: '',
  general: ''
})

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const handleLogin = async () => {
  // Reset errors
  errors.email = ''
  errors.password = ''
  errors.general = ''
  
  // Validate
  try {
    schema.parse(form)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(e => {
        if (e.path[0] === 'email') errors.email = e.message
        if (e.path[0] === 'password') errors.password = e.message
      })
    }
    return
  }

  loading.value = true
  try {
    const api = useApi()
    await api.fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe
      }
    })
    
    // Refresh admin state and redirect
    await fetchUser()
    
    // Show success alert
    Swal.fire({
      icon: 'success',
      title: 'Welcome back!',
      text: 'Successfully logged into admin dashboard',
      confirmButtonColor: '#0071E3',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      navigateTo('/admin')
    })
    
  } catch (error: any) {
    // useApi automatically handles SweetAlert2 popups for errors
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-off-white flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-apple-blue rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
          <span class="text-white text-3xl font-bold font-serif">I</span>
        </div>
        <h1 class="text-2xl font-bold text-apple-black">Imani Admin</h1>
        <p class="text-gray-500 mt-2">Sign in to manage your shop</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-light-gray">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- General Error -->
          <div v-if="errors.general" class="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errors.general }}
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-apple-black mb-1.5">Email Address</label>
            <input 
              v-model="form.email"
              type="email" 
              class="w-full px-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue transition-all"
              :class="{'border-red-500 focus:ring-red-500/20 focus:border-red-500': errors.email}"
              placeholder="admin@imaniprima.co.id"
            />
            <p v-if="errors.email" class="mt-1.5 text-sm text-red-500">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-apple-black mb-1.5">Password</label>
            <input 
              v-model="form.password"
              type="password" 
              class="w-full px-4 py-3 rounded-xl border border-light-gray focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:border-apple-blue transition-all"
              :class="{'border-red-500 focus:ring-red-500/20 focus:border-red-500': errors.password}"
              placeholder="••••••••"
            />
            <p v-if="errors.password" class="mt-1.5 text-sm text-red-500">{{ errors.password }}</p>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center gap-2 mt-2">
            <input 
              id="remember" 
              v-model="form.rememberMe" 
              type="checkbox" 
              class="w-4 h-4 text-apple-blue border-light-gray rounded focus:ring-apple-blue/20"
            />
            <label for="remember" class="text-sm text-gray-500 cursor-pointer">Remember me for 7 days</label>
          </div>

          <!-- Submit -->
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full py-3.5 px-4 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center mt-2"
          >
            <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>Sign In</span>
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-gray-500 mt-8">
        &copy; {{ new Date().getFullYear() }} PT Imani Prima. All rights reserved.
      </p>
    </div>
  </div>
</template>
