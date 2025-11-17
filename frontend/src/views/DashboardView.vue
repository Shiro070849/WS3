<template>
  <!-- Main Container - Tailwind Only -->
  <div class="w-full max-w-full animate-fadeIn">

    <!-- Header - Tailwind Only -->
    <div class="mb-10 relative">
      <h1 class="page-title">Dashboard</h1>
      <p class="text-lg text-slate-500 m-0 font-prompt font-medium">
        ภาพรวมระบบ Smart Security
      </p>
    </div>

    <!-- Content -->
    <div class="w-full">

      <!-- Filters Row: Date Range + Company + Vehicle Type -->
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

        <div class="vehicle-type-filter-wrapper">
          <select
            v-model="filters.vehicleType"
            class="company-select-inline"
            @change="handleVehicleTypeFilter"
          >
            <option value="">ประเภทรถทั้งหมด</option>
            <option
              v-for="vType in vehicleTypes"
              :key="vType.VType_ID"
              :value="vType.VType_LocalName"
            >
              {{ vType.VType_LocalName }}
            </option>
          </select>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="search-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="filters.search"
            type="text"
            placeholder="ค้นหาทะเบียนรถ, ชื่อคนขับ..."
            class="search-input"
            @input="handleSearch"
          />
          <button v-if="filters.search" @click="clearSearch" class="clear-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Stats Cards Grid - Tailwind Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 mb-10">

        <!-- Card 1: รถเข้าวันนี้ -->
        <BaseCard>
          <div class="flex items-center gap-5 p-2 transition-all duration-300 hover:-translate-y-1 group">
            <div class="stat-icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8 text-white drop-shadow-md">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-base text-slate-500 mb-2 font-prompt font-medium tracking-wide">
                รถเข้าวันนี้
              </p>
              <p class="text-4xl font-extrabold text-slate-900 m-0 font-prompt tracking-tight leading-none">
                {{ stats.wayInToday || 0 }}
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- Card 2: รถออกวันนี้ -->
        <BaseCard>
          <div class="flex items-center gap-5 p-2 transition-all duration-300 hover:-translate-y-1 group">
            <div class="stat-icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8 text-white drop-shadow-md">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-base text-slate-500 mb-2 font-prompt font-medium tracking-wide">
                รถออกวันนี้
              </p>
              <p class="text-4xl font-extrabold text-slate-900 m-0 font-prompt tracking-tight leading-none">
                {{ stats.wayOutToday || 0 }}
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- Card 3: รถยังไม่ชั่งออก -->
        <BaseCard>
          <div class="flex items-center gap-5 p-2 transition-all duration-300 hover:-translate-y-1 group">
            <div class="stat-icon-orange">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8 text-white drop-shadow-md">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-base text-slate-500 mb-2 font-prompt font-medium tracking-wide">
                รถยังไม่ชั่งออก
              </p>
              <p class="text-4xl font-extrabold text-slate-900 m-0 font-prompt tracking-tight leading-none">
                {{ stats.pendingVehicles || 0 }}
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- Card 4: บริษัททั้งหมด -->
        <BaseCard>
          <div class="flex items-center gap-5 p-2 transition-all duration-300 hover:-translate-y-1 group">
            <div class="stat-icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8 text-white drop-shadow-md">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-base text-slate-500 mb-2 font-prompt font-medium tracking-wide">
                บริษัททั้งหมด
              </p>
              <p class="text-4xl font-extrabold text-slate-900 m-0 font-prompt tracking-tight leading-none">
                {{ stats.activeCompanies || 0 }}
              </p>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Recent Activities Table - Tailwind Spacing -->
      <div class="mt-8">
        <BaseCard title="รายการเข้า-ออกล่าสุด">
          <BaseTable :columns="columns" :data="activities" :loading="loading">
            <template #cell-WI_DateTimeIn="{ value }">
              {{ formatDateTime(value) }}
            </template>
            <template #cell-Status="{ value }">
              <span
                :class="value === 'เข้า' ? 'badge-blue' : 'badge-green'"
                class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold font-prompt tracking-wide border-2 transition-all duration-200 hover:scale-105"
              >
                {{ value }}
              </span>
            </template>
          </BaseTable>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from '../components/base/BaseCard.vue';
import BaseTable from '../components/base/BaseTable.vue';
import DateRangeFilter from '../components/DateRangeFilter.vue';
import { dashboardAPI, companiesAPI, vehicleTypesAPI } from '../services/api';

const stats = ref({
  wayInToday: 0,
  wayOutToday: 0,
  pendingVehicles: 0,
  activeCompanies: 0,
});

const activities = ref([]);
const loading = ref(false);
const companies = ref([]);
const vehicleTypes = ref([]);

// ดึงข้อมูล user จาก localStorage
const userId = parseInt(localStorage.getItem('userId'));
const loggedInCompanyId = localStorage.getItem('companyId');
const isSuperAdmin = !loggedInCompanyId || loggedInCompanyId === 'null' || loggedInCompanyId === 'undefined';

