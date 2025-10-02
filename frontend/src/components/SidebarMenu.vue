<template>
  <aside class="sidebar">
    <!-- Logo Section -->
    <div class="logo-section">
      <div class="logo-container">
        <img src="/image/Ruxchai-logo.png" alt="Ruxchai Logo" class="logo-image" />
      </div>
      <h1 class="company-name">Ruxchai</h1>
      <p class="company-subtitle">Cold Storage</p>
    </div>

    <!-- Profile Section -->
    <div class="profile-section">
      <div class="profile-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div class="profile-info">
        <p class="profile-name">{{ userName }}</p>
        <p v-if="userEmail" class="profile-email">{{ userEmail }}</p>
      </div>
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
        :class="{ 'menu-item-active': isActive(item.route) }"
      >
        <div class="menu-indicator"></div>
        <div class="menu-icon" v-html="item.icon"></div>
        <span class="menu-text">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Logout Section -->
    <div class="logout-section">
      <button @click="handleLogout" class="logout-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// User Data from localStorage
const userName = ref(localStorage.getItem('userName') || 'Admin User');
const userEmail = ref(localStorage.getItem('userEmail') || '');

// SVG Icons
const icons = {
  dashboard: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  truck: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  report: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
  statistics: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
};

// Menu Items
const menuItems = [
  { name: 'Dashboard', icon: icons.dashboard, route: '/dashboard' },
  { name: 'ทะเบียนรถ', icon: icons.truck, route: '/vehicle' },
  { name: 'Report', icon: icons.report, route: '/report' },
  { name: 'Statistics', icon: icons.statistics, route: '/statistics' },
  { name: 'Settings', icon: icons.settings, route: '/settings' }
];

// Check if route is active
const isActive = (routePath) => {
  return route.path === routePath;
};

// Logout Handler
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  router.push('/login');
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background: #047685;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  font-family: 'Prompt', sans-serif;
  z-index: 1000;
}

/* Logo Section */
.logo-section {
  padding: 1.5rem 1rem 1rem;
  text-align: center;
}

.logo-container {
  width: 64px;
  height: 64px;
  margin: 0 auto 0.75rem;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;
}

.logo-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.company-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
  letter-spacing: 0.3px;
}

.company-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0 0;
  font-weight: 300;
}

/* Profile Section */
.profile-section {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 0.75rem;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-section:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(3px);
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0090D3, #00B1EF);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 3px 6px rgba(0, 144, 211, 0.25);
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-email {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0.125rem 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Divider */
.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 1rem 1rem;
}

/* Menu Section */
.menu-section {
  flex: 1;
  padding: 0 0.75rem;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  margin-bottom: 0.375rem;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(3px);
}

.menu-item-active {
  background: linear-gradient(135deg, #0090D3, #00B1EF);
  color: white;
  box-shadow: 0 3px 10px rgba(0, 144, 211, 0.25);
}

.menu-item-active:hover {
  transform: translateX(2px);
}

.menu-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: white;
  border-radius: 0 3px 3px 0;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item-active .menu-indicator {
  height: 55%;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.menu-item:hover .menu-icon {
  transform: scale(1.1);
}

.menu-item-active .menu-icon {
  animation: iconPulse 0.5s ease-out;
}

.menu-text {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* Logout Section */
.logout-section {
  padding: 1rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  margin-top: auto;
}

.logout-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Prompt', sans-serif;
}

.logout-button:hover {
  background: rgba(255, 69, 58, 0.15);
  border-color: rgba(255, 69, 58, 0.3);
  transform: scale(1.02);
}

.logout-button:active {
  transform: scale(0.98);
}

/* Animations */
@keyframes iconPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

/* Scrollbar Styling */
.sidebar::-webkit-scrollbar {
  width: 5px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.08);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 180px;
  }
  
  .logo-container {
    width: 56px;
    height: 56px;
  }
  
  .company-name {
    font-size: 1.125rem;
  }
  
  .menu-text {
    font-size: 0.8125rem;
  }
}
</style>