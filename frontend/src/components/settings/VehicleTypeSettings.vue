<template>
  <BaseCard>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-semibold text-[#1a202c]">จัดการประเภทรถ</h2>
        <p class="text-base text-gray-500 mt-1">จัดการประเภทยานพาหนะที่ใช้ในระบบ</p>
      </div>
      <BaseButton @click="openModal()" variant="primary">
        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        เพิ่มประเภทรถ
      </BaseButton>
    </div>

    <BaseTable :columns="columns" :data="vehicleTypes" :loading="loading">
      <template #cell-VType_IsActive="{ value }">
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
            @click="editVehicleType(row)"
            class="text-[#0090D3] hover:text-[#007AB8] transition-colors"
            title="แก้ไข"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="deleteVehicleType(row)"
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

    <!-- MODAL: เพิ่ม/แก้ไขประเภทรถ -->
    <BaseModal :show="modal.show" :title="modal.title" @close="closeModal" size="md">
      <div class="space-y-4">
        <BaseInput
          v-model="form.localName"
          label="ชื่อประเภทรถ (ไทย)"
          placeholder="เช่น รถมอไซต์, รถยนต์"
          required
        />
        <BaseInput
          v-model="form.englishName"
          label="ชื่อประเภทรถ (อังกฤษ)"
          placeholder="เช่น Motorcycle, Car"
        />
        <BaseInput
          v-model="form.description"
          label="คำอธิบาย"
          placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)"
        />
        <BaseInput
          v-model.number="form.order"
          label="ลำดับการแสดงผล"
          type="number"
          placeholder="0"
        />
        <div>
          <label class="flex items-center">
            <input
              v-model="form.isActive"
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
          <BaseButton variant="primary" @click="saveVehicleType" :loading="saving">
            {{ modal.isEdit ? 'บันทึก' : 'สร้าง' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </BaseCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { vehicleTypesAPI } from '../../services/api';
import BaseCard from '../base/BaseCard.vue';
import BaseTable from '../base/BaseTable.vue';
import BaseButton from '../base/BaseButton.vue';
import BaseModal from '../base/BaseModal.vue';
import BaseInput from '../base/BaseInput.vue';

const vehicleTypes = ref([]);
const loading = ref(false);
const saving = ref(false);

const modal = ref({
  show: false,
  title: '',
  isEdit: false,
});

const form = ref({
  id: null,
  localName: '',
  englishName: '',
  description: '',
  order: 0,
  isActive: true,
});

const columns = [
  { key: 'VType_Order', label: 'ลำดับ', class: 'text-center w-24' },
  { key: 'VType_LocalName', label: 'ชื่อภาษาไทย' },
  { key: 'VType_EnglishName', label: 'ชื่อภาษาอังกฤษ' },
  { key: 'VType_Description', label: 'คำอธิบาย' },
  { key: 'VType_IsActive', label: 'สถานะ', class: 'text-center' },
];

const fetchVehicleTypes = async () => {
  loading.value = true;
  try {
    const response = await vehicleTypesAPI.getAll(false);
    vehicleTypes.value = response.data.data;
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
  } finally {
    loading.value = false;
  }
};

const openModal = (vehicleType = null) => {
  if (vehicleType) {
    modal.value = {
      show: true,
      title: 'แก้ไขประเภทรถ',
      isEdit: true,
    };
    form.value = {
      id: vehicleType.VType_ID,
      localName: vehicleType.VType_LocalName,
      englishName: vehicleType.VType_EnglishName || '',
      description: vehicleType.VType_Description || '',
      order: vehicleType.VType_Order || 0,
      isActive: vehicleType.VType_IsActive || false,
    };
  } else {
    modal.value = {
      show: true,
      title: 'เพิ่มประเภทรถใหม่',
      isEdit: false,
    };
    form.value = {
      id: null,
      localName: '',
      englishName: '',
      description: '',
      order: 0,
      isActive: true,
    };
  }
};

const closeModal = () => {
  modal.value.show = false;
  form.value = {
    id: null,
    localName: '',
    englishName: '',
    description: '',
    order: 0,
    isActive: true,
  };
};

const saveVehicleType = async () => {
  if (!form.value.localName) {
    alert('กรุณากรอกชื่อประเภทรถ (ไทย)');
    return;
  }

  saving.value = true;
  try {
    const data = {
      localName: form.value.localName,
      englishName: form.value.englishName,
      description: form.value.description,
      order: form.value.order || 0,
      isActive: form.value.isActive,
    };

    if (modal.value.isEdit) {
      await vehicleTypesAPI.update(form.value.id, data);
      alert('แก้ไขประเภทรถสำเร็จ');
    } else {
      await vehicleTypesAPI.create(data);
      alert('เพิ่มประเภทรถสำเร็จ');
    }

    closeModal();
    fetchVehicleTypes();
  } catch (error) {
    console.error('Error saving vehicle type:', error);
    const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    alert(errorMessage);
  } finally {
    saving.value = false;
  }
};

const editVehicleType = (vehicleType) => {
  openModal(vehicleType);
};

const deleteVehicleType = async (vehicleType) => {
  if (!confirm(`ต้องการลบประเภทรถ "${vehicleType.VType_LocalName}" ใช่หรือไม่?`)) {
    return;
  }

  try {
    const response = await vehicleTypesAPI.delete(vehicleType.VType_ID);
    const message = response.data.message || 'ลบประเภทรถสำเร็จ';
    alert(message);
    fetchVehicleTypes();
  } catch (error) {
    console.error('Error deleting vehicle type:', error);
    const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล';
    alert(errorMessage);
  }
};

onMounted(() => {
  fetchVehicleTypes();
});
</script>
