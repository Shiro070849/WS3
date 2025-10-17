<template>
  <div class="settings-view">
    <SidebarMenu />
    <main class="main-content">
      <h1 class="page-title">Settings</h1>
      <p class="page-description">ตั้งค่าระบบและการใช้งาน</p>
    </main>
  </div>
</template>

<script>
import SidebarMenu from '@/components/SidebarMenu.vue';

export default {
  name: 'SettingsView',
  components: {
    SidebarMenu
  }
}
</script>

<style scoped>
.settings-view {
  display: flex;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.page-title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #555;
}
</style>
