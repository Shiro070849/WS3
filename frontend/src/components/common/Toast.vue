<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <transition name="toast-slide">
    <div v-if="show" :class="['toast-card', typeClass]">
      <svg class="wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
        <path
          fill-opacity="1"
          d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
        ></path>
      </svg>

      <div class="icon-container">
        <svg v-if="type === 'success'" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="type === 'error'" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else-if="type === 'warning'" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <svg v-else class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div class="message-text-container">
        <p class="message-text">{{ title }}</p>
        <p class="sub-text">{{ message }}</p>
      </div>

      <svg
        @click="close"
        class="cross-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
        ></path>
      </svg>
    </div>
  </transition>
</template>

<script setup>
import { computed, onMounted } from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 4000
  },
  show: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const typeClass = computed(() => `toast-${props.type}`);

const close = () => {
  emit('close', props.id);
};

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      close();
    }, props.duration);
  }
});
</script>

<style scoped>
.toast-card {
  position: relative;
  width: 330px;
  height: 80px;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 10px 15px;
  gap: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  z-index: 0;
}

.toast-success .wave path {
  fill: #22c55e;
}

.toast-error .wave path {
  fill: #ef4444;
}

.toast-warning .wave path {
  fill: #f97316;
}

.toast-info .wave path {
  fill: #3b82f6;
}

.icon-container {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
}

.toast-success .icon-container {
  background-color: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.toast-error .icon-container {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.toast-warning .icon-container {
  background-color: rgba(249, 115, 22, 0.2);
  color: #f97316;
}

.toast-info .icon-container {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.icon {
  width: 20px;
  height: 20px;
}

.message-text-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  z-index: 1;
  min-width: 0;
}

.message-text {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  font-family: 'Prompt', sans-serif;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-text {
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  font-family: 'Prompt', sans-serif;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cross-icon {
  width: 18px;
  height: 18px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
  flex-shrink: 0;
}

.cross-icon:hover {
  color: #4b5563;
  transform: scale(1.1);
}

/* Animations */
.toast-slide-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-slide-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
