<template>
  <div class="min-h-screen relative overflow-hidden flex items-center justify-center">
    <!-- Ice Background Image -->
    <div class="absolute inset-0">
      <img
        src="@/assets/images/BG_RUX_2.png"
        alt="Ice Crystal Background"
        class="w-full h-full object-cover"
      />
      <!-- Dark Overlay for better contrast -->
      <div class="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-slate-900/40 to-blue-900/50"></div>
    </div>

    <!-- Floating Snowflakes (SVG) -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <svg v-for="(snowflake, i) in snowflakes" :key="i"
           class="snowflake-svg absolute"
           :style="{
             left: snowflake.left,
             top: '-5%',
             animationDelay: snowflake.delay,
             animationDuration: snowflake.duration
           }"
           width="20" height="20" viewBox="0 0 20 20">
        <path d="M10 0L10 20M0 10L20 10M3 3L17 17M17 3L3 17M10 5L10 15M5 10L15 10"
              stroke="rgba(255,255,255,0.6)"
              stroke-width="0.5"
              fill="none"/>
      </svg>
    </div>

    <!-- Glassmorphism Card - Compact Design -->
    <div class="relative z-10 w-full max-w-lg mx-4 animate-fadeIn">
      <div class="glass-card bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <!-- Logo/Icon Inside Card -->
        <div class="text-center mb-5">
          <div class="inline-flex items-center justify-center w-16 h-16 mb-3 bg-gradient-to-br from-[#0090D3] to-[#006A9F] rounded-2xl shadow-lg">
            <!-- Warehouse Icon with Boxes -->
            <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L2 8v13h20V8l-10-5zm8 16H4v-9l8-4 8 4v9z"/>
              <rect x="6" y="12" width="3" height="3"/>
              <rect x="10.5" y="12" width="3" height="3"/>
              <rect x="15" y="12" width="3" height="3"/>
              <rect x="6" y="16" width="3" height="3"/>
              <rect x="10.5" y="16" width="3" height="3"/>
            </svg>
          </div>

          <!-- Title -->
          <h1 class="text-xs font-medium text-gray-300 mb-1.5 tracking-widest uppercase">Welcome to</h1>
          <h2 class="text-2xl font-bold text-white mb-0.5">RUXCHAI</h2>
          <h3 class="text-lg font-semibold text-[#8bcbe9] mb-4">WAREHOUSE</h3>
        </div>
        <!-- Alert Messages -->
        <div v-if="errorMessage" class="mb-5 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl text-red-100 text-sm flex items-start">
          <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="mb-5 p-3 bg-green-500/20 backdrop-blur-sm border border-green-400/50 rounded-xl text-green-100 text-sm flex items-start">
          <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>{{ successMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Username Input -->
          <div>
            <input
              v-model="username"
              type="text"
              placeholder="Email or Username"
              required
              class="glass-input w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#0090D3]/50 focus:border-[#0090D3] transition-all"
            />
          </div>

          <!-- Password Input -->
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              required
              class="glass-input w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#0090D3]/50 focus:border-[#0090D3] transition-all"
            />
            <button
              v-if="password"
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 px-4 bg-gradient-to-r from-[#0090D3] to-[#006A9F] hover:from-[#007AB8] hover:to-[#005A8A] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Signing in...' : 'Login' }}
          </button>

        </form>

        <!-- Footer -->
        <div class="mt-6 pt-6 border-t border-white/10 text-center text-xs text-white/60">
          <p>©2025 SmartSecurity </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const { loadTheme } = useTheme()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

// Generate snowflakes once (static positions)
const snowflakes = Array.from({ length: 20 }, () => ({
  left: Math.random() * 100 + '%',
  delay: Math.random() * 10 + 's',
  duration: (15 + Math.random() * 10) + 's'
}))

const handleLogin = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''
    isLoading.value = true

    // Call API
    const response = await authAPI.login(username.value, password.value)

    if (response.data.success) {
      const userData = response.data.data

      // Store user session
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userName', userData.SU_Name1 || username.value)
      localStorage.setItem('userEmail', userData.SU_Email || '')
      localStorage.setItem('userId', userData.SU_ID)
      localStorage.setItem('companyId', userData.IC_ID)
      localStorage.setItem('companyName', 'Smart Security')

      // 🎨 Load Theme ทันทีหลัง Login
      console.log('🎨 Loading theme for company:', userData.IC_ID)
      await loadTheme(userData.IC_ID)

      successMessage.value = 'Login successful! Redirecting...'

      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else {
      errorMessage.value = response.data.message || 'Invalid username or password'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.response?.data?.message || 'Invalid username or password'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Prompt', sans-serif;
}

/* Glass Card Effect */
.glass-card {
  box-shadow: 0 8px 32px 0 rgba(0, 144, 211, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.glass-card:hover {
  box-shadow: 0 12px 40px 0 rgba(0, 144, 211, 0.3);
}

/* Glass Input Effect */
.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 20px rgba(0, 144, 211, 0.3);
}

/* Snowflake SVG Animation - Smooth Continuous Flow */
@keyframes snowfall {
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 0.3;
  }
  5% {
    opacity: 0.7;
  }
  95% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0.3;
  }
}

.snowflake-svg {
  animation: snowfall linear infinite;
  pointer-events: none;
  opacity: 0.7;
}

/* Float Animation for Logo */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out;
}

/* Glow Effect on Focus */
.glass-input:focus {
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 144, 211, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 144, 211, 0.5);
  }
}
</style>
