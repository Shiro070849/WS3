<template>
  <div class="appearance-settings">
    <BaseCard>
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-[#1a202c]">การตั้งค่ารูปแบบ</h2>
        <p class="text-sm text-gray-500 mt-1">ปรับแต่งรูปลักษณ์ของระบบ</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Settings Form -->
        <div class="lg:col-span-2">
          <form @submit.prevent="handleSave" class="space-y-6">
            <!-- ส่วนที่ 1: โลโก้และ Favicon -->
            <div class="border-b pb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">โลโก้และไอคอน</h3>
              <div class="space-y-4">
                <!-- โลโก้ระบบ - Upload -->
                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">
                    โลโก้ระบบ (อัปโหลดไฟล์)
                  </label>
                  <input
                    ref="logoFileInput"
                    type="file"
                    @change="handleLogoUpload"
                    accept="image/*"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] text-sm"
                  />
                  <p class="text-sm text-gray-500 mt-1">รองรับ: .png, .jpg, .jpeg, .svg, .webp (สูงสุด 5MB)</p>
                  <div v-if="formData.logo_url" class="mt-2">
                    <img :src="logoPreviewUrl" alt="Logo Preview" class="h-16 object-contain border rounded p-2">
                  </div>
                </div>

                <!-- โลโก้ระบบ - URL -->
                <BaseInput
                  v-model="formData.logo_url"
                  label="URL รูปภาพโลโก้ (หรือระบุ URL โดยตรง)"
                  placeholder="https://example.com/logo.png"
                />

                <!-- Favicon - Upload -->
                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">
                    Favicon (อัปโหลดไฟล์)
                  </label>
                  <input
                    ref="faviconFileInput"
                    type="file"
                    @change="handleFaviconUpload"
                    accept="image/*"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] text-sm"
                  />
                  <p class="text-sm text-gray-500 mt-1">รองรับ: .png, .jpg, .jpeg, .svg, .webp (สูงสุด 5MB)</p>
                  <div v-if="formData.favicon_url" class="mt-2">
                    <img :src="faviconPreviewUrl" alt="Favicon Preview" class="h-8 w-8 object-contain border rounded p-1">
                  </div>
                </div>

                <!-- Favicon - URL -->
                <BaseInput
                  v-model="formData.favicon_url"
                  label="URL รูปภาพ Favicon (หรือระบุ URL โดยตรง)"
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>

            <!-- ส่วนที่ 2: สี -->
            <div class="border-b pb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">สี</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">สีหลัก</label>
                  <div class="flex gap-2">
                    <input
                      type="color"
                      v-model="formData.primary_color"
                      class="w-16 h-10 rounded border"
                    />
                    <input
                      type="text"
                      v-model="formData.primary_color"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="#0090D3"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">สีรอง</label>
                  <div class="flex gap-2">
                    <input
                      type="color"
                      v-model="formData.secondary_color"
                      class="w-16 h-10 rounded border"
                    />
                    <input
                      type="text"
                      v-model="formData.secondary_color"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="#6B7280"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">สีเน้น</label>
                  <div class="flex gap-2">
                    <input
                      type="color"
                      v-model="formData.accent_color"
                      class="w-16 h-10 rounded border"
                    />
                    <input
                      type="text"
                      v-model="formData.accent_color"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="#10B981"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">สีพื้นหลัง</label>
                  <div class="flex gap-2">
                    <input
                      type="color"
                      v-model="formData.background_color"
                      class="w-16 h-10 rounded border"
                    />
                    <input
                      type="text"
                      v-model="formData.background_color"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">สีตัวอักษร</label>
                  <div class="flex gap-2">
                    <input
                      type="color"
                      v-model="formData.text_color"
                      class="w-16 h-10 rounded border"
                    />
                    <input
                      type="text"
                      v-model="formData.text_color"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="#1A202C"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- ส่วนที่ 3: ธีมและฟอนต์ -->
            <div class="border-b pb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">ธีมและฟอนต์</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">โหมดธีม</label>
                  <select
                    v-model="formData.theme_mode"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] text-sm"
                  >
                    <option value="light">Light (สว่าง)</option>
                    <option value="dark">Dark (มืด)</option>
                    <option value="auto">Auto (อัตโนมัติ)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">ฟอนต์</label>
                  <select
                    v-model="formData.font_family"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] text-sm"
                  >
                    <option value="Prompt">Prompt</option>
                    <option value="Sarabun">Sarabun</option>
                    <option value="Kanit">Kanit</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- ส่วนที่ 4: การตั้งค่าเลย์เอาต์ -->
            <div class="border-b pb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">เลย์เอาต์</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">มุมโค้ง (px)</label>
                  <input
                    type="number"
                    v-model.number="formData.border_radius"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] text-sm"
                    min="0"
                    max="20"
                  />
                </div>

                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">ขนาดฟอนต์ (px)</label>
                  <input
                    type="number"
                    v-model.number="formData.base_font_size"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] text-sm"
                    min="12"
                    max="18"
                  />
                </div>

                <div>
                  <label class="block text-base font-medium text-gray-700 mb-2">ความสูง Header (px)</label>
                  <input
                    type="number"
                    v-model.number="formData.header_height"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] text-sm"
                    min="48"
                    max="80"
                  />
                </div>
              </div>
            </div>

            <!-- ส่วนที่ 5: โหมดกระชับ -->
            <div class="border-b pb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">โหมดการแสดงผล</h3>
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="compactModeChecked"
                  id="compactMode"
                  class="w-5 h-5 rounded border-gray-300 text-[#0090D3] focus:ring-[#0090D3]"
                />
                <label for="compactMode" class="text-base font-medium text-gray-700">
                  เปิดใช้โหมดกระชับ (Compact Mode)
                </label>
              </div>

              <!-- คำแนะนำ -->
              <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 class="text-sm font-medium text-blue-900 mb-2">คำแนะนำ:</h4>
                <ul class="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>โหมดกระชับจะลดขนาด padding และ spacing ของ UI</li>
                  <li>เหมาะสำหรับจอขนาดเล็กหรือต้องการดูข้อมูลจำนวนมากในครั้งเดียว</li>
                  <li>สามารถสลับระหว่างโหมดปกติและโหมดกระชับได้ตลอดเวลา</li>
                </ul>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end gap-3 pt-4 border-t">
              <BaseButton
                type="button"
                variant="secondary"
                @click="handleReset"
                :disabled="loading"
              >
                รีเซ็ต
              </BaseButton>
              <BaseButton
                type="submit"
                variant="primary"
                :loading="loading"
              >
                บันทึก
              </BaseButton>
            </div>
          </form>
        </div>

        <!-- Right Column: Live Preview -->
        <div class="lg:col-span-1">
          <LivePreview :settings="formData" />
        </div>
      </div>
    </BaseCard>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import BaseCard from '../base/BaseCard.vue';
