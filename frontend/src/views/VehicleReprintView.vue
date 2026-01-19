<template>
  <div class="w-full max-w-full animate-fadeIn">
    <!-- Page Header -->
    <div class="relative mb-10">
      <h1 class="page-title">รีปริ้น / Reprint</h1>
      <p class="m-0 text-lg font-medium text-slate-500 font-prompt">
        ค้นหาและพิมพ์ใบสลิปใหม่
      </p>
    </div>

    <!-- Main Content -->
    <div class="w-full">
      <!-- Search Card -->
      <div class="p-6 mb-6 bg-white border border-gray-100 rounded-lg shadow-sm">
        <div class="mb-4">
          <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
            ค้นหาด้วย Barcode
          </label>
          <div class="flex gap-3">
            <input
              v-model="barcodeSearch"
              type="text"
              placeholder="กรุณากรอก Barcode"
              class="flex-1 px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              @keyup.enter="searchByBarcode"
            />
            <button
              @click="searchByBarcode"
              :disabled="loading || !barcodeSearch"
              class="px-6 py-2.5 text-base font-semibold text-white bg-[#0090D3] rounded-lg hover:bg-[#007AB8] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-prompt"
            >
              {{ loading ? 'กำลังค้นหา...' : 'ค้นหา' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Reprint Modal -->
      <Teleport to="body">
        <div v-if="showReprintModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm print:hidden" @click.self="closeReprintModal">
          <div class="browser-modal browser-modal-large max-h-[90vh] overflow-y-auto">
            <!-- Browser Tabs Header -->
            <div class="tabs-head">
              <div class="tabs">
                <div class="tab-open">
                  <span>รีปริ้น / Reprint</span>
                  <button @click="closeReprintModal" class="close-tab">✕</button>
                </div>
              </div>
              <div class="window-opt">
                <button>−</button>
                <button>□</button>
                <button @click="closeReprintModal" class="window-close">✕</button>
              </div>
            </div>

            <!-- Browser URL Bar -->
            <div class="head-browser">
              <button disabled>←</button>
              <button disabled>→</button>
              <div class="url-bar">
                <span class="url-text">reprint/slip</span>
                <button class="star">★</button>
              </div>
              <button>⋮</button>
            </div>

            <!-- Content Area -->
            <div class="browser-content">
              <!-- Visit Type Selector -->
              <div class="mb-4">
                <label class="block mb-2 text-sm font-semibold text-gray-700 font-prompt">
                  ประเภทการเข้า
                </label>
                <select
                  v-model="reprintData.visitTypeId"
                  class="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent font-prompt"
                  @change="onVisitTypeChange"
                >
                  <option :value="null">กรุณาเลือกประเภทการเข้า</option>
                  <option
                    v-for="vt in visitTypes"
                    :key="vt.VT_ID"
                    :value="vt.VT_ID"
                  >
                    {{ vt.VT_LocalName }} ({{ vt.VT_EnglishName }})
                  </option>
                </select>
              </div>

              <!-- Slip Preview -->
              <div class="slip-80mm-preview font-prompt" v-if="reprintData.vehicle">
                <!-- Company Logo -->
                <div class="flex justify-center" style="margin-bottom: 4px;">
                  <img
                    v-if="reprintData.vehicle.IC_LogoPath"
                    :src="`${getBackendBaseUrl()}${reprintData.vehicle.IC_LogoPath}`"
                    alt="Company Logo"
                    style="height: 48px !important;"
                    @error="(e) => { console.error('[REPRINT] Logo load error:', e); e.target.style.display = 'none'; }"
                  />
                  <div v-else class="font-semibold text-gray-600" style="font-size: 10px !important;">{{ reprintData.vehicle.IC_LocalName || 'Company' }}</div>
                </div>

                <!-- Company Name -->
                <div class="text-center" style="margin-bottom: 6px;">
                  <h2 class="font-bold" style="font-size: 11px !important; line-height: 1.2 !important;">{{ reprintData.vehicle.IC_LocalName || 'บริษัท' }}</h2>
                  <p class="text-gray-600" style="font-size: 9px !important; line-height: 1.2 !important;">{{ reprintData.vehicle.IC_EnglishName || 'Company Name' }}</p>
                </div>

                <!-- Visitor Information -->
                <div style="line-height: 1.3 !important; margin-bottom: 6px;">
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">ลำดับ:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Sequence || '-' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">ประเภท:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.VT_LocalName || 'qqq' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">ชื่อ-นามสกุล:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_FullName || 'สกุล. qqq' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 9px !important;">เลขบัตรประชาชน:</span>
                    <span style="font-size: 9px !important;">{{ reprintData.vehicle.WI_CardID || '1111111111111' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">ทะเบียนรถ:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_LicensePlate || 'qqq' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">จังหวัด:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_LicenseProvince || 'qqqqq' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">หมายเหตุ:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Remarks || '' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">ผู้ติดตาม:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Follower || '1' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">ประเภทรถ:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_VehicleType || 'รถส่วนสัตว์' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 9px !important;">ผู้ติดต่อ:</span>
                    <span style="font-size: 9px !important;">{{ reprintData.vehicle.WI_ContactName || '-' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">เวลาเข้า:</span>
                    <span style="font-size: 11px !important;">{{ formatDateTime(reprintData.vehicle.WI_RecordedOn) }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">เวลาออก:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.CheckOutTime ? formatDateTime(reprintData.vehicle.CheckOutTime) : '-' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">หมายเหตุภายใน:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_InternalNote || '' }}</span>
                  </div>
                  <div class="flex justify-between" style="margin-bottom: 2px;">
                    <span style="font-size: 11px !important;">สถานที่:</span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.User_Location || '-' }}</span>
                  </div>
                </div>

                <!-- QR Code -->
                <div class="flex justify-center" style="margin-bottom: 4px;">
                  <img v-if="reprintData.qrCodeUrl" :src="reprintData.qrCodeUrl" alt="QR Code" style="width: 112px !important; height: 112px !important;" />
                </div>

                <!-- Barcode (แสดงเฉพาะ "ฝาก/เบิกสินค้า") -->
                <div v-if="reprintData.barcodeUrl && shouldShowBarcode(reprintData.vehicle.VT_ID)" class="flex justify-center" style="margin-bottom: 6px;">
                  <img :src="reprintData.barcodeUrl" alt="Barcode" style="max-width: 55% !important;" />
                </div>

                <!-- Footer Warnings -->
                <div v-if="shouldShowFooterWarning(reprintData.vehicle.VT_ID)" class="space-y-0 font-medium text-center" style="font-size: 7px !important; line-height: 1.2 !important; margin-bottom: 4px;">
                  <p style="font-size: 7px !important; margin-bottom: 2px;">{{ REPRINT_CONFIG.FOOTER_WARNING_TEXT.line1 }}</p>
                  <p style="font-size: 7px !important; margin-bottom: 2px;">{{ REPRINT_CONFIG.FOOTER_WARNING_TEXT.line2 }}</p>
                </div>

                <!-- ห้ามทำใบสลิปหาย (แสดงเสมอ) -->
                <div class="text-center" style="margin-top: 4px;">
                  <p class="font-bold" style="font-size: 9px !important;">*** ห้ามทำใบสลิปหาย ***</p>
                  <br>
                  <br>
                  <br>
                  <br>
                  <p>-----</p>
                </div>
              </div>

              <!-- Print Button -->
              <div class="flex justify-end gap-3 mt-6">
                <button
                  @click="closeReprintModal"
                  class="px-6 py-3 text-base font-semibold text-gray-700 transition-all border-2 border-gray-300 rounded-xl hover:bg-gray-100 active:scale-95 font-prompt"
                >
                  ยกเลิก
                </button>
                <button
                  @click="printSlip"
                  class="px-6 py-3 text-base font-semibold text-white transition-all bg-purple-600 shadow-md rounded-xl hover:bg-purple-700 active:scale-95 font-prompt"
                >
                  พิมพ์ / Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Print-only Slip (hidden on screen, shown when printing) -->
      <div class="hidden print:block">
        <div class="slip-80mm-print font-prompt" v-if="reprintData.vehicle">
          <!-- Company Logo -->
          <div class="flex justify-center" style="margin-bottom: 4px;">
            <img
              v-if="reprintData.vehicle.IC_LogoPath"
              :src="`${getBackendBaseUrl()}${reprintData.vehicle.IC_LogoPath}`"
              alt="Company Logo"
              style="height: 48px !important;"
            />
            <div v-else class="font-semibold text-gray-700" style="font-size: 10px !important;">{{ reprintData.vehicle.IC_LocalName || 'Company' }}</div>
          </div>

          <!-- Company Name -->
          <div class="text-center" style="margin-bottom: 6px;">
            <h2 class="font-bold" style="font-size: 11px !important; line-height: 1.2 !important;">{{ reprintData.vehicle.IC_LocalName || 'บริษัท' }}</h2>
            <p class="text-gray-700" style="font-size: 9px !important; line-height: 1.2 !important;">{{ reprintData.vehicle.IC_EnglishName || 'Company Name' }}</p>
          </div>

          <!-- Visitor Information -->
          <div style="line-height: 1.3 !important; margin-bottom: 6px;">
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">ลำดับ:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Sequence || '-' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">ประเภท:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.VT_LocalName || 'qqq' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">ชื่อ-นามสกุล:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_FullName || 'สกุล. qqq' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 9px !important;">เลขบัตรประชาชน:</span>
              <span style="font-size: 9px !important;">{{ reprintData.vehicle.WI_CardID || '1111111111111' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">ทะเบียนรถ:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_LicensePlate || 'qqq' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">จังหวัด:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_LicenseProvince || 'qqqqq' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">หมายเหตุ:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Remarks || '' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">ผู้ติดตาม:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Follower || '1' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">ประเภทรถ:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_VehicleType || 'รถส่วนสัตว์' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 9px !important;">ผู้ติดต่อ:</span>
              <span style="font-size: 9px !important;">{{ reprintData.vehicle.WI_ContactName || '-' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">เวลาเข้า:</span>
              <span style="font-size: 11px !important;">{{ formatDateTime(reprintData.vehicle.WI_RecordedOn) }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">เวลาออก:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.CheckOutTime ? formatDateTime(reprintData.vehicle.CheckOutTime) : '-' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">หมายเหตุภายใน:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_InternalNote || '' }}</span>
            </div>
            <div class="flex justify-between" style="margin-bottom: 2px;">
              <span style="font-size: 11px !important;">สถานที่:</span>
              <span style="font-size: 11px !important;">{{ reprintData.vehicle.User_Location || '-' }}</span>
            </div>
          </div>

          <!-- QR Code -->
          <div class="flex justify-center" style="margin-bottom: 4px;">
            <img v-if="reprintData.qrCodeUrl" :src="reprintData.qrCodeUrl" alt="QR Code" style="width: 112px !important; height: 112px !important;" />
          </div>

          <!-- Barcode (แสดงเฉพาะ "ฝาก/เบิกสินค้า") -->
          <div v-if="reprintData.barcodeUrl && shouldShowBarcode(reprintData.vehicle.VT_ID)" class="flex justify-center" style="margin-bottom: 6px;">
            <img :src="reprintData.barcodeUrl" alt="Barcode" style="max-width: 55% !important;" />
          </div>

          <!-- Footer Warnings -->
          <div v-if="shouldShowFooterWarning(reprintData.vehicle.VT_ID)" class="space-y-0 font-medium text-center" style="font-size: 7px !important; line-height: 1.2 !important; margin-bottom: 4px;">
            <p style="font-size: 7px !important; margin-bottom: 2px;">{{ REPRINT_CONFIG.FOOTER_WARNING_TEXT.line1 }}</p>
            <p style="font-size: 7px !important; margin-bottom: 2px;">{{ REPRINT_CONFIG.FOOTER_WARNING_TEXT.line2 }}</p>
          </div>

          <!-- ห้ามทำใบสลิปหาย (แสดงเสมอ) -->
          <div class="text-center" style="margin-top: 4px;">
            <p class="font-bold" style="font-size: 9px !important;">*** ห้ามทำใบสลิปหาย ***</p>
            <br>
            <br>
            <br>
            <br>
            <p>-----</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { wayinAPI, getBackendBaseUrl } from '../services/api';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { REPRINT_CONFIG, isQRUrlType, shouldShowFooterWarning, shouldShowBarcode } from '../constants/visitTypes';
import { useToast } from '@/composables/useToast';

const toast = useToast();

// ==================== STATE ====================
const barcodeSearch = ref('');
const loading = ref(false);
const showReprintModal = ref(false);
const reprintData = ref({
  vehicle: null,
  visitTypeId: null,
  qrCodeUrl: '',
  barcodeUrl: ''
});
const visitTypes = ref([]);

// ==================== METHODS ====================

// ค้นหาด้วย Barcode
const searchByBarcode = async () => {
  if (!barcodeSearch.value.trim()) {
    toast.warning('ข้อมูลไม่ครบ', 'กรุณากรอก Barcode');
    return;
  }

  try {
    loading.value = true;
    const response = await wayinAPI.searchByBarcode(barcodeSearch.value.trim());

    if (response.data.success && response.data.data) {
      await openReprintModal(response.data.data);
    } else {
      toast.error('ไม่พบข้อมูล', 'ไม่พบข้อมูลที่ค้นหา');
    }
  } catch (error) {
    console.error('Error searching by barcode:', error);
    toast.error('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถค้นหาข้อมูลได้');
  } finally {
    loading.value = false;
  }
};

// เปิด Reprint Modal
const openReprintModal = async (vehicle) => {
  console.log('[REPRINT] Vehicle data:', vehicle);

  reprintData.value = {
    vehicle: vehicle,
    visitTypeId: vehicle.VT_ID || null,
    qrCodeUrl: '',
    barcodeUrl: ''
  };

  // Generate QR Code
  try {
    const vtId = reprintData.value.visitTypeId || vehicle.VT_ID;
    const isUrlType = isQRUrlType(vtId);
    const qrData = isUrlType
      ? `${REPRINT_CONFIG.QR_URL_TEMPLATE}${vehicle.WI_Barcode}`
      : vehicle.WI_Barcode;
    reprintData.value.qrCodeUrl = await QRCode.toDataURL(qrData, { width: 200 });
  } catch (error) {
    console.error('Error generating QR code:', error);
  }

  // Generate Barcode
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, vehicle.WI_Barcode, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true
    });
    reprintData.value.barcodeUrl = canvas.toDataURL();
  } catch (error) {
    console.error('Error generating barcode:', error);
  }

  showReprintModal.value = true;
};

// ปิด Reprint Modal
const closeReprintModal = () => {
  showReprintModal.value = false;
  reprintData.value = { vehicle: null, visitTypeId: null, qrCodeUrl: '', barcodeUrl: '' };
  barcodeSearch.value = '';
};

// เมื่อเปลี่ยน Visit Type
const onVisitTypeChange = async () => {
  if (!reprintData.value.visitTypeId) {
    return;
  }

  try {
    const vehicle = reprintData.value.vehicle;

    await wayinAPI.update(vehicle.WI_ID, {
      fullName: vehicle.WI_FullName,
      cardId: vehicle.WI_CardID,
      address: vehicle.WI_Address,
      licensePlate: vehicle.WI_LicensePlate,
      licenseProvince: vehicle.WI_LicenseProvince,
      vehicleType: vehicle.WI_VehicleType,
      visitTypeId: reprintData.value.visitTypeId,
      internalDivision: vehicle.WI_InternalDivision,
      follower: vehicle.WI_Follower,
      remarks: vehicle.WI_Remarks
    });

    toast.success('สำเร็จ', 'อัพเดทประเภทการเข้าสำเร็จ');

    // อัพเดทข้อมูลใน reprintData
    reprintData.value.vehicle.VT_ID = reprintData.value.visitTypeId;
    const selectedVisitType = visitTypes.value.find(vt => vt.VT_ID === reprintData.value.visitTypeId);
    if (selectedVisitType) {
      reprintData.value.vehicle.VT_LocalName = selectedVisitType.VT_LocalName;
      reprintData.value.vehicle.VT_EnglishName = selectedVisitType.VT_EnglishName;
    }

    // อัพเดท QR Code ใหม่
    try {
      const isUrlType = isQRUrlType(reprintData.value.visitTypeId);
      const qrData = isUrlType
        ? `${REPRINT_CONFIG.QR_URL_TEMPLATE}${vehicle.WI_Barcode}`
        : vehicle.WI_Barcode;
      reprintData.value.qrCodeUrl = await QRCode.toDataURL(qrData, { width: 200 });
    } catch (error) {
      console.error('Error regenerating QR code:', error);
    }
  } catch (error) {
    console.error('Error updating visit type:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถอัพเดทประเภทการเข้าได้');
  }
};

// พิมพ์สลิป
const printSlip = () => {
  window.print();
};

// Format DateTime
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// โหลด Visit Types
const loadVisitTypes = async () => {
  try {
    const response = await wayinAPI.getVisitTypes();
    if (response.data.success) {
      visitTypes.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error fetching visit types:', error);
  }
};

// ==================== LIFECYCLE ====================
onMounted(() => {
  loadVisitTypes();
});
</script>

<style scoped>
/* Slip Styles - เหมือนกับ VehicleView.vue */
.slip-80mm-preview {
  width: 80mm;
  max-width: 100%;
  margin: 0 auto;
  padding: 8px;
  border: 1px dashed #ccc;
  background: white;
}

.slip-80mm-print {
  width: 80mm;
  margin: 0 auto;
  padding: 8px;
  background: white;
}

@media print {
  .slip-80mm-print {
    width: 80mm;
    margin: 0;
    padding: 0;
  }
}
</style>

