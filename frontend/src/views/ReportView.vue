<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">รายงาน</h1>
      <p class="page-subtitle">รายงานสรุปข้อมูลการเข้า-ออกของยานพาหนะ</p>
    </div>

    <!-- Main Content -->
    <div class="page-content">
      <!-- Filter Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-4">
        <h3 class="text-base font-bold text-gray-900 mb-4" style="font-family: 'Prompt', sans-serif;">
          ตัวกรอง
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- วันที่เริ่มต้น -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              วันที่เริ่มต้น
            </label>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all"
            />
          </div>

          <!-- วันที่สิ้นสุด -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              วันที่สิ้นสุด
            </label>
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all"
            />
          </div>

          <!-- บริษัท -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              บริษัท
            </label>
            <select
              v-model="filters.companyId"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all"
            >
              <option value="">ทั้งหมด</option>
              <option value="1">บริษัท รักชัยห้องเย็น จำกัด</option>
              <option value="2">บริษัท มหาราช จำกัด</option>
            </select>
          </div>

          <!-- สถานะ -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              สถานะ
            </label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all"
            >
              <option value="">ทั้งหมด</option>
              <option value="in">เข้า</option>
              <option value="out">ออก</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-5">
          <button
            @click="fetchReport"
            class="px-5 py-2.5 text-base font-semibold bg-[#0090D3] text-white rounded-lg hover:bg-[#007AB8] active:scale-95 transition-all shadow-sm"
          >
            <svg class="w-5 h-5 inline-block mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            ค้นหา
          </button>
          <button
            @click="exportExcel"
            class="px-5 py-2.5 text-base font-semibold bg-[#3AAA35] text-white rounded-lg hover:bg-[#339A2E] active:scale-95 transition-all shadow-sm"
          >
            <svg class="w-5 h-5 inline-block mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            ส่งออก Excel
          </button>
          <button
            @click="exportPDF"
            class="px-5 py-2.5 text-base font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-all shadow-sm"
          >
            <svg class="w-5 h-5 inline-block mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            ส่งออก PDF
          </button>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600" style="font-family: 'Prompt', sans-serif;">ทั้งหมด</p>
              <p class="text-2xl font-bold text-gray-900" style="font-family: 'Prompt', sans-serif;">{{ summary.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600" style="font-family: 'Prompt', sans-serif;">รถเข้า</p>
              <p class="text-2xl font-bold text-gray-900" style="font-family: 'Prompt', sans-serif;">{{ summary.in }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600" style="font-family: 'Prompt', sans-serif;">รถออก</p>
              <p class="text-2xl font-bold text-gray-900" style="font-family: 'Prompt', sans-serif;">{{ summary.out }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600" style="font-family: 'Prompt', sans-serif;">ค้างอยู่</p>
              <p class="text-2xl font-bold text-gray-900" style="font-family: 'Prompt', sans-serif;">{{ summary.pending }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <!-- Table Header -->
        <div class="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 class="text-base font-bold text-gray-900">
            รายการข้อมูล
            <span class="ml-2 text-sm font-normal text-gray-500">
              ({{ reports.length }} รายการ)
            </span>
          </h2>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">#</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">ทะเบียนรถ</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">ประเภทรถ</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">คนขับ</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">บริษัท</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">เวลาเข้า</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">เวลาออก</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">ระยะเวลา</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-gray-700">สถานะ</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                  <div class="flex justify-center items-center">
                    <svg class="animate-spin h-5 w-5 mr-2 text-[#0090D3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-sm">กำลังโหลดข้อมูล...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="reports.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-sm text-gray-500">
                  ไม่พบข้อมูล
                </td>
              </tr>
              <tr v-else v-for="(report, index) in reports" :key="report.id" class="hover:bg-blue-50/30 transition-colors border-b border-gray-200">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {{ index + 1 }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">
                    {{ report.licensePlate }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ report.province }}
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {{ report.vehicleType }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {{ report.driver }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {{ report.company }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {{ report.timeIn }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {{ report.timeOut || '-' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {{ report.duration || '-' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    :class="{
                      'bg-green-100 text-green-700 border border-green-200': report.status === 'เข้า',
                      'bg-orange-100 text-orange-700 border border-orange-200': report.status === 'ออก'
                    }"
                    class="px-2.5 py-1 inline-flex text-sm font-bold rounded-full"
                  >
                    {{ report.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { reportsAPI } from '../services/api';

// ==================== STATE ====================
const loading = ref(false);
const reports = ref([]);

const filters = ref({
  startDate: '',
  endDate: '',
  companyId: '',
  status: '',
});

const summary = ref({
  total: 0,
  in: 0,
  out: 0,
  pending: 0,
});

// ==================== FUNCTIONS ====================

const fetchReport = async () => {
  loading.value = true;
  try {
    const params = {
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
      companyId: filters.value.companyId || undefined,
      status: filters.value.status || undefined,
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
  } catch (error) {
    console.error('Error fetching reports:', error);
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
  } finally {
    loading.value = false;
  }
};

const exportExcel = async () => {
  try {
    const params = new URLSearchParams({
      ...(filters.value.startDate && { startDate: filters.value.startDate }),
      ...(filters.value.endDate && { endDate: filters.value.endDate }),
      ...(filters.value.companyId && { companyId: filters.value.companyId }),
      ...(filters.value.status && { status: filters.value.status }),
    });

    // สร้าง URL สำหรับ download
    const url = `http://localhost:8088/api/reports/export/excel?${params.toString()}`;

    // สร้าง link element และ click เพื่อ download
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานยานพาหนะ_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('กำลังดาวน์โหลดไฟล์ Excel...');
  } catch (error) {
    console.error('Error exporting Excel:', error);
    alert('เกิดข้อผิดพลาดในการส่งออก Excel');
  }
};

const exportPDF = async () => {
  try {
    const params = new URLSearchParams({
      ...(filters.value.startDate && { startDate: filters.value.startDate }),
      ...(filters.value.endDate && { endDate: filters.value.endDate }),
      ...(filters.value.companyId && { companyId: filters.value.companyId }),
      ...(filters.value.status && { status: filters.value.status }),
    });

    // สร้าง URL สำหรับ download
    const url = `http://localhost:8088/api/reports/export/pdf?${params.toString()}`;

    // สร้าง link element และ click เพื่อ download
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานยานพาหนะ_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('กำลังดาวน์โหลดไฟล์ PDF...');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('เกิดข้อผิดพลาดในการส่งออก PDF');
  }
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';

  // ตัด 'Z' ออกเพื่อบังคับให้อ่านเป็น Local Time แทน UTC
  // เพราะ Database บันทึกเวลาเป็น Local Time แต่ส่งออกมามี Z ต่อท้าย
  const dateStr = dateTime.replace('Z', '');
  const date = new Date(dateStr);

  // Format: DD/MM/YYYY HH:MM (ใช้ปี ค.ศ.)
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear(); // ปี ค.ศ. 4 หลัก
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

onMounted(() => {
  // Set default date range (last 7 days)
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  filters.value.endDate = today.toISOString().split('T')[0];
  filters.value.startDate = lastWeek.toISOString().split('T')[0];

  fetchReport();
});
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 100%;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  font-family: 'Prompt', sans-serif;
}

.page-subtitle {
  font-size: 1rem;
  color: #718096;
  margin: 0;
  font-family: 'Prompt', sans-serif;
}

.page-content {
  width: 100%;
}
</style>
