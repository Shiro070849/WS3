<template>
  <div class="w-full max-w-full animate-fadeIn">
    <!-- Page Header - Tailwind Only -->
    <div class="mb-10 relative">
      <h1 class="page-title">รายการ การเข้า-ออก</h1>
      <p class="text-lg text-slate-500 m-0 font-prompt font-medium">
        จัดการข้อมูลยานพาหนะเข้า-ออก
      </p>
    </div>

    <!-- Main Content - Tailwind Layout -->
    <div class="w-full">
      <!-- Filter Card - Tailwind Only -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-base font-semibold text-gray-700 mb-2 font-prompt">
              ค้นหา
            </label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="ทะเบียนรถ หรือชื่อคนขับ"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              @keyup.enter="fetchVehicles"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-base font-semibold text-gray-700 mb-2 font-prompt">
              สถานะ
            </label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              @change="fetchVehicles"
            >
              <option value="">ทั้งหมด</option>
              <option value="pending">ค้างอยู่</option>
              <option value="in">เข้า</option>
              <option value="out">ออก</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-end gap-2">
            <button
              @click="fetchVehicles"
              class="flex-1 px-4 py-2.5 text-base font-semibold bg-[#0090D3] text-white rounded-lg hover:bg-[#007AB8] active:scale-95 transition-all shadow-sm font-prompt"
            >
              ค้นหา
            </button>
            <button
              @click="openAddModal"
              class="flex-1 px-4 py-2.5 text-base font-semibold bg-[#3AAA35] text-white rounded-lg hover:bg-[#339A2E] active:scale-95 transition-all shadow-sm font-prompt"
            >
              + เพิ่มรถ
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card - Tailwind Only -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <!-- Table Header -->
        <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 class="text-lg font-bold text-gray-900 font-prompt">
            รายการทะเบียนรถ
            <span class="ml-2 text-base font-normal text-gray-500">
              ({{ pagination.total }} รายการ)
            </span>
          </h2>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <tr>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">
                  ทะเบียนรถ
                </th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">
                  ประเภทรถ
                </th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">
                  คนขับ
                </th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">
                  บริษัท
                </th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">
                  เวลาเข้า
                </th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">
                  เวลาออก
                </th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">
                  สถานะ
                </th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading" class="bg-white">
                <td colspan="8" class="px-6 py-10 text-center text-gray-500">
                  <div class="flex justify-center items-center">
                    <svg class="animate-spin h-6 w-6 mr-3 text-[#0090D3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-base font-prompt">กำลังโหลดข้อมูล...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="vehicles.length === 0" class="bg-white">
                <td colspan="8" class="px-6 py-10 text-center text-base text-gray-500 font-prompt">
                  ไม่พบข้อมูล
                </td>
              </tr>
              <tr v-else v-for="vehicle in vehicles" :key="vehicle.WI_ID" class="hover:bg-blue-50/30 transition-colors border-b border-gray-200">
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base font-bold text-gray-900 font-prompt">
                    {{ vehicle.WI_LicensePlate || '-' }}
                  </div>
                  <div class="text-sm text-gray-500 font-prompt">
                    {{ vehicle.WI_LicenseProvince || '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base text-gray-700 font-medium font-prompt">
                    {{ vehicle.WI_VehicleType || '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base text-gray-700 font-medium font-prompt">
                    {{ vehicle.WI_FullName || '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base text-gray-700 font-medium font-prompt">
                    {{ vehicle.CompanyName || '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base text-gray-700 font-medium font-prompt">
                    {{ formatDateTime(vehicle.WI_RecordedOn) }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base text-gray-700 font-medium font-prompt">
                    {{ vehicle.WO_RecordedOn ? formatDateTime(vehicle.WO_RecordedOn) : '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <span
                    :class="{
                      'bg-blue-100 text-blue-700 border-blue-200': vehicle.Status === 'เข้า',
                      'bg-green-100 text-green-700 border-green-200': vehicle.Status === 'ออก'
                    }"
                    class="px-3 py-1.5 inline-flex text-sm font-semibold rounded-full border-2 font-prompt"
                  >
                    {{ vehicle.Status }}
                  </span>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="flex gap-2">
                    <button
                      v-if="vehicle.Status === 'เข้า'"
                      @click="openCheckoutModal(vehicle)"
                      class="px-4 py-2 bg-[#3AAA35] text-white rounded-lg hover:bg-[#339A2E] active:scale-95 transition-all text-base font-semibold shadow-sm font-prompt"
                    >
                      บันทึกออก
                    </button>
                    <button
                      @click="openEditModal(vehicle)"
                      class="px-4 py-2 bg-[#0090D3] text-white rounded-lg hover:bg-[#007AB8] active:scale-95 transition-all text-base font-semibold shadow-sm font-prompt"
                    >
                      แก้ไข
                    </button>
                    <button
                      @click="confirmDelete(vehicle)"
                      class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-all text-base font-semibold shadow-sm font-prompt"
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div class="text-base text-gray-600 font-prompt">
            หน้า {{ pagination.page }} จาก {{ pagination.totalPages }}
          </div>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-5 py-2.5 text-base font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-prompt"
            >
              ก่อนหน้า
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="px-5 py-2.5 text-base font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-prompt"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal - Tailwind Only -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden m-4">
        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center modal-header rounded-t-2xl">
          <h3 class="text-xl font-bold text-white font-prompt tracking-tight">
            {{ modalMode === 'add' ? 'เพิ่มรถเข้า' : 'แก้ไขข้อมูลรถ' }}
          </h3>
          <button @click="closeModal" class="text-white hover:bg-white/20 rounded-xl p-2 transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="px-6 py-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div class="grid grid-cols-2 gap-5">
            <div class="col-span-2 md:col-span-1">
              <label class="block text-base font-semibold text-gray-700 mb-2 font-prompt">
                ทะเบียนรถ <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.licensePlate"
                type="text"
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
                placeholder="กท-1234"
              />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label class="block text-base font-semibold text-gray-700 mb-2 font-prompt">
                จังหวัด
              </label>
              <input
                v-model="formData.licenseProvince"
                type="text"
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
                placeholder="กรุงเทพมหานคร"
              />
            </div>
            <div class="col-span-2 md:col-span-1">
              <label class="block text-base font-semibold text-gray-700 mb-2 font-prompt">
                ประเภทรถ
              </label>
              <select
                v-model="formData.vehicleType"
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              >
                <option value="">เลือกประเภทรถ</option>
                <option value="4 ล้อ">4 ล้อ</option>
                <option value="6 ล้อ">6 ล้อ</option>
                <option value="10 ล้อ">10 ล้อ</option>
                <option value="รถกระบะ">รถกระบะ</option>
                <option value="รถยนต์">รถยนต์</option>
              </select>
            </div>
            <div class="col-span-2 md:col-span-1">
              <label class="block text-base font-semibold text-gray-700 mb-2 font-prompt">
                ชื่อคนขับ
              </label>
              <input
                v-model="formData.fullName"
                type="text"
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
                placeholder="ชื่อ-นามสกุล"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-base font-semibold text-gray-700 mb-2 font-prompt">
                หมายเหตุ
              </label>
              <textarea
                v-model="formData.remarks"
                rows="3"
                class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all resize-none font-prompt"
                placeholder="หมายเหตุเพิ่มเติม"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
          <button
            @click="closeModal"
            class="px-6 py-3 text-base font-semibold border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 active:scale-95 transition-all font-prompt"
          >
            ยกเลิก
          </button>
          <button
            @click="saveVehicle"
            class="px-6 py-3 text-base font-semibold bg-[#0090D3] text-white rounded-xl hover:bg-[#007AB8] active:scale-95 transition-all shadow-md font-prompt"
          >
            {{ modalMode === 'add' ? 'เพิ่มรถ' : 'บันทึก' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Checkout Modal - Tailwind Only -->
    <div v-if="showCheckoutModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden m-4">
        <div class="px-7 py-6 border-b border-gray-100 modal-header-green rounded-t-2xl">
          <h3 class="text-2xl font-bold text-white font-prompt tracking-tight">
            บันทึกรถออก
          </h3>
        </div>
        <div class="px-7 py-6">
          <div class="mb-6 p-6 bg-blue-50 rounded-xl border-2 border-blue-100">
            <p class="text-base text-gray-700 mb-3 font-prompt">
              <span class="font-semibold text-gray-600">ทะเบียนรถ:</span>
              <span class="font-bold text-gray-900 text-lg ml-2">{{ checkoutData.vehicle?.WI_LicensePlate }}</span>
            </p>
            <p class="text-base text-gray-700 font-prompt">
              <span class="font-semibold text-gray-600">คนขับ:</span>
              <span class="font-bold text-gray-900 text-lg ml-2">{{ checkoutData.vehicle?.WI_FullName || '-' }}</span>
            </p>
          </div>
          <div>
            <label class="block text-base font-bold text-gray-700 mb-3 font-prompt">
              หมายเหตุ
            </label>
            <textarea
              v-model="checkoutData.remarks"
              rows="4"
              class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3AAA35] focus:border-[#3AAA35] transition-all resize-none leading-relaxed font-prompt"
              placeholder="หมายเหตุการออก (ถ้ามี)"
            ></textarea>
          </div>
        </div>
        <div class="px-7 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
          <button
            @click="closeCheckoutModal"
            class="px-6 py-3 text-base font-semibold border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 active:scale-95 transition-all font-prompt"
          >
            ยกเลิก
          </button>
          <button
            @click="saveCheckout"
            class="px-6 py-3 text-base font-semibold bg-[#3AAA35] text-white rounded-xl hover:bg-[#339A2E] active:scale-95 transition-all shadow-md font-prompt"
          >
            บันทึกออก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { vehiclesAPI } from '../services/api';

// ==================== STATE ====================
const vehicles = ref([]);
const loading = ref(false);
const showModal = ref(false);
const showCheckoutModal = ref(false);
const modalMode = ref('add');

const filters = ref({
  search: '',
  status: '',
  page: 1,
  limit: 50,
});

const pagination = ref({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 0,
});

const formData = ref({
  id: null,
  licensePlate: '',
  licenseProvince: '',
  vehicleType: '',
  fullName: '',
  gender: '',
  address: '',
  follower: 0,
  remarks: '',
  companyId: null,
  departmentId: null,
  visitTypeId: null,
  fromCompany: '',
  contactName: '',
});

const checkoutData = ref({
  vehicle: null,
  remarks: '',
});

// ==================== FUNCTIONS ====================

const fetchVehicles = async () => {
  loading.value = true;
  try {
    // ดึง companyId จาก localStorage
    const companyId = localStorage.getItem('companyId');
    // ถ้าเป็น Super Admin (IC_ID = NULL) ไม่ต้องส่ง companyId เพื่อเห็นข้อมูลทุกบริษัท
    const isSuperAdmin = !companyId || companyId === 'null' || companyId === 'undefined';
    const filterCompanyId = isSuperAdmin ? undefined : companyId;

    const params = {
      search: filters.value.search || undefined,
      status: filters.value.status || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
      companyId: filterCompanyId, // ส่ง companyId ไปด้วย (null ถ้าเป็น Admin ใหญ่)
    };

    const response = await vehiclesAPI.getAll(params);
    vehicles.value = response.data.data;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page;
    fetchVehicles();
  }
};

const openAddModal = () => {
  modalMode.value = 'add';
  formData.value = {
    id: null,
    licensePlate: '',
    licenseProvince: '',
    vehicleType: '',
    fullName: '',
    gender: '',
    address: '',
    follower: 0,
    remarks: '',
    companyId: null,
    departmentId: null,
    visitTypeId: null,
    fromCompany: '',
    contactName: '',
  };
  showModal.value = true;
};

const openEditModal = (vehicle) => {
  modalMode.value = 'edit';
  formData.value = {
    id: vehicle.WI_ID,
    licensePlate: vehicle.WI_LicensePlate,
    licenseProvince: vehicle.WI_LicenseProvince,
    vehicleType: vehicle.WI_VehicleType,
    fullName: vehicle.WI_FullName,
    gender: vehicle.WI_Gender,
    address: vehicle.WI_Address,
    follower: vehicle.WI_Follower || 0,
    remarks: vehicle.WI_Remarks,
    companyId: vehicle.IC_ID,
    departmentId: vehicle.ID_ID,
    visitTypeId: vehicle.VT_ID,
    fromCompany: vehicle.WI_FromCompany,
    contactName: vehicle.WI_ContactName,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = {};
};

const saveVehicle = async () => {
  if (!formData.value.licensePlate) {
    alert('กรุณากรอกทะเบียนรถ');
    return;
  }

  try {
    // ดึง companyId จาก localStorage (ถ้ายังไม่มีใน formData)
    const companyId = formData.value.companyId || localStorage.getItem('companyId');

    const data = {
      licensePlate: formData.value.licensePlate,
      licenseProvince: formData.value.licenseProvince,
      vehicleType: formData.value.vehicleType,
      fullName: formData.value.fullName,
      gender: formData.value.gender,
      address: formData.value.address,
      follower: formData.value.follower,
      remarks: formData.value.remarks,
      companyId: companyId ? parseInt(companyId) : null, // ใช้ companyId ของ user
      departmentId: formData.value.departmentId,
      visitTypeId: formData.value.visitTypeId,
      fromCompany: formData.value.fromCompany,
      contactName: formData.value.contactName,
      systemUserId: parseInt(localStorage.getItem('userId')) || 1,
    };

    if (modalMode.value === 'add') {
      await vehiclesAPI.create(data);
      alert('เพิ่มรถสำเร็จ');
    } else {
      await vehiclesAPI.update(formData.value.id, data);
      alert('แก้ไขข้อมูลสำเร็จ');
    }

    closeModal();
    fetchVehicles();
  } catch (error) {
    console.error('Error saving vehicle:', error);
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  }
};

const confirmDelete = (vehicle) => {
  if (confirm(`ต้องการลบทะเบียนรถ ${vehicle.WI_LicensePlate} ใช่หรือไม่?`)) {
    deleteVehicle(vehicle.WI_ID);
  }
};

const deleteVehicle = async (id) => {
  try {
    await vehiclesAPI.delete(id);
    alert('ลบข้อมูลสำเร็จ');
    fetchVehicles();
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    alert('เกิดข้อผิดพลาดในการลบข้อมูล');
  }
};

const openCheckoutModal = (vehicle) => {
  checkoutData.value = {
    vehicle: vehicle,
    remarks: '',
  };
  showCheckoutModal.value = true;
};

const closeCheckoutModal = () => {
  showCheckoutModal.value = false;
  checkoutData.value = { vehicle: null, remarks: '' };
};

const saveCheckout = async () => {
  try {
    await vehiclesAPI.checkout(checkoutData.value.vehicle.WI_ID, {
      remarks: checkoutData.value.remarks,
      systemUserId: 1,
    });
    alert('บันทึกรถออกสำเร็จ');
    closeCheckoutModal();
    fetchVehicles();
  } catch (error) {
    console.error('Error checking out vehicle:', error);
    alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกรถออก');
  }
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  // Remove 'Z' to force local time interpretation
  const dateStr = dateTime.replace('Z', '');
  const date = new Date(dateStr);
  return date.toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchVehicles();
});
</script>

<style scoped>
/* ============================================
   CSS เหลือแค่ส่วนที่ Tailwind ทำไม่ได้
   ============================================ */

/* 1. Animation - Tailwind ไม่มี */
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

.animate-fadeIn {
  animation: fadeIn 0.5s ease-in;
}

/* 2. Gradient Text - Tailwind ทำได้แต่ยาว */
.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0B4F6C 0%, #0090D3 50%, #20B2AA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.75rem 0;
  font-family: 'Prompt', sans-serif;
  letter-spacing: -0.02em;
}

/* 3. Modal Header Gradients */
.modal-header {
  background: linear-gradient(135deg, #0090D3 0%, #00B1EF 100%);
}

.modal-header-green {
  background: linear-gradient(135deg, #3AAA35 0%, #45B845 100%);
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }
}
</style>