import BaseInput from '../base/BaseInput.vue';
import BaseButton from '../base/BaseButton.vue';
import LivePreview from './LivePreview.vue';
import { systemSettingsAPI, getBackendBaseUrl } from '@/services/api';
import { useTheme } from '@/composables/useTheme';

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  }
});

const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const logoFileInput = ref(null);
const faviconFileInput = ref(null);

// Use theme composable
const { reloadTheme, applyTheme } = useTheme();

const formData = ref({
  logo_url: '',
  favicon_url: '',
  primary_color: '#0090D3',
  secondary_color: '#6B7280',
  theme_mode: 'light',
  font_family: 'Prompt',
  accent_color: '#10B981',
  background_color: '#FFFFFF',
  text_color: '#1A202C',
  border_radius: '8',
  base_font_size: '14',
  header_height: '64',
  compact_mode: 'false'
});

const originalData = ref({});

// Computed property สำหรับ checkbox
const compactModeChecked = computed({
  get: () => formData.value.compact_mode === 'true',
  set: (val) => {
    formData.value.compact_mode = val ? 'true' : 'false';
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

// Computed properties สำหรับแสดงรูป
const logoPreviewUrl = computed(() => getImageUrl(formData.value.logo_url));
const faviconPreviewUrl = computed(() => getImageUrl(formData.value.favicon_url));

// ดึงข้อมูล
const fetchSettings = async () => {
  try {
    loading.value = true;
    console.log('📥 Fetching appearance settings for company ID:', props.companyId);
    const response = await systemSettingsAPI.getAppearance(props.companyId);

    if (response.data.success) {
      formData.value = { ...response.data.data };
      originalData.value = { ...response.data.data };
      console.log('✅ Appearance settings loaded:', formData.value);
    }
  } catch (error) {
    console.error('❌ Error fetching appearance settings:', error);
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลได้';
  } finally {
    loading.value = false;
  }
};

// Watch companyId changes
watch(() => props.companyId, (newId) => {
  if (newId) {
    console.log('🔄 Company changed to ID:', newId);
    fetchSettings();
  }
});

// Watch formData changes for Live Preview (ไม่ save แค่ preview)
watch(() => formData.value, (newSettings) => {
  // Update Live Preview component only (ไม่ apply ให้ทั้งระบบ)
  // Live Preview จะใช้ prop :settings="formData" อยู่แล้ว
}, { deep: true });

// Validate color format
const isValidColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

// Validate form data
const validateForm = () => {
  const errors = [];

  // Validate colors
  if (formData.value.primary_color && !isValidColor(formData.value.primary_color)) {
    errors.push('สีหลักไม่ถูกต้อง (ต้องเป็น #RRGGBB)');
  }
  if (formData.value.secondary_color && !isValidColor(formData.value.secondary_color)) {
    errors.push('สีรองไม่ถูกต้อง (ต้องเป็น #RRGGBB)');
  }
  if (formData.value.accent_color && !isValidColor(formData.value.accent_color)) {
    errors.push('สีเน้นไม่ถูกต้อง (ต้องเป็น #RRGGBB)');
  }
  if (formData.value.background_color && !isValidColor(formData.value.background_color)) {
    errors.push('สีพื้นหลังไม่ถูกต้อง (ต้องเป็น #RRGGBB)');
  }
  if (formData.value.text_color && !isValidColor(formData.value.text_color)) {
    errors.push('สีตัวอักษรไม่ถูกต้อง (ต้องเป็น #RRGGBB)');
  }

  // Validate numbers
  if (formData.value.border_radius < 0 || formData.value.border_radius > 20) {
    errors.push('มุมโค้งต้องอยู่ระหว่าง 0-20 px');
  }
  if (formData.value.base_font_size < 12 || formData.value.base_font_size > 18) {
    errors.push('ขนาดฟอนต์ต้องอยู่ระหว่าง 12-18 px');
  }
  if (formData.value.header_height < 48 || formData.value.header_height > 80) {
    errors.push('ความสูง Header ต้องอยู่ระหว่าง 48-80 px');
  }

  return errors;
};

// บันทึกข้อมูล
const handleSave = async () => {
  // Validate form
  const errors = validateForm();
  if (errors.length > 0) {
    errorMessage.value = errors.join(', ');
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
    return;
  }

  try {
    loading.value = true;
    successMessage.value = '';
    errorMessage.value = '';

    console.log('💾 Saving appearance settings for company ID:', props.companyId);
    console.log('📦 Form data:', formData.value);

    const response = await systemSettingsAPI.updateAppearance(formData.value, props.companyId);

    if (response.data.success) {
      successMessage.value = 'บันทึกข้อมูลสำเร็จ และ Apply Theme แล้ว';
      originalData.value = { ...formData.value };
      console.log('✅ Appearance settings saved successfully');

      // Apply theme immediately after save
      console.log('🎨 Applying theme to entire application...');
      await reloadTheme(props.companyId);

      // ซ่อนข้อความหลัง 3 วินาที
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    }
  } catch (error) {
    console.error('❌ Error saving appearance settings:', error);
    errorMessage.value = error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  } finally {
    loading.value = false;
  }
};

// อัปโหลดโลโก้
const handleLogoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'ไฟล์ใหญ่เกิน 5MB';
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
    if (logoFileInput.value) {
      logoFileInput.value.value = '';
    }
    return;
  }

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = 'รองรับเฉพาะไฟล์ภาพ: .png, .jpg, .jpeg, .svg, .webp';
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
    if (logoFileInput.value) {
      logoFileInput.value.value = '';
    }
    return;
  }

  try {
    loading.value = true;
    successMessage.value = '';
    errorMessage.value = '';
    console.log('📤 Uploading logo...');
    const response = await systemSettingsAPI.uploadImage(file, props.companyId, 'logo');

    if (response.data.success) {
      // Store relative path only (backend will serve from /uploads)
      formData.value.logo_url = response.data.data.url;
      successMessage.value = 'อัปโหลดโลโก้สำเร็จ';
      console.log('✅ Logo uploaded:', formData.value.logo_url);
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    }
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    errorMessage.value = error.response?.data?.message || 'ไม่สามารถอัปโหลดโลโก้ได้';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  } finally {
    loading.value = false;
    // Clear file input
    if (logoFileInput.value) {
      logoFileInput.value.value = '';
    }
  }
};

