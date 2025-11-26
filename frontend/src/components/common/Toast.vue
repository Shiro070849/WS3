<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <transition name="toast-slide">
    <div v-if="show" :class="['group relative w-full max-w-sm rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 font-prompt', toastBgClass]">
      <!-- Gradient Border Top -->
      <div :class="['absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', gradientBorderClass]"></div>

      <!-- Progress Bar -->
      <div v-if="duration > 0" class="absolute bottom-0 left-0 h-0.5" :style="{ backgroundImage: `linear-gradient(to right, ${progressColor}, ${progressColorLight})`, animation: `progress ${duration}ms linear forwards` }"></div>

      <!-- Main Content -->
      <div class="relative flex items-start gap-4 px-5 py-4 backdrop-blur-sm">
        <!-- Icon Container -->
        <div :class="['flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110', iconBgClass]">
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
        <div class="flex-1 min-w-0 pt-0.5">
          <p class="text-base font-semibold leading-tight mb-1.5 tracking-wide" :style="{ color: titleColor }">{{ title }}</p>
          <p v-if="message" class="text-sm leading-relaxed opacity-90" :style="{ color: messageColor }">{{ message }}</p>
        </div>

        <!-- Close Button -->
        <button @click="close" :class="['flex-shrink-0 p-1 rounded-lg transition-all duration-200 opacity-60 hover:opacity-100', closeButtonHoverClass]" aria-label="Close notification">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" class="w-5 h-5" fill="currentColor">
            <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
          </svg>
        </button>
      </div>
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

const colorScheme = {
  success: {
    bg: 'bg-emerald-50',
    border: 'from-emerald-400 to-emerald-500',
    icon: '#10b981',
    iconBg: 'bg-emerald-100',
    title: '#065f46',
    message: '#047857',
    progress: '#10b981',
    progressLight: '#d1fae5'
  },
  error: {
    bg: 'bg-red-50',
    border: 'from-red-400 to-red-500',
    icon: '#ef4444',
    iconBg: 'bg-red-100',
    title: '#7f1d1d',
    message: '#dc2626',
    progress: '#ef4444',
    progressLight: '#fee2e2'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'from-amber-400 to-amber-500',
    icon: '#f59e0b',
    iconBg: 'bg-amber-100',
    title: '#92400e',
    message: '#d97706',
    progress: '#f59e0b',
    progressLight: '#fef3c7'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'from-blue-400 to-blue-500',
    icon: '#3b82f6',
    iconBg: 'bg-blue-100',
    title: '#1e3a8a',
    message: '#1d4ed8',
    progress: '#3b82f6',
    progressLight: '#dbeafe'
  }
};

const scheme = computed(() => colorScheme[props.type] || colorScheme.info);

const toastBgClass = computed(() => scheme.value.bg);

const gradientBorderClass = computed(() => scheme.value.border);

const iconBgClass = computed(() => scheme.value.iconBg);

const iconColor = computed(() => scheme.value.icon);

const titleColor = computed(() => scheme.value.title);

const messageColor = computed(() => scheme.value.message);

const progressColor = computed(() => scheme.value.progress);

const progressColorLight = computed(() => scheme.value.progressLight);

const closeButtonHoverClass = computed(() => {
  const classes = {
    success: 'hover:bg-emerald-200',
    error: 'hover:bg-red-200',
    warning: 'hover:bg-amber-200',
    info: 'hover:bg-blue-200'
  };
  return classes[props.type] || classes.info;
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
.toast-slide-enter-active {
  animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-leave-active {
  animation: slideOutRight 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes slideInRight {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(120%);
    opacity: 0;
  }
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
