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
  username: '',
  password: '',
  rememberMe: false
})
const loading = ref(false)
const errors = reactive({
  username: '',
  password: '',
  general: ''
})

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const handleLogin = async () => {
  // Reset errors
  errors.username = ''
  errors.password = ''
  errors.general = ''
  
  // Validate
  try {
    schema.parse(form)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(e => {
        if (e.path[0] === 'username') errors.username = e.message
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
        username: form.username,
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
  <div class="min-h-screen bg-gradient-to-br from-off-white to-gray-200 flex flex-col justify-center items-center p-4 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-apple-blue/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
    <div class="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

    <div class="w-full max-w-md z-10">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-apple-blue to-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-lg shadow-apple-blue/30 transform transition-transform hover:scale-105 duration-300">
          <span class="text-white text-4xl font-bold font-serif drop-shadow-md">I</span>
        </div>
        <h1 class="text-3xl font-bold text-apple-black tracking-tight">Imani Admin</h1>
        <p class="text-gray-500 mt-2 font-medium">Sign in to manage your system</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white/50">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- General Error -->
          <div v-if="errors.general" class="p-4 bg-red-50/80 backdrop-blur-md text-red-600 rounded-2xl text-sm border border-red-100 flex items-start gap-2">
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errors.general }}
          </div>

          <!-- Username -->
          <div>
            <label class="block text-sm font-semibold text-apple-black mb-2">Username</label>
            <div class="relative">
              <input 
                v-model="form.username"
                type="text" 
                class="w-full pl-4 pr-4 py-3.5 bg-white/50 rounded-2xl border border-light-gray focus:outline-none focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all"
                :class="{'border-red-500 focus:ring-red-500/10 focus:border-red-500': errors.username}"
                placeholder="Enter username"
              />
            </div>
            <p v-if="errors.username" class="mt-2 text-sm text-red-500 font-medium">{{ errors.username }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-apple-black mb-2">Password</label>
            <div class="relative">
              <input 
                v-model="form.password"
                type="password" 
                class="w-full pl-4 pr-4 py-3.5 bg-white/50 rounded-2xl border border-light-gray focus:outline-none focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all"
                :class="{'border-red-500 focus:ring-red-500/10 focus:border-red-500': errors.password}"
                placeholder="••••••••"
              />
            </div>
            <p v-if="errors.password" class="mt-2 text-sm text-red-500 font-medium">{{ errors.password }}</p>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center gap-3 mt-3">
            <div class="relative flex items-start">
              <div class="flex items-center h-5">
                <input 
                  id="remember" 
                  v-model="form.rememberMe" 
                  type="checkbox" 
                  class="w-4 h-4 text-apple-blue border-gray-300 rounded focus:ring-apple-blue/30"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="remember" class="font-medium text-gray-600 cursor-pointer select-none">Remember me for 3 days</label>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full py-4 px-4 bg-apple-black hover:bg-gray-800 text-white rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4 shadow-lg shadow-black/10"
          >
            <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>Sign In to Dashboard</span>
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-gray-500 mt-8">
        &copy; {{ new Date().getFullYear() }} PT Imani Prima. All rights reserved.
      </p>
    </div>
  </div>
</template>