// อัปโหลด Favicon
const handleFaviconUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'ไฟล์ใหญ่เกิน 5MB';
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
    if (faviconFileInput.value) {
      faviconFileInput.value.value = '';
    }
    return;
  }

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/x-icon'];
  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = 'รองรับเฉพาะไฟล์ภาพ: .png, .jpg, .jpeg, .svg, .webp, .ico';
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
    if (faviconFileInput.value) {
      faviconFileInput.value.value = '';
    }
    return;
  }

  try {
    loading.value = true;
    successMessage.value = '';
    errorMessage.value = '';
    console.log('📤 Uploading favicon...');
    const response = await systemSettingsAPI.uploadImage(file, props.companyId, 'favicon');

    if (response.data.success) {
      // Store relative path only (backend will serve from /uploads)
      formData.value.favicon_url = response.data.data.url;
      successMessage.value = 'อัปโหลด Favicon สำเร็จ';
      console.log('✅ Favicon uploaded:', formData.value.favicon_url);
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    }
  } catch (error) {
    console.error('❌ Error uploading favicon:', error);
    errorMessage.value = error.response?.data?.message || 'ไม่สามารถอัปโหลด Favicon ได้';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  } finally {
    loading.value = false;
    // Clear file input
    if (faviconFileInput.value) {
      faviconFileInput.value.value = '';
    }
  }
};

// รีเซ็ตข้อมูล
const handleReset = () => {
  formData.value = { ...originalData.value };
  successMessage.value = '';
  errorMessage.value = '';
  console.log('🔄 Form reset to original values');
};

onMounted(() => {
  if (props.companyId) {
    fetchSettings();
  }
});
</script>

<style scoped>
.appearance-settings {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
