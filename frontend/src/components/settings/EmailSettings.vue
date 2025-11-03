<template>
  <BaseCard>
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-semibold text-[#1a202c] mb-1">อีเมล</h2>
        <p class="text-sm text-gray-500">จัดการการตั้งค่าการส่งอีเมลของระบบ</p>
      </div>

      <!-- SMTP Host -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
        <p class="text-xs text-gray-500 mb-2">ที่อยู่ SMTP server</p>
        <BaseInput
          v-model="settings.smtpHost"
          type="text"
          placeholder="smtp.gmail.com"
        />
      </div>

      <!-- SMTP Port -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
        <p class="text-xs text-gray-500 mb-2">พอร์ตของ SMTP server</p>
        <BaseInput
          v-model="settings.smtpPort"
          type="number"
          placeholder="587"
        />
      </div>

      <!-- SMTP Secure (SSL) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Secure (SSL)</label>
        <p class="text-xs text-gray-500 mb-2">ใช้ SSL / TLS สำหรับ SMTP</p>
        <label class="flex items-center">
          <input
            v-model="settings.smtpSecure"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- SMTP Username -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
        <p class="text-xs text-gray-500 mb-2">Username สำหรับ SMTP authentication</p>
        <BaseInput
          v-model="settings.smtpUsername"
          type="text"
          placeholder="your-email@example.com"
        />
      </div>

      <!-- SMTP Password -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          SMTP Password
          <span class="text-orange-500">(ต้องเข้ารหัสก่อนบันทึก)</span>
        </label>
        <p class="text-xs text-gray-500 mb-2">Password สำหรับ SMTP authentication</p>
        <BaseInput
          v-model="settings.smtpPassword"
          type="password"
          placeholder="••••••••"
        />
      </div>

      <!-- อีเมลผู้ส่ง -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">อีเมลผู้ส่ง</label>
        <p class="text-xs text-gray-500 mb-2">อีเมลที่ใช้เป็นผู้ส่ง</p>
        <BaseInput
          v-model="settings.fromEmail"
          type="email"
          placeholder="noreply@ruxchai.com"
        />
      </div>

      <!-- ชื่อผู้ส่ง -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้ส่ง</label>
        <p class="text-xs text-gray-500 mb-2">ชื่อเพื่อแสดงเป็นผู้ส่ง</p>
        <BaseInput
          v-model="settings.fromName"
          type="text"
          placeholder="Ruxchai LearnHub"
        />
      </div>

      <!-- ปุ่มทดสอบการส่งอีเมล -->
      <div class="flex gap-3 pt-4">
        <BaseButton variant="secondary" @click="testEmail" :loading="testing">
          <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          ทดสอบส่งอีเมล
        </BaseButton>
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
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  smtpUsername: '',
  smtpPassword: '',
  fromEmail: '',
  fromName: ''
});

const saving = ref(false);
const testing = ref(false);

const loadSettings = async () => {
  try {
    console.log('[EmailSettings] Loading settings for companyId:', props.companyId);
    const response = await systemSettingsAPI.getEmail(props.companyId);
    console.log('[EmailSettings] API Response:', response.data);
    if (response.data.success) {
      const data = response.data.data;
      console.log('[EmailSettings] Data from database:', data);
      settings.value = {
        smtpHost: data.smtpHost || '',
        smtpPort: parseInt(data.smtpPort) || 587,
        smtpSecure: data.smtpSecure === 'true',
        smtpUsername: data.smtpUsername || '',
        smtpPassword: '', // Don't show encrypted password
        fromEmail: data.fromEmail || '',
        fromName: data.fromName || ''
      };
      console.log('[EmailSettings] Settings updated:', settings.value);
    }
  } catch (error) {
    console.error('[EmailSettings] Error loading settings:', error);
  }
};

const saveSettings = async () => {
  try {
    saving.value = true;
    const response = await systemSettingsAPI.updateEmail(settings.value, props.companyId);
    if (response.data.success) {
      alert('บันทึกการตั้งค่าอีเมลสำเร็จ');
      // Clear password field after save
      settings.value.smtpPassword = '';
    }
  } catch (error) {
    console.error('Error saving email settings:', error);
    alert('เกิดข้อผิดพลาดในการบันทึก');
  } finally {
    saving.value = false;
  }
};

const testEmail = async () => {
  try {
    testing.value = true;

    // ถามว่าจะส่งไปที่เมลไหน
    const testEmailAddress = prompt(
      'กรุณากรอกอีเมลที่ต้องการทดสอบส่ง:',
      settings.value.fromEmail || settings.value.smtpUsername
    );

    if (!testEmailAddress) {
      testing.value = false;
      return;
    }

    console.log('[TEST] Sending test email to:', testEmailAddress);

    const response = await systemSettingsAPI.testEmail({
      companyId: props.companyId,
      testEmail: testEmailAddress
    });

    if (response.data.success) {
      alert(response.data.message || `ส่งอีเมลทดสอบไปที่ ${testEmailAddress} สำเร็จ กรุณาตรวจสอบกล่องจดหมาย`);
    } else {
      alert(response.data.message || 'เกิดข้อผิดพลาดในการส่งอีเมลทดสอบ');
    }
  } catch (error) {
    console.error('[ERROR] Testing email:', error);
    alert('เกิดข้อผิดพลาดในการส่งอีเมลทดสอบ: ' + (error.response?.data?.message || error.message));
  } finally {
    testing.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>
