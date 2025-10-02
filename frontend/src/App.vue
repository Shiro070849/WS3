<template>
  <div id="app">
    <!-- ถ้าไม่ใช่หน้า Login → แสดง Sidebar + Content -->
    <div v-if="!$route.meta.hideLayout" class="app-layout">
      <Sidebar />
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>

    <!-- ถ้าเป็นหน้า Login → แสดงเฉพาะ LoginView เต็มจอ -->
    <router-view v-else />
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'App',
  components: {
    Sidebar
  }
}
</script>

<style>
/* ===== Base Styles ===== */
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
}

body {
  background: #f0f4f8;
  color: #1a202c;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* ===== Layout with Sidebar ===== */
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.content-wrapper {
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
  background: #f0f4f8;
  min-height: 100vh;
}

/* ===== Scrollbar ===== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #e5e7eb;
}

::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>