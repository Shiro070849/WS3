<template>
  <BaseCard>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-semibold text-[#1a202c]">จัดการสถานที่</h2>
        <p class="text-base text-gray-500 mt-1">จัดการสถานที่สำหรับยาม (SGS/SGU)</p>
      </div>
      <BaseButton @click="openModal()" variant="primary">
        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        เพิ่มสถานที่
      </BaseButton>
    </div>

    <BaseTable :columns="columns" :data="locations" :loading="loading">
      <template #cell-GL_Active="{ value }">
        <span
          :class="value ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'"
          class="px-3 py-1.5 rounded-full text-sm font-semibold"
        >
          {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
        </span>
      </template>

      <template #actions="{ row }">
        <div class="flex gap-2 justify-end">
          <button
            @click="editLocation(row)"
            class="text-[#0090D3] hover:text-[#007AB8] transition-colors"
            title="แก้ไข"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="deleteLocation(row)"
            class="text-red-600 hover:text-red-800 transition-colors"
            title="ลบ"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>
    </BaseTable>

    <!-- MODAL: เพิ่ม/แก้ไขสถานที่ -->
    <BaseModal :show="modal.show" :title="modal.title" @close="closeModal" size="md">
      <div class="space-y-4">
        <BaseInput
          v-model="form.code"
          label="รหัสสถานที่"
          placeholder="เช่น P-01, P-02"
          required
        />
        <BaseInput
          v-model="form.name"
          label="ชื่อสถานที่"
          placeholder="เช่น ป้อมชั้น A, ป้อมชั้น B"
          required
        />
        <BaseInput
          v-model="form.description"
          label="คำอธิบาย"
          placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)"
        />
        <div>
          <label class="flex items-center">
            <input
              v-model="form.active"
              type="checkbox"
              class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
            />
            <span class="ml-2 text-sm text-gray-700">ใช้งาน</span>
          </label>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="closeModal">ยกเลิก</BaseButton>
          <BaseButton variant="primary" @click="saveLocation" :loading="saving">
            {{ modal.isEdit ? 'บันทึก' : 'สร้าง' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </BaseCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { locationsAPI } from '../../services/api';
import BaseCard from '../base/BaseCard.vue';
import BaseTable from '../base/BaseTable.vue';
import BaseButton from '../base/BaseButton.vue';
import BaseModal from '../base/BaseModal.vue';
import BaseInput from '../base/BaseInput.vue';

const locations = ref([]);
const loading = ref(false);
const saving = ref(false);

const modal = ref({
  show: false,
  title: '',
  isEdit: false,
});

const form = ref({
  id: null,
  code: '',
  name: '',
  description: '',
  active: true,
});

const columns = [
  { key: 'GL_Code', label: 'รหัสสถานที่' },
  { key: 'GL_Name', label: 'ชื่อสถานที่' },
  { key: 'GL_Description', label: 'คำอธิบาย' },
  { key: 'GL_Active', label: 'สถานะ', class: 'text-center' },
];

const fetchLocations = async () => {
  loading.value = true;
  try {
    const response = await locationsAPI.getAll();
    locations.value = response.data.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
  } finally {
    loading.value = false;
  }
};

const openModal = (location = null) => {
  if (location) {
    modal.value = {
      show: true,
      title: 'แก้ไขสถานที่',
      isEdit: true,
    };
    form.value = {
      id: location.GL_ID,
      code: location.GL_Code,
      name: location.GL_Name,
      description: location.GL_Description || '',
      active: location.GL_Active || false,
    };
  } else {
    modal.value = {
      show: true,
      title: 'เพิ่มสถานที่ใหม่',
      isEdit: false,
    };
    form.value = {
      id: null,
      code: '',
      name: '',
      description: '',
      active: true,
    };
  }
};

const closeModal = () => {
  modal.value.show = false;
  form.value = {
    id: null,
    code: '',
    name: '',
    description: '',
    active: true,
  };
};

const saveLocation = async () => {
  if (!form.value.code || !form.value.name) {
    alert('กรุณากรอกรหัสและชื่อสถานที่');
    return;
  }

  saving.value = true;
  try {
    const data = {
      code: form.value.code,
      name: form.value.name,
      description: form.value.description,
      active: form.value.active,
    };

    if (modal.value.isEdit) {
      await locationsAPI.update(form.value.id, data);
      alert('แก้ไขสถานที่สำเร็จ');
    } else {
      await locationsAPI.create(data);
      alert('เพิ่มสถานที่สำเร็จ');
    }

    closeModal();
    fetchLocations();
  } catch (error) {
    console.error('Error saving location:', error);
    const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    alert(errorMessage);
  } finally {
    saving.value = false;
  }
};

const editLocation = (location) => {
  openModal(location);
};

const deleteLocation = async (location) => {
  if (!confirm(`ต้องการลบสถานที่ "${location.GL_Name}" ใช่หรือไม่?`)) {
    return;
  }

  try {
    const response = await locationsAPI.delete(location.GL_ID);
    const message = response.data.message || 'ลบสถานที่สำเร็จ';
    alert(message);
    fetchLocations();
  } catch (error) {
    console.error('Error deleting location:', error);
    const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล';
    alert(errorMessage);
  }
};

onMounted(() => {
  fetchLocations();
});
</script>
