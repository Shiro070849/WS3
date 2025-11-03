<template>
  <BaseCard>
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-semibold text-[#1a202c] mb-1">การแจ้งเตือน</h2>
        <p class="text-sm text-gray-500">จัดการการตั้งค่าการแจ้งเตือนของระบบ</p>
      </div>

      <!-- เปิดการแจ้งเตือนผ่านอีเมล -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">เปิดการแจ้งเตือนผ่านอีเมล</label>
        <p class="text-xs text-gray-500 mb-2">ส่งการแจ้งเตือนผ่านอีเมล</p>
        <label class="flex items-center">
          <input
            v-model="settings.emailNotification"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- เปิดการแจ้งเตือนผ่าน Browser -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">เปิดการแจ้งเตือนผ่าน Browser</label>
        <p class="text-xs text-gray-500 mb-2">แสดงการแจ้งเตือนผ่าน Browser</p>
        <label class="flex items-center">
          <input
            v-model="settings.browserNotification"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- เปิดการแจ้งเตือนผ่าน SMS -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">เปิดการแจ้งเตือนผ่าน SMS</label>
        <p class="text-xs text-gray-500 mb-2">ส่งการแจ้งเตือนผ่าน SMS</p>
        <label class="flex items-center">
          <input
            v-model="settings.smsNotification"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- หน้าการแจ้งเตือน (นาที) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">หน่วงการแจ้งเตือน (นาที)</label>
        <p class="text-xs text-gray-500 mb-2">ระยะเวลาระหว่างการแจ้งเตือนแต่ละครั้ง</p>
        <BaseInput
          v-model="settings.notificationDelay"
          type="number"
          placeholder="30"
          min="1"
        />
      </div>

      <hr class="my-6" />

      <!-- ประเภทของการแจ้งเตือน -->
      <div>
        <h3 class="text-lg font-semibold text-[#1a202c] mb-4">ประเภทของการแจ้งเตือน</h3>

        <!-- รถเข้า -->
        <div class="mb-4">
          <label class="flex items-center">
            <input
              v-model="settings.notifyCheckIn"
              type="checkbox"
              class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
            />
            <span class="ml-2 text-sm text-gray-700 font-medium">แจ้งเตือนเมื่อมีรถเข้า</span>
          </label>
          <p class="text-xs text-gray-500 ml-6 mt-1">ส่งการแจ้งเตือนเมื่อมีการบันทึกรถเข้า</p>
        </div>

        <!-- รถออก -->
        <div class="mb-4">
          <label class="flex items-center">
            <input
              v-model="settings.notifyCheckOut"
              type="checkbox"
              class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
            />
            <span class="ml-2 text-sm text-gray-700 font-medium">แจ้งเตือนเมื่อมีรถออก</span>
          </label>
          <p class="text-xs text-gray-500 ml-6 mt-1">ส่งการแจ้งเตือนเมื่อมีการบันทึกรถออก</p>
        </div>

        <!-- ผู้ใช้งานใหม่ -->
        <div class="mb-4">
          <label class="flex items-center">
            <input
              v-model="settings.notifyNewUser"
              type="checkbox"
              class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
            />
            <span class="ml-2 text-sm text-gray-700 font-medium">แจ้งเตือนเมื่อมีผู้ใช้งานใหม่</span>
          </label>
          <p class="text-xs text-gray-500 ml-6 mt-1">ส่งการแจ้งเตือนเมื่อมีการสร้างผู้ใช้งานใหม่</p>
        </div>

        <!-- ระบบมีปัญหา -->
        <div class="mb-4">
          <label class="flex items-center">
            <input
              v-model="settings.notifySystemError"
              type="checkbox"
              class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
            />
            <span class="ml-2 text-sm text-gray-700 font-medium">แจ้งเตือนเมื่อระบบมีปัญหา</span>
          </label>
          <p class="text-xs text-gray-500 ml-6 mt-1">ส่งการแจ้งเตือนเมื่อระบบเกิดข้อผิดพลาด</p>
        </div>

        <!-- รายงานประจำวัน -->
        <div class="mb-4">
          <label class="flex items-center">
            <input
              v-model="settings.notifyDailyReport"
              type="checkbox"
              class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
            />
            <span class="ml-2 text-sm text-gray-700 font-medium">ส่งรายงานประจำวันอัตโนมัติ</span>
          </label>
          <p class="text-xs text-gray-500 ml-6 mt-1">ส่งรายงานสรุปประจำวันทางอีเมล</p>
        </div>
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
  emailNotification: true,
  browserNotification: true,
  smsNotification: false,
  notificationDelay: 30,
  notifyCheckIn: true,
  notifyCheckOut: true,
  notifyNewUser: true,
  notifySystemError: true,
  notifyDailyReport: false
});

const saving = ref(false);

const loadSettings = async () => {
  try {
    const response = await systemSettingsAPI.getNotifications(props.companyId);
    if (response.data.success) {
      const data = response.data.data;
      settings.value = {
        emailNotification: data.emailNotification === 'true',
        browserNotification: data.browserNotification === 'true',
        smsNotification: data.smsNotification === 'true',
        notificationDelay: parseInt(data.notificationDelay) || 30,
        notifyCheckIn: data.notifyCheckIn === 'true',
        notifyCheckOut: data.notifyCheckOut === 'true',
        notifyNewUser: data.notifyNewUser === 'true',
        notifySystemError: data.notifySystemError === 'true',
        notifyDailyReport: data.notifyDailyReport === 'true'
      };
    }
  } catch (error) {
    console.error('Error loading notification settings:', error);
  }
};

const saveSettings = async () => {
  try {
    saving.value = true;
    const response = await systemSettingsAPI.updateNotifications(settings.value, props.companyId);
    if (response.data.success) {
      alert('บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ');
    }
  } catch (error) {
    console.error('Error saving notification settings:', error);
    alert('เกิดข้อผิดพลาดในการบันทึก');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>
