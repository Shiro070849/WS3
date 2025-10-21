<template>
  <div class="w-full">
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="$emit('update:modelValue', tab.key)"
          :class="tabClasses(tab.key)"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
        >
          <svg v-if="tab.icon" class="w-5 h-5 mr-2 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
          </svg>
          {{ tab.label }}
        </button>
      </nav>
    </div>
    <div class="mt-6">
      <slot :name="modelValue" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
});

defineEmits(['update:modelValue']);

const tabClasses = (key) => {
  return key === props.modelValue
    ? 'border-[#0090D3] text-[#0090D3]'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
};
</script>
