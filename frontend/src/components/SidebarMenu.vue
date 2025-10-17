<template>
  <aside 
    :class="[
      'h-screen bg-[#047685] flex flex-col fixed left-0 top-0 shadow-[3px_0_10px_rgba(0,0,0,0.08)] overflow-y-auto font-[\'Prompt\'] z-[1000] custom-scrollbar transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-[70px]' : 'w-40'
    ]"
  >
    
    <!-- Header Section: Hamburger + Company Name -->
    <div class="px-3 py-4 flex items-center gap-3 border-b border-white/15">
      <!-- Hamburger Menu Button -->
      <button 
        @click="toggleSidebar"
        class="w-8 h-8 flex flex-col items-center justify-center gap-[5px] bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 flex-shrink-0 group"
      >
        <span 
          :class="[
            'w-4 h-[2px] bg-white rounded-full transition-all duration-300',
            isCollapsed ? 'rotate-45 translate-y-[7px]' : ''
          ]"
        ></span>
        <span 
          :class="[
            'w-4 h-[2px] bg-white rounded-full transition-all duration-300',
            isCollapsed ? 'opacity-0' : 'opacity-100'
          ]"
        ></span>
        <span 
          :class="[
            'w-4 h-[2px] bg-white rounded-full transition-all duration-300',
            isCollapsed ? '-rotate-45 -translate-y-[7px]' : ''
          ]"
        ></span>
      </button>

      <!-- Company Name -->
      <transition name="fade">
        <div v-if="!isCollapsed" class="flex-1 min-w-0">
          <h1 class="text-sm font-semibold text-white m-0 tracking-[0.3px] whitespace-nowrap overflow-hidden text-ellipsis">
            {{ companyName }}
          </h1>
          <p class="text-[9px] text-white/70 mt-0.5 mb-0 font-light">Cold Storage</p>
        </div>
      </transition>
    </div>

    <!-- Profile Section -->
    <div 
      :class="[
        'py-2.5 flex items-center gap-2 bg-white/8 mx-2.5 mt-3 rounded-lg transition-all duration-300 hover:bg-white/12',
        isCollapsed ? 'px-0 justify-center' : 'px-2.5 hover:translate-x-0.5'
      ]"
    >
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#0090D3] to-[#00B1EF] flex items-center justify-center text-white flex-shrink-0 shadow-[0_3px_6px_rgba(0,144,211,0.25)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <transition name="fade">
        <div v-if="!isCollapsed" class="flex-1 min-w-0">
          <p class="text-[11px] font-semibold text-white m-0 whitespace-nowrap overflow-hidden text-ellipsis">{{ userName }}</p>
          <p v-if="userEmail" class="text-[9px] text-white/70 mt-0.5 mb-0 whitespace-nowrap overflow-hidden text-ellipsis">{{ userEmail }}</p>
        </div>
      </transition>
    </div>

    <!-- Divider -->
    <div class="h-px bg-white/15 my-3 mx-3"></div>

    <!-- Menu Section -->
    <nav class="flex-1 px-2.5 overflow-y-auto custom-scrollbar">
      <router-link
        v-for="item in menuItems"
        :key="item.route"
        :to="item.route"
        :class="[
          'flex items-center gap-2 mb-1.5 rounded-lg text-white/80 no-underline transition-all duration-300 relative overflow-hidden',
          isCollapsed ? 'py-3 px-0 justify-center' : 'py-2.5 px-2.5',
          isActive(item.route)
            ? 'bg-gradient-to-br from-[#0090D3] to-[#00B1EF] text-white shadow-[0_3px_10px_rgba(0,144,211,0.25)]'
            : 'hover:bg-white/10 hover:text-white hover:translate-x-0.5'
        ]"
        :title="isCollapsed ? item.name : ''"
      >
        <!-- Menu Indicator -->
        <div 
          :class="[
            'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] bg-white rounded-r-[3px] transition-all duration-300',
            isActive(item.route) ? 'h-[55%]' : 'h-0'
          ]"
        ></div>
        
        <!-- Menu Icon -->
        <div 
          :class="[
            'flex items-center justify-center flex-shrink-0 transition-transform duration-300',
            'hover:scale-110',
            isActive(item.route) && 'animate-pulse-once'
          ]"
          v-html="item.icon"
        ></div>
        
        <!-- Menu Text -->
        <transition name="fade">
          <span v-if="!isCollapsed" class="text-[11px] font-medium tracking-[0.2px]">{{ item.name }}</span>
        </transition>
      </router-link>
    </nav>

    <!-- Logout Section -->
    <div class="py-2 px-2.5 border-t border-white/15 mt-auto">
      <button 
        @click="showLogoutModal = true"
        :class="[
          'w-full flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 rounded-lg text-white cursor-pointer transition-all duration-300 hover:bg-red-500/30 hover:border-red-400/50 active:scale-95',
          isCollapsed ? 'py-2 px-0 justify-center text-[0px]' : 'py-1.5 px-2 justify-center text-[10px] font-medium'
        ]"
        :title="isCollapsed ? 'Logout' : ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
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

  <!-- Logout Confirmation Modal -->
  <transition name="modal">
    <div 
      v-if="showLogoutModal" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] backdrop-blur-sm"
      @click.self="showLogoutModal = false"
    >
      <div class="bg-white rounded-xl shadow-2xl w-[90%] max-w-md mx-4 overflow-hidden transform transition-all">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-[#047685] to-[#0090D3] px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white m-0">ยืนยันการออกจากระบบ</h3>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-6">
          <p class="text-gray-700 text-sm leading-relaxed m-0">
            คุณต้องการออกจากระบบใช่หรือไม่?
          </p>
          <p class="text-gray-500 text-xs mt-2 mb-0">
            คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อใช้งานต่อ
          </p>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
          <button 
            @click="showLogoutModal = false"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-all duration-200 active:scale-95"
          >
            ยกเลิก
          </button>
          <button 
            @click="confirmLogout"
            class="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
          >
            ยืนยัน Logout
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Sidebar State
const isCollapsed = ref(false);

// Modal State
const showLogoutModal = ref(false);

// Toggle Sidebar
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

// User Data from localStorage
const companyName = ref(localStorage.getItem('companyName') || 'Ruxchai');
const userName = ref(localStorage.getItem('userName') || 'Admin User');
const userEmail = ref(localStorage.getItem('userEmail') || '');

// SVG Icons (ขนาด 16px)
const icons = {
  dashboard: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  truck: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  report: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
  statistics: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
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

// Confirm Logout Handler
const confirmLogout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('companyName');
  showLogoutModal.value = false;
  router.push('/login');
};
</script>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.08);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Pulse Animation for Active Menu Icon */
@keyframes pulse-once {
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

.animate-pulse-once {
  animation: pulse-once 0.5s ease-out;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  aside {
    width: 70px !important;
  }
}
</style>