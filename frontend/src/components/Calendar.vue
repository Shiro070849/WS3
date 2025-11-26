<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="calendar-wrapper">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <button class="nav-button prev-btn" @click="previousMonth" aria-label="Previous month">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="month-year">
        <h2>{{ monthYearDisplay }}</h2>
      </div>

      <button class="nav-button next-btn" @click="nextMonth" aria-label="Next month">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Day Headers -->
    <div class="day-headers">
      <div v-for="day in dayNames" :key="day" class="day-header">
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <button
        v-for="day in calendarDays"
        :key="`${day.date}-${day.isCurrentMonth}`"
        :class="[
          'day-cell',
          {
            'current-month': day.isCurrentMonth,
            'other-month': !day.isCurrentMonth,
            'is-today': day.isToday,
            'is-selected': day.isSelected,
            'disabled': !day.isCurrentMonth
          }
        ]"
        @click="selectDate(day)"
        :disabled="!day.isCurrentMonth"
      >
        <span class="day-number">{{ day.day }}</span>
        <span v-if="day.isToday" class="today-dot"></span>
      </button>
    </div>

    <!-- Footer Actions -->
    <div class="calendar-footer">
      <button class="footer-btn clear-btn" @click="clearDate">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 4 21 4"></polyline>
          <path d="M19 4v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4m3 0V2h8v2M10 11v6M14 11v6"></path>
        </svg>
        Clear
      </button>
      <button class="footer-btn today-btn" @click="selectToday">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"></circle>
          <path d="M12 1v6m0 6v6"></path>
          <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24"></path>
          <path d="M1 12h6m6 0h6"></path>
          <path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
        </svg>
        Today
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: null // Format: YYYY-MM-DD
  }
})

const emit = defineEmits(['update:modelValue'])

// State
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

// Day names
const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Month names for display
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Format: "November 2025"
const monthYearDisplay = computed(() => {
  return `${monthNames[currentMonth.value]} ${currentYear.value}`
})

// Get days array for calendar grid
const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const totalCells = 42 // 6 rows × 7 days
  const today = new Date()
  const selectedDate = props.modelValue ? new Date(props.modelValue + 'T00:00:00') : null

  for (let i = 0; i < totalCells; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    const isCurrentMonth = date.getMonth() === currentMonth.value
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    const isSelected =
      selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()

    days.push({
      day: date.getDate(),
      date: formatDate(date),
      isCurrentMonth,
      isToday,
      isSelected
    })
  }

  return days
})

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Methods
const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (day) => {
  if (day.isCurrentMonth) {
    emit('update:modelValue', day.date)
  }
}

const selectToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayDate = `${year}-${month}-${day}`

  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()

  emit('update:modelValue', todayDate)
}

const clearDate = () => {
  emit('update:modelValue', null)
}
</script>

<style scoped>
.calendar-wrapper {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 2px solid #e2e8f0;
  width: 100%;
  max-width: 350px;
  font-family: 'Prompt', sans-serif;
}

/* Header */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.nav-button {
  background: #f0f8ff;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0090D3;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.nav-button:hover {
  background: #e0f0ff;
  transform: scale(1.05);
}

.nav-button:active {
  transform: scale(0.95);
}

.nav-button .icon {
  width: 20px;
  height: 20px;
}

.month-year {
  flex: 1;
  text-align: center;
}

.month-year h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0090D3;
  letter-spacing: 0.5px;
}

/* Day Headers */
.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.day-header {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  padding: 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-cell {
  aspect-ratio: 1;
  border: none;
  border-radius: 8px;
  background: white;
  color: #1a202c;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Prompt', sans-serif;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell:disabled {
  cursor: not-allowed;
}

/* Other month days */
.day-cell.other-month {
  color: #cbd5e1;
  background: transparent;
  cursor: not-allowed;
}

/* Current month days */
.day-cell.current-month {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.day-cell.current-month:hover:not(.disabled) {
  background: #e0f0ff;
  border-color: #0090D3;
  transform: scale(1.05);
}

/* Today */
.day-cell.is-today {
  background: linear-gradient(135deg, #0090D3 0%, #0078b7 100%);
  color: white;
  font-weight: 600;
  border: none;
}

.day-cell.is-today .today-dot {
  display: none;
}

.day-cell.is-today:hover {
  box-shadow: 0 4px 12px rgba(0, 144, 211, 0.4);
  transform: scale(1.08);
}

/* Selected Date */
.day-cell.is-selected {
  background: linear-gradient(135deg, #0090D3 0%, #0078b7 100%);
  color: white;
  font-weight: 600;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 144, 211, 0.3);
}

.day-cell.is-selected:hover {
  box-shadow: 0 4px 12px rgba(0, 144, 211, 0.4);
  transform: scale(1.08);
}

/* Today dot indicator */
.today-dot {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background: #0090D3;
  border-radius: 50%;
}

.day-number {
  position: relative;
  z-index: 1;
}

/* Footer Actions */
.calendar-footer {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #e2e8f0;
}

.footer-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: 'Prompt', sans-serif;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.footer-btn:hover {
  border-color: #0090D3;
  color: #0090D3;
  background: #f0f8ff;
}

.footer-btn .icon {
  width: 16px;
  height: 16px;
}

.clear-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fff5f5;
}

.today-btn:hover {
  border-color: #0090D3;
  color: #0090D3;
  background: #f0f8ff;
}

/* Responsive */
@media (max-width: 640px) {
  .calendar-wrapper {
    padding: 1rem;
    max-width: 100%;
  }

  .calendar-header {
    margin-bottom: 1rem;
  }

  .month-year h2 {
    font-size: 1.125rem;
  }

  .day-cell {
    font-size: 0.8rem;
  }

  .nav-button {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .calendar-wrapper {
    padding: 0.875rem;
  }

  .calendar-header {
    gap: 0.5rem;
    margin-bottom: 0.875rem;
  }

  .day-cell {
    font-size: 0.75rem;
    aspect-ratio: 1;
  }

  .day-header {
    font-size: 0.65rem;
    padding: 0.25rem 0;
  }
}
</style>
