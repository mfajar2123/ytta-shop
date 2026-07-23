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
const showPassword = ref(false)
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
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-3xl opacity-60 animate-pulse mix-blend-multiply dark:mix-blend-screen"></div>
    <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-400/20 rounded-full blur-3xl opacity-60 animate-pulse mix-blend-multiply dark:mix-blend-screen" style="animation-delay: 2s;"></div>

    <div class="w-full max-w-md z-10">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-600 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-xl shadow-primary-500/30 ring-4 ring-primary-500/10">
          <UIcon name="i-heroicons-squares-plus" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">Sign in to manage your system</p>
      </div>

      <!-- Login Card -->
      <UCard class="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 shadow-2xl ring-1 ring-gray-200/50 dark:ring-gray-800/50">
        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <UAlert
            v-if="errors.general"
            icon="i-heroicons-exclamation-triangle"
            color="error"
            variant="subtle"
            :title="errors.general"
            class="mb-4"
          />

          <UFormField label="Username" name="username" :error="errors.username">
            <UInput 
              v-model="form.username" 
              placeholder="Enter your username" 
              icon="i-heroicons-user" 
              size="xl"
            />
          </UFormField>

          <UFormField label="Password" name="password" :error="errors.password">
            <UInput 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••" 
              icon="i-heroicons-lock-closed" 
              size="xl"
              :ui="{ trailing: { pointerEvents: 'auto' } }"
            >
              <template #trailing>
                <div class="flex items-center h-full cursor-pointer px-1" @click="showPassword = !showPassword">
                  <UIcon
                    :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                    class="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  />
                </div>
              </template>
            </UInput>
          </UFormField>

          <div class="flex items-center justify-between mt-4">
            <UCheckbox 
              v-model="form.rememberMe" 
              name="remember" 
              label="Remember me for 3 days" 
            />
          </div>

          <UButton 
            type="submit" 
            color="primary" 
            size="xl" 
            block 
            :loading="loading"
            class="mt-6 font-semibold"
          >
            Sign In to Dashboard
          </UButton>
        </form>
      </UCard>

      <p class="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
        &copy; {{ new Date().getFullYear() }} PT Imani Prima. All rights reserved.
      </p>
    </div>
  </div>
</template>