console.log(`👤 Dashboard User: userId=${userId}, companyId=${loggedInCompanyId}, isSuperAdmin=${isSuperAdmin}`);

const filters = ref({
  search: '',
  dateFrom: null,
  dateTo: null,
  companyId: null,
  vehicleType: '',
});

const columns = [
  { key: 'WI_DateTimeIn', label: 'เวลา' },
  { key: 'WI_LicensePlate', label: 'ทะเบียนรถ' },
  { key: 'CompanyName', label: 'บริษัท' },
  { key: 'WI_VehicleType', label: 'ประเภทรถ' },
  { key: 'Status', label: 'สถานะ' },
];

const fetchCompanies = async () => {
  try {
    const response = await companiesAPI.getAll();
    // Filter only active companies (IC_IsActive can be true, 1, or '1')
    companies.value = response.data.data.filter(c => c.IC_IsActive === true || c.IC_IsActive === 1 || c.IC_IsActive === '1');
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
};

const fetchVehicleTypes = async () => {
  try {
    const response = await vehicleTypesAPI.getAll(true);
    vehicleTypes.value = response.data.data;
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
  }
};

const fetchStats = async () => {
  try {
    // ส่ง userId และ companyId ไป Backend
    const filterCompanyId = filters.value.companyId;

    const response = await dashboardAPI.getStats(
      userId,
      filterCompanyId,
      filters.value.dateFrom,
      filters.value.dateTo,
      filters.value.vehicleType
    );
    stats.value = response.data.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const fetchActivities = async () => {
  loading.value = true;
  try {
    // ส่ง userId และ companyId ไป Backend
    const filterCompanyId = filters.value.companyId;

    const response = await dashboardAPI.getActivities(
      10,
      userId,
      filterCompanyId,
      filters.value.dateFrom,
      filters.value.dateTo,
      filters.value.search,
      filters.value.vehicleType
    );
    activities.value = response.data.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
  } finally {
    loading.value = false;
  }
};

const handleDateFilter = ({ dateFrom, dateTo }) => {
  filters.value.dateFrom = dateFrom;
  filters.value.dateTo = dateTo;
  fetchStats();
  fetchActivities();
};

const handleCompanyFilter = () => {
  fetchStats();
  fetchActivities();
};

const handleVehicleTypeFilter = () => {
  fetchStats();
  fetchActivities();
};

const handleSearch = () => {
  fetchActivities();
};

const clearSearch = () => {
  filters.value.search = '';
  fetchActivities();
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
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
  fetchVehicleTypes();
  fetchStats();
  fetchActivities();
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

/* 3. Icon Gradients - ทำด้วย class แยกเพื่อ reuse */
.stat-icon-blue,
.stat-icon-green,
.stat-icon-orange,
.stat-icon-purple {
  @apply w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-lg transition-all duration-300;
}

.group:hover .stat-icon-blue,
.group:hover .stat-icon-green,
.group:hover .stat-icon-orange,
.group:hover .stat-icon-purple {
  @apply scale-110 shadow-2xl;
}

.stat-icon-blue {
  background: linear-gradient(135deg, #0B4F6C 0%, #0090D3 100%);
}

.stat-icon-green {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.stat-icon-orange {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
}

.stat-icon-purple {
  background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
}

/* 4. Badge Gradients */
.badge-blue {
  background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
  color: #1E40AF;
  border-color: #93C5FD;
}

.badge-blue:hover {
  background: linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%);
}

.badge-green {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  color: #065F46;
  border-color: #6EE7B7;
}

.badge-green:hover {
  background: linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%);
}

/* Filters Row Layout */
.filters-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.date-filter-wrapper {
  flex: 1;
}

.company-filter-wrapper,
.vehicle-type-filter-wrapper {
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

/* Search Bar */
.search-container {
  margin-bottom: 1.5rem;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.search-bar:hover {
  border-color: #cbd5e1;
}

.search-bar:focus-within {
  border-color: #0B4F6C;
  box-shadow: 0 0 0 3px rgba(11, 79, 108, 0.1);
}

.search-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #94a3b8;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  font-family: 'Prompt', sans-serif;
  color: #1e293b;
  background: transparent;
}

.search-input::placeholder {
  color: #94a3b8;
}

.clear-btn {
  padding: 0.375rem;
  color: #94a3b8;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
}

.clear-btn:hover {
  color: #475569;
  background: #f1f5f9;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .filters-row {
    flex-direction: column;
    gap: 1rem;
  }

  .company-filter-wrapper,
  .vehicle-type-filter-wrapper {
    min-width: 100%;
    max-width: 100%;
  }

  .stat-icon-blue,
  .stat-icon-green,
  .stat-icon-orange,
  .stat-icon-purple {
    @apply w-14 h-14;
  }

  .stat-icon-blue svg,
  .stat-icon-green svg,
  .stat-icon-orange svg,
  .stat-icon-purple svg {
    @apply w-7 h-7;
  }

  .search-input {
    font-size: 0.875rem;
  }
}
</style>
