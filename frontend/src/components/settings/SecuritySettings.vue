<template>
  <BaseCard>
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-semibold text-[#1a202c] mb-1">ความปลอดภัย</h2>
        <p class="text-sm text-gray-500">จัดการการตั้งค่าความปลอดภัยของระบบ</p>
      </div>

      <!-- Session Timeout -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Session Timeout (นาที)</label>
        <p class="text-xs text-gray-500 mb-2">ระยะเวลาการ session หมดอายุ</p>
        <BaseInput
          v-model="settings.sessionTimeout"
          type="number"
          placeholder="1440"
          min="1"
        />
      </div>

      <!-- ความยาววรหัสผ่านขั้นต่ำ -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ความยาววรหัสผ่านขั้นต่ำ</label>
        <p class="text-xs text-gray-500 mb-2">จำนวนตัวอักษรขั้นต่ำของรหัสผ่าน</p>
        <BaseInput
          v-model="settings.minPasswordLength"
          type="number"
          placeholder="8"
          min="4"
          max="32"
        />
      </div>

      <!-- ต้องการตัวอักษรพิเศษ -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ต้องการตัวอักษรพิเศษในรหัสผ่าน</label>
        <p class="text-xs text-gray-500 mb-2">บังคับให้มีตัวอักษรพิเศษในรหัสผ่าน</p>
        <label class="flex items-center">
          <input
            v-model="settings.requireSpecialChar"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- ต้องการตัวเลข -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ต้องการตัวเลขในรหัสผ่าน</label>
        <p class="text-xs text-gray-500 mb-2">บังคับให้มีตัวเลขในรหัสผ่าน</p>
        <label class="flex items-center">
          <input
            v-model="settings.requireNumber"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- ต้องการตัวพิมพ์ใหญ่ -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ต้องการตัวพิมพ์ใหญ่ในรหัสผ่าน</label>
        <p class="text-xs text-gray-500 mb-2">บังคับให้มีตัวพิมพ์ใหญ่ในรหัสผ่าน</p>
        <label class="flex items-center">
          <input
            v-model="settings.requireUppercase"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- ต้องมีการรีเซ็ตรหัสผ่าน -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ต้องมีการรีเซ็ตรหัสผ่าน</label>
        <p class="text-xs text-gray-500 mb-2">บังคับให้รีเซ็ตรหัสผ่านทุกๆ</p>
        <label class="flex items-center">
          <input
            v-model="settings.passwordExpiry"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- จำนวนครั้งที่รีเซ็ตรหัสผ่าน (วัน) -->
      <div v-if="settings.passwordExpiry">
        <label class="block text-sm font-medium text-gray-700 mb-2">จำนวนครั้งที่รีเซ็ตรหัสผ่าน (วัน)</label>
        <p class="text-xs text-gray-500 mb-2">จำนวนวันก่อนที่รหัสผ่านจะหมดอายุ</p>
        <BaseInput
          v-model="settings.passwordExpiryDays"
          type="number"
          placeholder="90"
          min="1"
        />
      </div>

      <!-- ระยะเวลาหมดอายุของเซสชัน (นาที) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ระยะเวลาหมดอายุของเซสชัน (นาที)</label>
        <p class="text-xs text-gray-500 mb-2">ระยะเวลาที่ผู้ใช้ไม่มีกิจกรรมก่อนถูกออกจากระบบ</p>
        <BaseInput
          v-model="settings.inactivityTimeout"
          type="number"
          placeholder="15"
          min="1"
        />
      </div>

      <!-- เปิดใช้ Two-Factor Authentication -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">เปิดใช้ Two-Factor Authentication</label>
        <p class="text-xs text-gray-500 mb-2">เปิดหรือปิดยืนยันตัวตน 2 ชั้นสำหรับทุกผู้ใช้</p>
        <label class="flex items-center">
          <input
            v-model="settings.twoFactorAuth"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- จำนวนความพยายามเข้าสู่ระบบที่ผิด (ครั้ง) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">จำนวนความพยายามเข้าสู่ระบบที่ผิด (ครั้ง)</label>
        <p class="text-xs text-gray-500 mb-2">จำนวนครั้งที่อนุญาตให้ลงชื่อเข้าใช้ผิดพลาดก่อนล็อก</p>
        <BaseInput
          v-model="settings.maxLoginAttempts"
          type="number"
          placeholder="5"
          min="1"
        />
      </div>

      <!-- ปุ่มบันทึก -->
      <div class="flex justify-end pt-4">
        <BaseButton variant="primary" @click="saveSettings" :loading="saving">
          บันทึกการตั้งค่า
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from '../base/BaseCard.vue';
import BaseInput from '../base/BaseInput.vue';
import BaseButton from '../base/BaseButton.vue';
import { systemSettingsAPI } from '@/services/api';

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  }
});

const settings = ref({
  sessionTimeout: 1440,
  minPasswordLength: 8,
  requireSpecialChar: false,
  requireNumber: false,
  requireUppercase: false,
  passwordExpiry: false,
  passwordExpiryDays: 90,
  inactivityTimeout: 15,
  twoFactorAuth: false,
  maxLoginAttempts: 5
});

const saving = ref(false);

const loadSettings = async () => {
  try {
    console.log('[SecuritySettings] Loading settings for companyId:', props.companyId);
    const response = await systemSettingsAPI.getSecurity(props.companyId);
    console.log('[SecuritySettings] API Response:', response.data);
    if (response.data.success) {
      const data = response.data.data;
      console.log('[SecuritySettings] Data from database:', data);
      settings.value = {
        sessionTimeout: parseInt(data.sessionTimeout) || 1440,
        minPasswordLength: parseInt(data.minPasswordLength) || 8,
        requireSpecialChar: data.requireSpecialChar === 'true',
        requireNumber: data.requireNumber === 'true',
        requireUppercase: data.requireUppercase === 'true',
        passwordExpiry: data.passwordExpiry === 'true',
        passwordExpiryDays: parseInt(data.passwordExpiryDays) || 90,
        inactivityTimeout: parseInt(data.inactivityTimeout) || 15,
        twoFactorAuth: data.twoFactorAuth === 'true',
        maxLoginAttempts: parseInt(data.maxLoginAttempts) || 5
      };
      console.log('[SecuritySettings] Settings updated:', settings.value);
    }
  } catch (error) {
    console.error('[SecuritySettings] Error loading settings:', error);
  }
};

const saveSettings = async () => {
  try {
    saving.value = true;
    const response = await systemSettingsAPI.updateSecurity(settings.value, props.companyId);
    if (response.data.success) {
      alert('บันทึกการตั้งค่าความปลอดภัยสำเร็จ');
    }
  } catch (error) {
    console.error('Error saving security settings:', error);
    alert('เกิดข้อผิดพลาดในการบันทึก');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>
