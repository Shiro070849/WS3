<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed, 'main-admin': isMainAdmin }">
    <!-- Header Section -->
    <div class="sidebar-header">
      <button @click="toggleSidebar" class="toggle-btn">
        <span class="hamburger-line" :class="{ active: isCollapsed }"></span>
        <span class="hamburger-line" :class="{ active: isCollapsed }"></span>
        <span class="hamburger-line" :class="{ active: isCollapsed }"></span>
      </button>

      <transition name="fade">
        <div v-if="!isCollapsed" class="company-info">
          <!-- Logo + Company Name (Horizontal Layout) -->
          <div v-if="logoUrl" class="company-header-card">
            <div class="company-logo-container">
              <img class="company-logo-horizontal" :src="logoUrl" alt="Company Logo" />
            </div>
            <h1 class="company-name-horizontal">{{ companyName }}</h1>
          </div>
        </div>
      </transition>
    </div>

    <!-- Profile Section -->
    <div class="profile-section">
      <div class="profile-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>

      <transition name="fade">
        <div v-if="!isCollapsed" class="profile-info">
          <p class="profile-name">{{ userName }}</p>
          <p v-if="userEmail" class="profile-email">{{ userEmail }}</p>
        </div>
      </transition>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Menu Section -->
    <nav class="menu-section">
      <router-link
        v-for="item in menuItems"
        :key="item.route"
        :to="item.route"
        class="menu-item"
        :class="{ active: isActive(item.route) }"
        :title="isCollapsed ? item.name : ''"
      >
        <div class="menu-icon" v-html="item.icon"></div>
        <transition name="fade">
          <span v-if="!isCollapsed" class="menu-text">{{ item.name }}</span>
        </transition>
      </router-link>
    </nav>

    <!-- Logout Section -->
    <div class="logout-section">
      <button @click="showLogoutModal = true" class="Btn" :class="{ 'collapsed': isCollapsed }">
        <div class="sign">
          <svg viewBox="0 0 512 512">
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
          </svg>
        </div>
        <div class="text">Logout</div>
      </button>
    </div>
  </aside>

  <!-- Logout Modal -->
  <Teleport to="body">
    <transition name="modal">
      <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
        <div class="browser-modal">
          <!-- Browser Tabs Header -->
          <div class="tabs-head" :class="{ 'main-admin-tabs': isMainAdmin }">
            <div class="tabs">
              <div class="tab-open">
                <span>ยืนยันการออกจากระบบ</span>
                <button @click="showLogoutModal = false" class="close-tab">✕</button>
              </div>
            </div>
            <div class="window-opt">
              <button @click="showLogoutModal = false">−</button>
              <button @click="showLogoutModal = false">□</button>
              <button @click="showLogoutModal = false" class="window-close">✕</button>
            </div>
          </div>

          <!-- Browser URL Bar -->
          <div class="head-browser" :class="{ 'main-admin-url': isMainAdmin }">
            <button disabled>←</button>
            <button disabled>→</button>
            <div class="url-bar">
              <span class="url-text">auth/logout</span>
              <button class="star">★</button>
            </div>
            <button>⋮</button>
          </div>

          <!-- Content Area -->
          <div class="browser-content">
            <div class="logout-content-wrapper">
              <div class="modal-icon-large">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <p class="modal-question">คุณต้องการออกจากระบบใช่หรือไม่?</p>
              <p class="modal-hint">กรุณายืนยันการออกจากระบบอีกครั้ง</p>
            </div>

            <!-- ปุ่ม -->
            <div class="flex justify-end gap-4 px-6 py-4 border-t bg-gray-50">
              <button @click="showLogoutModal = false" class="btn-cancel">ยกเลิก</button>
              <button @click="confirmLogout" class="btn-confirm">ยืนยัน Logout</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, defineEmits, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { companiesAPI, getBackendBaseUrl } from '@/services/api'

const router = useRouter()
const route = useRoute()
const emit = defineEmits(['toggle'])

// State
const isCollapsed = ref(false)
const showLogoutModal = ref(false)

// User Data
const companyName = ref(localStorage.getItem('companyName') || 'Smart Security')
const userName = ref(localStorage.getItem('userName') || 'Admin User')
const userEmail = ref(localStorage.getItem('userEmail') || '')
const companyLogoPath = ref(null)

// Check if Super Admin (IC_ID = NULL)
const isMainAdmin = computed(() => {
  const companyId = localStorage.getItem('companyId')
  return !companyId || companyId === 'null' || companyId === 'undefined'
})

// Theme
const { currentTheme, loadTheme } = useTheme()

