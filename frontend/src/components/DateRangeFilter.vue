<template>
  <div class="date-filter-container">
    <!-- Quick Filter Buttons -->
    <div class="quick-filters">
      <button
        v-for="filter in quickFilters"
        :key="filter.value"
        :class="['quick-filter-btn', { active: activeFilter === filter.value }]"
        @click="applyQuickFilter(filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Custom Date Range -->
    <div class="custom-date-range">
      <div class="date-input-group">
        <label for="dateFrom">วันที่เริ่มต้น</label>
        <input
          id="dateFrom"
          v-model="localDateFrom"
          type="date"
          class="date-input"
          @change="onCustomDateChange"
        />
      </div>
      <div class="date-separator">-</div>
      <div class="date-input-group">
        <label for="dateTo">วันที่สิ้นสุด</label>
        <input
          id="dateTo"
          v-model="localDateTo"
          type="date"
          class="date-input"
          @change="onCustomDateChange"
        />
      </div>
      <button class="apply-btn" @click="applyCustomDate">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        ค้นหา
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  dateFrom: {
    type: String,
    default: null
  },
  dateTo: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:dateFrom', 'update:dateTo', 'filter'])

const activeFilter = ref('7days')
const localDateFrom = ref(props.dateFrom || '')
const localDateTo = ref(props.dateTo || '')

const quickFilters = [
  { label: 'วันนี้', value: 'today' },
  { label: 'เมื่อวาน', value: 'yesterday' },
  { label: '7 วันย้อนหลัง', value: '7days' },
  { label: '30 วันย้อนหลัง', value: '30days' },
  { label: 'เดือนนี้', value: 'thisMonth' },
  { label: 'ล้างค่า', value: 'clear' }
]

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const applyQuickFilter = (filterValue) => {
  activeFilter.value = filterValue
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let dateFrom = null
  let dateTo = null

  switch (filterValue) {
    case 'today': {
      dateFrom = formatDate(today)
      dateTo = formatDate(today)
      break
    }
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      dateFrom = formatDate(yesterday)
      dateTo = formatDate(yesterday)
      break
    }
    case '7days': {
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      dateFrom = formatDate(sevenDaysAgo)
      dateTo = formatDate(today)
      break
    }
    case '30days': {
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
      dateFrom = formatDate(thirtyDaysAgo)
      dateTo = formatDate(today)
      break
    }
    case 'thisMonth': {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      dateFrom = formatDate(firstDayOfMonth)
      dateTo = formatDate(today)
      break
    }
    case 'clear': {
      dateFrom = null
      dateTo = null
      break
    }
  }

  localDateFrom.value = dateFrom || ''
  localDateTo.value = dateTo || ''

  emit('update:dateFrom', dateFrom)
  emit('update:dateTo', dateTo)
  emit('filter', { dateFrom, dateTo })
}

const onCustomDateChange = () => {
  activeFilter.value = null
}

const applyCustomDate = () => {
  const dateFrom = localDateFrom.value || null
  const dateTo = localDateTo.value || null

  emit('update:dateFrom', dateFrom)
  emit('update:dateTo', dateTo)
  emit('filter', { dateFrom, dateTo })
}

// Initialize with 7 days default
const initializeDefault = () => {
  if (!props.dateFrom && !props.dateTo) {
    applyQuickFilter('7days')
  }
}

// Watch for prop changes
watch(() => [props.dateFrom, props.dateTo], ([newFrom, newTo]) => {
  localDateFrom.value = newFrom || ''
  localDateTo.value = newTo || ''
})

// Initialize on mount
initializeDefault()
</script>

<style scoped>
.date-filter-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.quick-filter-btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Prompt', sans-serif;
  color: #475569;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-filter-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.quick-filter-btn.active {
  background: linear-gradient(135deg, #0B4F6C 0%, #0090D3 100%);
  color: white;
  border-color: #0B4F6C;
  box-shadow: 0 4px 12px rgba(11, 79, 108, 0.3);
}

.custom-date-range {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Prompt', sans-serif;
  color: #475569;
}

.date-input {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-family: 'Prompt', sans-serif;
  color: #1e293b;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 160px;
}

.date-input:hover {
  border-color: #cbd5e1;
}

.date-input:focus {
  outline: none;
  border-color: #0B4F6C;
  box-shadow: 0 0 0 3px rgba(11, 79, 108, 0.1);
}

.date-separator {
  font-size: 1.25rem;
  font-weight: 600;
  color: #94a3b8;
  padding-bottom: 0.625rem;
}

.apply-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Prompt', sans-serif;
  color: white;
  background: linear-gradient(135deg, #0B4F6C 0%, #0090D3 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(11, 79, 108, 0.3);
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(11, 79, 108, 0.4);
}

.apply-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .date-filter-container {
    padding: 1rem;
  }

  .quick-filters {
    gap: 0.5rem;
  }

  .quick-filter-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
  }

  .custom-date-range {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .date-input {
    min-width: 100%;
  }

  .date-separator {
    display: none;
  }

  .apply-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
