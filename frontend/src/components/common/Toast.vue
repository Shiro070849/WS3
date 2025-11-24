<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <transition name="toast-fade">
    <div v-if="show" :class="['relative w-full max-w-md px-5 py-4 bg-white rounded-lg shadow-lg overflow-hidden flex items-center gap-5 mb-3 font-prompt transition-all', typeClass]">
      <!-- Wave SVG -->
      <svg class="absolute left-0 top-0 w-20 h-20 transform -rotate-90 -translate-x-6 translate-y-3 pointer-events-none" :style="{ fill: waveColor }" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z" fill-opacity="0.2"></path>
      </svg>

      <!-- Icon Container -->
      <div :class="['relative z-10 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center', iconBgColor]">
        <svg v-if="type === 'success'" class="w-6 h-6" :style="{ color: iconColor }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="type === 'error'" class="w-6 h-6" :style="{ color: iconColor }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <svg v-else-if="type === 'warning'" class="w-6 h-6" :style="{ color: iconColor }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        <svg v-else class="w-6 h-6" :style="{ color: iconColor }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
      </div>

      <!-- Text Content -->
      <div class="relative z-10 flex-1 min-w-0">
        <p class="text-base font-bold mb-1" :style="{ color: titleColor }">{{ title }}</p>
        <p v-if="message" class="text-sm text-gray-600">{{ message }}</p>
      </div>

      <!-- Close Button -->
      <button @click="close" class="relative z-10 flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors" aria-label="Close notification">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" class="w-5 h-5" fill="currentColor">
          <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
        </svg>
      </button>
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

const typeClass = computed(() => {
  const types = {
    success: 'border-l-4 border-green-500',
    error: 'border-l-4 border-red-500',
    warning: 'border-l-4 border-amber-500',
    info: 'border-l-4 border-blue-500'
  };
  return types[props.type] || types.info;
});

const iconBgColor = computed(() => {
  const colors = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    warning: 'bg-amber-100',
    info: 'bg-blue-100'
  };
  return colors[props.type] || colors.info;
});

const iconColor = computed(() => {
  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  return colors[props.type] || colors.info;
});

const titleColor = computed(() => {
  const colors = {
    success: '#166534',
    error: '#991b1b',
    warning: '#b45309',
    info: '#1e40af'
  };
  return colors[props.type] || colors.info;
});

const waveColor = computed(() => {
  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  return colors[props.type] || colors.info;
});

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
.toast-fade-enter-active {
  animation: slideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-fade-leave-active {
  animation: slideOut 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%) translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%) translateY(-10px);
    opacity: 0;
  }
}
</style>
