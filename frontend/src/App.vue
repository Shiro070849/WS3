<template>
  <div id="app">
    <!-- ถ้าไม่ใช่หน้า Login → แสดง Sidebar + Content -->
    <div v-if="!$route.meta.hideLayout" class="app-layout">
      <Sidebar @toggle="handleSidebarToggle" />
      <main
        class="main-content"
        :class="{ 'sidebar-collapsed': isCollapsed }"
      >
        <router-view />
      </main>
    </div>

    <!-- ถ้าเป็นหน้า Login → แสดงเฉพาะ LoginView เต็มจอ -->
    <router-view v-else />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/SidebarMenu.vue'
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'App',
  components: {
    Sidebar
  },
  setup() {
    const isCollapsed = ref(false)
    const route = useRoute()
    const { loadTheme } = useTheme()

    const handleSidebarToggle = (collapsed) => {
      isCollapsed.value = collapsed
    }

    // Load theme on app mount
    onMounted(() => {
      console.log('🚀 App mounted - Loading theme...')

      // Get companyId from localStorage (set during login)
      const companyId = localStorage.getItem('companyId')
      if (companyId) {
        console.log('👤 User company ID:', companyId)
        loadTheme(parseInt(companyId))
      } else {
        // Fallback: try to get from user object
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            const fallbackCompanyId = user.IC_ID || 1
            console.log('👤 Fallback company ID from user object:', fallbackCompanyId)
            loadTheme(fallbackCompanyId)
          } catch (error) {
            console.error('❌ Error parsing user data:', error)
          }
        } else {
          console.warn('⚠️ No company ID found, theme will not load')
        }
      }
    })

    // Watch for route changes (in case user switches company)
    watch(() => route.query.companyId, (newCompanyId) => {
      if (newCompanyId) {
        console.log('🔄 Company changed via route:', newCompanyId)
        loadTheme(parseInt(newCompanyId))
      }
    })

    return {
      isCollapsed,
      handleSidebarToggle
    }
  }
}
</script>

<style>
/* Import Theme Variables */
@import '@/assets/styles/theme-variables.css';

/* ===== Global Reset ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  /* ลดขนาดลง 30% แล้วเพิ่มกลับมา 5% = 73.5% */
  font-size: 11.76px; /* จาก 16px -> 11.2px (70%) -> 11.76px (73.5%) */
}

body {
  background: #f0f4f8;
  color: #1a202c;
  font-family: 'Prompt', 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* ===== App Layout with Sidebar ===== */
.app-layout {
  display: flex;
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* ===== Main Content Area ===== */
.main-content {
  flex: 1;
  min-height: 100vh;
  padding: 2rem;
  background: #f0f4f8;
  margin-left: 220px; /* ตรงกับความกว้าง sidebar ใหม่ */
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

/* เมื่อ sidebar ถูกย่อ */
.main-content.sidebar-collapsed {
  margin-left: 60px; /* ตรงกับความกว้าง sidebar แบบ collapsed */
}

/* ===== Scrollbar Styling ===== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
  transition: background 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* ===== Responsive Design ===== */
@media (max-width: 768px) {
  .main-content {
    margin-left: 60px !important; /* บนมือถือให้ sidebar ย่อตลอด */
  }
}
</style>