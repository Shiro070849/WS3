<template>
  <div class="fixed inset-0 z-50 overflow-y-auto font-prompt">
    <!-- Background Gradient -->
    <div class="fixed inset-0 bg-gradient-to-br from-[#0090D3] via-[#047685] to-[#0090D3]"></div>

    <!-- Background Snowflakes - ขนาดลดลง -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <!-- มุมซ้ายบน -->
      <div class="snowflake-bg-float text-gray-300/10 text-[150px] absolute -top-20 -left-20 select-none">❆</div>
      
      <!-- มุมขวาบน -->
      <div class="snowflake-bg-float-delayed text-gray-300/10 text-[160px] absolute -top-16 -right-24 select-none rotate-45">❄</div>
      
      <!-- ซ้ายล่าง (2 อัน) -->
      <div class="snowflake-bg-rotate text-gray-300/10 text-[135px] absolute -bottom-24 -left-16 select-none">❅</div>
      <div class="snowflake-bg-float text-gray-300/10 text-[120px] absolute bottom-1/4 left-12 select-none rotate-12">❆</div>
      
      <!-- ขวาล่าง -->
      <div class="snowflake-bg-rotate-delayed text-gray-300/10 text-[170px] absolute -bottom-28 -right-20 select-none -rotate-15">❄</div>
    </div>

    <div class="flex min-h-full items-center justify-center p-4 relative z-10">
      <!-- Modal Card - ลดขนาดจาก max-w-3xl เป็น max-w-2xl -->
      <div 
        class="modal-card relative w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden
               ring-1 ring-white/30 shadow-[0_0_60px_rgba(0,144,211,0.3)]
               border border-white/20"
      >
        
        <!-- Main Container - ลดความสูงจาก 480px เป็น 380px -->
        <div class="grid grid-cols-1 lg:grid-cols-2 min-h-[380px] relative">
          
          <!-- Left Side - Branding Section - ลด padding -->
          <div class="branding-section relative bg-gradient-to-br from-[#0090D3] via-[#047685] to-[#00B1EF] p-6 lg:p-8 flex flex-col justify-center text-white overflow-hidden">
            
            <!-- Decorative Elements Layer -->
            <div class="absolute inset-0 overflow-hidden">
              <!-- Original floating circles -->
              <div class="floating-circle absolute -bottom-20 -left-20 w-40 h-40 bg-white/8 rounded-full blur-3xl"></div>
              <div class="floating-circle-delayed absolute top-12 -right-8 w-28 h-28 bg-white/8 rounded-full blur-2xl"></div>
            </div>
            
            <!-- Content -->
            <div class="relative z-10 text-center">
              <!-- Company Logo - ลดจาก h-16 เป็น h-12 -->
              <div class="mb-5 flex justify-center">
                <div class="bg-white rounded-lg shadow-lg p-2.5 hover:shadow-xl transition-all duration-300">
                  <img 
                    src="/image/Ruxchai-logo.png" 
                    alt="Ruxchai Logo" 
                    class="h-12 w-auto object-contain"
                  />
                </div>
              </div>
              
              <!-- ลดขนาดหัวข้อจาก text-2xl lg:text-3xl เป็น text-xl lg:text-2xl -->
              <h1 class="text-xl lg:text-2xl font-bold mb-2 leading-tight">
                Ruxchai Cold Storage
              </h1>
              <p class="text-sm text-white/90 mb-1.5 leading-relaxed">
                ระบบจัดการข้อมูลการเข้า-ออกรรถห้องเย็น
              </p>
              <p class="text-xs text-white/80 mb-5">
                Cold Storage Vehicle Management System
              </p>
              
              <!-- Feature Highlights -->
              <div class="space-y-2 text-white/90">
                <div class="flex items-start gap-2.5 justify-center">
                  <div class="w-2 h-2 bg-[#3AAA35] rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(58,170,53,0.6)]"></div>
                  <p class="text-xs leading-relaxed text-left">
                    ระบบจัดการข้อมูลการเข้า-ออกรถห้องเย็น
                  </p>
                </div>
                <div class="flex items-start gap-2.5 justify-center">
                  <div class="w-2 h-2 bg-[#3AAA35] rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(58,170,53,0.6)]"></div>
                  <p class="text-xs leading-relaxed text-left">
                    Cold Storage Vehicle Management System
                  </p>
                </div>
                <div class="flex items-start gap-2.5 justify-center">
                  <div class="w-2 h-2 bg-[#3AAA35] rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(58,170,53,0.6)]"></div>
                  <p class="text-xs leading-relaxed text-left">
                    Web Site Smart Security
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side - Login Form - ลด padding -->
          <div class="bg-gradient-to-br from-white to-gray-50/30 p-6 lg:p-8 flex flex-col justify-center relative">
            <div class="w-full max-w-sm mx-auto relative z-10">
              
              <!-- Header with Icon - ลดขนาดไอคอน -->
              <div class="text-center mb-5">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#3AAA35] to-[#258C1F] rounded-full mb-2.5 shadow-lg
                            hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <h2 class="text-lg font-bold text-[#555452] mb-1">เข้าสู่ระบบ</h2>
                <p class="text-xs text-gray-600">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
              </div>

              <!-- Login Form -->
              <div class="space-y-3.5">
                <!-- Username Field -->
                <div>
                  <label class="block text-sm font-semibold text-[#555452] mb-1.5">ชื่อผู้ใช้งาน</label>
                  <div class="relative input-wrapper">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      v-model="username"
                      :class="[
                        'w-full pl-10 pr-4 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 text-sm',
                        'focus:outline-none focus:border-[#3AAA35] focus:ring-2 focus:ring-[#3AAA35]/20',
                        hasError && !username ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      ]"
                      placeholder="กรุณาใส่ชื่อผู้ใช้งาน"
                      @input="clearError"
                    />
                  </div>
                </div>

                <!-- Password Field -->
                <div>
                  <label class="block text-sm font-semibold text-[#555452] mb-1.5">รหัสผ่าน</label>
                  <div class="relative input-wrapper">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </div>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      v-model="password"
                      :class="[
                        'w-full pl-10 pr-12 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 text-sm',
                        'focus:outline-none focus:border-[#3AAA35] focus:ring-2 focus:ring-[#3AAA35]/20',
                        hasError && !password ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      ]"
                      placeholder="กรุณาใส่รหัสผ่าน"
                      @input="clearError"
                      @keyup.enter="handleLogin"
                    />
                    <button
                      type="button"
                      @click="togglePasswordVisibility"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#3AAA35] transition-colors duration-200"
                    >
                      <svg v-if="!showPassword" class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      <svg v-else class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Error Message -->
                <div v-if="errorMessage" class="error-message border-l-4 border-red-400 bg-red-50 p-2.5 rounded-r-lg">
                  <div class="flex items-center space-x-2 text-xs text-red-700">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{{ errorMessage }}</span>
                  </div>
                </div>

                <!-- Login Button with Shine Effect -->
                <button
                  @click="handleLogin"
                  :disabled="isLoading || !username || !password"
                  class="login-button w-full bg-gradient-to-r from-[#258C1F] via-[#3AAA35] to-[#24C617] 
                         hover:from-[#3AAA35] hover:via-[#24C617] hover:to-[#56E04F] 
                         text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl 
                         transition-all duration-300 transform hover:scale-[1.01] text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none 
                         focus:outline-none focus:ring-4 focus:ring-[#3AAA35]/20"
                >
                  <span v-if="!isLoading" class="flex items-center justify-center gap-2">
                    <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    เข้าสู่ระบบ
                  </span>
                  <span v-else>
                    <svg class="animate-spin h-4.5 w-4.5 mx-auto text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z"/>
                    </svg>
                  </span>
                </button>
              </div>

              <!-- Footer -->
              <div class="mt-4 pt-3.5 border-t border-gray-200 text-center">
                <p class="text-xs text-gray-500">
                  © {{ currentYear }} Ruxchai Cold Storage. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentYear = new Date().getFullYear()

// Form Data
const username = ref('')
const password = ref('')
const showPassword = ref(false)

// UI State
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// Methods
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const clearError = () => {
  hasError.value = false
  errorMessage.value = ''
}

// Login Handler
const handleLogin = () => {
  clearError()
  
  // Validation
  if (!username.value || !password.value) {
    hasError.value = true
    errorMessage.value = 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน'
    return
  }

  isLoading.value = true

  // Simulate API call delay
  setTimeout(() => {
    // Hard-coded login check
    if (username.value === 'admin' && password.value === 'admin123') {
      // Login successful
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userName', username.value)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      // Login failed
      hasError.value = true
      errorMessage.value = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
    }
    
    isLoading.value = false
  }, 800)
}
</script>

<style scoped>
/* Modal fade-in animation */
.modal-card {
  animation: modalFadeIn 0.5s ease-out;
}

@keyframes modalFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Dots Pattern ด้านซ้าย (เบามาก) */
.branding-section::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 1;
}

/* Background Snowflakes Animation - นอก Modal เท่านั้น */
.snowflake-bg-float {
  animation: bgSnowFloat 20s ease-in-out infinite;
}

.snowflake-bg-float-delayed {
  animation: bgSnowFloat 24s ease-in-out 4s infinite;
}

.snowflake-bg-rotate {
  animation: bgSnowRotate 18s linear infinite;
}

.snowflake-bg-rotate-delayed {
  animation: bgSnowRotate 22s linear 3s infinite;
}

@keyframes bgSnowFloat {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(15px, -15px) rotate(120deg);
  }
  66% {
    transform: translate(-10px, 10px) rotate(240deg);
  }
}

@keyframes bgSnowRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Floating circles animation - very subtle */
.floating-circle {
  animation: floatSlow 8s ease-in-out infinite;
}

.floating-circle-delayed {
  animation: floatSlow 8s ease-in-out 2s infinite;
}

@keyframes floatSlow {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(10px, -10px);
  }
}