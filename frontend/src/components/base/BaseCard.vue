<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header px-6 py-5 border-b border-slate-100">
      <slot name="header">
        <h3 class="text-lg font-bold text-slate-800">{{ title }}</h3>
      </slot>
    </div>
    <div :class="contentClasses">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  noPadding: {
    type: Boolean,
    default: false,
  },
});

const cardClasses = computed(() => {
  return 'card-modern bg-white rounded-2xl overflow-hidden transition-all duration-300';
});

const contentClasses = computed(() => {
  return props.noPadding ? '' : 'px-6 py-5';
});
</script>

<style scoped>
.card-modern {
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(10px);
}

.card-modern:hover {
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.15),
    0 10px 15px -3px rgba(0, 0, 0, 0.08),
    0 4px 6px -4px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: rgba(191, 219, 254, 0.6);
}

.card-header {
  background: linear-gradient(135deg,
    rgba(248, 250, 252, 0.9) 0%,
    rgba(241, 245, 249, 0.7) 100%
  );
}

.card-header h3 {
  font-family: 'Prompt', sans-serif;
  letter-spacing: -0.01em;
}
</style>
