<template>
  <div class="live-preview sticky top-4">
    <div class="bg-white border border-gray-300 rounded-lg p-4">
      <h3 class="text-lg font-medium text-gray-800 mb-4">ตัวอย่างการแสดงผล</h3>

      <!-- Preview Container -->
      <div
        class="preview-container border rounded-lg overflow-hidden"
        :style="{
          fontFamily: settings.font_family,
          fontSize: `${settings.base_font_size}px`,
          backgroundColor: settings.background_color,
          color: settings.text_color
        }"
      >
        <!-- Header Preview -->
        <div
          class="preview-header flex items-center px-4"
          :style="{
            height: `${settings.header_height}px`,
            backgroundColor: settings.primary_color
          }"
        >
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div
              v-if="settings.logo_url"
              class="logo-preview"
              :style="{ height: `${parseInt(settings.header_height) - 16}px` }"
            >
              <img
                :src="settings.logo_url"
                alt="Logo"
                class="h-full object-contain"
              />
            </div>
            <div
              v-else
              class="logo-placeholder flex items-center justify-center"
              :style="{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: `${settings.border_radius}px`
              }"
            >
              <span class="text-white text-xl font-bold">L</span>
            </div>
            <span class="text-white font-semibold">ชื่อระบบ</span>
          </div>
        </div>

        <!-- Content Preview -->
        <div
          class="preview-content p-4 space-y-3"
          :class="{ 'compact': settings.compact_mode === 'true' }"
        >
          <!-- Sample Card -->
          <div
            class="sample-card border p-3"
            :style="{
              borderRadius: `${settings.border_radius}px`,
              borderColor: settings.secondary_color
            }"
          >
            <h4 class="font-medium mb-2">ตัวอย่างการ์ด</h4>
            <p class="text-sm opacity-80">นี่คือเนื้อหาภายในการ์ด</p>
          </div>

          <!-- Sample Button Primary -->
          <div class="flex gap-2">
            <button
              class="sample-button px-4 py-2 text-white font-medium"
              :style="{
                backgroundColor: settings.primary_color,
                borderRadius: `${settings.border_radius}px`
              }"
            >
              ปุ่มหลัก
            </button>

            <button
              class="sample-button px-4 py-2 text-white font-medium"
              :style="{
                backgroundColor: settings.accent_color,
                borderRadius: `${settings.border_radius}px`
              }"
            >
              ปุ่มเน้น
            </button>
          </div>

          <!-- Sample Input -->
          <div>
            <label class="block text-sm font-medium mb-1">ตัวอย่าง Input</label>
            <input
              type="text"
              placeholder="พิมพ์ข้อความ..."
              class="w-full px-3 py-2 border"
              :style="{
                borderRadius: `${settings.border_radius}px`,
                borderColor: settings.secondary_color,
                fontSize: `${settings.base_font_size}px`
              }"
            />
          </div>

          <!-- Theme Mode Indicator -->
          <div class="theme-indicator flex items-center gap-2 text-xs">
            <span
              class="w-3 h-3 rounded-full"
              :style="{
                backgroundColor: settings.theme_mode === 'light' ? '#FCD34D' :
                                 settings.theme_mode === 'dark' ? '#1F2937' : '#3B82F6'
              }"
            ></span>
            <span>โหมด: {{ themeLabel }}</span>
          </div>

          <!-- Compact Mode Badge -->
          <div v-if="settings.compact_mode === 'true'" class="text-xs">
            <span
              class="inline-block px-2 py-1 rounded text-white"
              :style="{
                backgroundColor: settings.accent_color,
                borderRadius: `${settings.border_radius}px`
              }"
            >
              โหมดกระชับ
            </span>
          </div>
        </div>
      </div>

      <!-- Preview Info -->
      <div class="preview-info mt-4 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
        <div class="flex justify-between">
          <span class="text-gray-600">ฟอนต์:</span>
          <span class="font-medium">{{ settings.font_family }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">ขนาดฟอนต์:</span>
          <span class="font-medium">{{ settings.base_font_size }}px</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">มุมโค้ง:</span>
          <span class="font-medium">{{ settings.border_radius }}px</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">ความสูง Header:</span>
          <span class="font-medium">{{ settings.header_height }}px</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
});

const themeLabel = computed(() => {
  switch (props.settings.theme_mode) {
    case 'light':
      return 'สว่าง';
    case 'dark':
      return 'มืด';
    case 'auto':
      return 'อัตโนมัติ';
    default:
      return 'ไม่ระบุ';
  }
});
</script>

<style scoped>
.live-preview {
  max-width: 100%;
}

.preview-container {
  min-height: 400px;
  transition: all 0.3s ease;
}

.preview-header {
  transition: all 0.3s ease;
}

.preview-content {
  transition: all 0.3s ease;
}

.preview-content.compact {
  padding: 0.75rem;
}

.preview-content.compact .sample-card {
  padding: 0.5rem;
}

.sample-button {
  transition: all 0.2s ease;
  cursor: pointer;
}

.sample-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.logo-preview img {
  max-width: 100%;
}

input:focus {
  outline: none;
  ring: 2px;
  ring-color: currentColor;
}
</style>
