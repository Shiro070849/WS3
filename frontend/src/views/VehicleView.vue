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
      <!-- Filters Row: Date Range + Company -->
      <div class="filters-row">
        <div class="date-filter-wrapper">
          <DateRangeFilter
            v-model:dateFrom="filters.dateFrom"
            v-model:dateTo="filters.dateTo"
            @filter="handleDateFilter"
          />
        </div>

        <div class="company-filter-wrapper" v-if="isSuperAdmin">
          <select
            id="companyFilter"
            v-model="filters.companyId"
            class="company-select-inline"
            @change="handleCompanyFilter"
          >
            <option :value="null">ทุกบริษัท</option>
            <option
              v-for="company in companies"
              :key="company.IC_ID"
              :value="company.IC_ID"
            >
              {{ company.IC_LocalName }}
            </option>
          </select>
        </div>
      </div>

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
        <div v-if="pagination.totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <div class="text-base text-gray-600 font-prompt">
              แสดง {{ (pagination.page - 1) * pagination.limit + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }} จาก {{ pagination.total }} รายการ
            </div>
            <div class="flex gap-2 items-center">
              <!-- Previous Button -->
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page === 1"
                class="px-4 py-2 text-base font-semibold border border-gray-300 rounded-lg hover:bg-white hover:border-[#0090D3] hover:text-[#0090D3] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-prompt"
              >
                ← ก่อนหน้า
              </button>

              <!-- Page Numbers -->
              <div class="flex gap-1">
                <!-- First Page -->
                <button
                  v-if="pagination.page > 6"
                  @click="changePage(1)"
                  class="w-10 h-10 flex items-center justify-center text-base font-semibold border border-gray-300 rounded-lg hover:bg-white hover:border-[#0090D3] hover:text-[#0090D3] transition-all font-prompt"
                >
                  1
                </button>
                <span v-if="pagination.page > 7" class="flex items-center px-2 text-gray-400">...</span>

                <!-- Pages around current page -->
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="changePage(page)"
                  :class="[
                    'w-10 h-10 flex items-center justify-center text-base font-semibold border rounded-lg transition-all font-prompt',
                    page === pagination.page
                      ? 'bg-[#0090D3] text-white border-[#0090D3]'
                      : 'border-gray-300 hover:bg-white hover:border-[#0090D3] hover:text-[#0090D3]'
                  ]"
                >
                  {{ page }}
                </button>

                <!-- Last Page -->
                <span v-if="pagination.page < pagination.totalPages - 6" class="flex items-center px-2 text-gray-400">...</span>
                <button
                  v-if="pagination.page < pagination.totalPages - 5"
                  @click="changePage(pagination.totalPages)"
                  class="w-10 h-10 flex items-center justify-center text-base font-semibold border border-gray-300 rounded-lg hover:bg-white hover:border-[#0090D3] hover:text-[#0090D3] transition-all font-prompt"
                >
                  {{ pagination.totalPages }}
                </button>
              </div>

              <!-- Next Button -->
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages"
                class="px-4 py-2 text-base font-semibold border border-gray-300 rounded-lg hover:bg-white hover:border-[#0090D3] hover:text-[#0090D3] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-prompt"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal - Browser Style -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm" @click.self="closeModal">
        <div class="browser-modal browser-modal-large">
          <!-- Browser Tabs Header -->
          <div class="tabs-head">
            <div class="tabs">
              <div class="tab-open">
                <span>{{ modalMode === 'add' ? 'เพิ่มรถเข้า' : 'แก้ไขข้อมูลรถ' }}</span>
                <button @click="closeModal" class="close-tab">✕</button>
              </div>
            </div>
            <div class="window-opt">
              <button>−</button>
              <button>□</button>
              <button @click="closeModal" class="window-close">✕</button>
            </div>
          </div>

          <!-- Browser URL Bar -->
          <div class="head-browser">
            <button disabled>←</button>
            <button disabled>→</button>
            <div class="url-bar">
              <span class="url-text">{{ modalMode === 'add' ? 'vehicle/create' : 'vehicle/edit' }}</span>
              <button class="star">★</button>
            </div>
            <button>⋮</button>
          </div>

          <!-- Content Area -->
          <div class="browser-content">
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
                  <option value="รถมอไซต์">รถมอไซต์</option>
                  <option value="รถสามล้อ">รถสามล้อ</option>
                  <option value="รถยนต์">รถยนต์</option>
                  <option value="รถกระบะ">รถกระบะ</option>
                  <option value="รถ 6 ล้อ">รถ 6 ล้อ</option>
                  <option value="รถ 10 ล้อ">รถ 10 ล้อ</option>
                  <option value="รถ 12 ล้อ">รถ 12 ล้อ</option>
                  <option value="รถ 20 ล้อ">รถ 20 ล้อ</option>
                  <option value="รถ 40 ล้อ">รถ 40 ล้อ</option>
                  <option value="ไม่มีพานพาหนะ">ไม่มีพานพาหนะ</option>
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

            <!-- ปุ่ม -->
            <div class="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 -mx-8 -mb-8 mt-6">
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
      </div>
    </Teleport>

    <!-- Checkout Modal - Browser Style -->
    <Teleport to="body">
      <div v-if="showCheckoutModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm" @click.self="closeCheckoutModal">
        <div class="browser-modal">
          <!-- Browser Tabs Header -->
          <div class="tabs-head tabs-head-green">
            <div class="tabs">
              <div class="tab-open">
                <span>บันทึกรถออก</span>
                <button @click="closeCheckoutModal" class="close-tab">✕</button>
              </div>
            </div>
            <div class="window-opt">
              <button>−</button>
              <button>□</button>
              <button @click="closeCheckoutModal" class="window-close">✕</button>
            </div>
          </div>

          <!-- Browser URL Bar -->
          <div class="head-browser head-browser-green">
            <button disabled>←</button>
            <button disabled>→</button>
            <div class="url-bar">
              <span class="url-text">vehicle/checkout</span>
              <button class="star">★</button>
            </div>
            <button>⋮</button>
          </div>

          <!-- Content Area -->
          <div class="browser-content">
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

            <!-- ปุ่ม -->
            <div class="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 -mx-8 -mb-8 mt-6">
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
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { vehiclesAPI, companiesAPI } from '../services/api';
import DateRangeFilter from '../components/DateRangeFilter.vue';

