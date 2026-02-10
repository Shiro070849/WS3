<template>
  <div class="w-full max-w-full animate-fadeIn">
    <!-- Page Header - Tailwind Only -->
    <div class="mb-5">
      <div class="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 class="page-title text-[1.35rem]">สถิติ</h1>
          <p class="m-0 text-base font-medium text-slate-500 font-prompt">
            สถิติและการวิเคราะห์ข้อมูลคลังสินค้า
          </p>
        </div>
        <div class="flex flex-wrap items-end gap-2">
          <!-- Date Range (เหมือน Report/Vehicle) -->
          <DateRangeFilter
            :dateFrom="customDateFrom"
            :dateTo="customDateTo"
            @update:dateFrom="customDateFrom = $event"
            @update:dateTo="customDateTo = $event"
            @filter="onCustomDateFilter"
          />
          <!-- Period Filter Buttons (กดแล้วล้างช่วงวันที่กำหนดเอง จะใช้ period แทน) -->
          <div class="flex gap-1 bg-white p-0.5 rounded-lg shadow-sm">
            <button
              v-for="period in periods"
              :key="period.value"
              @click="onPeriodClick(period.value)"
              :class="selectedPeriod === period.value ? 'period-btn-active' : 'period-btn'"
              class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all font-prompt"
            >
              {{ period.label }}
            </button>
          </div>
          <!-- Company Filter (Super Admin only) -->
          <select
            v-if="!userCompanyId || userCompanyId === 'null'"
            v-model="selectedCompany"
            class="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt bg-white shadow-sm"
          >
            <option value="">บริษัททั้งหมด</option>
            <option
              v-for="company in companiesList"
              :key="company.IC_ID"
              :value="company.IC_ID"
            >
              {{ company.IC_LocalName }}
            </option>
          </select>
          <!-- Vehicle Type Filter -->
          <select
            v-model="selectedVehicleType"
            class="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt bg-white shadow-sm"
          >
            <option value="">ประเภทรถทั้งหมด</option>
            <option
              v-for="vType in vehicleTypesList"
              :key="vType.VType_ID"
              :value="vType.VType_LocalName"
            >
              {{ vType.VType_LocalName }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Content - Tailwind Layout -->
    <div class="w-full">
      <!-- Overview Stats Cards - Tailwind Grid -->
      <div class="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="stat in overviewStats" :key="stat.label" class="flex items-center gap-3 p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex items-center justify-center shadow-md w-11 h-11 rounded-xl" :style="{ background: stat.gradient }">
            <div class="stat-icon" v-html="stat.icon"></div>
          </div>
          <div class="flex-1">
            <p class="text-xs text-gray-500 mb-1 font-prompt font-medium">{{ stat.label }}</p>
            <p class="text-xl font-extrabold text-gray-900 mb-1 font-prompt leading-none">{{ stat.value }}</p>
            <div class="flex items-center gap-0.5 text-xs font-semibold font-prompt" :class="stat.trend === 'up' ? 'text-green-600' : 'text-red-500'">
              <svg v-if="stat.trend === 'up'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
              </svg>
              <span>{{ stat.change }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section - Tailwind Grid -->
      <div class="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
        <!-- Traffic Trend Chart -->
        <div class="p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md">
          <div class="flex items-center justify-between mb-3">
            <h3 class="m-0 text-base font-bold text-gray-900 font-prompt">แนวโน้มการเข้า-ออกรถ</h3>
          </div>
          <div class="w-full p-1.5" style="height: 240px;">
            <Line v-if="trafficChartData" :data="trafficChartData" :options="trafficChartOptions" />
          </div>
        </div>

        <!-- Vehicle Types Chart -->
        <div class="p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md">
          <div class="flex items-center justify-between mb-3">
            <h3 class="m-0 text-base font-bold text-gray-900 font-prompt">ประเภทรถที่เข้าใช้บริการ</h3>
          </div>
          <div class="w-full p-1.5" style="height: 240px;">
            <Bar v-if="vehicleChartData" :data="vehicleChartData" :options="vehicleChartOptions" />
          </div>
        </div>

        <!-- Peak Hours Chart -->
        <div class="p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h3 class="m-0 text-base font-bold text-gray-900 font-prompt">ช่วงเวลาเร่งด่วน</h3>
              <p class="m-0 mt-0.5 text-xs text-slate-500 font-prompt">
                {{ peakHoursHasData ? 'แสดงช่วงเวลาที่หนาแน่นที่สุด (เรียงตามปริมาณ)' : 'ไม่มีข้อมูลการเข้าในช่วงเวลาที่เลือก' }}
              </p>
            </div>
            <span class="chart-badge">{{ peakHoursHasData ? 'Top 10' : '0 ครั้ง' }}</span>
          </div>
          <div v-if="!peakHoursHasData" class="flex flex-col items-center justify-center w-full py-8 text-center rounded-lg bg-slate-50" style="height: 280px;">
            <p class="text-sm font-medium text-slate-600 font-prompt">ยังไม่มีข้อมูลการเข้ายานพาหนะในช่วงเวลานี้</p>
            <p class="mt-1 text-xs text-slate-500 font-prompt">ลองเปลี่ยนช่วงเวลา (วันนี้/สัปดาห์นี้/เดือนนี้/ปีนี้) หรือบริษัท/ประเภทรถ</p>
          </div>
          <div v-else class="w-full p-1.5" style="height: 280px;">
            <Bar v-if="peakHoursChartData" :data="peakHoursChartData" :options="peakHoursChartOptions" />
          </div>
        </div>

        <!-- Top Companies -->
        <div class="p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md">
          <div class="flex items-center justify-between mb-3">
            <h3 class="m-0 text-base font-bold text-gray-900 font-prompt">บริษัทที่ใช้บริการบ่อยที่สุด</h3>
          </div>
          <div class="w-full p-1.5" style="height: 240px;">
            <Bar v-if="companiesChartData" :data="companiesChartData" :options="companiesChartOptions" />
          </div>
        </div>
      </div>

      <!-- Entry Locations Chart - แสดงสถิติการเข้าแยกตาม Location -->
      <div class="grid grid-cols-1 gap-4 mb-4">
        <div class="p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="m-0 text-base font-bold text-gray-900 font-prompt">สถิติการเข้าแยกตามจุดเข้า-ออก</h3>
              <p class="m-0 mt-0.5 text-xs text-slate-500 font-prompt">
                {{ entryLocationsHasData ? 'แสดงจำนวนรถที่เข้าแต่ละจุด (ประตู)' : 'ไม่มีข้อมูลการเข้าในช่วงเวลาที่เลือก' }}
              </p>
            </div>
            <span v-if="entryLocationsHasData" class="chart-badge">{{ entryLocations.length }} จุด</span>
          </div>
          <div v-if="!entryLocationsHasData" class="flex flex-col items-center justify-center w-full py-8 text-center rounded-lg bg-slate-50" style="height: 280px;">
            <p class="text-sm font-medium text-slate-600 font-prompt">ยังไม่มีข้อมูลการเข้ายานพาหนะในช่วงเวลานี้</p>
            <p class="mt-1 text-xs text-slate-500 font-prompt">ลองเปลี่ยนช่วงเวลา (วันนี้/สัปดาห์นี้/เดือนนี้/ปีนี้) หรือบริษัท/ประเภทรถ</p>
          </div>
          <div v-else>
            <!-- Chart -->
            <div class="w-full p-1.5" style="height: 320px;">
              <Bar v-if="entryLocationsChartData" :data="entryLocationsChartData" :options="entryLocationsChartOptions" />
            </div>

            <!-- Summary Blocks -->
            <div class="mt-2 pt-2 border-t border-gray-100">
              <h4 class="mb-1.5 text-[0.65rem] font-semibold text-gray-500 font-prompt">สรุปรายละเอียด</h4>
              <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
                <div
                  v-for="(location, index) in entryLocations"
                  :key="index"
                  class="relative overflow-hidden transition-all duration-200 border rounded-md hover:shadow-sm"
                  :style="{ borderColor: location.color, borderWidth: '1px' }"
                >
                  <div class="p-2 bg-white">
                    <div class="flex items-center gap-1 mb-0.5">
                      <div class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ backgroundColor: location.color }"></div>
                      <span class="text-[0.55rem] font-semibold text-gray-500 font-prompt uppercase tracking-wide truncate">
                        {{ location.locationName }}
                      </span>
                    </div>
                    <div class="text-lg font-bold text-gray-900 font-prompt leading-none">
                      {{ location.count.toLocaleString() }}
                    </div>
                    <div class="text-[0.55rem] text-gray-400 font-prompt">คัน</div>
                  </div>
                  <!-- Accent bar at bottom -->
                  <div class="h-0.5" :style="{ backgroundColor: location.color }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Stats - Tailwind Grid -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="flex items-center gap-3 p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:-translate-y-0.5 hover:shadow-md">
          <div class="stat-box-icon-blue">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-xs text-gray-500 mb-1 font-prompt font-medium">เวลาเฉลี่ยที่อยู่ในคลัง</p>
            <p class="m-0 text-xl font-extrabold leading-none text-gray-900 font-prompt">{{ additionalStats.averageTime }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:-translate-y-0.5 hover:shadow-md">
          <div class="stat-box-icon-green">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-xs text-gray-500 mb-1 font-prompt font-medium">ประสิทธิภาพการทำงาน</p>
            <p class="m-0 text-xl font-extrabold leading-none text-gray-900 font-prompt">{{ additionalStats.efficiency }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:-translate-y-0.5 hover:shadow-md">
          <div class="stat-box-icon-sky">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-xs text-gray-500 mb-1 font-prompt font-medium">จำนวนบริษัททั้งหมด</p>
            <p class="m-0 text-xl font-extrabold leading-none text-gray-900 font-prompt">{{ additionalStats.totalCompanies }}</p>
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
import { statisticsAPI, vehicleTypesAPI, companiesAPI } from '../services/api';
import DateRangeFilter from '../components/DateRangeFilter.vue';

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

// ช่วงวันที่กำหนดเอง (เฉพาะหน้านี้ ไม่ใช้ filterStore เพื่อไม่ทับหน้าอื่น)
const customDateFrom = ref('');
const customDateTo = ref('');

// Period filter
const selectedPeriod = ref('week');
const periods = [
  { value: 'today', label: 'วันนี้' },
  { value: 'week', label: 'สัปดาห์นี้' },
  { value: 'month', label: 'เดือนนี้' },
  { value: 'year', label: 'ปีนี้' }
];

// Vehicle type filter
const selectedVehicleType = ref('');
const vehicleTypesList = ref([]);

// Company filter
const selectedCompany = ref('');
const companiesList = ref([]);

// Extract user info from localStorage (ถ้าไม่มีหรือ invalid จะได้ null แทน NaN)
const _userIdRaw = localStorage.getItem('userId');
const userId = (_userIdRaw && _userIdRaw !== 'null' && _userIdRaw !== '') ? (parseInt(_userIdRaw) || null) : null;
const userCompanyId = localStorage.getItem('companyId');

// Loading states
const loading = ref(false);

// Data refs
const overviewStats = ref([]);
const vehicleTypes = ref([]);
const peakHours = ref([]);
const topCompanies = ref([]);
const trafficTrend = ref({ labels: [], in: [], out: [] });
const entryLocations = ref([]);
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
      barPercentage: 0.75,
      categoryPercentage: 0.9
    }]
  };
});

const vehicleChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 8, bottom: 8, left: 8, right: 8 }
  },
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
  },
  datasets: {
    bar: {
      barPercentage: 0.75,
      categoryPercentage: 0.9
    }
  }
};

// Chart Data - Peak Hours (แสดง Top 10 ช่วงเวลาที่มีกิจกรรมมากที่สุด จาก 24 ชม. ที่ backend ส่งมาเสมอ)
const peakHoursChartData = computed(() => {
  if (!peakHours.value.length) return null;
  // เรียงตามจำนวนจริง (count) มากไปน้อย แล้วเอา top 10 เพื่อให้รู้ว่า "เลียกมาตอนช่วงไหน"
  const sorted = [...peakHours.value].sort((a, b) => (b.count || 0) - (a.count || 0));
  const items = sorted.slice(0, 10);

  return {
    labels: items.map(h => h.time),
    datasets: [{
      label: 'ปริมาณการจราจร',
      data: items.map(h => h.traffic),
      backgroundColor: items.map(h => {
        if ((h.count || 0) === 0) return 'rgba(203, 213, 225, 0.6)';
        if (h.traffic >= 90) return 'rgba(239, 68, 68, 0.8)';
        if (h.traffic >= 70) return 'rgba(245, 158, 11, 0.8)';
        if (h.traffic >= 50) return 'rgba(14, 165, 233, 0.8)';
        return 'rgba(59, 130, 246, 0.8)';
      }),
      borderColor: items.map(h => {
        if ((h.count || 0) === 0) return 'rgba(148, 163, 184, 0.5)';
        if (h.traffic >= 90) return '#ef4444';
        if (h.traffic >= 70) return '#f59e0b';
        if (h.traffic >= 50) return '#0EA5E9';
        return '#3B82F6';
      }),
      borderWidth: 2,
      borderRadius: 6,
      barPercentage: 0.8,
      categoryPercentage: 0.85
    }]
  };
});

