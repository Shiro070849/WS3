<template>
  <div class="w-full max-w-full animate-fadeIn">
    <!-- Page Header - Tailwind Only -->
    <div class="relative mb-10">
      <h1 class="page-title">รายการ การเข้า-ออก</h1>
      <p class="m-0 text-lg font-medium text-slate-500 font-prompt">
        จัดการข้อมูลยานพาหนะเข้า-ออก
      </p>
    </div>

    <!-- Main Content - Tailwind Layout -->
    <div class="w-full">
      <!-- Date Range Filter (แยกบรรทัด) -->
      <div class="mb-4">
        <DateRangeFilter
          v-model:dateFrom="filters.dateFrom"
          v-model:dateTo="filters.dateTo"
          @filter="handleDateFilter"
        />
      </div>

      <!-- Filter Card - Tailwind Only -->
      <div class="p-6 mb-6 bg-white border border-gray-100 rounded-lg shadow-sm">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-6">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
              ค้นหา
            </label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="ทะเบียนรถ, ชื่อคนขับ, Sequence"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              @input="handleSearchInput"
            />
          </div>

          <!-- Company Filter (แสดงเมื่อมีหลายบริษัท) -->
          <div v-if="companies.length > 1">
            <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
              บริษัท
            </label>
            <select
              v-model="filters.companyId"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              @change="handleCompanyFilter"
            >
              <option :value="null">ทุกบริษัท</option>
              <option
                v-for="company in companies"
                :key="company.IC_ID"
                :value="company.IC_ID"
              >
                {{ company.IC_LocalName }}
              </option>
            </select>
          </div>

          <!-- Vehicle Type Filter -->
          <div>
            <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
              ประเภทรถ
            </label>
            <select
              v-model="filters.vehicleType"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              @change="fetchVehicles"
            >
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

          <!-- Status Filter -->
          <div>
            <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
              สถานะ
            </label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
              @change="fetchVehicles"
            >
              <option value="">ทั้งหมด</option>
              <option value="pending">ค้างอยู่</option>
              <option value="in">เข้า</option>
              <option value="out">ออก</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-end gap-2">
            <button
              @click="fetchVehicles"
              class="flex-1 px-4 py-2.5 text-base font-semibold bg-[#0090D3] text-white rounded-lg hover:bg-[#007AB8] active:scale-95 transition-all shadow-sm font-prompt"
            >
              ค้นหา
            </button>
            <button
              @click="openAddModal"
              class="flex-1 px-4 py-2.5 text-base font-semibold bg-[#3AAA35] text-white rounded-lg hover:bg-[#339A2E] active:scale-95 transition-all shadow-sm font-prompt"
            >
              + เพิ่มรถ
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card - Tailwind Only -->
      <div class="overflow-hidden bg-white border border-gray-100 rounded-lg shadow-sm">
        <!-- Table Header -->
        <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 class="text-lg font-bold text-gray-900 font-prompt">
            รายการทะเบียนรถ
            <span class="ml-2 text-base font-normal text-gray-500">
              ({{ pagination.total }} รายการ)
            </span>
          </h2>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <tr>
                <th class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  Sequence
                </th>
                <th class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  ทะเบียนรถ
                </th>
                <th v-if="canReprint" class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  Barcode
                </th>
                <th class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  ประเภทรถ
                </th>
                <th class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  คนขับ
                </th>
                <th class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  บริษัท
                </th>
                <th class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  เวลาเข้า
                </th>
                <th class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  เวลาออก
                </th>
                <th v-if="canReprint" class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  เวลารีปริ้น
                </th>
                <th class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  สถานะ
                </th>
                <th class="px-6 py-5 text-sm font-bold text-left text-gray-700 font-prompt">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading" class="bg-white">
                <td :colspan="canReprint ? 11 : 10" class="px-6 py-10 text-center text-gray-500">
                  <div class="flex items-center justify-center">
                    <svg class="animate-spin h-6 w-6 mr-3 text-[#0090D3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-base font-prompt">กำลังโหลดข้อมูล...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="vehicles.length === 0" class="bg-white">
                <td :colspan="canReprint ? 11 : 10" class="px-6 py-10 text-base text-center text-gray-500 font-prompt">
                  ไม่พบข้อมูล
                </td>
              </tr>
              <tr v-else v-for="vehicle in vehicles" :key="vehicle.WI_ID" class="transition-colors border-b border-gray-200 hover:bg-blue-50/30">
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base font-medium text-gray-900 font-prompt">
                    {{ vehicle.WI_Sequence || '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base font-bold text-gray-900 font-prompt">
                    {{ vehicle.WI_LicensePlate || '-' }}
                  </div>
                  <div class="text-sm text-gray-500 font-prompt">
                    {{ vehicle.WI_LicenseProvince || '-' }}
                  </div>
                </td>
                <td v-if="canReprint" class="px-6 py-5 whitespace-nowrap">
                  <div class="font-mono text-sm font-medium text-gray-700">
                    {{ vehicle.WI_Barcode || '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base font-medium text-gray-700 font-prompt">
                    {{ vehicle.WI_VehicleType || '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base font-medium text-gray-700 font-prompt">
                    {{ vehicle.WI_FullName || '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base font-medium text-gray-700 font-prompt">
                    {{ vehicle.CompanyName || '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base font-medium text-gray-700 font-prompt">
                    {{ formatDateTime(vehicle.WI_RecordedOn) }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-base font-medium text-gray-700 font-prompt">
                    {{ vehicle.WO_RecordedOn ? formatDateTime(vehicle.WO_RecordedOn) : '-' }}
                  </div>
                </td>
                <td v-if="canReprint" class="px-6 py-5 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-600 font-prompt">
                    {{ vehicle.WI_ReprintOn ? formatDateTime(vehicle.WI_ReprintOn) : '-' }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <span
                    :class="{
                      'bg-blue-100 text-blue-700 border-blue-200': vehicle.Status === 'เข้า',
                      'bg-green-100 text-green-700 border-green-200': vehicle.Status === 'ออก'
                    }"
                    class="px-3 py-1.5 inline-flex text-sm font-semibold rounded-full border-2 font-prompt"
                  >
                    {{ vehicle.Status }}
                  </span>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="flex gap-2">
                    <button
                      v-if="canReprint"
                      @click="openReprintModal(vehicle)"
                      class="px-4 py-2 text-base font-semibold text-white transition-all bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700 active:scale-95 font-prompt"
                    >
                      รีปริ้น
                    </button>
                    <button
                      @click="openEditModal(vehicle)"
                      class="px-4 py-2 bg-[#0090D3] text-white rounded-lg hover:bg-[#007AB8] active:scale-95 transition-all text-base font-semibold shadow-sm font-prompt"
                    >
                      แก้ไข
                    </button>
                    <button
                      @click="confirmDelete(vehicle)"
                      class="px-4 py-2 text-base font-semibold text-white transition-all bg-red-600 rounded-lg shadow-sm hover:bg-red-700 active:scale-95 font-prompt"
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="text-base text-gray-600 font-prompt">
              แสดง {{ (pagination.page - 1) * pagination.limit + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }} จาก {{ pagination.total }} รายการ
            </div>
            <div class="flex items-center gap-2">
              <!-- Previous Button -->
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page === 1"
                class="px-4 py-2 text-base font-semibold border border-gray-300 rounded-lg hover:bg-white hover:border-[#0090D3] hover:text-[#0090D3] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-prompt"
              >
                ← ก่อนหน้า
              </button>

              <!-- Page Numbers -->
              <div class="flex gap-1">
                <!-- First Page -->
                <button
                  v-if="pagination.page > 6"
                  @click="changePage(1)"
                  class="w-10 h-10 flex items-center justify-center text-base font-semibold border border-gray-300 rounded-lg hover:bg-white hover:border-[#0090D3] hover:text-[#0090D3] transition-all font-prompt"
                >
                  1
                </button>
                <span v-if="pagination.page > 7" class="flex items-center px-2 text-gray-400">...</span>

                <!-- Pages around current page -->
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="changePage(page)"
                  :class="[
                    'w-10 h-10 flex items-center justify-center text-base font-semibold border rounded-lg transition-all font-prompt',
                    page === pagination.page
                      ? 'bg-[#0090D3] text-white border-[#0090D3]'
                      : 'border-gray-300 hover:bg-white hover:border-[#0090D3] hover:text-[#0090D3]'
                  ]"
                >
                  {{ page }}
                </button>

                <!-- Last Page -->
                <span v-if="pagination.page < pagination.totalPages - 6" class="flex items-center px-2 text-gray-400">...</span>
                <button
                  v-if="pagination.page < pagination.totalPages - 5"
                  @click="changePage(pagination.totalPages)"
                  class="w-10 h-10 flex items-center justify-center text-base font-semibold border border-gray-300 rounded-lg hover:bg-white hover:border-[#0090D3] hover:text-[#0090D3] transition-all font-prompt"
                >
                  {{ pagination.totalPages }}
                </button>
              </div>

              <!-- Next Button -->
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages"
                class="px-4 py-2 text-base font-semibold border border-gray-300 rounded-lg hover:bg-white hover:border-[#0090D3] hover:text-[#0090D3] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-prompt"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal - Browser Style -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" @click.self="closeModal">
        <div class="browser-modal browser-modal-large">
          <!-- Browser Tabs Header -->
          <div class="tabs-head">
            <div class="tabs">
              <div class="tab-open">
                <span>{{ modalMode === 'add' ? 'เพิ่มรถเข้า' : 'แก้ไขข้อมูลรถ' }}</span>
                <button @click="closeModal" class="close-tab">✕</button>
              </div>
            </div>
            <div class="window-opt">
              <button>−</button>
              <button>□</button>
              <button @click="closeModal" class="window-close">✕</button>
            </div>
          </div>

          <!-- Browser URL Bar -->
          <div class="head-browser">
            <button disabled>←</button>
            <button disabled>→</button>
            <div class="url-bar">
              <span class="url-text">{{ modalMode === 'add' ? 'vehicle/create' : 'vehicle/edit' }}</span>
              <button class="star">★</button>
            </div>
            <button>⋮</button>
          </div>

          <!-- Content Area -->
          <div class="browser-content">
            <div class="grid grid-cols-2 gap-5">
              <div class="col-span-2 md:col-span-1">
                <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
                  ทะเบียนรถ <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.licensePlate"
                  type="text"
                  class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
                  placeholder="กท-1234"
                />
              </div>
              <div class="col-span-2 md:col-span-1">
                <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
                  จังหวัด
                </label>
                <input
                  v-model="formData.licenseProvince"
                  type="text"
                  class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
                  placeholder="กรุงเทพมหานคร"
                />
              </div>
              <div class="col-span-2 md:col-span-1">
                <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
                  ประเภทรถ
                </label>
                <select
                  v-model="formData.vehicleType"
                  class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
                >
                  <option value="">เลือกประเภทรถ</option>
                  <option
                    v-for="vType in vehicleTypes"
                    :key="vType.VType_ID"
                    :value="vType.VType_LocalName"
                  >
                    {{ vType.VType_LocalName }}
                  </option>
                </select>
              </div>
              <div class="col-span-2 md:col-span-1">
                <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
                  ชื่อคนขับ
                </label>
                <input
                  v-model="formData.fullName"
                  type="text"
                  class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>
              <div class="col-span-2">
                <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
                  หมายเหตุ
                </label>
                <textarea
                  v-model="formData.remarks"
                  rows="3"
                  class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all resize-none font-prompt"
                  placeholder="หมายเหตุเพิ่มเติม"
                ></textarea>
              </div>
            </div>

            <!-- ปุ่ม -->
            <div class="flex justify-end gap-3 px-6 py-4 mt-6 -mx-8 -mb-8 border-t bg-gray-50">
              <button
                @click="closeModal"
                class="px-6 py-3 text-base font-semibold text-gray-700 transition-all border-2 border-gray-300 rounded-xl hover:bg-gray-100 active:scale-95 font-prompt"
              >
                ยกเลิก
              </button>
              <button
                @click="saveVehicle"
                class="px-6 py-3 text-base font-semibold bg-[#0090D3] text-white rounded-xl hover:bg-[#007AB8] active:scale-95 transition-all shadow-md font-prompt"
              >
                {{ modalMode === 'add' ? 'เพิ่มรถ' : 'บันทึก' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Checkout Modal - Browser Style -->
    <Teleport to="body">
      <div v-if="showCheckoutModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" @click.self="closeCheckoutModal">
        <div class="browser-modal">
          <!-- Browser Tabs Header -->
          <div class="tabs-head tabs-head-green">
            <div class="tabs">
              <div class="tab-open">
                <span>บันทึกรถออก</span>
                <button @click="closeCheckoutModal" class="close-tab">✕</button>
              </div>
            </div>
            <div class="window-opt">
              <button>−</button>
              <button>□</button>
              <button @click="closeCheckoutModal" class="window-close">✕</button>
            </div>
          </div>

          <!-- Browser URL Bar -->
          <div class="head-browser head-browser-green">
            <button disabled>←</button>
            <button disabled>→</button>
            <div class="url-bar">
              <span class="url-text">vehicle/checkout</span>
              <button class="star">★</button>
            </div>
            <button>⋮</button>
          </div>

          <!-- Content Area -->
          <div class="browser-content">
            <div class="p-6 mb-6 border-2 border-blue-100 bg-blue-50 rounded-xl">
              <p class="mb-3 text-base text-gray-700 font-prompt">
                <span class="font-semibold text-gray-600">ทะเบียนรถ:</span>
                <span class="ml-2 text-lg font-bold text-gray-900">{{ checkoutData.vehicle?.WI_LicensePlate }}</span>
              </p>
              <p class="text-base text-gray-700 font-prompt">
                <span class="font-semibold text-gray-600">คนขับ:</span>
                <span class="ml-2 text-lg font-bold text-gray-900">{{ checkoutData.vehicle?.WI_FullName || '-' }}</span>
              </p>
            </div>
            <div>
              <label class="block mb-3 text-base font-bold text-gray-700 font-prompt">
                หมายเหตุ
              </label>
              <textarea
                v-model="checkoutData.remarks"
                rows="4"
                class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3AAA35] focus:border-[#3AAA35] transition-all resize-none leading-relaxed font-prompt"
                placeholder="หมายเหตุการออก (ถ้ามี)"
              ></textarea>
            </div>

            <!-- ปุ่ม -->
            <div class="flex justify-end gap-3 px-6 py-4 mt-6 -mx-8 -mb-8 border-t bg-gray-50">
              <button
                @click="closeCheckoutModal"
                class="px-6 py-3 text-base font-semibold text-gray-700 transition-all border-2 border-gray-300 rounded-xl hover:bg-gray-100 active:scale-95 font-prompt"
              >
                ยกเลิก
              </button>
              <button
                @click="saveCheckout"
                class="px-6 py-3 text-base font-semibold bg-[#3AAA35] text-white rounded-xl hover:bg-[#339A2E] active:scale-95 transition-all shadow-md font-prompt"
              >
                บันทึกออก
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
            <!-- VisitType Selector -->
            <div class="mb-6">
              <label class="block mb-2 text-sm font-semibold text-gray-800 font-prompt">ประเภทการเข้า (Visit Type)</label>
              <select
                v-model="reprintData.visitTypeId"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] focus:border-[#0090D3] transition-all font-prompt"
                style="font-size: 13px; line-height: 1.4;"
              >
                <option :value="null" style="font-size: 13px; padding: 4px 8px;">-- เลือกประเภทการเข้า --</option>
                <option v-for="vt in visitTypes" :key="vt.VT_ID" :value="vt.VT_ID" style="font-size: 13px; padding: 4px 8px;">
                  {{ vt.VT_LocalName }} / {{ vt.VT_EnglishName }}
                </option>
              </select>
              <button
                @click="updateVisitType"
                class="px-4 py-2 mt-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                อัพเดทประเภทการเข้า
              </button>
            </div>

            <!-- Print Preview Container (80mm width) -->
            <div class="p-4 bg-white border-2 border-gray-300 rounded-lg print-slip-preview">
              <div class="mx-auto slip-80mm font-prompt">
                <!-- Company Logo -->
                <div class="flex justify-center" v-if="reprintData.vehicle" style="margin-bottom: 4px;">
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
                <div class="text-center" v-if="reprintData.vehicle" style="margin-bottom: 6px;">
                  <h2 class="font-bold" style="font-size: 11px !important; line-height: 1.2 !important;">{{ reprintData.vehicle.IC_LocalName || 'บริษัท' }}</h2>
                  <p class="text-gray-600" style="font-size: 9px !important; line-height: 1.2 !important;">{{ reprintData.vehicle.IC_EnglishName || 'Company Name' }}</p>
                </div>

                <!-- Visitor Information -->
                <div v-if="reprintData.vehicle" style="line-height: 1.3 !important; margin-bottom: 6px;">
                  <!-- เลขที่ -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">เลขที่: </span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Sequence || '-' }}</span>
                  </div>

                  <!-- ประเภทผู้มาติดต่อ -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">ประเภทผู้มาติดต่อ: </span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.VT_LocalName || 'qqq' }}</span>
                  </div>

                  <!-- ชื่อ-สกุล -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">ชื่อ-สกุล: </span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_FullName || 'สกุล. qqq' }}</span>
                  </div>

                  <!-- เลขบัตรประชาชน (ฟอนต์เล็กกว่า) -->
                  <div style="margin-bottom: 2px; font-size: 9px !important;">
                    <span style="font-weight: 500; font-size: 9px !important;">เลขบัตรประชาชน: </span>
                    <span style="font-size: 9px !important;">{{ reprintData.vehicle.WI_CardID || '1111111111111' }}</span>
                  </div>

                  <!-- เลขทะเบียน -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">เลขทะเบียน: </span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_LicensePlate || 'qqq' }}</span>
                  </div>

                  <!-- ทะเบียนจังหวัด -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">ทะเบียนจังหวัด: </span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_LicenseProvince || 'qqqqq' }}</span>
                  </div>

                  <!-- รายละเอียด -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">รายละเอียด: </span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Remarks || '' }}</span>
                  </div>

                  <!-- จำนวนผู้มาติดต่อ -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">จำนวนผู้มาติดต่อ: </span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Follower || '1' }}</span>
                  </div>

                  <!-- ยานพาหนะ -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">ยานพาหนะ: </span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_VehicleType || 'รถส่วนสัตว์' }}</span>
                  </div>

                  <!-- ผู้รับการติดต่อ/แผนก (ฟอนต์เล็กกว่า) -->
                  <div style="margin-bottom: 2px; font-size: 9px !important;">
                    <span style="font-weight: 500; font-size: 9px !important;">ผู้รับการติดต่อ/แผนก: </span>
                    <span style="font-size: 9px !important;">{{ reprintData.vehicle.WI_ContactName || '-' }}</span>
                  </div>

                  <!-- เวลาเข้า -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">เวลาเข้า: </span>
                    <span style="font-size: 11px !important;">{{ formatDateTime(reprintData.vehicle.WI_RecordedOn) }}</span>
                  </div>

                  <!-- เวลาออก -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">เวลาออก: </span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.CheckOutTime ? formatDateTime(reprintData.vehicle.CheckOutTime) : '-' }}</span>
                  </div>

                  <!-- หมายเหตุ -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">หมายเหตุ: </span>
                    <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_InternalNote || '' }}</span>
                  </div>

                  <!-- ประตู -->
                  <div style="margin-bottom: 2px; font-size: 11px !important;">
                    <span style="font-weight: 500; font-size: 11px !important;">ประตู: </span>
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

            <!-- Print Instructions -->
            <div class="p-6 mb-4 border-2 border-blue-300 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
              <p class="flex items-center gap-3 mb-5 text-lg font-bold text-blue-900 font-prompt">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                คำแนะนำการพิมพ์
              </p>
              <div class="grid grid-cols-2 gap-5">
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm0 0h6a2 2 0 002-2v-4a2 2 0 00-2-2h-.756a2 2 0 00-1.789.894l-.276.553a1 1 0 00-.894.446H13a1 1 0 00-.894-.446l-.276-.553A2 2 0 009.756 7H9a2 2 0 00-2 2v4a2 2 0 002 2z"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-semibold text-blue-800 font-prompt">เครื่องปริ้น</p>
                    <p class="font-mono text-base font-bold text-blue-900">EPSON TM-T82X</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-semibold text-blue-800 font-prompt">ขนาดกระดาษ</p>
                    <p class="font-mono text-base font-bold text-blue-900">80mm</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m0 18v-6m0-6V5m0 0h10a2 2 0 012 2v14a2 2 0 01-2 2h-10"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-semibold text-blue-800 font-prompt">ระยะขอบ</p>
                    <p class="font-mono text-base font-bold text-blue-900">None</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4h10a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-semibold text-blue-800 font-prompt">ขนาดแสดง</p>
                    <p class="font-mono text-base font-bold text-blue-900">100%</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Print Button -->
            <div class="flex justify-end gap-3 mt-6">
              <button
                @click="closeReprintModal"
                class="px-6 py-3 text-base font-semibold text-gray-700 transition-all border-2 border-gray-300 rounded-xl hover:bg-gray-100 active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                @click="printSlip"
                class="px-6 py-3 text-base font-semibold text-white transition-all bg-purple-600 shadow-md rounded-xl hover:bg-purple-700 active:scale-95"
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
          <!-- เลขที่ -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">เลขที่: </span>
            <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Sequence || '-' }}</span>
          </div>

          <!-- ประเภทผู้มาติดต่อ -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">ประเภทผู้มาติดต่อ: </span>
            <span style="font-size: 11px !important;">{{ reprintData.vehicle.VT_LocalName || 'qqq' }}</span>
          </div>

          <!-- ชื่อ-สกุล -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">ชื่อ-สกุล: </span>
            <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_FullName || 'สกุล. qqq' }}</span>
          </div>

          <!-- เลขบัตรประชาชน (ฟอนต์เล็กกว่า) -->
          <div style="margin-bottom: 2px; font-size: 9px !important;">
            <span style="font-weight: 500; font-size: 9px !important;">เลขบัตรประชาชน: </span>
            <span style="font-size: 9px !important;">{{ reprintData.vehicle.WI_CardID || '1111111111111' }}</span>
          </div>

          <!-- เลขทะเบียน -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">เลขทะเบียน: </span>
            <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_LicensePlate || 'qqq' }}</span>
          </div>

          <!-- ทะเบียนจังหวัด -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">ทะเบียนจังหวัด: </span>
            <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_LicenseProvince || 'qqqqq' }}</span>
          </div>

          <!-- รายละเอียด -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">รายละเอียด: </span>
            <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Remarks || '' }}</span>
          </div>

          <!-- จำนวนผู้มาติดต่อ -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">จำนวนผู้มาติดต่อ: </span>
            <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_Follower || '1' }}</span>
          </div>

          <!-- ยานพาหนะ -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">ยานพาหนะ: </span>
            <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_VehicleType || 'รถส่วนสัตว์' }}</span>
          </div>

          <!-- ผู้รับการติดต่อ/แผนก (ฟอนต์เล็กกว่า) -->
          <div style="margin-bottom: 2px; font-size: 9px !important;">
            <span style="font-weight: 500; font-size: 9px !important;">ผู้รับการติดต่อ/แผนก: </span>
            <span style="font-size: 9px !important;">{{ reprintData.vehicle.WI_ContactName || '-' }}</span>
          </div>

          <!-- เวลาเข้า -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">เวลาเข้า: </span>
            <span style="font-size: 11px !important;">{{ formatDateTime(reprintData.vehicle.WI_RecordedOn) }}</span>
          </div>

          <!-- เวลาออก -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">เวลาออก: </span>
            <span style="font-size: 11px !important;">{{ reprintData.vehicle.CheckOutTime ? formatDateTime(reprintData.vehicle.CheckOutTime) : '-' }}</span>
          </div>

          <!-- หมายเหตุ -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">หมายเหตุ: </span>
            <span style="font-size: 11px !important;">{{ reprintData.vehicle.WI_InternalNote || '' }}</span>
          </div>

          <!-- ประตู -->
          <div style="margin-bottom: 2px; font-size: 11px !important;">
            <span style="font-weight: 500; font-size: 11px !important;">ประตู: </span>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { vehiclesAPI, vehicleTypesAPI, companiesAPI, wayinAPI, getBackendBaseUrl } from '../services/api';