// Logo URL - ใช้ logo ของบริษัทจาก IC_LogoPath หรือ fallback ไปที่ theme logo
const logoUrl = computed(() => {
  // ถ้ามี company logo ให้ใช้ logo ของบริษัท
  if (companyLogoPath.value) {
    return `${getBackendBaseUrl()}${companyLogoPath.value}`
  }

  // ถ้าไม่มี ให้ใช้ theme logo (สำหรับ Super Admin)
  if (!currentTheme.value?.logo_url) return ''

  // ถ้าเป็น URL เต็ม ใช้เลย
  if (currentTheme.value.logo_url.startsWith('http')) {
    return currentTheme.value.logo_url
  }

  // ถ้าเป็น path ใน backend ให้ต่อกับ API base URL
  return `${getBackendBaseUrl()}${currentTheme.value.logo_url}`
})

// ดึง company logo
const fetchCompanyLogo = async () => {
  try {
    const companyId = localStorage.getItem('companyId')

    // ถ้าเป็น Super Admin (IC_ID = null) ไม่ต้องดึง logo
    if (!companyId || companyId === 'null' || companyId === 'undefined' || companyId === '') {
      console.log('[SIDEBAR] Super Admin detected - no company logo needed')
      companyLogoPath.value = null  // ล้าง logo path
      return
    }

    const response = await companiesAPI.getById(companyId)
    if (response.data.success && response.data.data.IC_LogoPath) {
      companyLogoPath.value = response.data.data.IC_LogoPath
      console.log('[SIDEBAR] Company logo loaded:', companyLogoPath.value)
    } else {
      companyLogoPath.value = null  // ถ้าไม่มี logo ให้เคลียร์
      console.log('[SIDEBAR] No company logo found')
    }
  } catch (error) {
    console.error('[SIDEBAR] Error fetching company logo:', error)
    companyLogoPath.value = null  // Error แล้วก็เคลียร์
  }
}

// Menu Items
const menuItems = [
  {
    name: 'Dashboard',
    route: '/dashboard',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>'
  },
  {
    name: 'รายการ การเข้า-ออก',
    route: '/vehicle',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5"/></svg>'
  },
  {
    name: 'Report',
    route: '/report',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>'
  },
  {
    name: 'Statistics',
    route: '/statistics',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>'
  },
  {
    name: 'Settings',
    route: '/settings',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
  }
]

// Methods
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle', isCollapsed.value)
}

const isActive = (routePath) => {
  return route.path === routePath
}

const confirmLogout = () => {
  // ล้าง Theme ทั้งหมดก่อน Logout
  const { clearAllThemes } = useTheme()
  clearAllThemes()

  // ล้าง company logo path
  companyLogoPath.value = null
  companyName.value = 'Smart Security'  // Reset กลับไปเป็นค่า default

  // ล้าง localStorage
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userName')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('companyName')
  localStorage.removeItem('companyId')  // ล้าง companyId ด้วย
  localStorage.removeItem('userId')     // ล้าง userId ด้วย
  localStorage.removeItem('user')       // ล้าง user object ด้วย

  console.log('[LOGOUT] User logged out successfully - Theme and Logo cleared')
  showLogoutModal.value = false
  router.push('/login')
}

// Load theme and company logo on mount
onMounted(async () => {
  // Get user data from localStorage
  const userDataStr = localStorage.getItem('user')

  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr)
      const companyId = userData.IC_ID

      // Check if Super Admin (IC_ID is null, undefined, or missing)
      const isSuperAdmin = !companyId || companyId === null || companyId === undefined

      if (!isSuperAdmin) {
        // Company Admin: Load theme using IC_ID
        await loadTheme(companyId)
      }
    } catch (error) {
      console.error('[ERROR] Failed to parse user data:', error)
    }
  }

  // ดึง company logo
  await fetchCompanyLogo()
})
</script>

<style scoped>
/* ===== Sidebar Container ===== */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 220px;
  /* Dynamic theme colors from database */
  background: linear-gradient(180deg,
    var(--sidebar-bg-start, #ffffff) 0%,
    var(--sidebar-bg-middle, #ffffff) 50%,
    var(--sidebar-bg-end, #ffffff) 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
  z-index: 10; /* ต่ำกว่า modal backdrop (999) เพื่อให้โดน blur */
  overflow: hidden;
  font-family: 'Prompt', sans-serif;
}

.sidebar.collapsed {
  width: 60px;
}

/* ===== Main Admin Theme Override ===== */
.sidebar.main-admin {
  background: linear-gradient(180deg,
    #1565C0 0%,
    #0D47A1 50%,
    #0A3D91 100%) !important;
}

/* ===== Header ===== */
.sidebar-header {
  padding: 0.8rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  min-height: unset;
}

.toggle-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  transition: all 0.3s;
  flex-shrink: 0;
  margin-top: 2px;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hamburger-line {
  width: 14px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s;
}

.hamburger-line.active:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-line.active:nth-child(2) {
  opacity: 0;
}

.hamburger-line.active:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.company-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
}

/* Logo Card - Subtle integrated design */
.logo-card {
  background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.479) 0%,
    rgba(255, 255, 255, 0.08) 100%);
  border: 1px solid rgba(255, 255, 255, 0.678);
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  transition: all 0.25s ease;
  min-height: 52px;
  max-height: 58px;
  position: relative;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.logo-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg,
    rgb(255, 255, 255) 0%,
    transparent 100%);
  border-radius: 10px 10px 0 0;
  pointer-events: none;
}

