<template>
  <!-- Main Container - Tailwind Only -->
  <div class="w-full max-w-full animate-fadeIn">

    <!-- Page Header - Tailwind -->
    <div class="mb-6">
      <h1 class="page-title">ตั้งค่า</h1>
      <p class="text-lg text-slate-500 m-0 font-medium font-prompt">จัดการบริษัท ผู้ใช้งาน และแผนก</p>
    </div>

    <!-- Company Selector - Tailwind + Custom Dropdown CSS -->
    <div v-if="accessibleCompanies.length > 0" class="mb-8 flex items-center gap-4 py-4">
      <div class="flex items-center gap-2 text-sm font-semibold text-gray-800 whitespace-nowrap">
        <svg class="w-[18px] h-[18px] stroke-[#0090D3] flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    <!-- Tabs Content - Tailwind -->
    <div class="w-full">
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

        <!-- TAB: อีเมล -->
        <template #email>
          <EmailSettings :companyId="selectedCompanyId" :key="selectedCompanyId" />
        </template>

        <!-- TAB: การแจ้งเตือน -->
        <template #notifications>
          <NotificationSettings :companyId="selectedCompanyId" :key="selectedCompanyId" />
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
import EmailSettings from '../components/settings/EmailSettings.vue';
import NotificationSettings from '../components/settings/NotificationSettings.vue';
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
    return [
      { key: 'general', label: 'ทั่วไป', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      { key: 'appearance', label: 'รูปแบบ', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
      { key: 'security', label: 'ความปลอดภัย', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
      { key: 'email', label: 'อีเมล', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { key: 'notifications', label: 'การแจ้งเตือน', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
      { key: 'companies', label: 'จัดการบริษัท', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { key: 'users', label: 'จัดการผู้ใช้งาน', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { key: 'departments', label: 'จัดการแผนก', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    ];
  } else {
    return [
      { key: 'general', label: 'ทั่วไป', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      { key: 'appearance', label: 'รูปแบบ', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
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

/* 1. Animation */
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

/* 2. Gradient Title */
.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0B4F6C 0%, #0090D3 50%, #20B2AA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.75rem 0;
  font-family: 'Prompt', sans-serif;
  letter-spacing: -0.02em;
}

/* 3. Custom Dropdown (Complex component) */
.select {
  width: fit-content;
  cursor: pointer;
  position: relative;
  transition: 300ms;
  color: white;
  overflow: visible;
  z-index: 50;
}

.selected {
  background: #007AB8;
  padding: 8px 12px;
  margin-bottom: 3px;
  border-radius: 6px;
  position: relative;
  z-index: 51;
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
  z-index: 52;
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
  z-index: 53;
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
  display: inline-block;
  cursor: pointer;
}

.options label::before {
  content: attr(data-txt);
}

.options input[type="radio"]:checked + label {
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }
}
</style>
