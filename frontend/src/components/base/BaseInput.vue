<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-[#1a202c] mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
});

defineEmits(['update:modelValue']);

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`);

const inputClasses = computed(() => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed';
  const errorClasses = props.error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-[#0090D3] focus:ring-[#0090D3]';
  return `${baseClasses} ${errorClasses} focus:outline-none focus:ring-2 focus:ring-opacity-50`;
});
</script>
