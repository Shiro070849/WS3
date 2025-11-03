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
import { dashboardAPI } from '../services/api';

const stats = ref({
  wayInToday: 0,
  wayOutToday: 0,
  pendingVehicles: 0,
  activeCompanies: 0,
});

const activities = ref([]);
const loading = ref(false);

const columns = [
  { key: 'WI_DateTimeIn', label: 'เวลา' },
  { key: 'WI_LicensePlate', label: 'ทะเบียนรถ' },
  { key: 'CompanyName', label: 'บริษัท' },
  { key: 'WI_VehicleType', label: 'ประเภทรถ' },
  { key: 'Status', label: 'สถานะ' },
];

const fetchStats = async () => {
  try {
    const companyId = localStorage.getItem('companyId');
    const isSuperAdmin = !companyId || companyId === 'null' || companyId === 'undefined';
    const filterCompanyId = isSuperAdmin ? null : companyId;
    const response = await dashboardAPI.getStats(filterCompanyId);
    stats.value = response.data.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const fetchActivities = async () => {
  loading.value = true;
  try {
    const companyId = localStorage.getItem('companyId');
    const isSuperAdmin = !companyId || companyId === 'null' || companyId === 'undefined';
    const filterCompanyId = isSuperAdmin ? null : companyId;
    const response = await dashboardAPI.getActivities(10, filterCompanyId);
    activities.value = response.data.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
  } finally {
    loading.value = false;
  }
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

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
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
}
</style>
