<template>
  <div class="flex items-center">
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="w-4 h-4 text-[#0090D3] bg-white border-gray-300 rounded focus:ring-[#0090D3]/20 focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    />
    <label
      :for="checkboxId"
      class="ml-2 text-sm text-gray-700 cursor-pointer select-none"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:modelValue']);

const checkboxId = computed(() => `checkbox-${Math.random().toString(36).substr(2, 9)}`);
</script>