import DateRangeFilter from '../components/DateRangeFilter.vue';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { REPRINT_CONFIG, isQRUrlType, shouldShowFooterWarning, shouldShowBarcode } from '../constants/visitTypes';
import { useToast } from '@/composables/useToast';
import { useFilterStore } from '../stores/filterStore';

const toast = useToast();
const filterStore = useFilterStore();

// ==================== STATE ====================
const vehicles = ref([]);
const companies = ref([]);
const loading = ref(false);
const showModal = ref(false);
const showCheckoutModal = ref(false);
const modalMode = ref('add');

// Extract user info from localStorage
const userId = parseInt(localStorage.getItem('userId'));
const loggedInCompanyId = localStorage.getItem('companyId');
const isSuperAdmin = !loggedInCompanyId || loggedInCompanyId === 'null' || loggedInCompanyId === 'undefined';
const userRoleCode = localStorage.getItem('roleCode');

// Check if user can reprint (Super Admin, ADM, QA, RCT roles)
const canReprint = computed(() => {
  return isSuperAdmin || ['ADM', 'QA', 'RCT'].includes(userRoleCode);
});

// Reprint modal state
const showReprintModal = ref(false);
const reprintData = ref({
  vehicle: null,
  visitTypeId: null,
  qrCodeUrl: '',
  barcodeUrl: ''
});
const visitTypes = ref([]);
const vehicleTypes = ref([]);

