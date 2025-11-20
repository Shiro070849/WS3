<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] backdrop-blur-sm" @click.self="close">
        <div class="browser-modal" @click.stop>
          <!-- Browser Tabs Header -->
          <div class="tabs-head">
            <div class="tabs">
              <div class="tab-open">
                <span>ส่งออกรายงาน</span>
                <button @click="close" class="close-tab">✕</button>
              </div>
            </div>
            <div class="window-opt">
              <button>−</button>
              <button>□</button>
              <button @click="close" class="window-close">✕</button>
            </div>
          </div>

          <!-- Browser URL Bar -->
          <div class="head-browser">
            <button disabled>←</button>
            <button disabled>→</button>
            <div class="url-bar">
              <span class="url-text">report/export</span>
              <button class="star">★</button>
            </div>
            <button>⋮</button>
          </div>

          <!-- Content Area -->
          <div class="browser-content">
          <!-- รูปแบบไฟล์ -->
          <div class="mb-3">
            <label class="block text-sm font-semibold text-gray-700 mb-2 font-prompt">รูปแบบไฟล์</label>
            <div class="flex gap-2">
              <label class="flex-1 border-2 rounded-lg p-3 cursor-pointer transition-all" :class="selectedFormat === 'excel' ? 'border-[#0090D3] bg-blue-50' : 'border-gray-300 hover:border-gray-400'">
                <input
                  type="radio"
                  value="excel"
                  v-model="selectedFormat"
                  class="sr-only"
                />
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-900 font-prompt">Excel</div>
                    <div class="text-xs text-gray-500 font-prompt">(.xlsx)</div>
                  </div>
                </div>
              </label>

              <label class="flex-1 border-2 rounded-lg p-3 cursor-pointer transition-all" :class="selectedFormat === 'pdf' ? 'border-[#0090D3] bg-blue-50' : 'border-gray-300 hover:border-gray-400'">
                <input
                  type="radio"
                  value="pdf"
                  v-model="selectedFormat"
                  class="sr-only"
                />
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-900 font-prompt">PDF</div>
                    <div class="text-xs text-gray-500 font-prompt">(.pdf)</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- ช่วงเวลา -->
          <div class="mb-3">
            <label class="block text-sm font-semibold text-gray-700 mb-2 font-prompt">ช่วงเวลา</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                type="date"
                v-model="exportFilters.startDate"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] font-prompt"
              />
              <input
                type="date"
                v-model="exportFilters.endDate"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] font-prompt"
              />
            </div>
          </div>

          <!-- บริษัท -->
          <div class="mb-3">
            <label class="block text-sm font-semibold text-gray-700 mb-2 font-prompt">บริษัท</label>
            <select v-model="exportFilters.companyId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] font-prompt bg-white">
              <option value="">ทั้งหมด</option>
              <option
                v-for="company in companies"
                :key="company.IC_ID"
                :value="company.IC_ID"
              >
                {{ company.IC_LocalName }}
              </option>
            </select>
          </div>

          <!-- ประเภทรถ -->
          <div class="mb-3">
            <label class="block text-sm font-semibold text-gray-700 mb-2 font-prompt">ประเภทรถ</label>
            <select v-model="exportFilters.vehicleType" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] font-prompt bg-white">
              <option value="">ทั้งหมด</option>
              <option
                v-for="vType in vehicleTypes"
                :key="vType.VType_ID"
                :value="vType.VType_LocalName"
              >
                {{ vType.VType_LocalName }}
              </option>
            </select>
          </div>

          <!-- สถานะ -->
          <div class="mb-3">
            <label class="block text-sm font-semibold text-gray-700 mb-2 font-prompt">สถานะ</label>
            <select v-model="exportFilters.status" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] font-prompt bg-white">
              <option value="">ทั้งหมด</option>
              <option value="in">เข้า</option>
              <option value="out">ออก</option>
            </select>
          </div>

          <!-- ตัวเลือกเพิ่มเติม -->
          <div class="mb-3">
            <label class="block text-sm font-semibold text-gray-700 mb-2 font-prompt">ตัวเลือกเพิ่มเติม</label>
            <div class="space-y-2">
              <label class="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="exportOptions.includeSubtotal"
                  class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
                />
                <span class="ml-2 text-sm text-gray-700 font-prompt">รวม Subtotal ตามบริษัท</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="exportOptions.showLogo"
                  class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
                />
                <span class="ml-2 text-sm text-gray-700 font-prompt">แสดง Logo บริษัท (เฉพาะ PDF)</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="exportOptions.includeSummary"
                  class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
                />
                <span class="ml-2 text-sm text-gray-700 font-prompt">แสดงสรุปยอดรวม</span>
              </label>
            </div>
          </div>

          <!-- สรุปข้อมูลที่จะส่งออก -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div class="flex items-center gap-2 mb-3 pb-2.5 border-b border-blue-200">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-base font-bold text-gray-900 font-prompt">ข้อมูลที่จะส่งออก</span>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-3 font-prompt">
              <div>
                <div class="text-gray-500 text-xs mb-1 leading-tight">รูปแบบ</div>
                <div class="font-semibold text-gray-900 text-base leading-tight">{{ selectedFormat === 'excel' ? 'Excel' : 'PDF' }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs mb-1 leading-tight">จำนวนรายการ</div>
                <div class="font-bold text-blue-600 text-base leading-tight">{{ totalRecords }} รายการ</div>
              </div>
              <div class="col-span-2">
                <div class="text-gray-500 text-xs mb-1 leading-tight">ช่วงเวลา</div>
                <div class="font-medium text-gray-900 text-base leading-tight">{{ formatDateRange }}</div>
              </div>
              <div class="col-span-2">
                <div class="text-gray-500 text-xs mb-1 leading-tight">บริษัท</div>
                <div class="font-medium text-gray-900 text-base leading-tight">{{ getCompanyName }}</div>
              </div>
            </div>
          </div>

            <!-- Footer Buttons -->
            <div class="flex justify-end gap-2 px-5 py-3 border-t bg-gray-50 -mx-6 -mb-6 mt-4">
              <button
                @click="close"
                class="px-5 py-2.5 text-base font-semibold border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:scale-95 transition-all font-prompt"
              >
                ยกเลิก
              </button>
              <button
                @click="handleExport"
                class="px-5 py-2.5 text-base font-semibold bg-[#0090D3] text-white rounded-lg hover:bg-[#007AB8] active:scale-95 transition-all shadow-md font-prompt flex items-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ส่งออกรายงาน
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Swal from 'sweetalert2';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentFilters: {
    type: Object,
    default: () => ({})
  },
  companies: {
    type: Array,
    default: () => []
  },
  vehicleTypes: {
    type: Array,
    default: () => []
  },
  totalRecords: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['close', 'export']);

