<template>
  <div class="date-filter-container">
    <!-- Custom Date Range -->
    <div class="custom-date-range">
      <!-- Start Date -->
      <div class="date-input-group">
        <label for="dateFrom">วันที่เริ่มต้น</label>
        <div class="date-input-wrapper">
          <input
            type="text"
            class="date-input"
            :value="displayDateFrom"
            placeholder="DD/MM/YYYY"
            readonly
            @click="toggleCalendar('from')"
          />
          <button class="calendar-icon-btn" @click="toggleCalendar('from')" aria-label="Select start date">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <polyline points="16 2 16 6 8 6 8 2"></polyline>
              <polyline points="3 10 21 10"></polyline>
            </svg>
          </button>
          <!-- Calendar Popup From -->
          <div v-if="activeCalendar === 'from'" class="calendar-popup">
            <Calendar v-model="localDateFrom" @update:modelValue="selectDateFrom" />
          </div>
        </div>
      </div>

      <div class="date-separator">-</div>

      <!-- End Date -->
      <div class="date-input-group">
        <label for="dateTo">วันที่สิ้นสุด</label>
        <div class="date-input-wrapper">
          <input
            type="text"
            class="date-input"
            :value="displayDateTo"
            placeholder="DD/MM/YYYY"
            readonly
            @click="toggleCalendar('to')"
          />
          <button class="calendar-icon-btn" @click="toggleCalendar('to')" aria-label="Select end date">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <polyline points="16 2 16 6 8 6 8 2"></polyline>
              <polyline points="3 10 21 10"></polyline>
            </svg>
          </button>
          <!-- Calendar Popup To -->
          <div v-if="activeCalendar === 'to'" class="calendar-popup">
            <Calendar v-model="localDateTo" @update:modelValue="selectDateTo" />
          </div>
        </div>
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
import { ref, watch, computed } from 'vue'
import Calendar from './Calendar.vue'

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

const localDateFrom = ref(props.dateFrom || '')
const localDateTo = ref(props.dateTo || '')
const activeCalendar = ref(null)

// Format date from YYYY-MM-DD to DD/MM/YYYY
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

// Computed properties for display
const displayDateFrom = computed(() => formatDisplayDate(localDateFrom.value))
const displayDateTo = computed(() => formatDisplayDate(localDateTo.value))

// Toggle calendar popup
const toggleCalendar = (type) => {
  activeCalendar.value = activeCalendar.value === type ? null : type
}

// Handle date selection
const selectDateFrom = (date) => {
  localDateFrom.value = date
  activeCalendar.value = null
}

const selectDateTo = (date) => {
  localDateTo.value = date
  activeCalendar.value = null
}

const applyCustomDate = () => {
  const dateFrom = localDateFrom.value || null
  const dateTo = localDateTo.value || null

  emit('update:dateFrom', dateFrom)
  emit('update:dateTo', dateTo)
  emit('filter', { dateFrom, dateTo })
  activeCalendar.value = null
}

// Watch for prop changes
watch(() => [props.dateFrom, props.dateTo], ([newFrom, newTo]) => {
  localDateFrom.value = newFrom || ''
  localDateTo.value = newTo || ''
})

// Close calendar when clicking outside
const closeCalendar = () => {
  activeCalendar.value = null
}
</script>

<style scoped>
.date-filter-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  margin-bottom: 0;
}

.custom-date-range {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.date-input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
  position: relative;
}

.date-input-group label {
  font-size: 0.7rem;
  font-weight: 600;
  font-family: 'Prompt', sans-serif;
  color: #475569;
  white-space: nowrap;
  flex-shrink: 0;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input {
  padding: 0.375rem 0.75rem 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-family: 'Prompt', sans-serif;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;
  min-width: 110px;
  cursor: pointer;
}

.date-input:hover {
  border-color: #cbd5e1;
}

.date-input:focus {
  outline: none;
  border-color: #0090D3;
  box-shadow: 0 0 0 3px rgba(0, 144, 211, 0.1);
}

.calendar-icon-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #0090D3;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.calendar-icon-btn:hover {
  color: #0078b7;
  transform: translateY(-50%) scale(1.05);
}

.calendar-icon-btn .icon {
  width: 14px;
  height: 14px;
}

.calendar-popup {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  background: white;
  border: 1px solid #cbd5e1;
  animation: popupSlideDown 0.2s ease-out;
}

@keyframes popupSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.date-separator {
  font-size: 0.9rem;
  font-weight: 600;
  color: #cbd5e1;
  padding-bottom: 0;
}

.apply-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.375rem 0.6rem;
  font-size: 0.6rem;
  font-weight: 600;
  font-family: 'Prompt', sans-serif;
  color: white;
  background: linear-gradient(135deg, #0090D3 0%, #0078b7 100%);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 144, 211, 0.15);
  white-space: nowrap;
  flex-shrink: 0;
  height: auto;
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 144, 211, 0.4);
}

.apply-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .date-filter-container {
    padding: 1rem;
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

  .calendar-popup {
    position: fixed;
    left: 12px;
    right: 12px;
    top: auto;
    bottom: 0;
    margin-top: 0;
    border-radius: 12px 12px 0 0;
    max-height: 80vh;
    overflow-y: auto;
  }
}
</style>
