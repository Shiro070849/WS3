<template>
  <aside class="sidebar">
    <!-- Logo & Company Name -->
    <div class="sidebar-header">
      <img src="/frontend/public/image/Ruxchai-logo.png" alt="Ruxchai Logo" class="logo" />
      <h2 class="company-name">Ruxchai</h2>
      <p class="company-subtitle">Cold Storage</p>
    </div>

    <!-- User Profile -->
    <div class="user-profile">
      <div class="avatar">
        <i class="user-icon">👤</i>
      </div>
      <div class="user-info">
        <p class="user-name">{{ userName }}</p>
        <p class="user-email">{{ userEmail }}</p>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="nav-menu">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path" 
        :to="item.path" 
        class="nav-item"
        :class="{ 'active': $route.path === item.path }"
      >
        <i class="nav-icon">{{ item.icon }}</i>
        <span class="nav-text">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Logout Button -->
    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-btn">
        <i class="logout-icon">🚪</i>
        <span>ออกจากระบบ</span>
      </button>
      
      <!-- Active Users Info -->
      <div class="active-users">
        <p class="active-label">Active Users</p>
        <div class="user-avatars">
          <span class="mini-avatar">👤</span>
          <span class="mini-avatar">👤</span>
          <span class="mini-avatar">👤</span>
          <span class="user-count">+70</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'SidebarNav',
  data() {
    return {
      userName: 'Admin User',
      userEmail: 'admin@ruxchai.com',
      menuItems: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          icon: '🏠'
        },
        {
          path: '/vehicle',
          name: 'ทะเบียนรถ',
          icon: '🚗'
        },
        {
          path: '/report',
          name: 'Report',
          icon: '📊'
        },
        {
          path: '/statistics',
          name: 'Statistics',
          icon: '📈'
        },
        {
          path: '/settings',
          name: 'Settings',
          icon: '⚙️'
        }
      ]
    }
  },
  methods: {
    handleLogout() {
      // ลบข้อมูล login
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      
      // กลับไปหน้า Login
      this.$router.push('/login');
    }
  },
  mounted() {
    // โหลดข้อมูล User จาก localStorage
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    
    if (savedName) this.userName = savedName;
    if (savedEmail) this.userEmail = savedEmail;
  }
}
</script>

<style scoped>
/* ===== Sidebar Container ===== */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, #2d3e3e 0%, #1a2828 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;
}

/* ===== Header Section ===== */
.sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 0.75rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.company-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0090D3;
  margin: 0;
  letter-spacing: 0.5px;
}

.company-subtitle {
  font-size: 0.875rem;
  color: #3AAA35;
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

/* ===== User Profile Section ===== */
.user-profile {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0090D3 0%, #3AAA35 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-icon {
  font-size: 1.5rem;
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Navigation Menu ===== */
.nav-menu {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  font-size: 0.95rem;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #0090D3;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.nav-item:hover {
  background: rgba(0, 144, 211, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(0, 144, 211, 0.15);
  color: white;
  font-weight: 600;
}

.nav-item.active::before {
  transform: scaleY(1);
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 0.95rem;
}

/* ===== Footer Section ===== */
.sidebar-footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  padding: 0.875rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.5);
  color: #fee2e2;
  transform: translateY(-1px);
}

.logout-icon {
  font-size: 1.125rem;
}

/* ===== Active Users ===== */
.active-users {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.active-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.5rem 0;
}

.user-avatars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.mini-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #047685 0%, #258C1F 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: 2px solid #2d3e3e;
}

.user-count {
  margin-left: 0.25rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

/* ===== Scrollbar ===== */
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ===== Responsive ===== */
@media (max-width: 767px) {
  .sidebar {
    width: 70px;
  }
  
  .company-name,
  .company-subtitle,
  .user-info,
  .nav-text,
  .logout-btn span,
  .active-users {
    display: none;
  }
  
  .sidebar-header {
    padding: 1.5rem 0.5rem;
  }
  
  .logo {
    width: 40px;
    height: 40px;
  }
  
  .user-profile {
    justify-content: center;
    padding: 1rem 0.5rem;
  }
  
  .nav-item {
    justify-content: center;
    padding: 1rem 0.5rem;
  }
  
  .logout-btn {
    padding: 0.875rem 0.5rem;
  }
}
</style>