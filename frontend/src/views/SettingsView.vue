<template>
  <!-- Main Container - Tailwind Only -->
  <div class="w-full max-w-full animate-fadeIn">

    <!-- Page Header - Tailwind with Animation -->
    <div class="mb-6 animate-slideDown">
      <h1 class="page-title">ตั้งค่า</h1>
      <p class="m-0 text-lg font-medium text-slate-500 font-prompt">จัดการบริษัท ผู้ใช้งาน และแผนก</p>
    </div>

    <!-- Company Selector - Tailwind + Custom Dropdown CSS with Animation -->
    <div v-if="accessibleCompanies.length > 0" class="flex items-center gap-4 py-4 mb-8 animate-slideUp" style="position: relative; z-index: 9999;">
      <div class="flex items-center gap-2 text-sm font-semibold text-gray-800 whitespace-nowrap">
        <svg class="w-[18px] h-[18px] stroke-[#0090D3] flex-shrink-0 transition-transform duration-300 hover:scale-110" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span class="text-gray-800">เลือกบริษัท:</span>
      </div>

      <div class="select" :class="{ open: isDropdownOpen }">
        <div class="selected" :data-selected="getSelectedCompanyName()" @click="toggleDropdown">
          <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" class="arrow">
            <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
          </svg>
        </div>
        <div class="options" v-show="isDropdownOpen">
          <div v-for="company in accessibleCompanies" :key="company.IC_ID" :title="company.IC_LocalName">
            <input
              :id="`company-${company.IC_ID}`"
              name="company-option"
              type="radio"
              :value="company.IC_ID"
              v-model="selectedCompanyId"
              @change="onCompanyChange"
              :checked="company.IC_ID === selectedCompanyId"
            />
            <label class="option" :for="`company-${company.IC_ID}`" :data-txt="`${company.IC_LocalName} (${company.IC_Code})`"></label>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Content - Tailwind with Animation -->
    <div class="w-full animate-scaleIn">
      <BaseTabs v-model="activeTab" :tabs="tabs">

        <!-- TAB: ทั่วไป -->
        <template #general>
          <GeneralSettings :companyId="selectedCompanyId" :key="selectedCompanyId" />
        </template>

        <!-- TAB: รูปแบบ -->
        <template #appearance>
          <AppearanceSettings :companyId="selectedCompanyId" :key="selectedCompanyId" />
        </template>

        <!-- TAB: ความปลอดภัย -->
        <template #security>
          <SecuritySettings :companyId="selectedCompanyId" :key="selectedCompanyId" />
        </template>

        <!-- TAB: จัดการบริษัท -->
        <template #companies>
          <BaseCard>
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-semibold text-[#1a202c]">รายการบริษัท</h2>
                <p class="mt-1 text-base text-gray-500">จัดการข้อมูลบริษัทในระบบ</p>
              </div>
              <div class="flex gap-3">
                <BaseButton @click="openReorderModal" variant="secondary">
                  <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  จัดลำดับบริษัท
                </BaseButton>
                <BaseButton @click="openCompanyModal" variant="primary">
                  <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  เพิ่มบริษัท
                </BaseButton>
              </div>
            </div>

            <BaseTable :columns="companyColumns" :data="companies" :loading="companyLoading">
              <template #cell-Company_Sequence="{ value }">
                <span class="text-gray-900">{{ value || '-' }}</span>
              </template>

              <template #cell-IC_IsActive="{ value }">
                <span :class="value ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'" class="px-3 py-1.5 rounded-full text-sm font-semibold">
                  {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                </span>
              </template>

              <template #actions="{ row }">
                <div class="flex justify-end gap-2">
                  <button @click="editCompany(row)" class="text-[#0090D3] hover:text-[#007AB8] transition-colors" title="แก้ไข">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteCompany(row)" class="text-red-600 transition-colors hover:text-red-800" title="ลบ">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </template>
            </BaseTable>
          </BaseCard>
        </template>

        <!-- TAB: จัดการผู้ใช้งาน -->
        <template #users>
          <BaseCard>
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-semibold text-[#1a202c]">รายการผู้ใช้งาน</h2>
                <p class="mt-1 text-base text-gray-500">จัดการข้อมูลผู้ใช้งานในระบบ</p>
              </div>
              <BaseButton @click="openUserModal" variant="primary">
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มผู้ใช้งาน
              </BaseButton>
            </div>

            <BaseTable :columns="userColumns" :data="users" :loading="userLoading">
              <template #cell-SU_Active="{ value }">
                <span :class="value ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'" class="px-3 py-1.5 rounded-full text-sm font-semibold">
                  {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                </span>
              </template>

              <template #actions="{ row }">
                <div class="flex justify-end gap-2">
                  <button @click="openPasswordModal(row)" class="transition-colors text-amber-600 hover:text-amber-800" title="เปลี่ยนรหัสผ่าน">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>
                  <button @click="editUser(row)" class="text-[#0090D3] hover:text-[#007AB8] transition-colors" title="แก้ไข">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteUser(row)" class="text-red-600 transition-colors hover:text-red-800" title="ลบ">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </template>
            </BaseTable>
          </BaseCard>
        </template>

        <!-- TAB: จัดการแผนก -->
        <template #departments>
          <BaseCard>
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-semibold text-[#1a202c]">โครงสร้างแผนก</h2>
                <p class="mt-1 text-base text-gray-500">จัดการโครงสร้างแผนกแบบ Tree ตามบริษัท</p>
              </div>
              <BaseButton variant="primary" @click="openDepartmentModal">
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มแผนก
              </BaseButton>
            </div>

            <!-- Company Tree List -->
            <div v-if="companyLoading" class="flex items-center justify-center py-12">
              <svg class="animate-spin h-8 w-8 text-[#0090D3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="ml-3 text-gray-600 font-prompt">กำลังโหลดบริษัท...</span>
            </div>

            <div v-else-if="!companies || companies.length === 0" class="py-12 text-center text-gray-500 font-prompt">
              <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p>ไม่มีข้อมูลบริษัท</p>
            </div>

            <div v-else class="space-y-4">
              <CompanyTreeNode
                v-for="company in companies"
                :key="company.IC_ID"
                :company="company"
                @add-child="handleAddChild"
                @edit="handleEditDepartment"
                @move="handleMoveDepartment"
                @delete="handleDeleteDepartment"
                @add-department="handleAddDepartmentForCompany"
              />
            </div>
          </BaseCard>
        </template>

        <!-- TAB: จัดการประเภทรถ -->
        <template #vehicleTypes>
          <VehicleTypeSettings />
        </template>
      </BaseTabs>
    </div>

    <!-- MODAL: บริษัท -->
    <BaseModal :show="companyModal.show" :title="companyModal.title" @close="closeCompanyModal" size="lg">
      <div class="space-y-4">
        <BaseInput v-model="companyForm.code" label="รหัสบริษัท" placeholder="เช่น RC, MRG" required />
        <BaseInput v-model="companyForm.localName" label="ชื่อบริษัท (ไทย)" placeholder="เช่น บริษัท รักชัยห้องเย็น จำกัด" required />
        <BaseInput v-model="companyForm.englishName" label="ชื่อบริษัท (อังกฤษ)" placeholder="เช่น Ruxchai Cold Storage" />
        <div>
          <label class="flex items-center">
            <input v-model="companyForm.isActive" type="checkbox" class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]" />
            <span class="ml-2 text-sm text-gray-700">ใช้งาน</span>
          </label>
        </div>
        <BaseInput v-model="companyForm.remarks" label="หมายเหตุ" placeholder="หมายเหตุเพิ่มเติม" />
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="closeCompanyModal">ยกเลิก</BaseButton>
          <BaseButton variant="primary" @click="saveCompany" :loading="companySaving">
            {{ companyModal.isEdit ? 'บันทึก' : 'สร้าง' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- MODAL: จัดลำดับบริษัท -->
    <BaseModal :show="reorderModal.show" title="จัดลำดับบริษัท" @close="closeReorderModal" size="lg">
      <div class="mb-4">
        <p class="text-sm text-gray-600 font-prompt">
          <svg class="inline w-4 h-4 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ลากและวางเพื่อจัดลำดับบริษัท
        </p>
      </div>

      <div ref="scrollContainer" class="space-y-2 max-h-[500px] overflow-y-auto">
        <div
          v-for="(company, index) in reorderList"
          :key="company.IC_ID"
          :draggable="true"
          @dragstart="handleDragStart($event, index)"
          @dragover.prevent="handleDragOver($event, index)"
          @drag="handleDrag"
          @drop="handleDrop($event, index)"
          @dragend="handleDragEnd"
          class="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg cursor-move hover:border-[#0090D3] hover:shadow-md transition-all"
          :class="{ 'opacity-50': draggedIndex === index, 'border-[#0090D3] bg-blue-50': dragOverIndex === index }"
        >
          <!-- Drag Handle Icon -->
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
          </svg>

          <!-- Sequence Number -->
          <div class="flex items-center justify-center w-8 h-8 bg-[#0090D3] text-white rounded-full font-bold text-sm flex-shrink-0">
            {{ index + 1 }}
          </div>

          <!-- Company Info -->
          <div class="flex-1">
            <div class="font-semibold text-gray-900 font-prompt">{{ company.IC_LocalName }}</div>
            <div class="text-sm text-gray-500 font-prompt">{{ company.IC_Code }}</div>
          </div>

          <!-- Status Badge -->
          <span
            :class="company.IC_IsActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
            class="px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0"
          >
            {{ company.IC_IsActive ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
          </span>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="closeReorderModal">ยกเลิก</BaseButton>
          <BaseButton variant="primary" @click="saveReorder" :loading="reorderSaving">
            บันทึกลำดับ
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- MODAL: ผู้ใช้งาน -->
    <BaseModal :show="userModal.show" :title="userModal.title" @close="closeUserModal" size="lg">
      <div class="space-y-4">
        <!-- เลือกบริษัท (สำหรับ Super Admin เท่านั้น) -->
        <div v-if="isMainAdmin">
          <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
            บริษัท <span class="text-red-500">*</span>
          </label>
          <select
            v-model="userForm.companyId"
            class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
            required
          >
            <option value="">เลือกบริษัท</option>
            <option v-for="company in companies" :key="company.IC_ID" :value="company.IC_ID">
              {{ company.IC_LocalName }} ({{ company.IC_Code }})
            </option>
          </select>
        </div>

        <BaseInput v-model="userForm.code" label="รหัสพนักงาน" placeholder="เช่น 100001" required />
        <BaseInput v-model="userForm.name1" label="ชื่อ (ไทย)" placeholder="เช่น นายสมชาย ใจดี" required />
        <BaseInput v-model="userForm.name2" label="ชื่อ (อังกฤษ)" placeholder="เช่น Mr. Somchai Jaidee" />
        <BaseInput v-model="userForm.username" label="Username" placeholder="ชื่อผู้ใช้สำหรับเข้าสู่ระบบ" required />
        <BaseInput v-if="!userModal.isEdit" v-model="userForm.password" label="Password" type="password" placeholder="รหัสผ่าน" required />
        <BaseInput v-model="userForm.email" label="Email" type="email" placeholder="email@example.com" />
        <div>
          <label class="flex items-center">
            <input v-model="userForm.active" type="checkbox" class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]" />
            <span class="ml-2 text-sm text-gray-700">ใช้งาน</span>
          </label>
        </div>
        <BaseInput v-model="userForm.remarks" label="หมายเหตุ" placeholder="หมายเหตุเพิ่มเติม" />
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="closeUserModal">ยกเลิก</BaseButton>
          <BaseButton variant="primary" @click="saveUser" :loading="userSaving">
            {{ userModal.isEdit ? 'บันทึก' : 'สร้าง' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- MODAL: แผนก -->
    <BaseModal :show="departmentModal.show" :title="departmentModal.title" @close="closeDepartmentModal" size="lg">
      <div class="space-y-4">
        <!-- Company Selection -->
        <div>
          <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
            บริษัท <span class="text-red-500">*</span>
          </label>
          <select
            v-model="departmentForm.companyIds[0]"
            class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
            required
            :disabled="departmentModal.isEdit || departmentModal.isAddChild"
          >
            <option value="">เลือกบริษัท</option>
            <option v-for="company in companies" :key="company.IC_ID" :value="company.IC_ID">
              {{ company.IC_LocalName }} ({{ company.IC_Code }})
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500" v-if="!departmentModal.isEdit && !departmentModal.isAddChild">
            เลือกบริษัทที่ต้องการเพิ่มแผนก
          </p>
          <p class="mt-1 text-xs text-gray-500" v-else>
            ไม่สามารถเปลี่ยนบริษัทได้เมื่อแก้ไข
          </p>
        </div>

        <BaseInput v-model="departmentForm.code" label="รหัสแผนก" placeholder="เช่น IT, HR, CS" required />
        <BaseInput v-model="departmentForm.localName" label="ชื่อแผนก (ไทย)" placeholder="เช่น ฝ่ายเทคโนโลยีสารสนเทศ" required />
        <BaseInput v-model="departmentForm.englishName" label="ชื่อแผนก (อังกฤษ)" placeholder="เช่น Information Technology" />

        <!-- Type Selection -->
        <div>
          <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
            ประเภท <span class="text-red-500">*</span>
          </label>
          <select
            v-model="departmentForm.type"
            class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
            required
          >
            <option value="branch">สาขา (Branch)</option>
            <option value="office">สำนัก (Office)</option>
            <option value="department">แผนก (Department)</option>
          </select>
        </div>

        <!-- Parent Selection -->
        <div>
          <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
            แผนกหลัก (Parent)
          </label>

          <!-- Warning: ต้องเลือกบริษัทก่อน -->
          <div v-if="!departmentForm.companyIds || !departmentForm.companyIds[0]" class="p-3 border rounded-lg bg-amber-50 border-amber-200">
            <p class="flex items-center gap-2 text-sm text-amber-800 font-prompt">
              <svg class="flex-shrink-0 w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              กรุณาเลือกบริษัทก่อนเพื่อดูรายการแผนกหลักที่สามารถเลือกได้
            </p>
          </div>

          <!-- Dropdown (แสดงเมื่อเลือกบริษัทแล้ว) -->
          <select
            v-else
            v-model="departmentForm.parentId"
            class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
          >
            <option :value="null">ไม่มี (Root Level - แผนกอิสระ)</option>
            <option v-for="dept in availableParents" :key="dept.ID_ID" :value="dept.ID_ID">
              {{ dept.ID_LocalName }} ({{ dept.ID_Code }})
            </option>
          </select>

          <!-- Dynamic Help Text based on Type (แสดงเมื่อเลือกบริษัทแล้ว) -->
          <div v-if="departmentForm.companyIds && departmentForm.companyIds[0]" class="p-4 mt-3 border border-blue-200 rounded-lg bg-blue-50 shadow-sm">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="text-sm text-blue-800 font-prompt leading-relaxed">
                  <span v-if="departmentForm.type === 'office'">
                    <strong class="font-semibold text-blue-900">กฎสำนัก:</strong> สามารถเป็น Root (ไม่มี Parent) หรือ อยู่ภายใต้สำนักอื่นได้
                  </span>
                  <span v-else-if="departmentForm.type === 'branch'">
                    <strong class="font-semibold text-blue-900">กฎสาขา:</strong> สามารถเป็น Root ได้ หรือเลือก Parent เป็นสำนัก (Office) เพื่อจัดโครงสร้าง Tree
                  </span>
                  <span v-else-if="departmentForm.type === 'department'">
                    <strong class="font-semibold text-blue-900">กฎแผนก:</strong> สามารถเป็น Root ได้ หรือเลือก Parent เป็นสาขา (Branch) เพื่อจัดโครงสร้าง Tree
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="flex items-center">
            <input v-model="departmentForm.isActive" type="checkbox" class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]" />
            <span class="ml-2 text-sm text-gray-700">ใช้งาน</span>
          </label>
        </div>
        <BaseInput v-model="departmentForm.remarks" label="หมายเหตุ" placeholder="หมายเหตุเพิ่มเติม" />
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="closeDepartmentModal">ยกเลิก</BaseButton>
          <BaseButton variant="primary" @click="saveDepartment" :loading="departmentSaving">
            {{ departmentModal.isEdit ? 'บันทึก' : 'สร้าง' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- MODAL: เปลี่ยนรหัสผ่าน -->
    <BaseModal :show="passwordModal.show" :title="passwordModal.title" @close="closePasswordModal" size="md">
      <!-- แสดงข้อมูล User -->
      <div class="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div class="flex items-center gap-3 mb-2">
          <svg class="w-12 h-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <p class="text-lg font-semibold text-gray-800">{{ passwordForm.name }}</p>
            <p class="text-sm text-gray-600">{{ passwordForm.username }}</p>
            <p class="text-xs text-gray-500">{{ passwordForm.companyName }}</p>
          </div>
        </div>
      </div>

      <!-- Warning Message -->
      <div class="flex items-start gap-2 p-3 mb-4 border rounded-lg bg-amber-50 border-amber-200">
        <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-sm text-amber-800">ผู้ใช้งานจะต้อง Login ใหม่ด้วยรหัสผ่านที่เปลี่ยนแล้ว</p>
      </div>

      <!-- Password Fields -->
      <div class="space-y-4">
        <div>
          <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
            รหัสผ่านใหม่ <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="passwordForm.newPassword"
              :type="showPassword ? 'text' : 'password'"
              class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt pr-12"
              placeholder="รหัสผ่านใหม่ (8+ ตัว, A-Z, a-z, 0-9)"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
            >
              <svg v-if="!showPassword" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500">ต้องมีอย่างน้อย 8 ตัวอักษร, ตัวพิมพ์ใหญ่ (A-Z), ตัวพิมพ์เล็ก (a-z), และตัวเลข (0-9)</p>
        </div>

        <div>
          <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
            ยืนยันรหัสผ่าน <span class="text-red-500">*</span>
          </label>
          <input
            v-model="passwordForm.confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
            placeholder="ยืนยันรหัสผ่านใหม่"
            required
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="closePasswordModal">ยกเลิก</BaseButton>
          <BaseButton variant="primary" @click="changePassword" :loading="passwordChanging">
            เปลี่ยนรหัสผ่าน
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- MODAL: ย้ายแผนก -->
    <BaseModal :show="moveModal.show" title="ย้ายแผนก" @close="closeMoveModal" size="md">
      <!-- แสดงข้อมูลแผนกที่จะย้าย -->
      <div class="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div class="flex items-center gap-3">
          <svg class="w-10 h-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <div>
            <p class="text-lg font-semibold text-gray-800 font-prompt">{{ moveModal.departmentName }}</p>
            <p class="text-sm text-gray-600 font-prompt">กำลังย้ายแผนกนี้</p>
          </div>
        </div>
      </div>

      <!-- Warning Message -->
      <div class="flex items-start gap-2 p-3 mb-4 border rounded-lg bg-amber-50 border-amber-200">
        <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-sm text-amber-800 font-prompt">การย้ายแผนกจะเปลี่ยนโครงสร้างองค์กร</p>
      </div>

      <!-- Parent Selection -->
      <div>
        <label class="block mb-2 text-base font-semibold text-gray-700 font-prompt">
          ย้ายไปอยู่ภายใต้ Parent ใหม่ <span class="text-red-500">*</span>
        </label>
        <select
          v-model="newParentId"
          class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0090D3] focus:border-transparent transition-all font-prompt"
          required
        >
          <option :value="null">ไม่มี (Root Level)</option>
          <option v-for="dept in availableParentsForMove" :key="dept.ID_ID" :value="dept.ID_ID">
            {{ dept.ID_LocalName }} ({{ dept.ID_Code }})
          </option>
        </select>
        <p class="mt-1 text-xs text-gray-500 font-prompt">เลือกแผนกที่จะเป็น Parent ใหม่</p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="closeMoveModal">ยกเลิก</BaseButton>
          <BaseButton variant="primary" @click="saveMove" :loading="departmentSaving">
            ย้ายแผนก
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import BaseTabs from '../components/base/BaseTabs.vue';
import BaseCard from '../components/base/BaseCard.vue';
import BaseTable from '../components/base/BaseTable.vue';
import BaseButton from '../components/base/BaseButton.vue';
import BaseInput from '../components/base/BaseInput.vue';
import BaseModal from '../components/base/BaseModal.vue';
import GeneralSettings from '../components/settings/GeneralSettings.vue';
import AppearanceSettings from '../components/settings/AppearanceSettings.vue';
import SecuritySettings from '../components/settings/SecuritySettings.vue';
import VehicleTypeSettings from '../components/settings/VehicleTypeSettings.vue';
import CompanyTreeNode from '../components/settings/CompanyTreeNode.vue';
import { companiesAPI, usersAPI, departmentsAPI, systemSettingsAPI } from '../services/api';
import { useTheme } from '@/composables/useTheme';
import { useNotification } from '@/composables/useNotification';
import { useToast } from '@/composables/useToast';

// ==================== Notification ====================
const { success, error, warning, info } = useNotification();
const toast = useToast();

// ==================== Company Selection ====================
const accessibleCompanies = ref([]);
const selectedCompanyId = ref(null);
const isDropdownOpen = ref(false);

const fetchAccessibleCompanies = async () => {
  try {
    const userId = localStorage.getItem('userId');
    console.log('[FETCH] Fetching companies for userId:', userId);

    const response = await systemSettingsAPI.getAccessibleCompanies(userId);
    console.log('[DATA] Accessible Companies Response:', response.data);
    accessibleCompanies.value = response.data.data;

    if (accessibleCompanies.value.length > 0) {
      selectedCompanyId.value = accessibleCompanies.value[0].IC_ID;
      console.log('[INFO] Selected Company ID:', selectedCompanyId.value);
      console.log('[DATA] Accessible Companies:', accessibleCompanies.value);
    } else {
      console.warn('[INFO] No accessible companies found!');
    }
  } catch (error) {
    console.error('[ERROR] Error fetching accessible companies:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายการบริษัทได้');
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const onCompanyChange = () => {
  console.log('[UPDATE] Selected company changed to:', selectedCompanyId.value);
  isDropdownOpen.value = false;
};

const getSelectedCompanyName = () => {
  const company = accessibleCompanies.value.find(c => c.IC_ID === selectedCompanyId.value);
  return company ? `${company.IC_LocalName} (${company.IC_Code})` : 'เลือกบริษัท';
};

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.select');
  if (dropdown && !dropdown.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

// ==================== Tab State ====================
const activeTab = ref('general');
const isMainAdmin = ref(false);

const checkIsMainAdmin = () => {
  const companyId = localStorage.getItem('companyId');
  // Super Admin: companyId = null, 'null', undefined, หรือ ''
  isMainAdmin.value = !companyId || companyId === 'null' || companyId === 'undefined';
  console.log('[USER] Is Super Admin:', isMainAdmin.value, '(Company ID:', companyId, ')');
};

const tabs = computed(() => {
  if (isMainAdmin.value) {
    // Super Admin: Show General, Appearance, Security, Companies, Users, Departments, Vehicle Types
    return [
      { key: 'general', label: 'ทั่วไป', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      { key: 'appearance', label: 'รูปแบบ', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
      { key: 'security', label: 'ความปลอดภัย', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
      { key: 'companies', label: 'จัดการบริษัท', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { key: 'users', label: 'จัดการผู้ใช้งาน', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { key: 'departments', label: 'จัดการแผนก', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      { key: 'vehicleTypes', label: 'จัดการประเภทรถ', icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' },
    ];
  } else {
    // Company Admin: Show General, Appearance, Security only
    return [
      { key: 'general', label: 'ทั่วไป', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      { key: 'appearance', label: 'รูปแบบ', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
      { key: 'security', label: 'ความปลอดภัย', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    ];
  }
});

// ==================== บริษัท (Companies) ====================
const companies = ref([]);
const companyLoading = ref(false);
const companySaving = ref(false);
const companyModal = ref({ show: false, isEdit: false, title: '', id: null });
const companyForm = ref({ code: '', localName: '', englishName: '', isActive: true, remarks: '' });

const companyColumns = [
  { key: 'Company_Sequence', label: 'ลำดับ' },
  { key: 'IC_Code', label: 'รหัส' },
  { key: 'IC_LocalName', label: 'ชื่อบริษัท (ไทย)' },
  { key: 'IC_EnglishName', label: 'ชื่อบริษัท (EN)' },
  { key: 'IC_IsActive', label: 'สถานะ' },
  { key: 'IC_Remarks', label: 'หมายเหตุ' },
];

const fetchCompanies = async () => {
  companyLoading.value = true;
  try {
    const response = await companiesAPI.getAll();
    companies.value = response.data.data;
  } catch (error) {
    console.error('Error:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลบริษัทได้');
  } finally {
    companyLoading.value = false;
  }
};

const openCompanyModal = () => {
  companyModal.value = { show: true, isEdit: false, title: 'เพิ่มบริษัทใหม่', id: null };
  companyForm.value = { code: '', localName: '', englishName: '', isActive: true, remarks: '' };
};

const editCompany = (row) => {
  companyModal.value = { show: true, isEdit: true, title: 'แก้ไขบริษัท', id: row.IC_ID };
  companyForm.value = {
    code: row.IC_Code,
    localName: row.IC_LocalName,
    englishName: row.IC_EnglishName,
    isActive: row.IC_IsActive,
    remarks: row.IC_Remarks || ''
  };
};

const closeCompanyModal = () => {
  companyModal.value.show = false;
};

const saveCompany = async () => {
  companySaving.value = true;
  try {
    const payload = {
      code: companyForm.value.code,
      localName: companyForm.value.localName,
      englishName: companyForm.value.englishName,
      isActive: companyForm.value.isActive,
      remarks: companyForm.value.remarks
    };

    if (companyModal.value.isEdit) {
      await companiesAPI.update(companyModal.value.id, payload);
      toast.success('สำเร็จ', 'บันทึกข้อมูลบริษัทสำเร็จ');
    } else {
      await companiesAPI.create(payload);
      toast.success('สำเร็จ', 'สร้างบริษัทใหม่สำเร็จ');
    }
    closeCompanyModal();
    fetchCompanies();
  } catch (error) {
    console.error('Error:', error);
    toast.error('เกิดข้อผิดพลาด', error.response?.data?.message || error.message);
  } finally {
    companySaving.value = false;
  }
};

const deleteCompany = async (row) => {
  if (!confirm(`ต้องการลบบริษัท "${row.IC_LocalName}" ใช่หรือไม่?`)) return;
  try {
    await companiesAPI.delete(row.IC_ID);
    toast.success('สำเร็จ', 'ลบบริษัทสำเร็จ');
    fetchCompanies();
  } catch (error) {
    console.error('Error:', error);
    toast.error('เกิดข้อผิดพลาด', error.response?.data?.message || error.message);
  }
};

// ==================== จัดลำดับบริษัท (Reorder) ====================
const reorderModal = ref({ show: false });
const reorderList = ref([]);
const reorderSaving = ref(false);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

const openReorderModal = () => {
  // Copy companies array เพื่อจัดลำดับ
  reorderList.value = JSON.parse(JSON.stringify(companies.value));
  reorderModal.value.show = true;
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const closeReorderModal = () => {
  reorderModal.value.show = false;
  reorderList.value = [];
};

const handleDragStart = (event, index) => {
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target.innerHTML);
};

const handleDragOver = (event, index) => {
  event.preventDefault();
  dragOverIndex.value = index;
};

const handleDrop = (event, dropIndex) => {
  event.preventDefault();

  const dragIndex = draggedIndex.value;
  if (dragIndex === null || dragIndex === dropIndex) return;

  // Swap items
  const draggedItem = reorderList.value[dragIndex];
  reorderList.value.splice(dragIndex, 1);
  reorderList.value.splice(dropIndex, 0, draggedItem);

  dragOverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const saveReorder = async () => {
  reorderSaving.value = true;
  try {
    // สร้าง array ของ { id, sequence } สำหรับส่งไป backend
    const updates = reorderList.value.map((company, index) => ({
      id: company.IC_ID,
      sequence: index + 1
    }));

    // เรียก API batch update
    await companiesAPI.batchUpdateSequences(updates);

    toast.success('สำเร็จ', 'บันทึกลำดับบริษัทสำเร็จ');
    closeReorderModal();
    fetchCompanies(); // Refresh ข้อมูล
  } catch (error) {
    console.error('Error saving reorder:', error);
    toast.error('เกิดข้อผิดพลาด', error.response?.data?.message || error.message);
  } finally {
    reorderSaving.value = false;
  }
};

// ==================== ผู้ใช้งาน (Users) ====================
const users = ref([]);
const userLoading = ref(false);
const userSaving = ref(false);
const userModal = ref({ show: false, isEdit: false, title: '', id: null });
const userForm = ref({ code: '', name1: '', name2: '', username: '', password: '', email: '', active: true, remarks: '', companyId: null });

const userColumns = computed(() => {
  if (isMainAdmin.value) {
    return [
      { key: 'SU_Code', label: 'รหัส' },
      { key: 'SU_Name1', label: 'ชื่อ (ไทย)' },
      { key: 'CompanyName', label: 'บริษัท' },
      { key: 'SU_Username', label: 'Username' },
      { key: 'SU_Email', label: 'Email' },
      { key: 'SU_Active', label: 'สถานะ' },
    ];
  } else {
    return [
      { key: 'SU_Code', label: 'รหัส' },
      { key: 'SU_Name1', label: 'ชื่อ (ไทย)' },
      { key: 'SU_Username', label: 'Username' },
      { key: 'SU_Email', label: 'Email' },
      { key: 'SU_Active', label: 'สถานะ' },
    ];
  }
});

const fetchUsers = async () => {
  userLoading.value = true;
  try {
    const response = await usersAPI.getAll();
    users.value = response.data.data;
  } catch (error) {
    console.error('Error:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้');
  } finally {
    userLoading.value = false;
  }
};

const openUserModal = () => {
  userModal.value = { show: true, isEdit: false, title: 'เพิ่มผู้ใช้งานใหม่', id: null };
  // ถ้าไม่ใช่ Super Admin ให้ใช้ company ของตัวเอง
  const defaultCompanyId = isMainAdmin.value ? null : selectedCompanyId.value;
  userForm.value = { code: '', name1: '', name2: '', username: '', password: '', email: '', active: true, remarks: '', companyId: defaultCompanyId };
};

const editUser = (row) => {
  userModal.value = { show: true, isEdit: true, title: 'แก้ไขผู้ใช้งาน', id: row.SU_ID };
  userForm.value = {
    code: row.SU_Code,
    name1: row.SU_Name1,
    name2: row.SU_Name2,
    username: row.SU_Username,
    password: '',
    email: row.SU_Email || '',
    active: row.SU_Active,
    remarks: row.SU_Remarks || '',
    companyId: row.IC_ID || null
  };
};

const closeUserModal = () => {
  userModal.value.show = false;
};

const saveUser = async () => {
  // Validation: ถ้าเป็น Super Admin ต้องเลือกบริษัท
  if (isMainAdmin.value && !userForm.value.companyId) {
    toast.warning('ข้อมูลไม่ครบ', 'กรุณาเลือกบริษัท');
    return;
  }

  userSaving.value = true;
  try {
    const payload = {
      code: userForm.value.code,
      name1: userForm.value.name1,
      name2: userForm.value.name2,
      username: userForm.value.username,
      email: userForm.value.email,
      active: userForm.value.active,
      remarks: userForm.value.remarks,
      companyId: userForm.value.companyId // ส่ง IC_ID ไปด้วย
    };

    if (userModal.value.isEdit) {
      await usersAPI.update(userModal.value.id, payload);
      toast.success('สำเร็จ', 'บันทึกข้อมูลสำเร็จ');
    } else {
      payload.password = userForm.value.password;
      await usersAPI.create(payload);
      toast.success('สำเร็จ', 'สร้างผู้ใช้งานใหม่สำเร็จ');
    }
    closeUserModal();
    fetchUsers();
  } catch (error) {
    console.error('Error:', error);
    toast.error('เกิดข้อผิดพลาด', error.response?.data?.message || error.message);
  } finally {
    userSaving.value = false;
  }
};

const deleteUser = async (row) => {
  if (!confirm(`ต้องการลบผู้ใช้งาน "${row.SU_Name1}" ใช่หรือไม่?`)) return;
  try {
    await usersAPI.delete(row.SU_ID);
    toast.success('สำเร็จ', 'ลบผู้ใช้งานสำเร็จ');
    fetchUsers();
  } catch (error) {
    console.error('Error:', error);
    toast.error('เกิดข้อผิดพลาด', error.response?.data?.message || error.message);
  }
};

// ==================== เปลี่ยนรหัสผ่าน (Password Change) ====================
const passwordModal = ref({ show: false, title: 'เปลี่ยนรหัสผ่าน', id: null });
const passwordForm = ref({ name: '', username: '', companyName: '', newPassword: '', confirmPassword: '' });
const passwordChanging = ref(false);
const showPassword = ref(false);

const openPasswordModal = (row) => {
  passwordModal.value = { show: true, title: 'เปลี่ยนรหัสผ่าน', id: row.SU_ID };
  passwordForm.value = {
    name: row.SU_Name1,
    username: row.SU_Username,
    companyName: row.CompanyName || 'N/A',
    newPassword: '',
    confirmPassword: ''
  };
  showPassword.value = false;
  console.log('🔑 Opening password modal for user:', row.SU_Username);
};

const closePasswordModal = () => {
  passwordModal.value.show = false;
  passwordForm.value = { name: '', username: '', companyName: '', newPassword: '', confirmPassword: '' };
};

const changePassword = async () => {
  // Validation 1: ตรวจสอบว่ากรอกครบหรือไม่
  if (!passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    toast.warning('ข้อมูลไม่ครบ', 'กรุณากรอกรหัสผ่านให้ครบถ้วน');
    return;
  }

  // Validation 2: ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.warning('รหัสผ่านไม่ตรงกัน', 'กรุณากรอกใหม่');
    return;
  }

  // Validation 3: ความยาว (8-50 ตัวอักษร)
  if (passwordForm.value.newPassword.length < 8) {
    toast.warning('รหัสผ่านไม่ถูกต้อง', 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    return;
  }
  if (passwordForm.value.newPassword.length > 50) {
    toast.warning('รหัสผ่านไม่ถูกต้อง', 'รหัสผ่านต้องไม่เกิน 50 ตัวอักษร');
    return;
  }

  // Validation 4: ตรวจสอบรูปแบบ (A-Z, a-z, 0-9)
  const hasUpperCase = /[A-Z]/.test(passwordForm.value.newPassword);
  const hasLowerCase = /[a-z]/.test(passwordForm.value.newPassword);
  const hasNumber = /[0-9]/.test(passwordForm.value.newPassword);

  if (!hasUpperCase) {
    toast.warning('รหัสผ่านไม่ถูกต้อง', 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว');
    return;
  }
  if (!hasLowerCase) {
    toast.warning('รหัสผ่านไม่ถูกต้อง', 'รหัสผ่านต้องมีตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว');
    return;
  }
  if (!hasNumber) {
    toast.warning('รหัสผ่านไม่ถูกต้อง', 'รหัสผ่านต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัว');
    return;
  }

  // Confirm กับ User
  if (!confirm(`ยืนยันการเปลี่ยนรหัสผ่านสำหรับ "${passwordForm.value.username}" ใช่หรือไม่?`)) {
    return;
  }

  passwordChanging.value = true;
  try {
    console.log(`🔐 Changing password for user ID: ${passwordModal.value.id}`);

    await usersAPI.resetPassword(passwordModal.value.id, {
      password: passwordForm.value.newPassword
    });

    toast.success('สำเร็จ', `เปลี่ยนรหัสผ่านสำเร็จ - ผู้ใช้งาน: ${passwordForm.value.username} จะต้อง Login ใหม่`);
    closePasswordModal();
    fetchUsers();
  } catch (error) {
    console.error('Error changing password:', error);
    const errorMessage = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด';
    toast.error('เกิดข้อผิดพลาด', errorMessage);
  } finally {
    passwordChanging.value = false;
  }
};

// ==================== แผนก (Departments) ====================
const departments = ref([]);
const departmentSaving = ref(false);
const departmentModal = ref({ show: false, isEdit: false, title: '', id: null, isAddChild: false, parentId: null });
const departmentForm = ref({
  code: '',
  localName: '',
  englishName: '',
  type: 'department',
  parentId: null,
  isActive: true,
  remarks: '',
  companyIds: [] // เชื่อมกับบริษัทไหนบ้าง
});
const companyDepartments = ref([]); // Junction table data
const moveModal = ref({ show: false, departmentId: null, departmentName: '', currentParentId: null });
const newParentId = ref(null);

// ดึงข้อมูลแผนกแบบ Flat List (สำหรับ dropdown)
const fetchDepartments = async () => {
  try {
    const response = await departmentsAPI.getAll();
    departments.value = response.data.data;
  } catch (error) {
    console.error('Error:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลแผนกได้');
  }
};

// NOTE: fetchDepartmentTree removed - each CompanyTreeNode now fetches its own tree

const fetchCompanyDepartments = async () => {
  try {
    // Fetch junction table data
    const response = await departmentsAPI.getCompanyDepartments();
    companyDepartments.value = response.data.data;
  } catch (error) {
    console.error('Error fetching company-department relations:', error);
    toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดความสัมพันธ์บริษัท-แผนกได้');
  }
};

// เปิด Modal เพิ่มแผนกทั่วไป (จากปุ่ม "เพิ่มแผนก" ที่ header)
const openDepartmentModal = () => {
  // Reset saving state
  departmentSaving.value = false;

  departmentModal.value = { show: true, isEdit: false, title: 'เพิ่มแผนกใหม่', id: null, isAddChild: false, parentId: null };
  departmentForm.value = {
    code: '',
    localName: '',
    englishName: '',
    type: 'department',
    parentId: null,
    isActive: true,
    remarks: '',
    companyIds: [] // ยังไม่ได้เลือกบริษัท
  };
};

// เปิด Modal เพิ่มแผนกสำหรับบริษัทที่เลือก (จาก CompanyTreeNode)
const handleAddDepartmentForCompany = (company) => {
  // Reset saving state
  departmentSaving.value = false;

  departmentModal.value = { show: true, isEdit: false, title: `เพิ่มแผนกใหม่ - ${company.IC_LocalName}`, id: null, isAddChild: false, parentId: null };
  departmentForm.value = {
    code: '',
    localName: '',
    englishName: '',
    type: 'department',
    parentId: null,
    isActive: true,
    remarks: '',
    companyIds: [company.IC_ID] // Default: บริษัทที่คลิก
  };
};

// เปิด Modal เพิ่มแผนกลูก (Add Child)
const handleAddChild = (payload) => {
  const { node: parentNode, company } = payload;

  // Reset saving state
  departmentSaving.value = false;

  departmentModal.value = {
    show: true,
    isEdit: false,
    title: `เพิ่มแผนกภายใต้ "${parentNode.ID_LocalName}"`,
    id: null,
    isAddChild: true,
    parentId: parentNode.ID_ID
  };
  departmentForm.value = {
    code: '',
    localName: '',
    englishName: '',
    type: 'department',
    parentId: parentNode.ID_ID,
    isActive: true,
    remarks: '',
    companyIds: [company.IC_ID]
  };
};

// เปิด Modal แก้ไขแผนก
const handleEditDepartment = (payload) => {
  const { node, company } = payload;

  // Reset saving state
  departmentSaving.value = false;

  departmentModal.value = { show: true, isEdit: true, title: 'แก้ไขแผนก', id: node.ID_ID, isAddChild: false, parentId: node.Parent_ID_ID };
  departmentForm.value = {
    code: node.ID_Code,
    localName: node.ID_LocalName,
    englishName: node.ID_EnglishName,
    type: node.ID_Type || 'department',
    parentId: node.Parent_ID_ID,
    isActive: node.ID_IsActive,
    remarks: node.ID_Remarks || '',
    companyIds: [company.IC_ID] // ใช้ company จาก payload
  };
};

const closeDepartmentModal = () => {
  departmentModal.value.show = false;
};

// บันทึกแผนก (สร้างใหม่ หรือ แก้ไข)
const saveDepartment = async () => {
  // Validation 1: ต้องเลือกบริษัท (สำหรับการสร้างใหม่)
  if (!departmentModal.value.isEdit && (!departmentForm.value.companyIds || !departmentForm.value.companyIds[0])) {
    warning('กรุณาเลือกบริษัท');
    return;
  }

  // Validation 2: ตรวจสอบ required fields
  if (!departmentForm.value.code || !departmentForm.value.code.trim()) {
    warning('กรุณากรอกรหัสแผนก');
    return;
  }

  if (!departmentForm.value.localName || !departmentForm.value.localName.trim()) {
    warning('กรุณากรอกชื่อแผนก (ไทย)');
    return;
  }

  // Validation 3: Parent เป็น optional แล้ว แต่ถ้ามีการเลือก Parent ต้องเป็น type ที่ถูกต้อง
  // (การตรวจสอบ parent type จะทำที่ backend)

  departmentSaving.value = true;
  try {
    const payload = {
      code: departmentForm.value.code,
      localName: departmentForm.value.localName,
      englishName: departmentForm.value.englishName,
      type: departmentForm.value.type,
      parentId: departmentForm.value.parentId,
      isActive: departmentForm.value.isActive,
      remarks: departmentForm.value.remarks
    };

    if (departmentModal.value.isEdit) {
      // แก้ไขแผนก - ไม่ต้องส่ง companyId
      await departmentsAPI.update(departmentModal.value.id, payload);
      success('บันทึกข้อมูลสำเร็จ');
    } else {
      // สร้างแผนกใหม่ - ส่ง companyId ใน payload เพื่อให้ backend ทำ transaction
      payload.companyId = departmentForm.value.companyIds[0];

      const result = await departmentsAPI.create(payload);
      success('สร้างแผนกใหม่สำเร็จ');
    }

    closeDepartmentModal();
    window.location.reload(); // Reload page to refresh all company trees
  } catch (err) {
    console.error('Error in saveDepartment:', err);
    error(err.response?.data?.message || err.message);
  } finally {
    departmentSaving.value = false;
  }
};

// ย้ายแผนก (เปิด Modal)
const handleMoveDepartment = (payload) => {
  const { node, company } = payload;
  moveModal.value = {
    show: true,
    departmentId: node.ID_ID,
    departmentName: node.ID_LocalName,
    currentParentId: node.Parent_ID_ID,
    companyId: company.IC_ID
  };
  newParentId.value = node.Parent_ID_ID;
};

// ปิด Move Modal
const closeMoveModal = () => {
  moveModal.value.show = false;
  newParentId.value = null;
};

// บันทึกการย้าย
const saveMove = async () => {
  try {
    await departmentsAPI.move(moveModal.value.departmentId, newParentId.value);
    success('ย้ายแผนกสำเร็จ');
    closeMoveModal();
    window.location.reload(); // Reload page to refresh all company trees
  } catch (err) {
    console.error('Error:', err);
    error(err.response?.data?.message || err.message);
  }
};

// ลบแผนก
const handleDeleteDepartment = async (payload) => {
  const { node, company } = payload;

  // ตรวจสอบว่ามี children หรือไม่
  if (node.children && node.children.length > 0) {
    warning(`ไม่สามารถลบแผนก "${node.ID_LocalName}" ได้ เนื่องจากมีแผนกย่อยอยู่ภายใต้ (${node.children.length} แผนก) กรุณาลบแผนกย่อยก่อน หรือย้ายแผนกย่อยไปที่อื่น`);
    return;
  }

  if (!confirm(`ต้องการลบแผนก "${node.ID_LocalName}" ใช่หรือไม่?`)) return;

  try {
    await departmentsAPI.delete(node.ID_ID);
    success('ลบแผนกสำเร็จ');
    // Trigger refresh for this company (will implement refresh mechanism)
    window.location.reload(); // Temporary: reload page
  } catch (err) {
    console.error('Error:', err);
    error(err.response?.data?.message || err.message);
  }
};

// Dropdown สำหรับเลือก Parent (filter ตาม hierarchy rules และบริษัท)
const availableParents = computed(() => {
  let filtered = departments.value.filter(d => d.ID_IsActive);

  // ถ้าเป็นการแก้ไข: ไม่ให้เลือกตัวเองเป็น Parent
  if (departmentModal.value.isEdit) {
    filtered = filtered.filter(d => d.ID_ID !== departmentModal.value.id);
  }

  // Filter ตามบริษัท: แสดงเฉพาะแผนกที่อยู่ในบริษัทเดียวกัน
  if (departmentForm.value.companyIds && departmentForm.value.companyIds.length > 0) {
    // ดึง companyId แรก (สมมุติว่าเพิ่มแผนกให้กับบริษัทเดียวครั้งละบริษัท)
    const targetCompanyId = departmentForm.value.companyIds[0];

    // หา ID ของแผนกที่อยู่ในบริษัทนี้
    const departmentIdsInCompany = companyDepartments.value
      .filter(cd => cd.IC_ID === targetCompanyId && cd.ICD_IsActive)
      .map(cd => cd.ID_ID);

    // Filter เฉพาะแผนกที่อยู่ในบริษัทนี้
    filtered = filtered.filter(d => departmentIdsInCompany.includes(d.ID_ID));
  }

  // Filter ตาม Type Hierarchy Rules (แนะนำโครงสร้าง Tree)
  // โครงสร้างแนะนำ: Office → Branch → Department
  // แต่ Parent เป็น optional - สามารถเป็น root level ได้
  const selectedType = departmentForm.value.type;

  if (selectedType === 'office') {
    // office: can have parent=NULL (root) or parent=office (sub-office)
    filtered = filtered.filter(d => d.ID_Type === 'office');
  } else if (selectedType === 'branch') {
    // branch: recommended to have parent=office (but optional)
    filtered = filtered.filter(d => d.ID_Type === 'office');
  } else if (selectedType === 'department') {
    // department: recommended to have parent=branch (but optional)
    filtered = filtered.filter(d => d.ID_Type === 'branch');
  }

  return filtered;
});

// Dropdown สำหรับเลือก Parent ในการย้าย (filter ตาม hierarchy rules และบริษัท)
const availableParentsForMove = computed(() => {
  let filtered = departments.value.filter(d =>
    d.ID_ID !== moveModal.value.departmentId && // ไม่ให้เลือกตัวเอง
    d.ID_IsActive
  );

  // Filter ตามบริษัท: แสดงเฉพาะแผนกที่อยู่ในบริษัทเดียวกัน
  if (moveModal.value.companyId) {
    const targetCompanyId = moveModal.value.companyId;

    // หา ID ของแผนกที่อยู่ในบริษัทนี้
    const departmentIdsInCompany = companyDepartments.value
      .filter(cd => cd.IC_ID === targetCompanyId && cd.ICD_IsActive)
      .map(cd => cd.ID_ID);

    // Filter เฉพาะแผนกที่อยู่ในบริษัทนี้
    filtered = filtered.filter(d => departmentIdsInCompany.includes(d.ID_ID));
  }

  // หา Type ของแผนกที่จะย้าย
  const movingDept = departments.value.find(d => d.ID_ID === moveModal.value.departmentId);
  if (!movingDept) return filtered;

  const deptType = movingDept.ID_Type;

  // Filter ตาม Type Hierarchy Rules (แนะนำโครงสร้าง Tree)
  // โครงสร้างแนะนำ: Office → Branch → Department
  // แต่ Parent เป็น optional - สามารถเป็น root level ได้
  if (deptType === 'office') {
    // office: can have parent=NULL (root) or parent=office (sub-office)
    filtered = filtered.filter(d => d.ID_Type === 'office');
  } else if (deptType === 'branch') {
    // branch: recommended to have parent=office (but optional)
    filtered = filtered.filter(d => d.ID_Type === 'office');
  } else if (deptType === 'department') {
    // department: recommended to have parent=branch (but optional)
    filtered = filtered.filter(d => d.ID_Type === 'branch');
  }

  return filtered;
});

// Watch: เมื่อเปลี่ยน type ให้ reset parentId ถ้า parentId ที่เลือกไว้ไม่ match กับ availableParents ใหม่
watch(() => departmentForm.value.type, (newType, oldType) => {
  // ถ้าเป็นการแก้ไข (isEdit) หรือยังไม่ได้เปิด modal ไม่ต้องทำอะไร
  if (!departmentModal.value.show || departmentModal.value.isEdit) {
    return;
  }

  // ถ้ามี parentId ที่เลือกไว้ ให้ตรวจสอบว่า parentId ยังอยู่ใน availableParents หรือไม่
  if (departmentForm.value.parentId) {
    const isValidParent = availableParents.value.some(
      dept => dept.ID_ID === departmentForm.value.parentId
    );

    // ถ้า parentId ไม่ valid ให้ reset เป็น null
    if (!isValidParent) {
      departmentForm.value.parentId = null;
    }
  }
});

// ==================== Load Data on Mount ====================
onMounted(() => {
  checkIsMainAdmin();
  fetchAccessibleCompanies();
  fetchCompanies();
  fetchUsers();
  fetchDepartments();
  fetchCompanyDepartments();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* ============================================
   CSS เหลือแค่ส่วนที่ Tailwind ทำไม่ได้
   ============================================ */

/* 1. Animations */
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
  animation: fadeIn 0.5s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideUp {
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scaleIn {
  animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

/* 2. Page Title - moved to theme-variables.css for theming support */

/* 2.3 Company Cards */
.company-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.company-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
}

.company-departments {
  animation: expandDown 0.3s ease-out;
}

/* 2.5 Department Cards */
.department-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.25s ease;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.department-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.department-card.department-expanded {
  border-color: #3b82f6;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
}

.department-details {
  animation: expandDown 0.25s ease-out;
}

@keyframes expandDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Action Buttons */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.action-btn-view {
  background: #E0F2FE;
  color: #0284C7;
}

.action-btn-view:hover {
  background: #0EA5E9;
  color: white;
  transform: scale(1.08);
}

.action-btn-edit {
  background: #D1FAE5;
  color: #059669;
}

.action-btn-edit:hover {
  background: #10B981;
  color: white;
  transform: scale(1.08);
}

.action-btn-delete {
  background: #FEE2E2;
  color: #DC2626;
}

.action-btn-delete:hover {
  background: #EF4444;
  color: white;
  transform: scale(1.08);
}

/* 3. Custom Dropdown (Complex component) */
.select {
  width: fit-content;
  cursor: pointer;
  position: relative;
  transition: 300ms;
  color: white;
  overflow: visible;
  z-index: 9998;
}

.selected {
  background: #007AB8;
  padding: 8px 12px;
  margin-bottom: 3px;
  border-radius: 6px;
  position: relative;
  z-index: 9999;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 240px;
  gap: 0.75rem;
  font-family: 'Prompt', sans-serif;
  box-shadow: 0 2px 6px rgba(0, 122, 184, 0.2);
  transition: all 0.3s ease;
}

.selected:hover {
  background: #006299;
}

.selected::before {
  content: attr(data-selected);
}

.arrow {
  position: relative;
  right: 0px;
  height: 8px;
  transform: rotate(-90deg);
  width: 20px;
  fill: white;
  z-index: 10000;
  transition: 300ms;
  flex-shrink: 0;
}

.options {
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  padding: 4px;
  background-color: #ffffff;
  border: 2px solid #007AB8;
  position: absolute;
  top: -100px;
  left: 0;
  opacity: 0;
  transition: 300ms;
  min-width: 240px;
  max-height: 280px;
  overflow-y: auto;
  box-shadow: 0 8px 20px rgba(0, 122, 184, 0.15);
  z-index: 10001;
}

.select.open > .options {
  opacity: 1;
  top: 38px;
}

.select.open > .selected .arrow {
  transform: rotate(0deg);
}

.option {
  border-radius: 4px;
  padding: 8px 12px;
  transition: 300ms;
  background-color: transparent;
  width: 100%;
  font-size: 0.875rem;
  cursor: pointer;
  font-family: 'Prompt', sans-serif;
  color: #1a202c;
}

.option:hover {
  background-color: #E3F2FD;
  color: #007AB8;
}

.options input[type="radio"] {
  display: none;
}

.options label {
  display: block;
  width: 100%;
  cursor: pointer;
}

.options label::before {
  content: attr(data-txt);
  display: block;
  width: 100%;
}

.options input[type="radio"]:checked + label {
  display: none;
}

/* Responsive - page-title moved to theme-variables.css */
</style>