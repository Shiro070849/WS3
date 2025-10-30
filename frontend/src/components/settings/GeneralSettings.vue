<template>
  <div class="general-settings">
    <BaseCard>
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-[#1a202c]">ตั้งค่าทั่วไป</h2>
        <p class="text-sm text-gray-500 mt-1">จัดการข้อมูลระบบและบริษัท</p>
      </div>

      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- ส่วนที่ 1: ชื่อระบบ -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="formData.system_name_th"
            label="ชื่อระบบ (ไทย)"
            placeholder="เช่น Ruxchai LearnHub"
            required
          />
          <BaseInput
            v-model="formData.system_name_en"
            label="ชื่อระบบ (อังกฤษ)"
            placeholder="เช่น Ruxchai LearnHub"
            required
          />
        </div>

        <!-- ส่วนที่ 2: ชื่อบริษัท -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="formData.company_name_th"
            label="ชื่อบริษัท (ไทย)"
            placeholder="เช่น บริษัท รักชัย ห้องเย็น จำกัด"
            required
          />
          <BaseInput
            v-model="formData.company_name_en"
            label="ชื่อบริษัท (อังกฤษ)"
            placeholder="เช่น Ruxchai Cold Storage Co., Ltd."
            required
          />
        </div>

        <!-- ส่วนที่ 3: ข้อมูลติดต่อ -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="formData.email"
            label="อีเมลติดต่อ"
            type="email"
            placeholder="เช่น info@ruxchai.co.th"
            required
          />
          <BaseInput
            v-model="formData.support_email"
            label="อีเมลฝ่ายสนับสนุน"
            type="email"
            placeholder="เช่น support@ruxchai.co.th"
            required
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="formData.phone"
            label="เบอร์โทรศัพท์"
            placeholder="เช่น 0855499392"
            required
          />
          <BaseInput
            v-model="formData.website_url"
            label="เว็บไซต์/โซเชียล"
            placeholder="URL หรือ Social Media"
          />
        </div>

        <!-- ส่วนที่ 4: การตั้งค่าระบบ -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ภาษาเริ่มต้น
            </label>
            <select
              v-model="formData.language"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0090D3]"
            >
              <option value="th">ไทย (Thai)</option>
              <option value="en">อังกฤษ (English)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              เขตเวลา
            </label>
            <select
              v-model="formData.timezone"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0090D3]"
            >
              <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              รูปแบบวันที่
            </label>
            <select
              v-model="formData.date_format"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0090D3]"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              รูปแบบเวลา
            </label>
            <select
              v-model="formData.time_format"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0090D3]"
            >
              <option value="HH:mm">24 ชั่วโมง (13:30)</option>
              <option value="hh:mm A">12 ชั่วโมง (01:30 PM)</option>
            </select>
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
import { ref, onMounted, watch } from 'vue';
import BaseCard from '../base/BaseCard.vue';
import BaseInput from '../base/BaseInput.vue';
import BaseButton from '../base/BaseButton.vue';
import { systemSettingsAPI } from '@/services/api';

// รับ companyId จาก parent component
const props = defineProps({
  companyId: {
    type: Number,
    required: true
  }
});

const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const formData = ref({
  system_name_th: '',
  system_name_en: '',
  company_name_th: '',
  company_name_en: '',
  email: '',
  support_email: '',
  phone: '',
  website_url: '',
  language: 'th',
  timezone: 'Asia/Bangkok',
  date_format: 'DD/MM/YYYY',
  time_format: 'HH:mm'
});

const originalData = ref({});

// ดึงข้อมูล (รับ companyId เป็น parameter)
const fetchSettings = async () => {
  try {
    loading.value = true;
    console.log('📥 Fetching settings for company ID:', props.companyId);
    const response = await systemSettingsAPI.getGeneral(props.companyId);

    if (response.data.success) {
      formData.value = { ...response.data.data };
      originalData.value = { ...response.data.data };
      console.log('✅ Settings loaded:', formData.value);
    }
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
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

// บันทึกข้อมูล
const handleSave = async () => {
  try {
    loading.value = true;
    successMessage.value = '';
    errorMessage.value = '';

    console.log('💾 Saving settings for company ID:', props.companyId);
    const response = await systemSettingsAPI.updateGeneral(formData.value, props.companyId);

    if (response.data.success) {
      successMessage.value = 'บันทึกข้อมูลสำเร็จ';
      originalData.value = { ...formData.value };
      console.log('✅ Settings saved successfully');

      // ซ่อนข้อความหลัง 3 วินาที
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);

      // TODO: อัพเดท Sidebar/Navbar ด้วยข้อมูลใหม่
    }
  } catch (error) {
    console.error('❌ Error saving settings:', error);
    errorMessage.value = error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก';
  } finally {
    loading.value = false;
  }
};

// รีเซ็ตข้อมูล
const handleReset = () => {
  formData.value = { ...originalData.value };
  successMessage.value = '';
  errorMessage.value = '';
};

onMounted(() => {
  if (props.companyId) {
    fetchSettings();
  }
});
</script>

<style scoped>
.general-settings {
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

/* ปรับขนาด select dropdown options ให้เป็น sm */
select {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

select option {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}
</style>
