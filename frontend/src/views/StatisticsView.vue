<template>
  <div class="w-full max-w-full animate-fadeIn">
    <!-- Page Header - Tailwind Only -->
    <div class="mb-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="page-title">สถิติ</h1>
          <p class="text-lg text-slate-500 m-0 font-prompt font-medium">
            สถิติและการวิเคราะห์ข้อมูลคลังสินค้า
          </p>
        </div>
        <!-- Period Filter Buttons - Tailwind Only -->
        <div class="flex gap-1.5 bg-white p-1 rounded-xl shadow-sm">
          <button
            v-for="period in periods"
            :key="period.value"
            @click="selectedPeriod = period.value"
            :class="selectedPeriod === period.value ? 'period-btn-active' : 'period-btn'"
            class="px-4 py-2 rounded-lg text-sm font-semibold font-prompt transition-all"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content - Tailwind Layout -->
    <div class="w-full">
      <!-- Overview Stats Cards - Tailwind Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div v-for="stat in overviewStats" :key="stat.label" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" :style="{ background: stat.gradient }">
            <div class="stat-icon" v-html="stat.icon"></div>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-500 mb-1.5 font-prompt font-medium">{{ stat.label }}</p>
            <p class="text-2xl font-extrabold text-gray-900 mb-1.5 font-prompt leading-none">{{ stat.value }}</p>
            <div class="flex items-center gap-1 text-sm font-semibold font-prompt" :class="stat.trend === 'up' ? 'text-green-600' : 'text-red-500'">
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

      <!-- Charts Section - Tailwind Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <!-- Traffic Trend Chart -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-gray-900 m-0 font-prompt">แนวโน้มการเข้า-ออกรถ</h3>
          </div>
          <div class="h-64 w-full p-2">
            <Line v-if="trafficChartData" :data="trafficChartData" :options="trafficChartOptions" />
          </div>
        </div>

        <!-- Vehicle Types Chart -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-gray-900 m-0 font-prompt">ประเภทรถที่เข้าใช้บริการ</h3>
          </div>
          <div class="h-64 w-full p-2">
            <Bar v-if="vehicleChartData" :data="vehicleChartData" :options="vehicleChartOptions" />
          </div>
        </div>

        <!-- Peak Hours Chart -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-gray-900 m-0 font-prompt">ช่วงเวลาเร่งด่วน</h3>
            <span class="chart-badge">24 ชั่วโมง</span>
          </div>
          <div class="h-64 w-full p-2">
            <Bar v-if="peakHoursChartData" :data="peakHoursChartData" :options="peakHoursChartOptions" />
          </div>
        </div>

        <!-- Top Companies -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-lg font-bold text-gray-900 m-0 font-prompt">บริษัทที่ใช้บริการบ่อยที่สุด</h3>
          </div>
          <div class="h-64 w-full p-2">
            <Bar v-if="companiesChartData" :data="companiesChartData" :options="companiesChartOptions" />
          </div>
        </div>
      </div>

      <!-- Additional Stats - Tailwind Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div class="stat-box-icon-blue">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-500 mb-1.5 font-prompt font-medium">เวลาเฉลี่ยที่อยู่ในคลัง</p>
            <p class="text-2xl font-extrabold text-gray-900 m-0 font-prompt leading-none">{{ additionalStats.averageTime }}</p>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div class="stat-box-icon-green">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-500 mb-1.5 font-prompt font-medium">ประสิทธิภาพการทำงาน</p>
            <p class="text-2xl font-extrabold text-gray-900 m-0 font-prompt leading-none">{{ additionalStats.efficiency }}</p>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <div class="stat-box-icon-sky">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-500 mb-1.5 font-prompt font-medium">จำนวนบริษัททั้งหมด</p>
            <p class="text-2xl font-extrabold text-gray-900 m-0 font-prompt leading-none">{{ additionalStats.totalCompanies }}</p>
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

/* 3. Period Button Styles */
.period-btn {
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}

.period-btn:hover {
  background: #eff6ff;
  color: #2563eb;
}

.period-btn-active {
  border: 0;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #0090D3, #0B4F6C);
  color: white;
}

/* 4. Chart Badge Gradient */
.chart-badge {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  font-family: 'Prompt', sans-serif;
  background: linear-gradient(135deg, #0090D3, #0B4F6C);
  color: white;
}

/* 5. Additional Stats Icon Gradients */
.stat-box-icon-blue {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #0090D3, #0B4F6C);
}

.stat-box-icon-green {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-box-icon-sky {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #0EA5E9, #0284C7);
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }
}
</style>
