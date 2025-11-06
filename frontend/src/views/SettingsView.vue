<template>
  <!-- Main Container - Tailwind Only -->
  <div class="w-full max-w-full animate-fadeIn">

    <!-- Page Header - Tailwind with Animation -->
    <div class="mb-6 animate-slideDown">
      <h1 class="page-title">ตั้งค่า</h1>
      <p class="text-lg text-slate-500 m-0 font-medium font-prompt">จัดการบริษัท ผู้ใช้งาน และแผนก</p>
    </div>

    <!-- Company Selector - Tailwind + Custom Dropdown CSS with Animation -->
    <div v-if="accessibleCompanies.length > 0" class="mb-8 flex items-center gap-4 py-4 animate-slideUp" style="position: relative; z-index: 9999;">
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
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-semibold text-[#1a202c]">รายการบริษัท</h2>
                <p class="text-base text-gray-500 mt-1">จัดการข้อมูลบริษัทในระบบ</p>
              </div>
              <BaseButton @click="openCompanyModal" variant="primary">
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มบริษัท
              </BaseButton>
            </div>

            <BaseTable :columns="companyColumns" :data="companies" :loading="companyLoading">
              <template #cell-IC_IsActive="{ value }">
                <span :class="value ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'" class="px-3 py-1.5 rounded-full text-sm font-semibold">
                  {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                </span>
              </template>

              <template #actions="{ row }">
                <div class="flex gap-2 justify-end">
                  <button @click="editCompany(row)" class="text-[#0090D3] hover:text-[#007AB8] transition-colors" title="แก้ไข">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteCompany(row)" class="text-red-600 hover:text-red-800 transition-colors" title="ลบ">
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
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-semibold text-[#1a202c]">รายการผู้ใช้งาน</h2>
                <p class="text-base text-gray-500 mt-1">จัดการข้อมูลผู้ใช้งานในระบบ</p>
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
                <div class="flex gap-2 justify-end">
                  <button @click="openPasswordModal(row)" class="text-amber-600 hover:text-amber-800 transition-colors" title="เปลี่ยนรหัสผ่าน">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>
                  <button @click="editUser(row)" class="text-[#0090D3] hover:text-[#007AB8] transition-colors" title="แก้ไข">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteUser(row)" class="text-red-600 hover:text-red-800 transition-colors" title="ลบ">
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
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-semibold text-[#1a202c]">รายการแผนก</h2>
                <p class="text-base text-gray-500 mt-1">จัดการข้อมูลแผนกในระบบ</p>
              </div>
              <BaseButton @click="openDepartmentModal" variant="primary">
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มแผนก
              </BaseButton>
            </div>

            <BaseTable :columns="departmentColumns" :data="departments" :loading="departmentLoading">
              <template #cell-ID_IsActive="{ value }">
                <span :class="value ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'" class="px-3 py-1.5 rounded-full text-sm font-semibold">
                  {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                </span>
              </template>

              <template #actions="{ row }">
                <div class="flex gap-2 justify-end">
                  <button @click="editDepartment(row)" class="text-[#0090D3] hover:text-[#007AB8] transition-colors" title="แก้ไข">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteDepartment(row)" class="text-red-600 hover:text-red-800 transition-colors" title="ลบ">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </template>
            </BaseTable>
          </BaseCard>
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

    <!-- MODAL: ผู้ใช้งาน -->
    <BaseModal :show="userModal.show" :title="userModal.title" @close="closeUserModal" size="lg">
      <div class="space-y-4">
        <!-- เลือกบริษัท (สำหรับ Super Admin เท่านั้น) -->
        <div v-if="isMainAdmin">
          <label class="block text-base font-semibold text-gray-700 mb-2 font-prompt">
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
        <BaseInput v-model="departmentForm.code" label="รหัสแผนก" placeholder="เช่น IT, HR, CS" required />
        <BaseInput v-model="departmentForm.localName" label="ชื่อแผนก (ไทย)" placeholder="เช่น ฝ่ายเทคโนโลยีสารสนเทศ" required />
        <BaseInput v-model="departmentForm.englishName" label="ชื่อแผนก (อังกฤษ)" placeholder="เช่น Information Technology" />
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
      <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
      <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
        <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-sm text-amber-800">ผู้ใช้งานจะต้อง Login ใหม่ด้วยรหัสผ่านที่เปลี่ยนแล้ว</p>
      </div>

      <!-- Password Fields -->
      <div class="space-y-4">
        <div>
          <label class="block text-base font-semibold text-gray-700 mb-2 font-prompt">
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
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
          <p class="text-xs text-gray-500 mt-1">ต้องมีอย่างน้อย 8 ตัวอักษร, ตัวพิมพ์ใหญ่ (A-Z), ตัวพิมพ์เล็ก (a-z), และตัวเลข (0-9)</p>
        </div>

        <div>
          <label class="block text-base font-semibold text-gray-700 mb-2 font-prompt">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import BaseTabs from '../components/base/BaseTabs.vue';
import BaseCard from '../components/base/BaseCard.vue';
import BaseTable from '../components/base/BaseTable.vue';
import BaseButton from '../components/base/BaseButton.vue';
import BaseInput from '../components/base/BaseInput.vue';
import BaseModal from '../components/base/BaseModal.vue';
import GeneralSettings from '../components/settings/GeneralSettings.vue';
import AppearanceSettings from '../components/settings/AppearanceSettings.vue';
import SecuritySettings from '../components/settings/SecuritySettings.vue';
import { companiesAPI, usersAPI, departmentsAPI, systemSettingsAPI } from '../services/api';
import { useTheme } from '@/composables/useTheme';

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
    alert('ไม่สามารถโหลดรายการบริษัทได้');
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
    // Super Admin: Show General, Appearance, Security, Companies, Users, Departments
    return [
      { key: 'general', label: 'ทั่วไป', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      { key: 'appearance', label: 'รูปแบบ', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
      { key: 'security', label: 'ความปลอดภัย', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
      { key: 'companies', label: 'จัดการบริษัท', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { key: 'users', label: 'จัดการผู้ใช้งาน', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { key: 'departments', label: 'จัดการแผนก', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
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
    alert('ไม่สามารถโหลดข้อมูลบริษัทได้');
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
  companyForm.value = { code: row.IC_Code, localName: row.IC_LocalName, englishName: row.IC_EnglishName, isActive: row.IC_IsActive, remarks: row.IC_Remarks || '' };
};

const closeCompanyModal = () => {
  companyModal.value.show = false;
};

const saveCompany = async () => {
  companySaving.value = true;
  try {
    const payload = { code: companyForm.value.code, localName: companyForm.value.localName, englishName: companyForm.value.englishName, isActive: companyForm.value.isActive, remarks: companyForm.value.remarks };
    if (companyModal.value.isEdit) {
      await companiesAPI.update(companyModal.value.id, payload);
      alert('บันทึกข้อมูลสำเร็จ');
    } else {
      await companiesAPI.create(payload);
      alert('สร้างบริษัทใหม่สำเร็จ');
    }
    closeCompanyModal();
    fetchCompanies();
  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
  } finally {
    companySaving.value = false;
  }
};

const deleteCompany = async (row) => {
  if (!confirm(`ต้องการลบบริษัท "${row.IC_LocalName}" ใช่หรือไม่?`)) return;
  try {
    await companiesAPI.delete(row.IC_ID);
    alert('ลบบริษัทสำเร็จ');
    fetchCompanies();
  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
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
    alert('ไม่สามารถโหลดข้อมูลผู้ใช้งานได้');
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
    alert('กรุณาเลือกบริษัท');
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
      alert('บันทึกข้อมูลสำเร็จ');
    } else {
      payload.password = userForm.value.password;
      await usersAPI.create(payload);
      alert('สร้างผู้ใช้งานใหม่สำเร็จ');
    }
    closeUserModal();
    fetchUsers();
  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
  } finally {
    userSaving.value = false;
  }
};

const deleteUser = async (row) => {
  if (!confirm(`ต้องการลบผู้ใช้งาน "${row.SU_Name1}" ใช่หรือไม่?`)) return;
  try {
    await usersAPI.delete(row.SU_ID);
    alert('ลบผู้ใช้งานสำเร็จ');
    fetchUsers();
  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
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
    alert('กรุณากรอกรหัสผ่านให้ครบถ้วน');
    return;
  }

  // Validation 2: ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่');
    return;
  }

  // Validation 3: ความยาว (8-50 ตัวอักษร)
  if (passwordForm.value.newPassword.length < 8) {
    alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    return;
  }
  if (passwordForm.value.newPassword.length > 50) {
    alert('รหัสผ่านต้องไม่เกิน 50 ตัวอักษร');
    return;
  }

  // Validation 4: ตรวจสอบรูปแบบ (A-Z, a-z, 0-9)
  const hasUpperCase = /[A-Z]/.test(passwordForm.value.newPassword);
  const hasLowerCase = /[a-z]/.test(passwordForm.value.newPassword);
  const hasNumber = /[0-9]/.test(passwordForm.value.newPassword);

  if (!hasUpperCase) {
    alert('รหัสผ่านต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว');
    return;
  }
  if (!hasLowerCase) {
    alert('รหัสผ่านต้องมีตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว');
    return;
  }
  if (!hasNumber) {
    alert('รหัสผ่านต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัว');
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

    alert(`เปลี่ยนรหัสผ่านสำเร็จ!\n\nผู้ใช้งาน: ${passwordForm.value.username}\nจะต้อง Login ใหม่ด้วยรหัสผ่านใหม่`);
    closePasswordModal();
    fetchUsers();
  } catch (error) {
    console.error('Error changing password:', error);
    const errorMessage = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด';
    alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
  } finally {
    passwordChanging.value = false;
  }
};

// ==================== แผนก (Departments) ====================
const departments = ref([]);
const departmentLoading = ref(false);
const departmentSaving = ref(false);
const departmentModal = ref({ show: false, isEdit: false, title: '', id: null });
const departmentForm = ref({ code: '', localName: '', englishName: '', isActive: true, remarks: '' });

const departmentColumns = [
  { key: 'ID_Code', label: 'รหัส' },
  { key: 'ID_LocalName', label: 'ชื่อแผนก (ไทย)' },
  { key: 'ID_EnglishName', label: 'ชื่อแผนก (EN)' },
  { key: 'ID_IsActive', label: 'สถานะ' },
  { key: 'ID_Remarks', label: 'หมายเหตุ' },
];

const fetchDepartments = async () => {
  departmentLoading.value = true;
  try {
    const response = await departmentsAPI.getAll();
    departments.value = response.data.data;
  } catch (error) {
    console.error('Error:', error);
    alert('ไม่สามารถโหลดข้อมูลแผนกได้');
  } finally {
    departmentLoading.value = false;
  }
};

const openDepartmentModal = () => {
  departmentModal.value = { show: true, isEdit: false, title: 'เพิ่มแผนกใหม่', id: null };
  departmentForm.value = { code: '', localName: '', englishName: '', isActive: true, remarks: '' };
};

const editDepartment = (row) => {
  departmentModal.value = { show: true, isEdit: true, title: 'แก้ไขแผนก', id: row.ID_ID };
  departmentForm.value = { code: row.ID_Code, localName: row.ID_LocalName, englishName: row.ID_EnglishName, isActive: row.ID_IsActive, remarks: row.ID_Remarks || '' };
};

const closeDepartmentModal = () => {
  departmentModal.value.show = false;
};

const saveDepartment = async () => {
  departmentSaving.value = true;
  try {
    const payload = { code: departmentForm.value.code, localName: departmentForm.value.localName, englishName: departmentForm.value.englishName, isActive: departmentForm.value.isActive, remarks: departmentForm.value.remarks };
    if (departmentModal.value.isEdit) {
      await departmentsAPI.update(departmentModal.value.id, payload);
      alert('บันทึกข้อมูลสำเร็จ');
    } else {
      await departmentsAPI.create(payload);
      alert('สร้างแผนกใหม่สำเร็จ');
    }
    closeDepartmentModal();
    fetchDepartments();
  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
  } finally {
    departmentSaving.value = false;
  }
};

const deleteDepartment = async (row) => {
  if (!confirm(`ต้องการลบแผนก "${row.ID_LocalName}" ใช่หรือไม่?`)) return;
  try {
    await departmentsAPI.delete(row.ID_ID);
    alert('ลบแผนกสำเร็จ');
    fetchDepartments();
  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
  }
};

// ==================== Load Data on Mount ====================
onMounted(() => {
  checkIsMainAdmin();
  fetchAccessibleCompanies();
  fetchCompanies();
  fetchUsers();
  fetchDepartments();
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
