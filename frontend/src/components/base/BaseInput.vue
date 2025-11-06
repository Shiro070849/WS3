<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <!-- Prefix Icon -->
      <div v-if="prefixIcon" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <component :is="prefixIcon" class="w-5 h-5" />
      </div>

      <!-- Input Field -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />

      <!-- Suffix Icon -->
      <div v-if="suffixIcon" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <component :is="suffixIcon" class="w-5 h-5" />
      </div>

      <!-- Clear Button -->
      <button
        v-if="clearable && modelValue"
        type="button"
        @click="$emit('update:modelValue', '')"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <p v-if="error" class="mt-1.5 text-xs text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-gray-500">{{ hint }}</p>
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
  // New props for icon support
  prefixIcon: {
    type: [Object, Function],
    default: null,
  },
  suffixIcon: {
    type: [Object, Function],
    default: null,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:modelValue', 'blur', 'focus']);

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`);

const inputClasses = computed(() => {
  const baseClasses = 'block w-full py-2.5 border rounded-lg text-sm transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60';

  // Adjust padding based on icons
  let paddingClasses = 'px-3';
  if (props.prefixIcon) paddingClasses = 'pl-10 pr-3';
  if (props.suffixIcon || props.clearable) paddingClasses = props.prefixIcon ? 'pl-10 pr-10' : 'pl-3 pr-10';

  const errorClasses = props.error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    : 'input-focus';

  return `${baseClasses} ${paddingClasses} ${errorClasses} focus:outline-none focus:ring-2`;
});
</script>
