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
import { ref } from 'vue'
import Sidebar from '@/components/SidebarMenu.vue'

export default {
  name: 'App',
  components: {
    Sidebar
  },
  setup() {
    const isCollapsed = ref(false)

    const handleSidebarToggle = (collapsed) => {
      isCollapsed.value = collapsed
    }

    return {
      isCollapsed,
      handleSidebarToggle
    }
  }
}
</script>

<style>
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
  padding: 1.4rem; /* ลดจาก 2rem -> 1.4rem (70%) */
  background: #f0f4f8;
  margin-left: 140px; /* ลดจาก 200px -> 140px (70%) */
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

/* เมื่อ sidebar ถูกย่อ */
.main-content.sidebar-collapsed {
  margin-left: 42px; /* ลดจาก 60px -> 42px (70%) */
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