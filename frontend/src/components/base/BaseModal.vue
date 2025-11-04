<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);">
        <div class="fixed inset-0" @click="handleClose"></div>

        <div :class="[browserModalClasses, { 'main-admin-modal': isMainAdmin }]" class="browser-modal">
          <!-- Browser Tabs Header -->
          <div :class="{ 'main-admin-tabs': isMainAdmin }" class="tabs-head">
            <div class="tabs">
              <div :class="{ 'main-admin-tab': isMainAdmin }" class="tab-open">
                <span>{{ title }}</span>
                <button @click="emit('close')" class="close-tab">✕</button>
              </div>
            </div>
            <div class="window-opt">
              <button>−</button>
              <button>□</button>
              <button @click="emit('close')" class="window-close">✕</button>
            </div>
          </div>

          <!-- Browser URL Bar -->
          <div :class="{ 'main-admin-url': isMainAdmin }" class="head-browser">
            <button disabled>←</button>
            <button disabled>→</button>
            <div class="url-bar">
              <span class="url-text">{{ urlPath || 'settings' }}</span>
              <button class="star">★</button>
            </div>
            <button>⋮</button>
          </div>

          <!-- Content Area -->
          <div class="browser-content">
            <slot />

            <div v-if="$slots.footer" class="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 -mx-8 -mb-8 mt-6">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
  urlPath: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

// Check if Super Admin (IC_ID = NULL)
const isMainAdmin = computed(() => {
  const companyId = localStorage.getItem('companyId');
  return !companyId || companyId === 'null' || companyId === 'undefined';
});

const browserModalClasses = computed(() => {
  const sizeClasses = {
    sm: 'browser-modal-sm',
    md: 'browser-modal-md',
    lg: 'browser-modal-lg',
    xl: 'browser-modal-xl',
  };
  return sizeClasses[props.size] || 'browser-modal-md';
});

const handleClose = () => {
  if (props.closeOnClickOutside) {
    emit('close');
  }
};
</script>

<style>
/* Browser Modal Container */
.browser-modal {
  width: 650px;
  max-width: 90vw;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

/* Size variants */
.browser-modal-sm {
  width: 500px;
}

.browser-modal-md {
  width: 650px;
}

.browser-modal-lg {
  width: 800px;
}

.browser-modal-xl {
  width: 1000px;
}

/* Browser Tabs Header - Default uses theme colors */
.tabs-head {
  background: var(--primary-color, #0D47A1);
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 8px;
}

/* Override for Main Admin only */
.tabs-head.main-admin-tabs {
  background: #0D47A1 !important;
}

.tabs-head .tabs {
  display: flex;
  gap: 2px;
  height: 100%;
  align-items: flex-end;
}

.tabs-head .tab-open {
  min-width: 110px;
  max-width: 250px;
  height: 26px;
  border-radius: 5px 5px 0 0;
  background-color: var(--primary-color-light, #1565C0);
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  position: relative;
}

/* Override for Main Admin only */
.tabs-head .tab-open.main-admin-tab {
  background-color: #1565C0 !important;
}

.tabs-head .tab-open span {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tabs-head .tab-open .close-tab {
  color: #fff;
  font-size: 13px;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.2s;
  flex-shrink: 0;
  opacity: 0.8;
}

.tabs-head .tab-open .close-tab:hover {
  background-color: rgba(255, 255, 255, 0.2);
  opacity: 1;
}

.tabs-head .window-opt {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 100%;
}

.tabs-head .window-opt button {
  height: 24px;
  width: 24px;
  border: none;
  background-color: transparent;
  transition: 0.15s ease-out;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 12px;
  opacity: 0.9;
}

.tabs-head .window-opt button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

.tabs-head .window-opt .window-close:hover {
  background-color: #dc3545;
  color: #fff;
}

/* Browser URL Bar - Default uses theme colors */
.head-browser {
  position: relative;
  width: 100%;
  height: 42px;
  background-color: var(--primary-color-light, #1565C0);
  padding: 5px 10px;
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Override for Main Admin only */
.head-browser.main-admin-url {
  background-color: #1565C0 !important;
}

.head-browser button {
  width: 26px;
  height: 26px;
  border: none;
  background-color: transparent;
  color: #fff;
  border-radius: 3px;
  transition: 0.15s ease-in-out;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.head-browser button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.head-browser button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

.head-browser .url-bar {
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  height: 30px;
  border-radius: 15px;
  color: #fff;
  padding: 0 14px;
  flex: 1;
  transition: 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.head-browser .url-bar:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.head-browser .url-text {
  color: #fff;
  font-size: 13px;
  font-weight: 400;
  opacity: 0.9;
}

.head-browser .star {
  color: #fff;
  font-size: 16px;
  opacity: 0.7;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s;
}

.head-browser .star:hover {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

/* Browser Content */
.browser-content {
  background: #fff;
  padding: 32px;
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Utility Classes */
.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.gap-3 {
  gap: 0.75rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.border-t {
  border-top: 1px solid #e5e7eb;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.-mx-8 {
  margin-left: -2rem;
  margin-right: -2rem;
}

.-mb-8 {
  margin-bottom: -2rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .browser-modal,
.modal-leave-active .browser-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .browser-modal,
.modal-leave-to .browser-modal {
  transform: scale(0.95);
}
</style>
