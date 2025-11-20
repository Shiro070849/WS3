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
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: all;
}
</style>
