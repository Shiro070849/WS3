<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Header Section -->
    <div class="sidebar-header">
      <button @click="toggleSidebar" class="toggle-btn">
        <span class="hamburger-line" :class="{ active: isCollapsed }"></span>
        <span class="hamburger-line" :class="{ active: isCollapsed }"></span>
        <span class="hamburger-line" :class="{ active: isCollapsed }"></span>
      </button>

      <transition name="fade">
        <div v-if="!isCollapsed" class="company-info">
          <h1 class="company-name">{{ companyName }}</h1>
          <p class="company-subtitle">Cold Storage</p>
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
      <button @click="showLogoutModal = true" class="logout-btn" :title="isCollapsed ? 'Logout' : ''">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <transition name="fade">
          <span v-if="!isCollapsed">Logout</span>
        </transition>
      </button>
    </div>
  </aside>

  <!-- Logout Modal -->
  <transition name="modal">
    <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <h3>ยืนยันการออกจากระบบ</h3>
        </div>

        <div class="modal-body">
          <p class="modal-question">คุณต้องการออกจากระบบใช่หรือไม่?</p>
          <p class="modal-hint">กรุณายืนยันการออกจากระบบอีกครั้ง</p>
        </div>

        <div class="modal-footer">
          <button @click="showLogoutModal = false" class="btn-cancel">ยกเลิก</button>
          <button @click="confirmLogout" class="btn-confirm">ยืนยัน Logout</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useRouter, useRoute } from 'vue-router'

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
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userName')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('companyName')
  showLogoutModal.value = false
  router.push('/login')
}
</script>

<style scoped>
/* ===== Sidebar Container ===== */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 140px; /* ลดจาก 200px -> 140px (70%) */
  background: linear-gradient(180deg, #123972 0%, #1a4a7d 50%, #0d3a6d 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  overflow: hidden;
  font-family: 'Prompt', sans-serif;
}

.sidebar.collapsed {
  width: 42px; /* ลดจาก 60px -> 42px (70%) */
}

/* ===== Header ===== */
.sidebar-header {
  padding: 0.7rem; /* ลดจาก 1rem -> 0.7rem (70%) */
  display: flex;
  align-items: center;
  gap: 0.5rem; /* ลดจาก 0.75rem -> 0.5rem */
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  min-height: 45px; /* ลดจาก 65px -> 45px (70%) */
}

.toggle-btn {
  width: 22px; /* ลดจาก 32px -> 22px (70%) */
  height: 22px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px; /* ลดจาก 6px -> 4px */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px; /* ลดจาก 4px -> 3px */
  transition: all 0.3s;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hamburger-line {
  width: 11px; /* ลดจาก 16px -> 11px (70%) */
  height: 1.4px; /* ลดจาก 2px -> 1.4px */
  background: white;
  border-radius: 1.4px;
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
}

.company-name {
  font-size: 0.95rem; /* เพิ่มจาก 0.8rem -> 0.95rem */
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.3;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-subtitle {
  font-size: 0.7rem; /* เพิ่มจาก 0.6rem -> 0.7rem */
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  margin-top: 1.4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Profile ===== */
.profile-section {
  padding: 0.5rem 0.7rem; /* ลดจาก 0.75rem 1rem */
  display: flex;
  align-items: center;
  gap: 0.5rem; /* ลดจาก 0.75rem */
  background: rgba(255, 255, 255, 0.08);
  margin: 0.7rem; /* ลดจาก 1rem */
  border-radius: 5.6px; /* ลดจาก 8px */
  transition: all 0.3s;
}

.sidebar.collapsed .profile-section {
  margin: 0.35rem; /* ลดจาก 0.5rem */
  padding: 0.35rem;
  justify-content: center;
}

.profile-section:hover {
  background: rgba(255, 255, 255, 0.12);
}

.profile-avatar {
  width: 28px; /* เพิ่มขนาด */
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0090D3 0%, #00B1EF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 144, 211, 0.3);
}

.profile-avatar svg {
  width: 16px; /* เพิ่มขนาด icon */
  height: 16px;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 0.875rem; /* เพิ่มจาก 0.75rem -> 0.875rem */
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
  font-size: 0.7rem; /* เพิ่มจาก 0.6rem -> 0.7rem */
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  margin-top: 1.4px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Divider ===== */
.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 0.7rem; /* ลดจาก 1rem */
}

/* ===== Menu ===== */
.menu-section {
  flex: 1;
  padding: 0.7rem 0.5rem; /* ลดจาก 1rem 0.75rem */
  overflow-y: auto;
}

.sidebar.collapsed .menu-section {
  padding: 0.35rem 0.35rem; /* ลดจาก 0.5rem */
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
  gap: 0.5rem; /* ลดจาก 0.75rem */
  padding: 0.5rem; /* ลดจาก 0.75rem */
  margin-bottom: 0.175rem; /* ลดจาก 0.25rem */
  border-radius: 5.6px; /* ลดจาก 8px */
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.sidebar.collapsed .menu-item {
  padding: 0.5rem 0.35rem; /* ลด */
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
  background: linear-gradient(135deg, #0090D3 0%, #00B1EF 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 144, 211, 0.3);
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
  width: 16px; /* เพิ่มขนาด */
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon svg {
  width: 14px; /* เพิ่มขนาด */
  height: 14px;
}

.sidebar.collapsed .menu-icon {
  width: 18px; /* เพิ่มขนาด */
  height: 18px;
}

.sidebar.collapsed .menu-icon svg {
  width: 16px; /* เพิ่มขนาด */
  height: 16px;
}

.menu-text {
  font-size: 0.875rem; /* เพิ่มจาก 0.75rem -> 0.875rem */
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Logout ===== */
.logout-section {
  padding: 0.7rem; /* ลดจาก 1rem */
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.sidebar.collapsed .logout-section {
  padding: 0.5rem 0.35rem; /* ลด */
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5.6px;
  color: white;
  font-size: 0.8rem; /* เพิ่มจาก 0.7rem -> 0.8rem */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Prompt', sans-serif;
  letter-spacing: 0.01em;
  backdrop-filter: blur(10px);
}

.logout-btn svg {
  width: 13px; /* เพิ่มขนาด */
  height: 13px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.logout-btn:active {
  transform: scale(0.98);
}

.sidebar.collapsed .logout-btn {
  padding: 0.5rem 0.35rem;
  gap: 0;
}

.sidebar.collapsed .logout-btn svg {
  width: 14px; /* ลดจาก 20px */
  height: 14px;
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #047685 0%, #0090D3 100%);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 0;
  font-family: 'Prompt', sans-serif;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-question {
  margin: 0 0 0.75rem 0;
  color: #1F2937;
  font-size: 1rem;
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

.modal-footer {
  padding: 1rem 1.5rem;
  background: #F9FAFB;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
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
