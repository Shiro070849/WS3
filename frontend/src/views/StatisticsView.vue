<template>
  <div class="page-container">
    <div class="page-header">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="page-title">สถิติ</h1>
          <p class="page-subtitle">สถิติและการวิเคราะห์ข้อมูลคลังสินค้า</p>
        </div>
        <div class="filter-buttons">
          <button
            v-for="period in periods"
            :key="period.value"
            @click="selectedPeriod = period.value"
            :class="selectedPeriod === period.value ? 'active' : ''"
            class="period-btn"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <!-- Overview Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card-modern" v-for="stat in overviewStats" :key="stat.label">
          <div class="stat-icon-wrapper" :style="{ background: stat.gradient }">
            <div class="stat-icon" v-html="stat.icon"></div>
          </div>
          <div class="stat-info">
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value">{{ stat.value }}</p>
            <div class="stat-change" :class="stat.trend === 'up' ? 'positive' : 'negative'">
              <svg v-if="stat.trend === 'up'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
              </svg>
              <span>{{ stat.change }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Traffic Trend Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">แนวโน้มการเข้า-ออกรถ</h3>
          </div>
          <div class="chart-container">
            <Line v-if="trafficChartData" :data="trafficChartData" :options="trafficChartOptions" />
          </div>
        </div>

        <!-- Vehicle Types Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">ประเภทรถที่เข้าใช้บริการ</h3>
          </div>
          <div class="chart-container">
            <Bar v-if="vehicleChartData" :data="vehicleChartData" :options="vehicleChartOptions" />
          </div>
        </div>

        <!-- Peak Hours Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">ช่วงเวลาเร่งด่วน</h3>
            <span class="chart-badge">24 ชั่วโมง</span>
          </div>
          <div class="chart-container">
            <Bar v-if="peakHoursChartData" :data="peakHoursChartData" :options="peakHoursChartOptions" />
          </div>
        </div>

        <!-- Top Companies -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">บริษัทที่ใช้บริการบ่อยที่สุด</h3>
          </div>
          <div class="chart-container">
            <Bar v-if="companiesChartData" :data="companiesChartData" :options="companiesChartOptions" />
          </div>
        </div>
      </div>

      <!-- Additional Stats -->
      <div class="additional-stats">
        <div class="stat-box">
          <div class="stat-box-icon" style="background: linear-gradient(135deg, #0090D3, #0B4F6C);">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="stat-box-content">
            <p class="stat-box-label">เวลาเฉลี่ยที่อยู่ในคลัง</p>
            <p class="stat-box-value">{{ additionalStats.averageTime }}</p>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-box-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="stat-box-content">
            <p class="stat-box-label">ประสิทธิภาพการทำงาน</p>
            <p class="stat-box-value">{{ additionalStats.efficiency }}</p>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-box-icon" style="background: linear-gradient(135deg, #0EA5E9, #0284C7);">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div class="stat-box-content">
            <p class="stat-box-label">จำนวนบริษัททั้งหมด</p>
            <p class="stat-box-value">{{ additionalStats.totalCompanies }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { Line, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { statisticsAPI } from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Period filter
const selectedPeriod = ref('week');
const periods = [
  { value: 'today', label: 'วันนี้' },
  { value: 'week', label: 'สัปดาห์นี้' },
  { value: 'month', label: 'เดือนนี้' },
  { value: 'year', label: 'ปีนี้' }
];

// Loading states
const loading = ref(false);

// Data refs
const overviewStats = ref([]);
const vehicleTypes = ref([]);
const peakHours = ref([]);
const topCompanies = ref([]);
const trafficTrend = ref({ labels: [], in: [], out: [] });
const additionalStats = ref({
  averageTime: '0 ชั่วโมง',
  efficiency: '0%',
  totalCompanies: '0 บริษัท'
});

// Chart Data - Traffic Trend
const trafficChartData = computed(() => {
  if (!trafficTrend.value || !trafficTrend.value.labels || !trafficTrend.value.labels.length) return null;

  return {
    labels: trafficTrend.value.labels,
    datasets: [
      {
        label: 'รถเข้า',
        data: trafficTrend.value.in,
        borderColor: '#0090D3',
        backgroundColor: 'rgba(0, 144, 211, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#0090D3',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#0090D3',
        pointHoverBorderColor: '#fff',
      },
      {
        label: 'รถออก',
        data: trafficTrend.value.out,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#10b981',
        pointHoverBorderColor: '#fff',
      }
    ]
  };
});

const trafficChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          family: 'Prompt',
          size: 13,
          weight: '600'
        },
        color: '#64748b'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      padding: 12,
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
      titleFont: {
        family: 'Prompt',
        size: 14,
        weight: '600'
      },
      bodyFont: {
        family: 'Prompt',
        size: 13
      },
      cornerRadius: 8,
      displayColors: true,
      usePointStyle: true
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Prompt',
          size: 12
        },
        color: '#64748b'
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(226, 232, 240, 0.5)',
        drawBorder: false
      },
      ticks: {
        font: {
          family: 'Prompt',
          size: 12
        },
        color: '#64748b',
        padding: 10
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
};

// Chart Data - Vehicle Types
const vehicleChartData = computed(() => {
  if (!vehicleTypes.value.length) return null;

  return {
    labels: vehicleTypes.value.map(v => v.type),
    datasets: [{
      label: 'จำนวนรถ',
      data: vehicleTypes.value.map(v => v.count),
      backgroundColor: [
        'rgba(0, 144, 211, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(32, 178, 170, 0.8)'
      ],
      borderColor: [
        '#0090D3',
        '#10b981',
        '#3B82F6',
        '#0EA5E9',
        '#20B2AA'
      ],
      borderWidth: 2,
      borderRadius: 8,
      barThickness: 50
    }]
  };
});

const vehicleChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      padding: 12,
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
      titleFont: {
        family: 'Prompt',
        size: 14,
        weight: '600'
      },
      bodyFont: {
        family: 'Prompt',
        size: 13
      },
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          return ' จำนวน: ' + context.parsed.y + ' คัน';
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Prompt',
          size: 12,
          weight: '600'
        },
        color: '#64748b'
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(226, 232, 240, 0.5)',
        drawBorder: false
      },
      ticks: {
        font: {
          family: 'Prompt',
          size: 12
        },
        color: '#64748b',
        padding: 10
      }
    }
  }
};