const filters = ref({
  search: '',
  status: '',
  vehicleType: '',
  dateFrom: filterStore.dateFrom,
  dateTo: filterStore.dateTo,
  companyId: null,
  page: 1,
  limit: 25,
});

const pagination = ref({
  page: 1,
  limit: 25,
  total: 0,
  totalPages: 0,
});

const formData = ref({
  id: null,
  licensePlate: '',
  licenseProvince: '',
  vehicleType: '',
  fullName: '',
  gender: '',
  address: '',
  follower: 0,
  remarks: '',
  companyId: null,
  departmentId: null,
  visitTypeId: null,
  fromCompany: '',
  contactName: '',
});

const checkoutData = ref({
  vehicle: null,
  remarks: '',
});

// ==================== COMPUTED ====================

// คำนวณหน้าที่จะแสดงใน pagination (แสดงแค่ 10 หน้ารอบๆ หน้าปัจจุบัน)
const visiblePages = computed(() => {
  const current = pagination.value.page;
  const total = pagination.value.totalPages;
  const pages = [];

  // แสดงหน้ารอบๆ หน้าปัจจุบัน (5 หน้าก่อนหน้า + หน้าปัจจุบัน + 4 หน้าถัดไป = 10 หน้า)
  const start = Math.max(1, current - 5);
  const end = Math.min(total, current + 4);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// ==================== FUNCTIONS ====================

const fetchVehicles = async () => {
  loading.value = true;
  try {
    // ส่ง companyId เมื่อ:
    // 1. Super Admin → ส่ง companyId จาก dropdown (ถ้าเลือก)
    // 2. User ที่มีหลาย Company → ส่ง companyId จาก dropdown (ถ้าเลือก)
    // 3. User ที่มี 1 Company → ไม่ต้องส่ง (Backend จะใช้ accessibleCompanyIds อัตโนมัติ)
    const filterCompanyId = (companies.value.length > 1 && filters.value.companyId) 
      ? filters.value.companyId 
      : undefined;

    console.log('[VehicleView] Fetch vehicles with:', {
      userId,
      companyId: filterCompanyId,
      companiesCount: companies.value.length,
      selectedCompanyId: filters.value.companyId
    });

    const params = {
      userId: userId, // ส่ง userId ไปให้ Backend query accessibleCompanyIds
      search: filters.value.search || undefined,
      status: filters.value.status || undefined,
      vehicleType: filters.value.vehicleType || undefined,
      dateFrom: filters.value.dateFrom || undefined,
      dateTo: filters.value.dateTo || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
      companyId: filterCompanyId, // ส่งเมื่อมีหลายบริษัทและเลือกแล้ว
    };

    const response = await vehiclesAPI.getAll(params);
    vehicles.value = response.data.data;
    pagination.value = response.data.pagination;

    // Debug: Check if WI_Sequence exists
    if (vehicles.value.length > 0) {
      console.log('🔍 [DEBUG] First vehicle WI_Sequence:', vehicles.value[0].WI_Sequence);
      console.log('🔍 [DEBUG] First vehicle keys:', Object.keys(vehicles.value[0]));
    }
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
  } finally {
    loading.value = false;
  }
};

const fetchCompanies = async () => {
  try {
    // ใช้ getAccessible พร้อม userId เพื่อให้ Backend ดึงบริษัทที่ User เข้าถึงได้
    const response = await companiesAPI.getAccessible(userId);
    console.log('[VehicleView] Fetched companies:', response.data.data);
    // Backend กรอง IC_IsActive = 1 ให้แล้ว ไม่ต้อง filter ซ้ำ
    companies.value = response.data.data || [];
    console.log('[VehicleView] Companies count:', companies.value.length);
    
    // ถ้ามีหลายบริษัท → แสดง dropdown
    // ถ้ามี 1 บริษัท → ไม่แสดง dropdown (จะใช้บริษัทนั้นอัตโนมัติ)
  } catch (error) {
    console.error('Error fetching companies:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายการบริษัทได้');
  }
};

const handleDateFilter = ({ dateFrom, dateTo }) => {
  filters.value.dateFrom = dateFrom;
  filters.value.dateTo = dateTo;
  // อัปเดต global filter store
  filterStore.setDateRange(dateFrom, dateTo);
  filterStore.persistToLocalStorage();
  pagination.value.page = 1;
  fetchVehicles();
};

// ติดตามการเปลี่ยนแปลง store จากหน้าอื่น
watch(() => filterStore.dateFrom, (newVal) => {
  if (newVal !== filters.value.dateFrom) {
    filters.value.dateFrom = newVal;
    pagination.value.page = 1;
    fetchVehicles();
  }
});

watch(() => filterStore.dateTo, (newVal) => {
  if (newVal !== filters.value.dateTo) {
    filters.value.dateTo = newVal;
    pagination.value.page = 1;
    fetchVehicles();
  }
});

const handleCompanyFilter = () => {
  pagination.value.page = 1;
  fetchVehicles();
};

// Real-time search with debounce
let searchTimeout = null;
const handleSearchInput = () => {
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Set new timeout (300ms delay)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchVehicles();
  }, 300);
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page;
    fetchVehicles();
  }
};

