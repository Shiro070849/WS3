<template>
  <div class="error-page">
    <div class="error-container">
      <div class="score">00403</div>

      <div class="dino-scene">
        <div class="dino" style="--wh-number: 24;">
          <div class="pixel"></div>
        </div>
        <div class="cactus">
          <div class="cactus-arm-right"></div>
        </div>
      </div>

      <p class="title">ไม่มีสิทธิ์เข้าถึง</p>

      <p class="subtitle">ลองทำดังนี้:</p>

      <ul class="suggestions">
        <li>สิทธิ์การเข้าถึงของคุณอาจถูกเปลี่ยนแปลง</li>
        <li>กรุณา Logout และ Login ใหม่เพื่ออัปเดตสิทธิ์</li>
      </ul>

      <div class="error-actions">
        <button @click="logout" class="btn-primary">
          Logout และ Login ใหม่
        </button>
        <button @click="goToDashboard" class="btn-secondary">
          กลับไปหน้า Dashboard
        </button>
      </div>

      <div class="error-code">ERR_ACCESS_FORBIDDEN</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { usePermissionStore } from '@/stores/permissionStore';

const router = useRouter();
const permissionStore = usePermissionStore();

const logout = () => {
  // Clear permissions และ localStorage
  permissionStore.clearPermissions();
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('companyId');

  // Redirect ไป login
  router.replace('/login');
};

const goToDashboard = () => {
  // Clear history และ redirect ไป Dashboard
  router.replace('/dashboard');
};
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2c2c2c;
  padding: 1rem;
  font-family: 'Prompt', sans-serif;
}

.error-container {
  text-align: left;
  background: #3a3a3a;
  border-radius: 0;
  padding: 3rem 2.5rem;
  box-shadow: none;
  max-width: 500px;
  width: 100%;
  position: relative;
}

.score {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  font-family: monospace;
  font-size: 0.875rem;
  color: #6b6b6b;
}

.dino-scene {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 80px;
  margin: 20px 0 40px 0;
  border-bottom: 3px solid #555;
  position: relative;
  overflow: hidden;
  padding: 0 20px;
}

.dino-scene::before {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: repeating-linear-gradient(
    to right,
    #666 0px,
    #666 4px,
    transparent 4px,
    transparent 8px
  );
}

.dino {
  --zoom: 0.08;
  --wh: calc(var(--wh-number) * 1px);
  --wh-n: calc(var(--wh-number) * -1px);
  width: calc(var(--wh-number) * var(--wh));
  height: calc(var(--wh-number) * var(--wh));
  --color: #fff;
  --blur: 0;
  filter: drop-shadow(var(--wh-n) 0 var(--blur) var(--color))
    drop-shadow(0 var(--wh-n) var(--blur) var(--color))
    drop-shadow(var(--wh) 0 var(--blur) var(--color))
    drop-shadow(0 var(--wh) var(--blur) var(--color));
  image-rendering: pixelated;
  zoom: var(--zoom);
  animation: dinoWalk 0.3s infinite;
  margin-bottom: -3px;
}

.pixel {
  width: var(--wh);
  height: var(--wh);
  box-shadow: var(--shadow);
}