const selectedFormat = ref('excel');
const exportFilters = ref({
  startDate: '',
  endDate: '',
  companyId: '',
  vehicleType: '',
  status: ''
});

const exportOptions = ref({
  includeSubtotal: true,
  showLogo: true,
  includeSummary: true
});

// Watch for currentFilters changes AND modal show
watch([() => props.currentFilters, () => props.show], ([newFilters, isShowing]) => {
  if (isShowing && newFilters) {
    // Sync ค่าจากหน้าหลักเมื่อเปิด modal
    exportFilters.value = { ...newFilters };
  }
}, { immediate: true });

const formatDateRange = computed(() => {
  if (!exportFilters.value.startDate || !exportFilters.value.endDate) {
    return 'ทั้งหมด';
  }
  return `${exportFilters.value.startDate} - ${exportFilters.value.endDate}`;
});

const getCompanyName = computed(() => {
  if (!exportFilters.value.companyId) return 'ทั้งหมด';
  const company = props.companies.find(c => c.IC_ID === parseInt(exportFilters.value.companyId));
  return company ? company.IC_LocalName : 'ทั้งหมด';
});

const close = () => {
  emit('close');
};

const handleExport = () => {
  // ✅ Validation: ตรวจสอบว่ามีวันที่หรือไม่
  if (!exportFilters.value.startDate || !exportFilters.value.endDate) {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณาเลือกช่วงเวลา',
      text: 'กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุดก่อนส่งออกรายงาน',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#0090D3',
    });
    return; // ❌ หยุดการ export
  }

  // ✅ ถ้ามีวันที่ครบถ้วนแล้ว ให้ส่งออกได้
  emit('export', {
    format: selectedFormat.value,
    filters: exportFilters.value,
    options: exportOptions.value
  });
  close();
};
</script>

<style scoped>
/* Browser Modal Styles */
.browser-modal {
  width: 650px;
  max-width: 90vw;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.browser-modal-large {
  width: 800px;
  max-width: 90vw;
}

/* Browser Tabs Header */
.tabs-head {
  background: #0D47A1;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 8px;
}

.tabs-head .tabs {
  display: flex;
  gap: 2px;
  height: 100%;
  align-items: flex-end;
}

.tabs-head .tab-open {
  min-width: 110px;
  max-width: 200px;
  height: 26px;
  border-radius: 5px 5px 0 0;
  background-color: #1565C0;
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  position: relative;
}

.tabs-head .tab-open span {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tabs-head .tab-open .close-tab {
  color: #fff;
  font-size: 13px;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.2s;
  flex-shrink: 0;
  opacity: 0.8;
}

.tabs-head .tab-open .close-tab:hover {
  background-color: rgba(255, 255, 255, 0.2);
  opacity: 1;
}

.tabs-head .window-opt {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 100%;
}

.tabs-head .window-opt button {
  height: 24px;
  width: 24px;
  border: none;
  background-color: transparent;
  transition: 0.15s ease-out;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 12px;
  opacity: 0.9;
}

.tabs-head .window-opt button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

.tabs-head .window-opt .window-close:hover {
  background-color: #dc3545;
  color: #fff;
}

/* Browser URL Bar */
.head-browser {
  position: relative;
  width: 100%;
  height: 42px;
  background-color: #1565C0;
  padding: 5px 10px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.head-browser button {
  width: 26px;
  height: 26px;
  border: none;
  background-color: transparent;
  color: #fff;
  border-radius: 3px;
  transition: 0.15s ease-in-out;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.head-browser button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.head-browser button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

.head-browser .url-bar {
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  height: 30px;
  border-radius: 15px;
  color: #fff;
  padding: 0 14px;
  flex: 1;
  transition: 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.head-browser .url-bar:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.head-browser .url-text {
  color: #fff;
  font-size: 13px;
  font-weight: 400;
  opacity: 0.9;
}

.head-browser .star {
  color: #fff;
  font-size: 16px;
  opacity: 0.7;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s;
}

.head-browser .star:hover {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

/* Browser Content */
.browser-content {
  background: #fff;
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Dropdown Options Styling */
.browser-content select {
  font-size: 0.875rem;
}

.browser-content select option {
  padding: 8px 12px;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