const openAddModal = () => {
  modalMode.value = 'add';
  formData.value = {
    id: null,
    licensePlate: '',
    licenseProvince: '',
    vehicleType: '',
    fullName: '',
    gender: '',
    address: '',
    follower: 0,
    remarks: '',
    companyId: null,
    departmentId: null,
    visitTypeId: null,
    fromCompany: '',
    contactName: '',
  };
  showModal.value = true;
};

const openEditModal = (vehicle) => {
  modalMode.value = 'edit';
  formData.value = {
    id: vehicle.WI_ID,
    licensePlate: vehicle.WI_LicensePlate,
    licenseProvince: vehicle.WI_LicenseProvince,
    vehicleType: vehicle.WI_VehicleType,
    fullName: vehicle.WI_FullName,
    gender: vehicle.WI_Gender,
    address: vehicle.WI_Address,
    follower: vehicle.WI_Follower || 0,
    remarks: vehicle.WI_Remarks,
    companyId: vehicle.IC_ID,
    departmentId: vehicle.ID_ID,
    visitTypeId: vehicle.VT_ID,
    fromCompany: vehicle.WI_FromCompany,
    contactName: vehicle.WI_ContactName,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = {};
};

const saveVehicle = async () => {
  if (!formData.value.licensePlate) {
    toast.warning('ข้อมูลไม่ครบ', 'กรุณากรอกทะเบียนรถ');
    return;
  }

  try {
    // ดึง companyId จาก localStorage (ถ้ายังไม่มีใน formData)
    const companyId = formData.value.companyId || localStorage.getItem('companyId');

    const data = {
      licensePlate: formData.value.licensePlate,
      licenseProvince: formData.value.licenseProvince,
      vehicleType: formData.value.vehicleType,
      fullName: formData.value.fullName,
      gender: formData.value.gender,
      address: formData.value.address,
      follower: formData.value.follower,
      remarks: formData.value.remarks,
      companyId: companyId ? parseInt(companyId) : null, // ใช้ companyId ของ user
      departmentId: formData.value.departmentId,
      visitTypeId: formData.value.visitTypeId,
      fromCompany: formData.value.fromCompany,
      contactName: formData.value.contactName,
      systemUserId: parseInt(localStorage.getItem('userId')) || 1,
    };

    if (modalMode.value === 'add') {
      await vehiclesAPI.create(data);
      toast.success('สำเร็จ', 'เพิ่มรถสำเร็จ');
    } else {
      await vehiclesAPI.update(formData.value.id, data);
      toast.success('สำเร็จ', 'แก้ไขข้อมูลสำเร็จ');
    }

    closeModal();
    fetchVehicles();
  } catch (error) {
    console.error('Error saving vehicle:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
  }
};

const confirmDelete = (vehicle) => {
  if (confirm(`ต้องการลบทะเบียนรถ ${vehicle.WI_LicensePlate} ใช่หรือไม่?`)) {
    deleteVehicle(vehicle.WI_ID);
  }
};

const deleteVehicle = async (id) => {
  try {
    await vehiclesAPI.delete(id);
    toast.success('สำเร็จ', 'ลบข้อมูลสำเร็จ');
    fetchVehicles();
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้');
  }
};

const openCheckoutModal = (vehicle) => {
  checkoutData.value = {
    vehicle: vehicle,
    remarks: '',
  };
  showCheckoutModal.value = true;
};

const closeCheckoutModal = () => {
  showCheckoutModal.value = false;
  checkoutData.value = { vehicle: null, remarks: '' };
};

const saveCheckout = async () => {
  try {
    await vehiclesAPI.checkout(checkoutData.value.vehicle.WI_ID, {
      remarks: checkoutData.value.remarks,
      systemUserId: 1,
    });
    toast.success('สำเร็จ', 'บันทึกรถออกสำเร็จ');
    closeCheckoutModal();
    fetchVehicles();
  } catch (error) {
    console.error('Error checking out vehicle:', error);
    toast.error('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถบันทึกรถออกได้');
  }
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';

  /**
   * BACKEND → FRONTEND DATETIME FORMAT (สำคัญมาก)
   *
   * - MSSQL เก็บค่าเป็น `datetime` (ไม่มี timezone) เช่น: 2026-01-23 15:15:47.677
   * - mssql driver ใน Node คืนค่าเป็น Date (local time ของ server)
   * - ตอนส่งมาที่ Frontend ผ่าน JSON/axios มันถูก serialize เป็น ISO string แบบมี 'Z'
   *     เช่น "2026-01-23T15:15:47.677Z"
   *   แต่ความหมายที่คุณต้องการคือ "15:15 น. ตามที่เห็นใน SSMS" ไม่ใช่ 22:15 (UTC+7)
   *
   * เพราะฉะนั้นฝั่ง Frontend เราต้อง "ตีความ string นี้เป็น local time ตรง ๆ"
   * โดยการตัด 'Z' ทิ้ง แล้วให้ new Date() มองว่าเป็นเวลา local
   */

  let date;

  if (typeof dateTime === 'string') {
    const clean = dateTime.endsWith('Z') ? dateTime.slice(0, -1) : dateTime;
    date = new Date(clean);
  } else {
    date = new Date(dateTime);
  }

  return date.toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ==================== REPRINT FUNCTIONS ====================

const fetchVisitTypes = async () => {
  try {
    const response = await wayinAPI.getVisitTypes();
    if (response.data.success) {
      visitTypes.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching visit types:', error);
  }
};

const openReprintModal = async (vehicle) => {
  console.log('[REPRINT] Vehicle data:', vehicle);
  console.log('[REPRINT] VT_ID:', vehicle.VT_ID);
  console.log('[REPRINT] VT_LocalName:', vehicle.VT_LocalName);
  console.log('[REPRINT] WI_Barcode:', vehicle.WI_Barcode);
  console.log('[REPRINT] IC_LogoPath:', vehicle.IC_LogoPath);
  console.log('[REPRINT] WO_RecordedOn:', vehicle.WO_RecordedOn);
  console.log('[REPRINT] CheckOutTime:', vehicle.CheckOutTime);
  console.log('[REPRINT] Backend Base URL:', getBackendBaseUrl());

  // Map WO_RecordedOn เป็น CheckOutTime เพื่อให้หน้ารีปริ้นแสดงเวลาออกได้
  const vehicleWithCheckout = {
    ...vehicle,
    CheckOutTime: vehicle.CheckOutTime || vehicle.WO_RecordedOn || null
  };

  reprintData.value = {
    vehicle: vehicleWithCheckout,
    visitTypeId: vehicle.VT_ID || null,
    qrCodeUrl: '',
    barcodeUrl: ''
  };

  // Generate QR Code (URL หรือเลขบาร์โค้ด ตาม VT_ID)
  try {
    // ใช้ visitTypeId จาก reprintData (อัพเดทจาก dropdown) หรือ vehicle.VT_ID
    const vtId = reprintData.value.visitTypeId || vehicle.VT_ID;
    const isUrlType = isQRUrlType(vtId);
    console.log('[REPRINT] Using VT_ID:', vtId);
    console.log('[REPRINT] isQRUrlType:', isUrlType);
    console.log('[REPRINT] REPRINT_CONFIG.QR_URL_TYPE_IDS:', REPRINT_CONFIG.QR_URL_TYPE_IDS);

    const qrData = isUrlType
      ? `${REPRINT_CONFIG.QR_URL_TEMPLATE}${vehicle.WI_Barcode}`
      : vehicle.WI_Barcode;

    console.log('[REPRINT] QR Data:', qrData);
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

const closeReprintModal = () => {
  showReprintModal.value = false;
  reprintData.value = { vehicle: null, visitTypeId: null, qrCodeUrl: '', barcodeUrl: '' };
};

const updateVisitType = async () => {
  try {
    if (!reprintData.value.visitTypeId) {
      toast.warning('ข้อมูลไม่ครบ', 'กรุณาเลือกประเภทการเข้า');
      return;
    }

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

    // อัพเดทข้อมูลใน reprintData เพื่อให้แสดงผลถูกต้อง
    reprintData.value.vehicle.VT_ID = reprintData.value.visitTypeId;
    const selectedVisitType = visitTypes.value.find(vt => vt.VT_ID === reprintData.value.visitTypeId);
    if (selectedVisitType) {
      reprintData.value.vehicle.VT_LocalName = selectedVisitType.VT_LocalName;
      reprintData.value.vehicle.VT_EnglishName = selectedVisitType.VT_EnglishName;
    }

    // อัพเดท QR Code ใหม่ตาม VT_ID ที่เลือก
    try {
      const isUrlType = isQRUrlType(reprintData.value.visitTypeId);
      const qrData = isUrlType
        ? `${REPRINT_CONFIG.QR_URL_TEMPLATE}${vehicle.WI_Barcode}`
        : vehicle.WI_Barcode;
      reprintData.value.qrCodeUrl = await QRCode.toDataURL(qrData, { width: 200 });
      console.log('[UPDATE] QR Code regenerated:', qrData);
    } catch (error) {
      console.error('Error regenerating QR code:', error);
    }

    fetchVehicles();
  } catch (error) {
    console.error('Error updating visit type:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถอัพเดทได้');
  }
};

const printSlip = async () => {
  try {
    // บันทึกเวลารีปริ้นก่อนพิมพ์
    const vehicle = reprintData.value.vehicle;
    if (vehicle && vehicle.WI_ID) {
      // ส่ง flag reprintOn: true เพื่อให้ backend ใช้ GETDATE() ของ SQL Server
      // ไม่ต้องส่งเวลาจาก Browser เพราะ backend จะใช้เวลาจาก SQL Server โดยตรง
      console.log('[REPRINT] Saving reprint timestamp:', {
        vehicleId: vehicle.WI_ID,
        willUse: 'SQL Server GETDATE() (current server time)',
        vehicleData: vehicle
      });

      // อัพเดท WI_ReprintOn โดยไม่เปลี่ยนข้อมูลอื่น
      // ส่ง reprintOn: true เพื่อให้ backend ใช้ GETDATE() ของ SQL Server
      const response = await wayinAPI.update(vehicle.WI_ID, {
        reprintOn: true
      });

      console.log('[REPRINT] API Response:', response);
      console.log('[REPRINT] Reprint timestamp saved successfully');
      
      // อัพเดทข้อมูลใน reprintData เพื่อให้แสดงผลถูกต้อง
      // ใช้ค่าจาก response ที่ backend ส่งกลับมา (ซึ่งเป็นเวลาจาก SQL Server GETDATE())
      if (response.data && response.data.data && response.data.data.WI_ReprintOn) {
        reprintData.value.vehicle.WI_ReprintOn = response.data.data.WI_ReprintOn;
      }
      
      // อัพเดทข้อมูลใน vehicles list และ refresh ข้อมูล
      const vehicleIndex = vehicles.value.findIndex(v => v.WI_ID === vehicle.WI_ID);
      if (vehicleIndex !== -1) {
        vehicles.value[vehicleIndex].WI_ReprintOn = reprintData.value.vehicle.WI_ReprintOn;
      }
      
      // แสดง success message
      toast.success('สำเร็จ', 'บันทึกเวลารีปริ้นสำเร็จ');
    }

    // พิมพ์หลังจากบันทึกสำเร็จ
    setTimeout(() => {
      window.print();
    }, 100);
  } catch (error) {
    console.error('[REPRINT] Error saving reprint timestamp:', error);
    console.error('[REPRINT] Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    // แสดง error แต่ยังพิมพ์ได้ (ไม่ block การพิมพ์)
    toast.error('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถบันทึกเวลารีปริ้นได้ แต่ยังสามารถพิมพ์ได้');
    // พิมพ์ต่อไปแม้บันทึกไม่สำเร็จ
    setTimeout(() => {
      window.print();
    }, 100);
  }
};

const fetchVehicleTypes = async () => {
  try {
    const response = await vehicleTypesAPI.getAll(true);
    if (response.data.success) {
      vehicleTypes.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
  }
};

onMounted(() => {
  // โหลด stored filters จาก localStorage
  filterStore.initializeFromLocalStorage();
  filters.value.dateFrom = filterStore.dateFrom;
  filters.value.dateTo = filterStore.dateTo;

  fetchCompanies();
  fetchVehicles();
  fetchVehicleTypes();
  if (canReprint.value) {
    fetchVisitTypes();
  }
});
</script>

<style>
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

/* ============================================
   Filters Row Layout
   ============================================ */

.filters-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.date-filter-wrapper {
  flex: 1;
}

.company-filter-wrapper {
  min-width: 200px;
  max-width: 250px;
}

/* Company Filter Inline */
.company-select-inline {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
  color: #475569;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  height: 44px;
}

.company-select-inline:hover {
  border-color: #cbd5e1;
}

.company-select-inline:focus {
  outline: none;
  border-color: #0B4F6C;
  box-shadow: 0 0 0 3px rgba(11, 79, 108, 0.1);
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    gap: 1rem;
  }

  .company-filter-wrapper {
    min-width: 100%;
    max-width: 100%;
  }
}

/* ============================================
   Browser Modal Styles
   ============================================ */

/* Browser Modal Container */
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

/* Browser Tabs Header - Default Blue */
.tabs-head {
  background: #0D47A1;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 8px;
}

/* Green variant for checkout */
.tabs-head-green {
  background: #2E7D32 !important;
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

.tabs-head-green .tab-open {
  background-color: #43A047 !important;
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

.head-browser-green {
  background-color: #43A047 !important;
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
  padding: 32px;
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Responsive - page-title moved to theme-variables.css */

/* ============================================
   80mm Thermal Printer Slip Styles
   ============================================ */

/* Print Slip Preview Container */
.print-slip-preview {
  background: #f5f5f5 !important;
  box-shadow: inset 0 0 20px rgba(8, 0, 0, 0.15) !important;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px !important;
}

/* Preview slip (shown in modal) */
.slip-80mm {
  width: 80mm;
  padding: 10mm;
  background: white;
  font-family: 'Courier New', monospace;
  border: 2px solid #ddd;
  box-shadow: 0 8px 16px rgba(15, 15, 15, 0.3), 0 0 0 1px #ccc;
  border-radius: 4px;
}

/* Print-only slip (actual print output) */
.slip-80mm-print {
  width: 80mm;
  padding: 5mm;
  background: white;
  font-family: 'Courier New', monospace;
}

/* Print media query for 80mm thermal printer */
@media print {
  @page {
    size: 80mm auto;
    margin: 0;
  }

  * {
    margin: 0 !important;
    padding: 0 !important;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
  }

  body * {
    visibility: hidden;
  }

  .slip-80mm-print,
  .slip-80mm-print * {
    visibility: visible;
  }

  .slip-80mm-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    margin: 0 !important;
    padding: 5mm !important;
  }

  /* ซ่อน modal และองค์ประกอบอื่นๆ */
  .fixed,
  .browser-modal,
  button,
  header,
  nav,
  aside,
  .print\\:hidden {
    display: none !important;
    visibility: hidden !important;
  }
}
</style>
