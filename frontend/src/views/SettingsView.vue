<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">ตั้งค่า</h1>
      <p class="page-subtitle">จัดการบริษัท ผู้ใช้งาน และแผนก</p>
    </div>

    <div class="page-content">
      <BaseTabs v-model="activeTab" :tabs="tabs">
        <!-- ==================== TAB 1: จัดการบริษัท ==================== -->
        <template #companies>
          <BaseCard>
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-semibold text-[#1a202c]">รายการบริษัท</h2>
                <p class="text-sm text-gray-500 mt-1">จัดการข้อมูลบริษัทในระบบ</p>
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
                <span :class="value ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                </span>
              </template>

              <template #actions="{ row }">
                <div class="flex gap-2 justify-end">
                  <button @click="editCompany(row)" class="text-[#0090D3] hover:text-[#007AB8]" title="แก้ไข">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteCompany(row)" class="text-red-600 hover:text-red-800" title="ลบ">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </template>
            </BaseTable>
          </BaseCard>
        </template>

        <!-- ==================== TAB 2: จัดการผู้ใช้งาน ==================== -->
        <template #users>
          <BaseCard>
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-semibold text-[#1a202c]">รายการผู้ใช้งาน</h2>
                <p class="text-sm text-gray-500 mt-1">จัดการข้อมูลผู้ใช้งานในระบบ</p>
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
                <span :class="value ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                </span>
              </template>

              <template #actions="{ row }">
                <div class="flex gap-2 justify-end">
                  <button @click="editUser(row)" class="text-[#0090D3] hover:text-[#007AB8]" title="แก้ไข">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteUser(row)" class="text-red-600 hover:text-red-800" title="ลบ">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </template>
            </BaseTable>
          </BaseCard>
        </template>

        <!-- ==================== TAB 3: จัดการแผนก ==================== -->
        <template #departments>
          <BaseCard>
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-semibold text-[#1a202c]">รายการแผนก</h2>
                <p class="text-sm text-gray-500 mt-1">จัดการข้อมูลแผนกในระบบ</p>
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
                <span :class="value ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ value ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                </span>
              </template>

              <template #actions="{ row }">
                <div class="flex gap-2 justify-end">
                  <button @click="editDepartment(row)" class="text-[#0090D3] hover:text-[#007AB8]" title="แก้ไข">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteDepartment(row)" class="text-red-600 hover:text-red-800" title="ลบ">
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

    <!-- ==================== MODAL: บริษัท ==================== -->
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

    <!-- ==================== MODAL: ผู้ใช้งาน ==================== -->
    <BaseModal :show="userModal.show" :title="userModal.title" @close="closeUserModal" size="lg">
      <div class="space-y-4">
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

    <!-- ==================== MODAL: แผนก ==================== -->
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
import { ref, onMounted } from 'vue';
import BaseTabs from '../components/base/BaseTabs.vue';
import BaseCard from '../components/base/BaseCard.vue';
import BaseTable from '../components/base/BaseTable.vue';
import BaseButton from '../components/base/BaseButton.vue';
import BaseInput from '../components/base/BaseInput.vue';
import BaseModal from '../components/base/BaseModal.vue';
import { companiesAPI, usersAPI, departmentsAPI } from '../services/api';

// ==================== Tab State ====================
const activeTab = ref('companies');

const tabs = [
  { key: 'companies', label: 'จัดการบริษัท', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { key: 'users', label: 'จัดการผู้ใช้งาน', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { key: 'departments', label: 'จัดการแผนก', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
];

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
const userForm = ref({ code: '', name1: '', name2: '', username: '', password: '', email: '', active: true, remarks: '' });

const userColumns = [
  { key: 'SU_Code', label: 'รหัส' },
  { key: 'SU_Name1', label: 'ชื่อ (ไทย)' },
  { key: 'SU_Username', label: 'Username' },
  { key: 'SU_Email', label: 'Email' },
  { key: 'SU_Active', label: 'สถานะ' },
  { key: 'SU_Remarks', label: 'หมายเหตุ' },
];

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
  userForm.value = { code: '', name1: '', name2: '', username: '', password: '', email: '', active: true, remarks: '' };
};

const editUser = (row) => {
  userModal.value = { show: true, isEdit: true, title: 'แก้ไขผู้ใช้งาน', id: row.SU_ID };
  userForm.value = { code: row.SU_Code, name1: row.SU_Name1, name2: row.SU_Name2, username: row.SU_Username, password: '', email: row.SU_Email || '', active: row.SU_Active, remarks: row.SU_Remarks || '' };
};

const closeUserModal = () => {
  userModal.value.show = false;
};

const saveUser = async () => {
  userSaving.value = true;
  try {
    const payload = { code: userForm.value.code, name1: userForm.value.name1, name2: userForm.value.name2, username: userForm.value.username, email: userForm.value.email, active: userForm.value.active, remarks: userForm.value.remarks };
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
  fetchCompanies();
  fetchUsers();
  fetchDepartments();
});
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 100%;
  animation: fadeIn 0.5s ease-in;
}

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

.page-header {
  margin-bottom: 2.5rem;
}

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

.page-subtitle {
  font-size: 1.05rem;
  color: #64748b;
  margin: 0;
  font-family: 'Prompt', sans-serif;
  font-weight: 500;
}

.page-content {
  width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }
}
</style>
