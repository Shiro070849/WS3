import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useFilterStore = defineStore('filters', () => {
  // ==================== STATE ====================
  const dateFrom = ref(null);
  const dateTo = ref(null);

  // ==================== COMPUTED ====================
  const hasActiveDateFilter = computed(() => {
    return !!(dateFrom.value || dateTo.value);
  });

  const dateFilterLabel = computed(() => {
    if (!dateFrom.value && !dateTo.value) {
      return 'ไม่ได้ตั้งวันที่';
    }
    if (dateFrom.value && dateTo.value) {
      return `${formatDateForDisplay(dateFrom.value)} ถึง ${formatDateForDisplay(dateTo.value)}`;
    }
    if (dateFrom.value) {
      return `ตั้งแต่ ${formatDateForDisplay(dateFrom.value)}`;
    }
    return `จนถึง ${formatDateForDisplay(dateTo.value)}`;
  });

  // ==================== ACTIONS ====================
  const setDateRange = (from, to) => {
    dateFrom.value = from;
    dateTo.value = to;
  };

  const setDateFrom = (date) => {
    dateFrom.value = date;
  };

  const setDateTo = (date) => {
    dateTo.value = date;
  };

  const clearDateRange = () => {
    dateFrom.value = null;
    dateTo.value = null;
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ==================== INITIALIZE FROM LOCALSTORAGE ====================
  const initializeFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('appFilters');
      if (saved) {
        const filters = JSON.parse(saved);
        dateFrom.value = filters.dateFrom || null;
        dateTo.value = filters.dateTo || null;
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
  };

  // ==================== PERSIST TO LOCALSTORAGE ====================
  const persistToLocalStorage = () => {
    try {
      localStorage.setItem('appFilters', JSON.stringify({
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
      }));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  };

  return {
    // State
    dateFrom,
    dateTo,

    // Computed
    hasActiveDateFilter,
    dateFilterLabel,

    // Actions
    setDateRange,
    setDateFrom,
    setDateTo,
    clearDateRange,
    initializeFromLocalStorage,
    persistToLocalStorage,
  };
});
