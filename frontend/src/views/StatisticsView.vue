<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">สถิติ</h1>
      <p class="page-subtitle">สถิติและการวิเคราะห์ข้อมูล</p>
    </div>

    <div class="page-content">
      <!-- เตรียมไว้สำหรับเนื้อหา Statistics -->
      <div class="content-placeholder">
        <p>เนื้อหา Statistics จะแสดงที่นี่</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Statistics logic จะเขียนตอนทำ Backend API เสร็จ
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 100%;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  font-family: 'Prompt', sans-serif;
}

.page-subtitle {
  font-size: 1rem;
  color: #718096;
  margin: 0;
  font-family: 'Prompt', sans-serif;
}

.page-content {
  width: 100%;
}

.content-placeholder {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #718096;
}
</style>
