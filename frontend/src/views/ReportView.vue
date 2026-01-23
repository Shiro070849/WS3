<template>
  <div class="w-full max-w-full animate-fadeIn">
    <!-- Page Header - Tailwind Only -->
    <div class="mb-10 relative">
      <h1 class="page-title">รายงาน</h1>
      <p class="text-lg text-slate-500 m-0 font-prompt font-medium">
        รายงานสรุปข้อมูลการเข้า-ออกของยานพาหนะ
      </p>
    </div>

    <!-- Main Content - Tailwind Layout -->
    <div class="w-full">
      <!-- Filter Card - Row 1: Date Range -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-4 mb-3">
        <div class="flex items-end gap-1.5 w-full">
          <DateRangeFilter
            :dateFrom="filters.startDate"
            :dateTo="filters.endDate"
            @update:dateFrom="filters.startDate = $event"
            @update:dateTo="filters.endDate = $event"
            @filter="fetchReport"
          />
        </div>
      </div>

      <!-- Filter Card - Row 2: Other Filters + Buttons -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-4 mb-6">
        <div class="flex items-end gap-3 w-full">
          <!-- บริษัท -->
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-sm font-semibold text-gray-700 font-prompt">
              บริษัท
            </label>
            <select
              v-model="filters.companyId"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              @change="fetchReport"
              :disabled="companies.length === 1"
            >
              <!-- แสดง "ทั้งหมด" เมื่อมีหลายบริษัท -->
              <option v-if="companies.length > 1" value="">ทั้งหมด</option>
              <option
                v-for="company in companies"
                :key="company.IC_ID"
                :value="company.IC_ID"
              >
                {{ company.IC_LocalName }}
              </option>
            </select>
          </div>

          <!-- ประเภทรถ -->
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-sm font-semibold text-gray-700 font-prompt">
              ประเภทรถ
            </label>
            <select
              v-model="filters.vehicleType"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              @change="fetchReport"
            >
              <option value="">ทั้งหมด</option>
              <option
                v-for="vType in vehicleTypes"
                :key="vType.VType_ID"
                :value="vType.VType_LocalName"
              >
                {{ vType.VType_LocalName }}
              </option>
            </select>
          </div>

          <!-- สถานะ -->
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-sm font-semibold text-gray-700 font-prompt">
              สถานะ
            </label>
            <select
              v-model="filters.status"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              @change="fetchReport"
            >
              <option value="">ทั้งหมด</option>
              <option value="in">เข้า</option>
              <option value="out">ออก</option>
            </select>
          </div>

          <!-- Export Button -->
          <button
            @click="openExportModal"
            class="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#3AAA35] to-[#339A2E] text-white rounded-lg hover:shadow-lg active:scale-95 transition-all shadow-sm font-prompt h-auto whitespace-nowrap flex-shrink-0"
          >
            <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            ส่งออก
          </button>
        </div>
      </div>

      <!-- Export Modal -->
      <ExportModal
        :show="showExportModal"
        :current-filters="filters"
        :companies="companies"
        :vehicle-types="vehicleTypes"
        :total-records="summary.total"
        :is-company-admin="isCompanyAdmin"
        @close="closeExportModal"
        @export="handleExport"
      />

      <!-- Summary Stats - Tailwind Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-base font-medium text-gray-600 font-prompt">ทั้งหมด</p>
              <p class="text-3xl font-bold text-gray-900 font-prompt">{{ summary.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-base font-medium text-gray-600 font-prompt">รถเข้า</p>
              <p class="text-3xl font-bold text-gray-900 font-prompt">{{ summary.in }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-base font-medium text-gray-600 font-prompt">รถออก</p>
              <p class="text-3xl font-bold text-gray-900 font-prompt">{{ summary.out }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-base font-medium text-gray-600 font-prompt">ค้างอยู่</p>
              <p class="text-3xl font-bold text-gray-900 font-prompt">{{ summary.pending }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Table - Tailwind Only -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <!-- Table Header -->
        <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 class="text-lg font-bold text-gray-900 font-prompt">
            รายการข้อมูล
            <span class="ml-2 text-base font-normal text-gray-500">
              ({{ summary.total }} รายการ)
            </span>
          </h2>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <tr>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">#</th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">ทะเบียนรถ</th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">ประเภทรถ</th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">คนขับ</th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">บริษัท</th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">เวลาเข้า</th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">เวลาออก</th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">ระยะเวลา</th>
                <th class="px-6 py-5 text-left text-sm font-bold text-gray-700 font-prompt">สถานะ</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="9" class="px-6 py-10 text-center text-gray-500">
                  <div class="flex justify-center items-center">
                    <svg class="animate-spin h-6 w-6 mr-3 text-[#0090D3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-base font-prompt">กำลังโหลดข้อมูล...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="reports.length === 0">
                <td colspan="9" class="px-6 py-10 text-center text-base text-gray-500 font-prompt">
                  ไม่พบข้อมูล
                </td>
              </tr>
              <tr v-else v-for="(report, index) in paginatedReports" :key="report.id" class="hover:bg-blue-50/30 transition-colors border-b border-gray-200">
                <td class="px-6 py-5 whitespace-nowrap text-base text-gray-700 font-medium font-prompt">
                  {{ (pagination.page - 1) * pagination.limit + index + 1 }}
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base font-bold text-gray-900 font-prompt">
                    {{ report.licensePlate }}
                  </div>
                  <div class="text-sm text-gray-500 font-prompt">
                    {{ report.province }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-base text-gray-700 font-medium font-prompt">
                  {{ report.vehicleType }}
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-base text-gray-700 font-medium font-prompt">
                  {{ report.driver }}
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-base text-gray-700 font-medium font-prompt">
                  {{ report.company }}
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-base text-gray-700 font-medium font-prompt">
                  {{ report.timeIn }}
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-base text-gray-700 font-medium font-prompt">
                  {{ report.timeOut || '-' }}
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-base text-gray-700 font-medium font-prompt">
                  {{ report.duration || '-' }}
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <span
                    :class="{
                      'bg-green-100 text-green-700 border-green-200': report.status === 'เข้า',
                      'bg-orange-100 text-orange-700 border-orange-200': report.status === 'ออก'
                    }"
                    class="px-3 py-1.5 inline-flex text-sm font-semibold rounded-full border-2 font-prompt"
                  >
                    {{ report.status }}
                  </span>
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { reportsAPI, getBackendBaseUrl, vehicleTypesAPI, companiesAPI } from '../services/api';
import DateRangeFilter from '../components/DateRangeFilter.vue';
import ExportModal from '../components/ExportModal.vue';
import { useToast } from '@/composables/useToast';
import { useFilterStore } from '../stores/filterStore';

const toast = useToast();
const filterStore = useFilterStore();

// ==================== CONSTANTS ====================
// Timing constants
const BLOB_CLEANUP_DELAY = 100; // milliseconds - time to allow blob download before revoke URL

// ==================== STATE ====================
const loading = ref(false);
const reports = ref([]);
const vehicleTypes = ref([]);
const companies = ref([]);
const showExportModal = ref(false);

const filters = ref({
  startDate: filterStore.dateFrom || '',
  endDate: filterStore.dateTo || '',
  companyId: '',
  status: '',
  vehicleType: '',
});

const pagination = ref({
  page: 1,
  limit: 25,
  total: 0,
  totalPages: 0,
});

const summary = ref({
  total: 0,
  in: 0,
  out: 0,
  pending: 0,
});

// ==================== COMPUTED ====================

// ตรวจสอบว่าเป็น Company Admin หรือไม่
const isCompanyAdmin = computed(() => {
  const companyId = localStorage.getItem('companyId');
  return companyId && companyId !== 'null';
});

// คำนวณหน้าที่จะแสดงใน pagination
const visiblePages = computed(() => {
  const current = pagination.value.page;
  const total = pagination.value.totalPages;
  const pages = [];

  const start = Math.max(1, current - 5);
  const end = Math.min(total, current + 4);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// คำนวณข้อมูลที่จะแสดงในหน้าปัจจุบัน
const paginatedReports = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.limit;
  const end = start + pagination.value.limit;
  return reports.value.slice(start, end);
});

// ==================== FUNCTIONS ====================

const fetchVehicleTypes = async () => {
  try {
    const response = await vehicleTypesAPI.getAll(true);
    vehicleTypes.value = response.data.data;
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
  }
};

const fetchCompanies = async () => {
  try {
    const userId = localStorage.getItem('userId');

    // ใช้ getAccessible เพื่อให้ Backend กรองตาม User Company
    const response = await companiesAPI.getAccessible(userId);

    // Backend กรอง IC_IsActive = 1 ให้แล้ว ไม่ต้อง filter ซ้ำ
    companies.value = response.data.data || [];

    console.log('📦 [Report] Companies Count:', companies.value.length);
  } catch (error) {
    console.error('❌ [Report] Error fetching companies:', error);
  }
};

const fetchReport = async () => {
  loading.value = true;
  try {
    const params = {
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
      companyId: filters.value.companyId || undefined,
      status: filters.value.status || undefined,
      vehicleType: filters.value.vehicleType || undefined,
    };

    const response = await reportsAPI.getAll(params);

    // แปลงข้อมูลให้ตรงกับ format ที่ frontend ต้องการ
    reports.value = response.data.data.map(item => ({
      id: item.WI_ID,
      licensePlate: item.WI_LicensePlate,
      province: item.WI_LicenseProvince,
      vehicleType: item.WI_VehicleType,
      driver: item.DriverName,
      company: item.CompanyName,
      timeIn: formatDateTime(item.TimeIn),
      timeOut: item.TimeOut ? formatDateTime(item.TimeOut) : null,
      duration: item.Duration,
      status: item.Status,
    }));

    summary.value = response.data.summary;

    // คำนวณ pagination
    pagination.value.total = summary.value.total;
    pagination.value.totalPages = Math.ceil(summary.value.total / pagination.value.limit);
    pagination.value.page = 1; // รีเซต pagination เมื่อค้นหาข้อมูลใหม่
  } catch (error) {
    console.error('Error fetching reports:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลรายงานได้');
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page;
  }
};

// อัปเดต global filter store เมื่อวันที่เปลี่ยน
const updateGlobalFilters = () => {
  filterStore.setDateRange(filters.value.startDate, filters.value.endDate);
  filterStore.persistToLocalStorage();
};

// ติดตามการเปลี่ยนแปลงของวันที่
watch(() => filters.value.startDate, updateGlobalFilters);
watch(() => filters.value.endDate, updateGlobalFilters);

// ==================== EXPORT MODAL ====================
const openExportModal = () => {
  showExportModal.value = true;
};

const closeExportModal = () => {
  showExportModal.value = false;
};

const handleExport = async (exportData) => {
  try {
    const { format, filters: exportFilters, options } = exportData;

    // ดึง userId จาก localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('userId is required');
    }

    const params = new URLSearchParams({
      userId, // เพิ่ม userId
      ...(exportFilters.startDate && { startDate: exportFilters.startDate }),
      ...(exportFilters.endDate && { endDate: exportFilters.endDate }),
      ...(exportFilters.companyId && { companyId: exportFilters.companyId }),
      ...(exportFilters.status && { status: exportFilters.status }),
      ...(exportFilters.vehicleType && { vehicleType: exportFilters.vehicleType }),
      ...(options.includeSubtotal && { subtotal: 'true' }),
      ...(options.showLogo && { logo: 'true' }),
      ...(options.includeSummary && { summary: 'true' }),
    });

    // สร้าง URL ตาม format
    const endpoint = format === 'excel' ? 'excel' : 'pdf';
    const url = `${getBackendBaseUrl()}/api/reports/export/${endpoint}?${params.toString()}`;
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    const filename = `รายงานยานพาหนะ_${new Date().toISOString().split('T')[0]}.${extension}`;

    // แสดง loading toast
    toast.info('กำลังประมวลผล', `กำลังสร้างไฟล์ ${format.toUpperCase()}...`);

    // ใช้ fetch เพื่อดาวน์โหลดไฟล์
    const response = await fetch(url);

    if (!response.ok) {
      // ถ้า response ไม่ ok ให้ลองอ่าน error message
      let errorMessage = 'ไม่สามารถส่งออกรายงานได้';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // ถ้าไม่สามารถ parse JSON ได้
        errorMessage = `เกิดข้อผิดพลาด (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    // แปลง response เป็น blob
    const blob = await response.blob();

    // สร้าง blob URL และดาวน์โหลด
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // ล้าง blob URL หลังจากดาวน์โหลดเสร็จ
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), BLOB_CLEANUP_DELAY);

    // แสดง success toast
    toast.success('ดาวน์โหลดสำเร็จ', `ไฟล์ ${format.toUpperCase()} ถูกดาวน์โหลดเรียบร้อย`);

    // ปิด modal หลังดาวน์โหลดสำเร็จ
    closeExportModal();
  } catch (error) {
    console.error('Error exporting:', error);
    toast.error('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถส่งออกรายงานได้');
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

onMounted(async () => {
  // โหลด stored filters จาก localStorage
  filterStore.initializeFromLocalStorage();

  // ใช้ store dates หากมี มิฉะนั้นใช้ default (last 7 days)
  if (filterStore.dateFrom && filterStore.dateTo) {
    filters.value.startDate = filterStore.dateFrom;
    filters.value.endDate = filterStore.dateTo;
  } else {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    filters.value.endDate = today.toISOString().split('T')[0];
    filters.value.startDate = lastWeek.toISOString().split('T')[0];

    // บันทึกไปยัง store
    filterStore.setDateRange(filters.value.startDate, filters.value.endDate);
    filterStore.persistToLocalStorage();
  }

  // โหลด companies ก่อน
  await fetchCompanies();
  fetchVehicleTypes();

  // Auto-fill companyId สำหรับ Company Admin
  if (isCompanyAdmin.value && companies.value.length > 0) {
    filters.value.companyId = companies.value[0].IC_ID;
    console.log('🔒 [Report] Company Admin - Auto-selected company:', companies.value[0].IC_LocalName);
  }

  fetchReport();
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

/* 2. Page Title - moved to theme-variables.css for theming support */
</style>