// ==================== STATE ====================
const vehicles = ref([]);
const companies = ref([]);
const loading = ref(false);
const showModal = ref(false);
const showCheckoutModal = ref(false);
const modalMode = ref('add');

// Extract user info from localStorage
const userId = parseInt(localStorage.getItem('userId'));
const loggedInCompanyId = localStorage.getItem('companyId');
const isSuperAdmin = !loggedInCompanyId || loggedInCompanyId === 'null' || loggedInCompanyId === 'undefined';

const filters = ref({
  search: '',
  status: '',
  dateFrom: null,
  dateTo: null,
  companyId: null,
  page: 1,
  limit: 25,
});

const pagination = ref({
  page: 1,
  limit: 25,
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

// ==================== COMPUTED ====================

// คำนวณหน้าที่จะแสดงใน pagination (แสดงแค่ 10 หน้ารอบๆ หน้าปัจจุบัน)
const visiblePages = computed(() => {
  const current = pagination.value.page;
  const total = pagination.value.totalPages;
  const pages = [];

  // แสดงหน้ารอบๆ หน้าปัจจุบัน (5 หน้าก่อนหน้า + หน้าปัจจุบัน + 4 หน้าถัดไป = 10 หน้า)
  const start = Math.max(1, current - 5);
  const end = Math.min(total, current + 4);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// ==================== FUNCTIONS ====================

const fetchVehicles = async () => {
  loading.value = true;
  try {
    // Super Admin: ใช้ companyId จาก dropdown filter, Company Admin: ส่ง userId ให้ Backend query IC_ID
    const filterCompanyId = isSuperAdmin ? (filters.value.companyId || undefined) : undefined;

    const params = {
      userId: userId, // ส่ง userId ไปให้ Backend query IC_ID
      search: filters.value.search || undefined,
      status: filters.value.status || undefined,
      dateFrom: filters.value.dateFrom || undefined,
      dateTo: filters.value.dateTo || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
      companyId: filterCompanyId, // Super Admin: dropdown filter, Company Admin: undefined
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

const fetchCompanies = async () => {
  try {
    const response = await companiesAPI.getAll();
    // Filter only active companies (IC_IsActive can be true, 1, or '1')
    companies.value = response.data.data.filter(c => c.IC_IsActive === true || c.IC_IsActive === 1 || c.IC_IsActive === '1');
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
};

const handleDateFilter = ({ dateFrom, dateTo }) => {
  filters.value.dateFrom = dateFrom;
  filters.value.dateTo = dateTo;
  pagination.value.page = 1;
  fetchVehicles();
};

const handleCompanyFilter = () => {
  pagination.value.page = 1;
  fetchVehicles();
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
  fetchCompanies();
  fetchVehicles();
});
</script>

<style>
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

/* 2. Page Title - moved to theme-variables.css for theming support */

/* ============================================
   Filters Row Layout
   ============================================ */

.filters-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.date-filter-wrapper {
  flex: 1;
}

.company-filter-wrapper {
  min-width: 200px;
  max-width: 250px;
}

/* Company Filter Inline */
.company-select-inline {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
  color: #475569;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  height: 44px;
}

.company-select-inline:hover {
  border-color: #cbd5e1;
}

.company-select-inline:focus {
  outline: none;
  border-color: #0B4F6C;
  box-shadow: 0 0 0 3px rgba(11, 79, 108, 0.1);
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    gap: 1rem;
  }

  .company-filter-wrapper {
    min-width: 100%;
    max-width: 100%;
  }
}

/* ============================================
   Browser Modal Styles
   ============================================ */

/* Browser Modal Container */
.browser-modal {
  width: 650px;
  max-width: 90vw;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.browser-modal-large {
  width: 800px;
  max-width: 90vw;
}

/* Browser Tabs Header - Default Blue */
.tabs-head {
  background: #0D47A1;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 8px;
}

/* Green variant for checkout */
.tabs-head-green {
  background: #2E7D32 !important;
}

.tabs-head .tabs {
  display: flex;
  gap: 2px;
  height: 100%;
  align-items: flex-end;
}

.tabs-head .tab-open {
  min-width: 110px;
  max-width: 200px;
  height: 26px;
  border-radius: 5px 5px 0 0;
  background-color: #1565C0;
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  position: relative;
}

.tabs-head-green .tab-open {
  background-color: #43A047 !important;
}

.tabs-head .tab-open span {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tabs-head .tab-open .close-tab {
  color: #fff;
  font-size: 13px;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.2s;
  flex-shrink: 0;
  opacity: 0.8;
}

.tabs-head .tab-open .close-tab:hover {
  background-color: rgba(255, 255, 255, 0.2);
  opacity: 1;
}

.tabs-head .window-opt {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 100%;
}

.tabs-head .window-opt button {
  height: 24px;
  width: 24px;
  border: none;
  background-color: transparent;
  transition: 0.15s ease-out;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 12px;
  opacity: 0.9;
}

.tabs-head .window-opt button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

.tabs-head .window-opt .window-close:hover {
  background-color: #dc3545;
  color: #fff;
}

/* Browser URL Bar */
.head-browser {
  position: relative;
  width: 100%;
  height: 42px;
  background-color: #1565C0;
  padding: 5px 10px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.head-browser-green {
  background-color: #43A047 !important;
}

.head-browser button {
  width: 26px;
  height: 26px;
  border: none;
  background-color: transparent;
  color: #fff;
  border-radius: 3px;
  transition: 0.15s ease-in-out;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.head-browser button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.head-browser button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

.head-browser .url-bar {
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  height: 30px;
  border-radius: 15px;
  color: #fff;
  padding: 0 14px;
  flex: 1;
  transition: 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.head-browser .url-bar:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.head-browser .url-text {
  color: #fff;
  font-size: 13px;
  font-weight: 400;
  opacity: 0.9;
}

.head-browser .star {
  color: #fff;
  font-size: 16px;
  opacity: 0.7;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s;
}

.head-browser .star:hover {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

/* Browser Content */
.browser-content {
  background: #fff;
  padding: 32px;
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Responsive - page-title moved to theme-variables.css */
</style>
