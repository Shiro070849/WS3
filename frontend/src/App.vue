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

    <!-- Global Notification Modal -->
    <NotificationModal />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/SidebarMenu.vue'
import NotificationModal from '@/components/base/NotificationModal.vue'
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'App',
  components: {
    Sidebar,
    NotificationModal
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
      console.log('[INIT] App mounted - Loading theme...')

      // Get user data from localStorage (set during login)
      const userDataStr = localStorage.getItem('user')

      if (!userDataStr) {
        console.log('[INFO] No user data found - using default theme')
        return
      }

      try {
        const userData = JSON.parse(userDataStr)
        const companyId = userData.IC_ID

        // Check if Super Admin (IC_ID is null, undefined, or missing)
        const isSuperAdmin = !companyId || companyId === null || companyId === undefined

        if (isSuperAdmin) {
          console.log('[SUPER ADMIN] Super Admin detected (IC_ID = NULL) - using default hardcoded theme')

          // Clear any theme cache that might exist for Super Admin
          localStorage.removeItem('theme_null')
          localStorage.removeItem('theme_null_timestamp')
          localStorage.removeItem('theme_undefined')
          localStorage.removeItem('theme_undefined_timestamp')

          // Super Admin: Do not load theme from database
          return
        }

        // Company Admin: Load theme from database using IC_ID (e.g., 1002, 1103, 5)
        console.log('[COMPANY ADMIN] Loading theme for company IC_ID:', companyId)
        loadTheme(companyId)
      } catch (error) {
        console.error('[ERROR] Failed to parse user data:', error)
      }
    })

    // Watch for route changes (in case user switches company)
    watch(() => route.query.companyId, (newCompanyId) => {
      if (newCompanyId && newCompanyId !== 'null' && newCompanyId !== 'undefined') {
        console.log('[UPDATE] Company changed via route:', newCompanyId)
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
  z-index: 1; /* ให้ต่ำกว่า modal backdrop (z-index: 999) */
}

/* ===== Main Content Area ===== */
.main-content {
  flex: 1;
  min-height: 100vh;
  padding: 2rem;
  background: var(--background-color, #f0f4f8);
  color: var(--text-color, #1a202c);
  margin-left: 220px; /* ตรงกับความกว้าง sidebar ใหม่ */
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, color 0.3s ease;
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