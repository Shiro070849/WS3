<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-950 via-slate-900 to-gray-900 p-4 relative overflow-hidden">
    <!-- Grid Pattern Background -->
    <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>

    <!-- Scattered Stars Background -->
    <div class="absolute inset-0">
      <div
        v-for="(star, index) in backgroundStars"
        :key="index"
        class="absolute bg-white rounded-full star-twinkle"
        :class="star.sizeClass"
        :style="star.style"
      ></div>
    </div>
    <!-- Login Form -->
    <form
      @submit.prevent="handleLogin"
      class="relative block p-7 max-w-xs w-full bg-gradient-to-br from-slate-900/80 via-indigo-950/70 to-cyan-900 border-2 border-white shadow-[0_0_50px_-15px_rgba(0,212,255,0.7)] overflow-hidden z-10 rounded-sm scale-90"
    >
      <!-- Animated Stars Background -->
      <section class="bg-stars">
        <span class="star"></span>
        <span class="star"></span>
        <span class="star"></span>
        <span class="star"></span>
      </section>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-3 p-2 bg-red-500/20 border border-red-500 rounded text-red-200 text-xs text-center">
        {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-3 p-2 bg-green-500/20 border border-green-500 rounded text-green-200 text-xs text-center">
        {{ successMessage }}
      </div>

      <!-- Form Title with Flickering Effect -->
      <div class="text-base leading-6 font-semibold text-center text-white text-shadow-[1px_1px_1px_rgba(0,0,0,0.7)] mb-1">
        <span class="animate-[flicker_2s_linear_infinite]">sign in to your</span>
      </div>

      <!-- Main Title -->
      <div class="block -mt-1 text-[1.4rem] font-extrabold text-center tracking-[0.1rem] text-transparent mb-4"
           style="-webkit-text-stroke: 0.08rem #fff; text-shadow: 0px 0px 12px #CECECE;">
        <span class="space-title">Smart Security</span>
      </div>

      <!-- Username Input -->
      <div class="relative mb-2">
        <input
          v-model="email"
          type="text"
          placeholder="Enter username"
          required
          class="outline-none border-2 border-white bg-white p-1.5 text-sm w-full shadow-sm transition-all duration-900 placeholder:transition-opacity placeholder:duration-900 focus:placeholder:opacity-0"
        >
      </div>

      <!-- Password Input -->
      <div class="relative mb-2">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter password"
          required
          :class="password.length > 0 ? 'pr-10' : ''"
          class="outline-none border-2 border-white bg-white p-1.5 text-sm w-full shadow-sm transition-all duration-900 placeholder:transition-opacity placeholder:duration-900 focus:placeholder:opacity-0"
        >
        <button
          v-if="password.length > 0"
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none transition-opacity duration-200"
        >
          <!-- Eye Icon (Show) -->
          <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <!-- Eye Slash Icon (Hide) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>

      <!-- Submit Button with Shine Effect -->
      <button
        type="submit"
        class="submit-btn relative block p-2 bg-gray-400 text-white text-shadow-[1px_1px_1px_rgba(0,0,0,0.5)] text-sm font-medium w-full uppercase overflow-hidden border-2 border-white mt-2 transition-all duration-200 hover:rounded hover:shadow-[4px_5px_17px_-4px_#ffffff]"
      >
        <span>Sign in</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Hardcoded credentials for testing
const VALID_USERNAME = 'admin'
const VALID_PASSWORD = 'admin123'

// Generate random scattered stars for background with varying sizes
const backgroundStars = Array.from({ length: 60 }, () => {
  const size = Math.random()
  let sizeClass = 'w-1 h-1'

  if (size > 0.8) {
    sizeClass = 'w-2 h-2' // Larger stars (20%)
  } else if (size > 0.6) {
    sizeClass = 'w-1.5 h-1.5' // Medium stars (20%)
  }

  return {
    sizeClass,
    style: {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.4 + 0.3,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 3 + 2}s`
    }
  }
})

const handleLogin = async () => {
  try {
    // Clear previous messages
    errorMessage.value = ''
    successMessage.value = ''

    // Hardcoded login validation
    if (email.value === VALID_USERNAME && password.value === VALID_PASSWORD) {
      console.log('Login successful!')

      // Store user session
      localStorage.setItem('user', JSON.stringify({ username: email.value }))
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userName', email.value)
      localStorage.setItem('userEmail', '')
      localStorage.setItem('companyName', 'Smart Security')

      // Show success message
      successMessage.value = 'Login successful! Redirecting to dashboard...'

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      // Show error message
      errorMessage.value = 'Invalid username or password'

      // Clear error after 3 seconds
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'An error occurred. Please try again.'
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');

/* Apply Prompt font to entire form */
form {
  font-family: 'Prompt', sans-serif;
}

/* Grid Pattern Background */
.bg-grid-pattern {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Star Twinkling Animation */
.star-twinkle {
  animation: twinkle infinite ease-in-out;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Space title decorators */
.space-title::before {
  content: '\2014';
}

.space-title::after {
  content: '\2014';
}

/* Submit button shine effect */
.submit-btn::before {
  content: '';
  display: block;
  width: 0;
  height: 85%;
  position: absolute;
  top: 50%;
  left: 0;
  opacity: 0;
  background: #fff;
  box-shadow: 0 0 50px 30px #fff;
  transform: skewX(-20deg);
}

.submit-btn:hover::before {
  animation: shine 0.5s linear;
}

/* Shooting stars background */
.bg-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  background-size: cover;
  animation: animateBg 50s linear infinite;
}

.star {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.1), 0 0 0 8px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.1);
  animation: animate 3s linear infinite;
}

.star::before {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  height: 1px;
  background: linear-gradient(90deg, #fff, transparent);
}

.star:nth-child(1) {
  top: 0;
  right: 0;
  left: initial;
  animation-delay: 0s;
  animation-duration: 1s;
}

.star:nth-child(2) {
  top: 0;
  right: 100px;
  left: initial;
  animation-delay: 0.2s;
  animation-duration: 3s;
}

.star:nth-child(3) {
  top: 0;
  right: 220px;
  left: initial;
  animation-delay: 2.75s;
  animation-duration: 2.75s;
}

.star:nth-child(4) {
  top: 0;
  right: -220px;
  left: initial;
  animation-delay: 1.6s;
  animation-duration: 1.6s;
}

/* Custom animations */
@keyframes flicker {
  0%, 100% {
    opacity: 1;
  }
  41.99% {
    opacity: 1;
  }
  42% {
    opacity: 0;
  }
  43% {
    opacity: 0;
  }
  43.01% {
    opacity: 1;
  }
  47.99% {
    opacity: 1;
  }
  48% {
    opacity: 0;
  }
  49% {
    opacity: 0;
  }
  49.01% {
    opacity: 1;
  }
}

@keyframes shine {
  from {
    opacity: 0;
    left: 0%;
  }
  50% {
    opacity: 1;
  }
  to {
    opacity: 0;
    left: 100%;
  }
}

@keyframes animateBg {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes animate {
  0% {
    transform: rotate(315deg) translateX(0);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: rotate(315deg) translateX(-1000px);
    opacity: 0;
  }
}
</style>
