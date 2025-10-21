<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">ภาพรวมระบบ Smart Security</p>
    </div>

    <div class="page-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <BaseCard>
          <div class="stat-card">
            <div class="stat-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">รถเข้าวันนี้</p>
              <p class="stat-value">{{ stats.wayInToday || 0 }}</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="stat-card">
            <div class="stat-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">รถออกวันนี้</p>
              <p class="stat-value">{{ stats.wayOutToday || 0 }}</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="stat-card">
            <div class="stat-icon orange">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">รถยังไม่ชั่งออก</p>
              <p class="stat-value">{{ stats.pendingVehicles || 0 }}</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="stat-card">
            <div class="stat-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">บริษัททั้งหมด</p>
              <p class="stat-value">{{ stats.activeCompanies || 0 }}</p>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Recent Activities Table -->
      <div class="mt-6">
        <BaseCard title="รายการเข้า-ออกล่าสุด">
          <BaseTable :columns="columns" :data="activities" :loading="loading">
            <template #cell-WI_DateTimeIn="{ value }">
              {{ formatDateTime(value) }}
            </template>
            <template #cell-Status="{ value }">
              <span :class="value === 'เข้า' ? 'badge-blue' : 'badge-green'" class="badge">
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
    const response = await dashboardAPI.getStats();
    stats.value = response.data.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const fetchActivities = async () => {
  loading.value = true;
  try {
    const response = await dashboardAPI.getActivities(10);
    activities.value = response.data.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
  } finally {
    loading.value = false;
  }
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleString('th-TH', {
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #0090D3 0%, #007AB8 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #3AAA35 0%, #339A2E 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  margin: 0 0 0.25rem 0;
  font-family: 'Prompt', sans-serif;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  font-family: 'Prompt', sans-serif;
}

/* Badge */
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  font-family: 'Prompt', sans-serif;
}

.badge-blue {
  background: #DBEAFE;
  color: #1E40AF;
}

.badge-green {
  background: #D1FAE5;
  color: #065F46;
}
</style>