@keyframes dinoWalk {
  0%, 100% {
    --shadow:
      312px 0px #535353, 336px 0px #535353, 360px 0px #535353, 384px 0px #535353, 408px 0px #535353, 432px 0px #535353,
      288px 24px #535353, 312px 24px #535353, 336px 24px #535353, 360px 24px #535353, 384px 24px #535353, 408px 24px #535353, 432px 24px #535353, 456px 24px #535353, 480px 24px #535353, 504px 24px #535353, 528px 24px #535353,
      288px 48px #535353, 312px 48px #535353, 384px 48px #535353, 408px 48px #535353, 432px 48px #535353, 456px 48px #535353, 480px 48px #535353, 504px 48px #535353, 528px 48px #535353,
      288px 72px #535353, 312px 72px #535353, 384px 72px #535353, 408px 72px #535353, 432px 72px #535353, 456px 72px #535353, 480px 72px #535353, 504px 72px #535353, 528px 72px #535353,
      288px 96px #535353, 312px 96px #535353, 336px 96px #535353, 360px 96px #535353, 384px 96px #535353, 408px 96px #535353, 432px 96px #535353, 456px 96px #535353, 480px 96px #535353, 504px 96px #535353, 528px 96px #535353,
      288px 120px #535353, 312px 120px #535353, 336px 120px #535353, 360px 120px #535353, 384px 120px #535353, 408px 120px #535353, 432px 120px #535353, 456px 120px #535353, 480px 120px #535353, 504px 120px #535353, 528px 120px #535353,
      288px 144px #535353, 312px 144px #535353, 336px 144px #535353, 360px 144px #535353, 384px 144px #535353, 408px 144px #535353,
      288px 168px #535353, 312px 168px #535353, 336px 168px #535353, 360px 168px #535353, 384px 168px #535353, 408px 168px #535353,
      288px 192px #535353, 312px 192px #535353, 336px 192px #535353, 360px 192px #535353, 384px 192px #535353, 408px 192px #535353, 432px 192px #535353, 456px 192px #535353, 480px 192px #535353, 504px 192px #535353,
      240px 216px #535353, 264px 216px #535353, 288px 216px #535353, 312px 216px #535353, 336px 216px #535353, 360px 216px #535353, 384px 216px #535353,
      192px 240px #535353, 216px 240px #535353, 240px 240px #535353, 264px 240px #535353, 288px 240px #535353, 312px 240px #535353, 336px 240px #535353, 360px 240px #535353, 384px 240px #535353,
      168px 264px #535353, 192px 264px #535353, 216px 264px #535353, 240px 264px #535353, 264px 264px #535353, 288px 264px #535353, 312px 264px #535353, 336px 264px #535353, 360px 264px #535353, 384px 264px #535353, 408px 264px #535353, 432px 264px #535353,
      144px 288px #535353, 168px 288px #535353, 192px 288px #535353, 216px 288px #535353, 240px 288px #535353, 264px 288px #535353, 288px 288px #535353, 312px 288px #535353, 336px 288px #535353, 360px 288px #535353, 384px 288px #535353, 432px 288px #535353,
      96px 312px #535353, 120px 312px #535353, 144px 312px #535353, 168px 312px #535353, 192px 312px #535353, 216px 312px #535353, 240px 312px #535353, 264px 312px #535353, 288px 312px #535353, 312px 312px #535353, 336px 312px #535353, 360px 312px #535353, 384px 312px #535353,
      96px 336px #535353, 120px 336px #535353, 144px 336px #535353, 168px 336px #535353, 192px 336px #535353, 216px 336px #535353, 240px 336px #535353, 264px 336px #535353, 288px 336px #535353, 312px 336px #535353, 336px 336px #535353, 360px 336px #535353, 384px 336px #535353,
      24px 360px #535353, 48px 360px #535353, 72px 360px #535353, 96px 360px #535353, 120px 360px #535353, 144px 360px #535353, 168px 360px #535353, 192px 360px #535353, 216px 360px #535353, 240px 360px #535353, 264px 360px #535353, 288px 360px #535353, 312px 360px #535353, 336px 360px #535353, 360px 360px #535353, 384px 360px #535353,
      48px 384px #535353, 72px 384px #535353, 96px 384px #535353, 120px 384px #535353, 144px 384px #535353, 168px 384px #535353, 192px 384px #535353, 216px 384px #535353, 240px 384px #535353, 264px 384px #535353, 288px 384px #535353, 312px 384px #535353, 336px 384px #535353, 360px 384px #535353,
      72px 408px #535353, 96px 408px #535353, 120px 408px #535353, 144px 408px #535353, 168px 408px #535353, 192px 408px #535353, 216px 408px #535353, 240px 408px #535353, 264px 408px #535353, 288px 408px #535353, 312px 408px #535353, 336px 408px #535353,
      96px 432px #535353, 120px 432px #535353, 144px 432px #535353, 168px 432px #535353, 192px 432px #535353, 216px 432px #535353, 240px 432px #535353, 264px 432px #535353, 288px 432px #535353, 312px 432px #535353,
      120px 456px #535353, 144px 456px #535353, 168px 456px #535353, 192px 456px #535353, 216px 456px #535353, 240px 456px #535353, 264px 456px #535353, 288px 456px #535353,
      144px 480px #535353, 168px 480px #535353, 192px 480px #535353, 264px 480px #535353, 288px 480px #535353,
      144px 504px #535353, 168px 504px #535353, 288px 504px #535353,
      144px 528px #535353, 288px 528px #535353,
      144px 552px #535353, 168px 552px #535353, 288px 552px #535353, 312px 552px #535353;
  }
  50% {
    --shadow:
      312px 0px #535353, 336px 0px #535353, 360px 0px #535353, 384px 0px #535353, 408px 0px #535353, 432px 0px #535353,
      288px 24px #535353, 312px 24px #535353, 336px 24px #535353, 360px 24px #535353, 384px 24px #535353, 408px 24px #535353, 432px 24px #535353, 456px 24px #535353, 480px 24px #535353, 504px 24px #535353, 528px 24px #535353,
      288px 48px #535353, 312px 48px #535353, 384px 48px #535353, 408px 48px #535353, 432px 48px #535353, 456px 48px #535353, 480px 48px #535353, 504px 48px #535353, 528px 48px #535353,
      288px 72px #535353, 312px 72px #535353, 384px 72px #535353, 408px 72px #535353, 432px 72px #535353, 456px 72px #535353, 480px 72px #535353, 504px 72px #535353, 528px 72px #535353,
      288px 96px #535353, 312px 96px #535353, 336px 96px #535353, 360px 96px #535353, 384px 96px #535353, 408px 96px #535353, 432px 96px #535353, 456px 96px #535353, 480px 96px #535353, 504px 96px #535353, 528px 96px #535353,
      288px 120px #535353, 312px 120px #535353, 336px 120px #535353, 360px 120px #535353, 384px 120px #535353, 408px 120px #535353, 432px 120px #535353, 456px 120px #535353, 480px 120px #535353, 504px 120px #535353, 528px 120px #535353,
      288px 144px #535353, 312px 144px #535353, 336px 144px #535353, 360px 144px #535353, 384px 144px #535353, 408px 144px #535353,
      288px 168px #535353, 312px 168px #535353, 336px 168px #535353, 360px 168px #535353, 384px 168px #535353, 408px 168px #535353,
      288px 192px #535353, 312px 192px #535353, 336px 192px #535353, 360px 192px #535353, 384px 192px #535353, 408px 192px #535353, 432px 192px #535353, 456px 192px #535353, 480px 192px #535353, 504px 192px #535353,
      240px 216px #535353, 264px 216px #535353, 288px 216px #535353, 312px 216px #535353, 336px 216px #535353, 360px 216px #535353, 384px 216px #535353,
      192px 240px #535353, 216px 240px #535353, 240px 240px #535353, 264px 240px #535353, 288px 240px #535353, 312px 240px #535353, 336px 240px #535353, 360px 240px #535353, 384px 240px #535353,
      168px 264px #535353, 192px 264px #535353, 216px 264px #535353, 240px 264px #535353, 264px 264px #535353, 288px 264px #535353, 312px 264px #535353, 336px 264px #535353, 360px 264px #535353, 384px 264px #535353, 408px 264px #535353, 432px 264px #535353,
      144px 288px #535353, 168px 288px #535353, 192px 288px #535353, 216px 288px #535353, 240px 288px #535353, 264px 288px #535353, 288px 288px #535353, 312px 288px #535353, 336px 288px #535353, 360px 288px #535353, 384px 288px #535353, 432px 288px #535353,
      96px 312px #535353, 120px 312px #535353, 144px 312px #535353, 168px 312px #535353, 192px 312px #535353, 216px 312px #535353, 240px 312px #535353, 264px 312px #535353, 288px 312px #535353, 312px 312px #535353, 336px 312px #535353, 360px 312px #535353, 384px 312px #535353,
      96px 336px #535353, 120px 336px #535353, 144px 336px #535353, 168px 336px #535353, 192px 336px #535353, 216px 336px #535353, 240px 336px #535353, 264px 336px #535353, 288px 336px #535353, 312px 336px #535353, 336px 336px #535353, 360px 336px #535353, 384px 336px #535353,
      24px 360px #535353, 48px 360px #535353, 72px 360px #535353, 96px 360px #535353, 120px 360px #535353, 144px 360px #535353, 168px 360px #535353, 192px 360px #535353, 216px 360px #535353, 240px 360px #535353, 264px 360px #535353, 288px 360px #535353, 312px 360px #535353, 336px 360px #535353, 360px 360px #535353, 384px 360px #535353,
      48px 384px #535353, 72px 384px #535353, 96px 384px #535353, 120px 384px #535353, 144px 384px #535353, 168px 384px #535353, 192px 384px #535353, 216px 384px #535353, 240px 384px #535353, 264px 384px #535353, 288px 384px #535353, 312px 384px #535353, 336px 384px #535353, 360px 384px #535353,
      72px 408px #535353, 96px 408px #535353, 120px 408px #535353, 144px 408px #535353, 168px 408px #535353, 192px 408px #535353, 216px 408px #535353, 240px 408px #535353, 264px 408px #535353, 288px 408px #535353, 312px 408px #535353, 336px 408px #535353,
      96px 432px #535353, 120px 432px #535353, 144px 432px #535353, 168px 432px #535353, 192px 432px #535353, 216px 432px #535353, 240px 432px #535353, 264px 432px #535353, 288px 432px #535353, 312px 432px #535353,
      120px 456px #535353, 144px 456px #535353, 168px 456px #535353, 192px 456px #535353, 216px 456px #535353, 240px 456px #535353, 264px 456px #535353, 288px 456px #535353,
      144px 480px #535353, 168px 480px #535353, 264px 480px #535353, 288px 480px #535353,
      144px 504px #535353, 288px 504px #535353,
      144px 528px #535353, 168px 528px #535353, 288px 528px #535353,
      144px 552px #535353, 168px 552px #535353, 264px 552px #535353, 288px 552px #535353;
  }
}