// Chart Data - Peak Hours
const peakHoursChartData = computed(() => {
  if (!peakHours.value.length) return null;

  return {
    labels: peakHours.value.map(h => h.time),
    datasets: [{
      label: 'ปริมาณการจราจร',
      data: peakHours.value.map(h => h.traffic),
      backgroundColor: peakHours.value.map(h => {
        if (h.traffic >= 90) return 'rgba(239, 68, 68, 0.8)';
        if (h.traffic >= 70) return 'rgba(245, 158, 11, 0.8)';
        if (h.traffic >= 50) return 'rgba(14, 165, 233, 0.8)';
        return 'rgba(59, 130, 246, 0.8)';
      }),
      borderColor: peakHours.value.map(h => {
        if (h.traffic >= 90) return '#ef4444';
        if (h.traffic >= 70) return '#f59e0b';
        if (h.traffic >= 50) return '#0EA5E9';
        return '#3B82F6';
      }),
      borderWidth: 2,
      borderRadius: 6,
      barThickness: 25
    }]
  };
});

const peakHoursChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      padding: 12,
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
      titleFont: {
        family: 'Prompt',
        size: 14,
        weight: '600'
      },
      bodyFont: {
        family: 'Prompt',
        size: 13
      },
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          return ' ปริมาณ: ' + context.parsed.x + '%';
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: 'rgba(226, 232, 240, 0.5)',
        drawBorder: false
      },
      ticks: {
        font: {
          family: 'Prompt',
          size: 11
        },
        color: '#64748b',
        callback: function(value) {
          return value + '%';
        }
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Prompt',
          size: 12,
          weight: '600'
        },
        color: '#64748b'
      }
    }
  }
};

// Chart Data - Top Companies
const companiesChartData = computed(() => {
  if (!topCompanies.value.length) return null;

  return {
    labels: topCompanies.value.map(c => c.name),
    datasets: [{
      label: 'จำนวนครั้ง',
      data: topCompanies.value.map(c => c.count),
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(148, 163, 184, 0.8)',
        'rgba(217, 119, 6, 0.8)',
        'rgba(0, 144, 211, 0.8)',
        'rgba(14, 165, 233, 0.8)'
      ],
      borderColor: [
        '#f59e0b',
        '#94a3b8',
        '#d97706',
        '#0090D3',
        '#0EA5E9'
      ],
      borderWidth: 2,
      borderRadius: 6,
      barThickness: 35
    }]
  };
});

const companiesChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      padding: 12,
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
      titleFont: {
        family: 'Prompt',
        size: 14,
        weight: '600'
      },
      bodyFont: {
        family: 'Prompt',
        size: 13
      },
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          return ' จำนวน: ' + context.parsed.x + ' ครั้ง';
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(226, 232, 240, 0.5)',
        drawBorder: false
      },
      ticks: {
        font: {
          family: 'Prompt',
          size: 11
        },
        color: '#64748b'
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Prompt',
          size: 12,
          weight: '600'
        },
        color: '#64748b'
      }
    }
  }
};

// Fetch all statistics
const fetchStatistics = async () => {
  loading.value = true;
  try {
    // Fetch all data in parallel
    const [overviewRes, vehicleTypesRes, peakHoursRes, topCompaniesRes, trafficTrendRes, additionalRes] = await Promise.all([
      statisticsAPI.getOverview(selectedPeriod.value),
      statisticsAPI.getVehicleTypes(selectedPeriod.value),
      statisticsAPI.getPeakHours(selectedPeriod.value),
      statisticsAPI.getTopCompanies(selectedPeriod.value, 5),
      statisticsAPI.getTrafficTrend(selectedPeriod.value),
      statisticsAPI.getAdditional(selectedPeriod.value)
    ]);

    overviewStats.value = overviewRes.data.data;
    vehicleTypes.value = vehicleTypesRes.data.data;
    peakHours.value = peakHoursRes.data.data;
    topCompanies.value = topCompaniesRes.data.data;
    trafficTrend.value = trafficTrendRes.data.data;
    additionalStats.value = additionalRes.data.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ');
  } finally {
    loading.value = false;
  }
};

// Watch period change
watch(selectedPeriod, () => {
  fetchStatistics();
});

// Load data on mount
onMounted(() => {
  fetchStatistics();
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
  margin-bottom: 1.875rem;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.page-title {
  font-size: 1.7rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0B4F6C 0%, #0090D3 50%, #20B2AA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  font-family: 'Prompt', sans-serif;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
}

/* Period Filter Buttons */
.filter-buttons {
  display: flex;
  gap: 0.375rem;
  background: white;
  padding: 0.25rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.period-btn {
  padding: 0.5rem 0.95rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  font-family: 'Prompt', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.period-btn.active {
  background: linear-gradient(135deg, #0090D3, #0B4F6C);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 144, 211, 0.3);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1.125rem;
  margin-bottom: 1.5rem;
}

.stat-card-modern {
  background: white;
  padding: 1.3rem;
  border-radius: 15px;
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  align-items: center;
  gap: 0.95rem;
  transition: all 0.3s ease;
}

.stat-card-modern:hover {
  transform: translateY(-4px);
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.15),
    0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrapper {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.66rem;
  color: #64748b;
  margin: 0 0 0.375rem 0;
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.375rem 0;
  font-family: 'Prompt', sans-serif;
  line-height: 1;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.66rem;
  font-weight: 600;
  font-family: 'Prompt', sans-serif;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.stat-change svg {
  width: 1rem;
  height: 1rem;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(410px, 1fr));
  gap: 1.125rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background: white;
  padding: 1.3rem;
  border-radius: 15px;
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.15),
    0 12px 20px -5px rgba(0, 0, 0, 0.08);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.125rem;
}

.chart-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  font-family: 'Prompt', sans-serif;
}

.chart-legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.chart-badge {
  padding: 0.28rem 0.66rem;
  background: linear-gradient(135deg, #0090D3, #0B4F6C);
  color: white;
  font-size: 0.56rem;
  font-weight: 600;
  border-radius: 9999px;
  font-family: 'Prompt', sans-serif;
}

.chart-container {
  height: 260px;
  width: 100%;
  padding: 0.75rem 0.375rem;
}

/* Additional Stats */
.additional-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(225px, 1fr));
  gap: 1.125rem;
}

.stat-box {
  background: white;
  padding: 1.3rem;
  border-radius: 15px;
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  align-items: center;
  gap: 0.95rem;
  transition: all 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-4px);
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.15),
    0 12px 20px -5px rgba(0, 0, 0, 0.08);
}

.stat-box-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.stat-box-content {
  flex: 1;
}

.stat-box-label {
  font-size: 0.66rem;
  color: #64748b;
  margin: 0 0 0.375rem 0;
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
}

.stat-box-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  font-family: 'Prompt', sans-serif;
  line-height: 1;
}

/* Responsive */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 350px;
  }
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .additional-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .filter-buttons {
    flex-wrap: wrap;
  }

  .period-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .page-header .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .chart-container {
    height: 300px;
  }

  .stat-card-modern {
    padding: 1.25rem;
  }

  .stat-icon-wrapper {
    width: 56px;
    height: 56px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .chart-card {
    padding: 1.25rem;
  }
}
</style>
