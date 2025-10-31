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
    // ดึง companyId จาก localStorage
    const companyId = localStorage.getItem('companyId');
    // Admin หลัก (IC_ID = 1): เห็นทุกบริษัท (ไม่ส่ง filter)
    // Admin ย่อย (IC_ID ≠ 1): เห็นเฉพาะบริษัทตัวเอง (ส่ง companyId)
    const filterCompanyId = (companyId && parseInt(companyId) === 1) ? null : companyId;
    const response = await dashboardAPI.getStats(filterCompanyId);
    stats.value = response.data.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const fetchActivities = async () => {
  loading.value = true;
  try {
    // ดึง companyId จาก localStorage
    const companyId = localStorage.getItem('companyId');
    // Admin หลัก (IC_ID = 1): เห็นทุกบริษัท (ไม่ส่ง filter)
    // Admin ย่อย (IC_ID ≠ 1): เห็นเฉพาะบริษัทตัวเอง (ส่ง companyId)
    const filterCompanyId = (companyId && parseInt(companyId) === 1) ? null : companyId;
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
  fetchStats();
  fetchActivities();
});
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 100%;
  animation: fadeIn 0.5s ease-in;
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

.page-header {
  margin-bottom: 2.5rem;
  position: relative;
}

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
  text-shadow: 0 4px 12px rgba(0, 144, 211, 0.15);
}

.page-subtitle {
  font-size: 1.05rem;
  color: #64748b;
  margin: 0;
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
}

.page-content {
  width: 100%;
}

/* Stats Grid - Cold Storage Theme */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.75rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.stat-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.stat-icon svg {
  width: 32px;
  height: 32px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Cold Storage Themed Icons */
.stat-icon.blue {
  background: linear-gradient(135deg, #0B4F6C 0%, #0090D3 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  font-family: 'Prompt', sans-serif;
  letter-spacing: -0.03em;
  line-height: 1;
}

/* Table Section */
.mt-6 {
  margin-top: 2rem;
}

/* Badge - Modern Cold Theme */
.badge {
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: 'Prompt', sans-serif;
  letter-spacing: 0.02em;
  border: 1.5px solid transparent;
  transition: all 0.2s ease;
}

.badge-blue {
  background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
  color: #1E40AF;
  border-color: #93C5FD;
}

.badge-blue:hover {
  background: linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%);
  transform: scale(1.05);
}

.badge-green {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  color: #065F46;
  border-color: #6EE7B7;
}

.badge-green:hover {
  background: linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%);
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
  }

  .stat-icon svg {
    width: 28px;
    height: 28px;
  }

  .stat-value {
    font-size: 1.875rem;
  }
}
</style>
