<template>
  <div class="live-preview sticky top-4">
    <div class="bg-white border border-gray-300 rounded-lg p-4">
      <h3 class="text-lg font-medium text-gray-800 mb-4">ตัวอย่างการแสดงผล</h3>

      <!-- Preview Container - Mini Sidebar + Content -->
      <div class="preview-container border rounded-lg overflow-hidden flex">
        <!-- Mini Sidebar Preview -->
        <div
          class="preview-sidebar flex flex-col items-center py-4 px-2"
          :style="{
            background: `linear-gradient(180deg, ${settings.primary_color || '#0090D3'} 0%, ${adjustBrightness(settings.primary_color || '#0090D3', -10)} 50%, ${adjustBrightness(settings.primary_color || '#0090D3', -20)} 100%)`,
            width: '60px'
          }"
        >
          <!-- Logo -->
          <div class="mb-4">
            <div
              v-if="settings.logo_url"
              class="logo-preview w-10 h-10 flex items-center justify-center"
            >
              <img
                :src="logoUrl"
                alt="Logo"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <div
              v-else
              class="logo-placeholder w-10 h-10 flex items-center justify-center rounded-lg"
              :style="{
                backgroundColor: 'rgba(255,255,255,0.2)'
              }"
            >
              <span class="text-white text-xl font-bold">L</span>
            </div>
          </div>

          <!-- Menu Icons -->
          <div class="space-y-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-white bg-opacity-20">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-10">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-10">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Main Content Preview -->
        <div
          class="preview-content flex-1 p-4 space-y-3"
          :style="{
            backgroundColor: settings.background_color,
            color: settings.text_color
          }"
        >
          <!-- Sample Header Text -->
          <div>
            <h4 class="font-semibold text-base mb-1">ตัวอย่างหัวข้อ</h4>
            <p class="text-sm opacity-70">นี่คือตัวอย่างข้อความในระบบ</p>
          </div>

          <!-- Sample Card -->
          <div
            class="sample-card border rounded-lg p-3"
            :style="{
              borderColor: settings.secondary_color,
              backgroundColor: settings.background_color
            }"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-sm">สถิติ</span>
              <span
                class="text-xs px-2 py-1 rounded"
                :style="{
                  backgroundColor: settings.accent_color,
                  color: '#FFFFFF'
                }"
              >
                ใหม่
              </span>
            </div>
            <p class="text-xs opacity-70">ข้อมูลภายในการ์ด</p>
          </div>

          <!-- Sample Buttons -->
          <div class="flex gap-2">
            <button
              class="sample-button px-3 py-2 text-white font-medium text-sm rounded-lg transition-all hover:opacity-90"
              :style="{
                backgroundColor: settings.primary_color
              }"
            >
              ปุ่มหลัก
            </button>

            <button
              class="sample-button px-3 py-2 font-medium text-sm rounded-lg border transition-all hover:opacity-80"
              :style="{
                borderColor: settings.secondary_color,
                color: settings.text_color
              }"
            >
              ยกเลิก
            </button>
          </div>

          <!-- Sample Input -->
          <div>
            <label class="block text-xs font-medium mb-1" :style="{ color: settings.text_color }">
              ช่องกรอกข้อมูล
            </label>
            <input
              type="text"
              placeholder="พิมพ์ข้อความ..."
              class="w-full px-3 py-2 border rounded-lg text-sm"
              :style="{
                borderColor: settings.secondary_color,
                color: settings.text_color,
                backgroundColor: settings.background_color
              }"
            />
          </div>
        </div>
      </div>

      <!-- Color Palette Info -->
      <div class="preview-info mt-4 p-3 bg-gray-50 rounded-lg text-xs space-y-2">
        <div class="font-medium text-gray-700 mb-2">พาเลทสี</div>

        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-center gap-2">
            <div
              class="w-4 h-4 rounded border border-gray-300"
              :style="{ backgroundColor: settings.primary_color }"
            ></div>
            <span class="text-gray-600">สีหลัก</span>
          </div>

          <div class="flex items-center gap-2">
            <div
              class="w-4 h-4 rounded border border-gray-300"
              :style="{ backgroundColor: settings.secondary_color }"
            ></div>
            <span class="text-gray-600">สีรอง</span>
          </div>

          <div class="flex items-center gap-2">
            <div
              class="w-4 h-4 rounded border border-gray-300"
              :style="{ backgroundColor: settings.accent_color }"
            ></div>
            <span class="text-gray-600">สีเน้น</span>
          </div>

          <div class="flex items-center gap-2">
            <div
              class="w-4 h-4 rounded border border-gray-300"
              :style="{ backgroundColor: settings.background_color }"
            ></div>
            <span class="text-gray-600">พื้นหลัง</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getBackendBaseUrl } from '@/services/api';

const props = defineProps({
  settings: {
    type: Object,
    required: true,
    default: () => ({
      logo_url: '',
      favicon_url: '',
      primary_color: '#0090D3',
      secondary_color: '#6B7280',
      accent_color: '#10B981',
      background_color: '#FFFFFF',
      text_color: '#1A202C'
    })
  }
});

// Helper function: สร้าง Full URL สำหรับรูปภาพ (ใช้ environment variable)
const getImageUrl = (url) => {
  if (!url) return '';
  // ถ้า URL เป็น full URL (http/https) ให้ใช้ตรงๆ
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // ถ้าเป็น relative path ให้เติม backend base URL จาก .env
  return `${getBackendBaseUrl()}${url}`;
};

// Helper function: ปรับความสว่างของสี
const adjustBrightness = (hex, percent) => {
  if (!hex || !hex.startsWith('#')) return hex;

  // Remove # and parse RGB
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + Math.round(2.55 * percent)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(2.55 * percent)));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const logoUrl = computed(() => getImageUrl(props.settings.logo_url));
</script>

<style scoped>
.live-preview {
  max-width: 100%;
}

.preview-container {
  min-height: 350px;
  transition: all 0.3s ease;
}

.preview-sidebar {
  transition: all 0.3s ease;
}

.preview-content {
  transition: all 0.3s ease;
}

.sample-button {
  cursor: pointer;
}

.sample-button:hover {
  opacity: 0.9;
}

.logo-preview img {
  max-width: 100%;
}

input:focus {
  outline: none;
  border-width: 2px;
}
</style>