const peakHoursHasData = computed(() => peakHours.value.some(h => (h.count || 0) > 0));

// Check if entry locations has data
const entryLocationsHasData = computed(() => entryLocations.value.length > 0);

const peakHoursChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 10, bottom: 10, left: 8, right: 12 }
  },
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
          const raw = peakHours.value.find(h => h.time === context.label);
          const count = raw?.count ?? 0;
          return ' ปริมาณ: ' + context.parsed.x + '%' + (count > 0 ? ' (' + count + ' ครั้ง)' : '');
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
          size: 13,
          weight: '600'
        },
        color: '#475569',
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
        padding: 12
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
      barPercentage: 0.75,
      categoryPercentage: 0.9
    }]
  };
});

const companiesChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 8, bottom: 8, left: 4, right: 8 }
  },
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
        color: '#64748b',
        autoSkip: false
      }
    }
  },
  datasets: {
    bar: {
      barPercentage: 0.75,
      categoryPercentage: 0.9
    }
  }
};

// Chart Data - Entry Locations
const entryLocationsChartData = computed(() => {
  if (!entryLocations.value.length) return null;

  return {
    labels: entryLocations.value.map(loc => loc.locationName),
    datasets: [{
      label: 'จำนวนรถ',
      data: entryLocations.value.map(loc => loc.count),
      backgroundColor: entryLocations.value.map(loc => loc.color),
      borderColor: entryLocations.value.map(loc => loc.color.replace('0.8', '1')),
      borderWidth: 2,
      borderRadius: 6,
      barPercentage: 0.75,
      categoryPercentage: 0.9
    }]
  };
});

const entryLocationsChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 10, bottom: 10, left: 8, right: 12 }
  },
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
          return ` จำนวน: ${context.parsed.x} คัน`;
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
          size: 13,
          weight: '600'
        },
        color: '#475569',
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
        padding: 12
      }
    }
  }
};

// Fetch vehicle types for dropdown
const fetchVehicleTypes = async () => {
  try {
    const response = await vehicleTypesAPI.getAll(true);
    vehicleTypesList.value = response.data.data;
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
  }
};

// Fetch companies for dropdown
const fetchCompanies = async () => {
  try {
    const userId = localStorage.getItem('userId');

    // ใช้ getAccessible แทน getAll เพื่อไม่ต้องการ SETTINGS permission
    const response = await companiesAPI.getAccessible(userId);

    // Backend กรอง IC_IsActive = 1 ให้แล้ว ไม่ต้อง filter ซ้ำ
    let filteredCompanies = response.data.data || [];

    // If sub-admin, show only their own company
    const isSuperAdmin = !userCompanyId || userCompanyId === 'null';
    if (!isSuperAdmin) {
      filteredCompanies = filteredCompanies.filter(c => c.IC_ID.toString() === userCompanyId.toString());
    }

    companiesList.value = filteredCompanies;

    // Auto-select first company for Super Admin (if not already selected)
    if (isSuperAdmin && filteredCompanies.length > 0 && !selectedCompany.value) {
      selectedCompany.value = filteredCompanies[0].IC_ID;
    }
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
};

// เลือกช่วงวันที่กำหนดเอง แล้วดึงข้อมูล
const onCustomDateFilter = ({ dateFrom, dateTo }) => {
  customDateFrom.value = dateFrom || '';
  customDateTo.value = dateTo || '';
  fetchStatistics();
};

// กดปุ่ม period จะล้างช่วงวันที่กำหนดเอง แล้วดึงข้อมูลตาม period
const onPeriodClick = (period) => {
  selectedPeriod.value = period;
  customDateFrom.value = '';
  customDateTo.value = '';
  fetchStatistics();
};

// Fetch all statistics (ใช้ customDateFrom/customDateTo ถ้ามี ไม่ก็ใช้ period)
const fetchStatistics = async () => {
  loading.value = true;
  try {
    const companyIdParam = userCompanyId && userCompanyId !== 'null' ? userCompanyId : (selectedCompany.value || null);
    const dateFrom = customDateFrom.value || undefined;
    const dateTo = customDateTo.value || undefined;

    const [overviewRes, vehicleTypesRes, peakHoursRes, topCompaniesRes, trafficTrendRes, additionalRes, entryLocationsRes] = await Promise.all([
      statisticsAPI.getOverview(selectedPeriod.value, userId, companyIdParam, dateFrom, dateTo, selectedVehicleType.value || null),
      statisticsAPI.getVehicleTypes(selectedPeriod.value, userId, companyIdParam, dateFrom, dateTo, selectedVehicleType.value || null),
      statisticsAPI.getPeakHours(selectedPeriod.value, userId, companyIdParam, dateFrom, dateTo, selectedVehicleType.value || null),
      statisticsAPI.getTopCompanies(selectedPeriod.value, 5, userId, companyIdParam, dateFrom, dateTo, selectedVehicleType.value || null),
      statisticsAPI.getTrafficTrend(selectedPeriod.value, userId, companyIdParam, dateFrom, dateTo, selectedVehicleType.value || null),
      statisticsAPI.getAdditional(selectedPeriod.value, userId, companyIdParam, dateFrom, dateTo, selectedVehicleType.value || null),
      statisticsAPI.getEntryLocations(selectedPeriod.value, userId, companyIdParam, dateFrom, dateTo, selectedVehicleType.value || null)
    ]);

    // Sync ช่วงวันที่จาก backend เฉพาะกรณีที่ไม่ได้เลือก custom เอง
    const backendRange = overviewRes.data.range;
    if (backendRange && !customDateFrom.value && !customDateTo.value) {
      customDateFrom.value = backendRange.startDate || '';
      customDateTo.value = backendRange.endDate || '';
    }

    overviewStats.value = overviewRes.data.data ?? [];
    vehicleTypes.value = vehicleTypesRes.data.data ?? [];
    peakHours.value = peakHoursRes.data.data ?? [];
    topCompanies.value = topCompaniesRes.data.data ?? [];
    trafficTrend.value = trafficTrendRes.data.data ?? { labels: [], in: [], out: [] };
    additionalStats.value = additionalRes.data.data ?? { averageTime: '0 ชั่วโมง', efficiency: '0%', totalCompanies: '0 บริษัท' };
    entryLocations.value = entryLocationsRes.data.data ?? [];
  } catch (error) {
    console.error('Error fetching statistics:', error);
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ');
  } finally {
    loading.value = false;
  }
};

// Watch period change (เมื่อเปลี่ยน period จากที่อื่น เช่น dropdown - แต่ปกติใช้ onPeriodClick)
watch(selectedPeriod, () => {
  if (!customDateFrom.value && !customDateTo.value) fetchStatistics();
});

// Watch vehicle type change
watch(selectedVehicleType, () => {
  fetchStatistics();
});

// Watch company change - with deep watch to catch all changes
watch(() => selectedCompany.value, () => {
  fetchStatistics();
}, { immediate: false });

// Load data on mount
onMounted(async () => {
  fetchVehicleTypes();
  await fetchCompanies();
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

/* 2. Page Title - moved to theme-variables.css for theming support */

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
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 9999px;
  font-family: 'Prompt', sans-serif;
  background: linear-gradient(135deg, #0090D3, #0B4F6C);
  color: white;
}

/* 5. Additional Stats Icon Gradients */
.stat-box-icon-blue {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 12px -3px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #0090D3, #0B4F6C);
}

.stat-box-icon-green {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 12px -3px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-box-icon-sky {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 12px -3px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #0EA5E9, #0284C7);
}
</style>
