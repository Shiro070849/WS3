<template>
  <div class="statistics-view">
    <SidebarMenu />
    <main class="main-content">
      <h1 class="page-title">Statistics</h1>
      <p class="page-description">สถิติและการวิเคราะห์ข้อมูล</p>
    </main>
  </div>
</template>

<script>
import SidebarMenu from '@/components/SidebarMenu.vue';

export default {
  name: 'StatisticsView',
  components: {
    SidebarMenu
  }
}
</script>

<style scoped>
.statistics-view {
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