.cactus {
  width: 20px;
  height: 48px;
  background: #888;
  position: relative;
  border-radius: 2px;
  margin-bottom: -3px;
}

.cactus::before {
  content: "";
  position: absolute;
  top: 16px;
  left: -10px;
  width: 12px;
  height: 20px;
  background: #888;
  border-radius: 2px;
}

.cactus-arm-right {
  position: absolute;
  top: 12px;
  right: -10px;
  width: 12px;
  height: 24px;
  background: #888;
  border-radius: 2px;
}

.title {
  font-size: 1.5rem;
  font-weight: 400;
  color: #ccc;
  margin: 0 0 1.5rem 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.subtitle {
  font-size: 0.875rem;
  color: #999;
  margin: 0 0 1rem 0;
}

.suggestions {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.suggestions li {
  font-size: 0.875rem;
  color: #ccc;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1rem;
}

.suggestions li::before {
  content: "•";
  position: absolute;
  left: 0;
  top: 0;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 2rem 0 1.5rem 0;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-family: 'Prompt', sans-serif;
  text-align: center;
}

.btn-primary {
  background: #5a5a5a;
  color: #ffffff;
}

.btn-primary:hover {
  background: #6a6a6a;
}

.btn-secondary {
  background: transparent;
  color: #b8b8b8;
  border: 1px solid #5a5a5a;
}

.btn-secondary:hover {
  background: #4a4a4a;
}

.error-code {
  font-size: 0.75rem;
  color: #666;
  font-family: monospace;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 640px) {
  .error-container {
    padding: 2rem 1.5rem;
  }

  .dino-scene {
    padding: 0 10px;
  }
}
</style>

