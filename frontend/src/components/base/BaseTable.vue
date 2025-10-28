<template>
  <div class="w-full overflow-x-auto modern-table-container">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="table-header">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            {{ column.label }}
          </th>
          <th v-if="$slots.actions" scope="col" class="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
            การจัดการ
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-slate-100">
        <tr v-if="loading" class="loading-row">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-12 text-center text-slate-500">
            <div class="flex items-center justify-center">
              <svg class="animate-spin h-6 w-6 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="font-medium">กำลังโหลดข้อมูล...</span>
            </div>
          </td>
        </tr>
        <tr v-else-if="!data || data.length === 0" class="empty-row">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-12 text-center text-slate-400">
            <div class="flex flex-col items-center">
              <svg class="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <span class="font-medium">ไม่พบข้อมูล</span>
            </div>
          </td>
        </tr>
        <tr v-else v-for="(row, index) in data" :key="index" class="table-row">
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-6 py-4 whitespace-nowrap text-sm text-slate-900"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.modern-table-container {
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  background: linear-gradient(135deg,
    rgba(241, 245, 249, 1) 0%,
    rgba(248, 250, 252, 1) 100%
  );
  border-bottom: 2px solid rgba(148, 163, 184, 0.2);
}

.table-header th {
  font-family: 'Prompt', sans-serif;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
}

.table-row {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.table-row:hover {
  background: linear-gradient(90deg,
    rgba(219, 234, 254, 0.3) 0%,
    rgba(191, 219, 254, 0.15) 100%
  );
  transform: translateX(2px);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row td {
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
}

.loading-row td,
.empty-row td {
  background: rgba(248, 250, 252, 0.5);
}

/* Scrollbar */
.modern-table-container::-webkit-scrollbar {
  height: 8px;
}

.modern-table-container::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.5);
  border-radius: 4px;
}

.modern-table-container::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 4px;
  transition: background 0.2s;
}

.modern-table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.6);
}
</style>