.logo-card:hover {
  background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.76) 0%,
    rgba(255, 255, 255, 0.12) 100%);
  border-color: rgb(255, 255, 255);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.company-logo {
  max-width: 100%;
  max-height: 40px;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* Company Header Card - Horizontal Layout */
.company-header-card {
  background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.1) 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  padding: 1rem;
  border-radius: 12px;
  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  width: 100%;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.company-header-card:hover {
  background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.15) 100%);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
}

.company-logo-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  max-width: 60px;
  height: 60px;
  background: white;
  border-radius: 8px;
  padding: 0.4rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.company-logo-horizontal {
  max-width: 60px;
  max-height: 60px;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.company-name-horizontal {
  flex: 1;
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.3;
  letter-spacing: 0.02em;
  text-align: left;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.company-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.3;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  width: 100%;
}

.company-subtitle {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  width: 100%;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

/* ===== Profile ===== */
.profile-section {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  margin: 1rem;
  border-radius: 8px;
  transition: all 0.3s;
}

.sidebar.collapsed .profile-section {
  margin: 0.5rem;
  padding: 0.5rem;
  justify-content: center;
}

.profile-section:hover {
  background: rgba(255, 255, 255, 0.12);
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color, #0090D3) 0%, var(--primary-color-light, #00B1EF) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 144, 211, 0.3);
}

/* Override for Main Admin only */
.sidebar.main-admin .profile-avatar {
  background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%) !important;
  box-shadow: 0 3px 8px rgba(25, 118, 210, 0.4) !important;
}

.profile-avatar svg {
  width: 20px;
  height: 20px;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.3;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-email {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  margin-top: 2px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Divider ===== */
.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 1rem;
}

/* ===== Menu ===== */
.menu-section {
  flex: 1;
  padding: 1rem 0.75rem;
  overflow-y: auto;
}

.sidebar.collapsed .menu-section {
  padding: 0.5rem 0.5rem;
}

.menu-section::-webkit-scrollbar {
  width: 4px;
}

.menu-section::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.menu-section::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.25rem;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.sidebar.collapsed .menu-item {
  padding: 0.75rem 0.5rem;
  justify-content: center;
  gap: 0;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(2px);
}

.sidebar.collapsed .menu-item:hover {
  transform: translateX(0) scale(1.05);
}

.menu-item.active {
  background: linear-gradient(135deg, var(--primary-color, #0090D3) 0%, var(--primary-color-light, #00B1EF) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 144, 211, 0.3);
}

/* Override for Main Admin only */
.sidebar.main-admin .menu-item.active {
  background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%) !important;
  box-shadow: 0 3px 10px rgba(25, 118, 210, 0.4) !important;
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: white;
  border-radius: 0 2px 2px 0;
}

.menu-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon svg {
  width: 18px;
  height: 18px;
}

.sidebar.collapsed .menu-icon {
  width: 22px;
  height: 22px;
}

.sidebar.collapsed .menu-icon svg {
  width: 20px;
  height: 20px;
}

.menu-text {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Logout ===== */
.logout-section {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  justify-content: center;
}

.sidebar.collapsed .logout-section {
  padding: 0.75rem 0.5rem;
}

/* Animated Logout Button */
.Btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
  background-color: rgb(255, 65, 65);
}

/* plus sign */
.Btn .sign {
  width: 100%;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.Btn .sign svg {
  width: 17px;
  transition: transform 0.3s ease;
}

.Btn .sign svg path {
  fill: white;
}

/* text */
.Btn .text {
  position: absolute;
  right: 0%;
  width: 0%;
  opacity: 0;
  color: white;
  font-size: 1.2em;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  white-space: nowrap;
}

/* hover effect on button width */
.Btn:hover {
  width: 125px;
  border-radius: 40px;
  box-shadow: 4px 4px 15px rgba(255, 65, 65, 0.4);
  transform: translateY(-2px);
}

.Btn:hover .sign {
  width: 30%;
  padding-left: 20px;
}

.Btn:hover .sign svg {
  transform: translateX(2px);
}

/* hover effect button's text */
.Btn:hover .text {
  opacity: 1;
  width: 70%;
  padding-right: 10px;
}

/* button click effect*/
.Btn:active {
  transform: translate(2px, 2px) scale(0.95);
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
  transition: all 0.1s ease;
}

/* When sidebar is collapsed */
.sidebar.collapsed .Btn {
  width: 45px;
  height: 45px;
}

.sidebar.collapsed .Btn:hover {
  width: 45px;
  border-radius: 50%;
}

.sidebar.collapsed .Btn .text {
  display: none;
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

/* Browser Modal Container */
.browser-modal {
  width: 500px;
  max-width: 90vw;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

/* Browser Tabs Header - Default uses theme colors */
.tabs-head {
  background: var(--primary-color, #0D47A1);
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 8px;
}

/* Override for Main Admin only */
.tabs-head.main-admin-tabs {
  background: #0D47A1 !important;
}

.tabs-head .tabs {
  display: flex;
  gap: 2px;
  height: 100%;
  align-items: flex-end;
}

.tabs-head .tab-open {
  min-width: 110px;
  max-width: 200px;
  height: 26px;
  border-radius: 5px 5px 0 0;
  background-color: var(--primary-color-light, #1565C0);
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  position: relative;
}

/* Override for Main Admin only */
.tabs-head.main-admin-tabs .tab-open {
  background-color: #1565C0 !important;
}

.tabs-head .tab-open span {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tabs-head .tab-open .close-tab {
  color: #fff;
  font-size: 13px;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.2s;
  flex-shrink: 0;
  opacity: 0.8;
}

.tabs-head .tab-open .close-tab:hover {
  background-color: rgba(255, 255, 255, 0.2);
  opacity: 1;
}

.tabs-head .window-opt {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 100%;
}

.tabs-head .window-opt button {
  height: 24px;
  width: 24px;
  border: none;
  background-color: transparent;
  transition: 0.15s ease-out;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 12px;
  opacity: 0.9;
}

.tabs-head .window-opt button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

.tabs-head .window-opt .window-close:hover {
  background-color: #dc3545;
  color: #fff;
}

/* Browser URL Bar - Default uses theme colors */
.head-browser {
  position: relative;
  width: 100%;
  height: 42px;
  background-color: var(--primary-color-light, #1565C0);
  padding: 5px 10px;
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Override for Main Admin only */
.head-browser.main-admin-url {
  background-color: #1565C0 !important;
}

.head-browser button {
  width: 26px;
  height: 26px;
  border: none;
  background-color: transparent;
  color: #fff;
  border-radius: 3px;
  transition: 0.15s ease-in-out;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.head-browser button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.head-browser button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

.head-browser .url-bar {
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  height: 30px;
  border-radius: 15px;
  color: #fff;
  padding: 0 14px;
  flex: 1;
  transition: 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.head-browser .url-bar:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.head-browser .url-text {
  color: #fff;
  font-size: 13px;
  font-weight: 400;
  opacity: 0.9;
}

.head-browser .star {
  color: #fff;
  font-size: 16px;
  opacity: 0.7;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s;
}

.head-browser .star:hover {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

/* Browser Content */
.browser-content {
  background: #fff;
  padding: 32px;
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Logout Modal Specific Styles */
.logout-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 1rem 0;
}

.modal-icon-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color, #0090D3) 0%, var(--primary-color-light, #00B1EF) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 144, 211, 0.3);
}

.modal-icon-large svg {
  stroke: white;
}

.modal-question {
  margin: 0 0 0.5rem 0;
  color: #1F2937;
  font-size: 1.125rem;
  font-weight: 600;
  font-family: 'Prompt', sans-serif;
  line-height: 1.5;
}

.modal-hint {
  margin: 0;
  color: #6B7280;
  font-size: 0.875rem;
  font-family: 'Prompt', sans-serif;
  line-height: 1.4;
}

.btn-cancel,
.btn-confirm {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Prompt', sans-serif;
  min-width: 100px;
}

.btn-cancel {
  background: #E5E7EB;
  color: #374151;
}

.btn-cancel:hover {
  background: #D1D5DB;
}

.btn-confirm {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-confirm:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.btn-cancel:active,
.btn-confirm:active {
  transform: scale(0.98);
}

/* Utility Classes (Tailwind-like) */
.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.gap-4 {
  gap: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.border-t {
  border-top: 1px solid #e5e7eb;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

/* ===== Transitions ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s, opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
  opacity: 0;
}

/* ===== Divider in collapsed state ===== */
.sidebar.collapsed .divider {
  margin: 0 0.5rem;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .sidebar .profile-section {
    margin: 0.5rem;
    padding: 0.5rem;
    justify-content: center;
  }

  .sidebar .menu-section {
    padding: 0.5rem;
  }

  .sidebar .menu-item {
    padding: 0.75rem 0.5rem;
    justify-content: center;
  }
}
</style>
