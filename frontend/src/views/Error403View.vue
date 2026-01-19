<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      
      <h1 class="error-title">403</h1>
      <h2 class="error-subtitle">Forbidden</h2>
      <p class="error-message">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      <p class="error-description">กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่เป็นข้อผิดพลาด</p>
      
      <div class="error-actions">
        <button @click="goToDashboard" class="btn-primary">
          กลับไปหน้า Dashboard
        </button>
        <button @click="goBack" class="btn-secondary">
          กลับหน้าก่อนหน้า
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToDashboard = () => {
  router.push('/dashboard');
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  font-family: 'Prompt', sans-serif;
}

.error-container {
  text-align: center;
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
}

.error-icon {
  color: #ef4444;
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.error-title {
  font-size: 4rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1;
}

.error-subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0.5rem 0;
}

.error-message {
  font-size: 1.25rem;
  color: #374151;
  margin: 1.5rem 0 0.5rem;
  font-weight: 500;
}

.error-description {
  font-size: 1rem;
  color: #6b7280;
  margin: 0.5rem 0 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-family: 'Prompt', sans-serif;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}
</style>

