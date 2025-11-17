<template>
  <Teleport to="body">
    <Transition name="notification">
      <div
        v-if="notification.show"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click="closeNotification"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div
          class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          @click.stop
        >
          <!-- Icon & Color Bar -->
          <div :class="headerClass">
            <div class="flex items-center justify-center w-16 h-16 rounded-full bg-white/20">
              <component :is="iconComponent" class="w-8 h-8 text-white" />
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 text-center">
            <h3 class="text-xl font-semibold text-gray-900 mb-2 font-prompt">
              {{ notification.title }}
            </h3>
            <p class="text-gray-600 font-prompt">
              {{ notification.message }}
            </p>
          </div>

          <!-- Footer -->
          <div class="px-6 pb-6">
            <button
              @click="closeNotification"
              :class="buttonClass"
              class="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 font-prompt"
            >
              ตกลง
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, h } from 'vue';
import { useNotification } from '@/composables/useNotification';

const { notification, closeNotification } = useNotification();

// Keyboard support
const handleKeydown = (e) => {
  if (e.key === 'Escape' && notification.value.show) {
    closeNotification();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Icons (using h() render function to avoid template compilation warning)
const SuccessIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 13l4 4L19 7' })
  ])
};

const ErrorIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M6 18L18 6M6 6l12 12' })
  ])
};

const WarningIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
  ])
};

const InfoIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
};

const iconComponent = computed(() => {
  const icons = {
    success: SuccessIcon,
    error: ErrorIcon,
    warning: WarningIcon,
    info: InfoIcon,
  };
  return icons[notification.value.type] || InfoIcon;
});

const headerClass = computed(() => {
  const classes = {
    success: 'bg-gradient-to-br from-green-500 to-green-600',
    error: 'bg-gradient-to-br from-red-500 to-red-600',
    warning: 'bg-gradient-to-br from-amber-500 to-amber-600',
    info: 'bg-gradient-to-br from-blue-500 to-blue-600',
  };
  return `${classes[notification.value.type] || classes.info} p-8 flex items-center justify-center`;
});

const buttonClass = computed(() => {
  const classes = {
    success: 'bg-green-500 hover:bg-green-600 text-white',
    error: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    info: 'bg-blue-500 hover:bg-blue-600 text-white',
  };
  return classes[notification.value.type] || classes.info;
});
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: opacity 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
}

.notification-enter-active .relative,
.notification-leave-active .relative {
  transition: transform 0.3s ease;
}

.notification-enter-from .relative {
  transform: scale(0.9);
}

.notification-leave-to .relative {
  transform: scale(0.9);
}
</style>
