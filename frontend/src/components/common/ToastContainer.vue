<template>
  <div class="toast-container">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :id="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      :show="toast.show"
      @close="handleClose"
    />
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast';
import Toast from './Toast.vue';

const { toasts, removeToast } = useToast();

const handleClose = (id) => {
  removeToast(id);
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  pointer-events: none;
  max-width: 100%;
  padding: 0 12px;
}

.toast-container > * {
  pointer-events: all;
  max-width: calc(100vw - 40px);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .toast-container {
    top: 12px;
    right: 12px;
    left: 12px;
    align-items: stretch;
  }

  .toast-container > * {
    max-width: 100%;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .toast-container {
    top: 20px;
    right: 20px;
  }

  .toast-container > * {
    max-width: 90vw;
  }
}
</style>
