<template>
  <BaseCard>
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-semibold text-[#1a202c] mb-1">ความปลอดภัย</h2>
        <p class="text-sm text-gray-500">จัดการการตั้งค่าความปลอดภัยของระบบ</p>
      </div>

      <!-- จัดการ Admin ของบริษัท -->
      <div class="border-t pt-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-lg font-semibold text-[#1a202c]">จัดการ Admin ของบริษัท</h3>
            <p class="text-sm text-gray-500 mt-1">เพิ่ม แก้ไข หรือเปลี่ยนรหัสผ่าน Admin</p>
          </div>
          <BaseButton @click="openAdminModal" variant="primary" size="sm">
            <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            เพิ่ม Admin
          </BaseButton>
        </div>

        <BaseTable :columns="adminColumns" :data="admins" :loading="adminLoading">
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
              <button @click="editAdmin(row)" class="text-[#0090D3] hover:text-[#007AB8] transition-colors" title="แก้ไข">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="deleteAdmin(row)" class="text-red-600 hover:text-red-800 transition-colors" title="ลบ">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </template>
        </BaseTable>
      </div>

      <!-- Session Timeout -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Session Timeout (นาที)</label>
        <p class="text-xs text-gray-500 mb-2">ระยะเวลาการ session หมดอายุ</p>
        <BaseInput
          v-model="settings.sessionTimeout"
          type="number"
          placeholder="1440"
          min="1"
        />
      </div>

      <!-- ความยาววรหัสผ่านขั้นต่ำ -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ความยาววรหัสผ่านขั้นต่ำ</label>
        <p class="text-xs text-gray-500 mb-2">จำนวนตัวอักษรขั้นต่ำของรหัสผ่าน</p>
        <BaseInput
          v-model="settings.minPasswordLength"
          type="number"
          placeholder="8"
          min="4"
          max="32"
        />
      </div>

      <!-- ต้องการตัวอักษรพิเศษ -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ต้องการตัวอักษรพิเศษในรหัสผ่าน</label>
        <p class="text-xs text-gray-500 mb-2">บังคับให้มีตัวอักษรพิเศษในรหัสผ่าน</p>
        <label class="flex items-center">
          <input
            v-model="settings.requireSpecialChar"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- ต้องการตัวเลข -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ต้องการตัวเลขในรหัสผ่าน</label>
        <p class="text-xs text-gray-500 mb-2">บังคับให้มีตัวเลขในรหัสผ่าน</p>
        <label class="flex items-center">
          <input
            v-model="settings.requireNumber"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- ต้องการตัวพิมพ์ใหญ่ -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ต้องการตัวพิมพ์ใหญ่ในรหัสผ่าน</label>
        <p class="text-xs text-gray-500 mb-2">บังคับให้มีตัวพิมพ์ใหญ่ในรหัสผ่าน</p>
        <label class="flex items-center">
          <input
            v-model="settings.requireUppercase"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- ต้องมีการรีเซ็ตรหัสผ่าน -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ต้องมีการรีเซ็ตรหัสผ่าน</label>
        <p class="text-xs text-gray-500 mb-2">บังคับให้รีเซ็ตรหัสผ่านทุกๆ</p>
        <label class="flex items-center">
          <input
            v-model="settings.passwordExpiry"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- จำนวนครั้งที่รีเซ็ตรหัสผ่าน (วัน) -->
      <div v-if="settings.passwordExpiry">
        <label class="block text-sm font-medium text-gray-700 mb-2">จำนวนครั้งที่รีเซ็ตรหัสผ่าน (วัน)</label>
        <p class="text-xs text-gray-500 mb-2">จำนวนวันก่อนที่รหัสผ่านจะหมดอายุ</p>
        <BaseInput
          v-model="settings.passwordExpiryDays"
          type="number"
          placeholder="90"
          min="1"
        />
      </div>

      <!-- ระยะเวลาหมดอายุของเซสชัน (นาที) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ระยะเวลาหมดอายุของเซสชัน (นาที)</label>
        <p class="text-xs text-gray-500 mb-2">ระยะเวลาที่ผู้ใช้ไม่มีกิจกรรมก่อนถูกออกจากระบบ</p>
        <BaseInput
          v-model="settings.inactivityTimeout"
          type="number"
          placeholder="15"
          min="1"
        />
      </div>

      <!-- เปิดใช้ Two-Factor Authentication -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">เปิดใช้ Two-Factor Authentication</label>
        <p class="text-xs text-gray-500 mb-2">เปิดหรือปิดยืนยันตัวตน 2 ชั้นสำหรับทุกผู้ใช้</p>
        <label class="flex items-center">
          <input
            v-model="settings.twoFactorAuth"
            type="checkbox"
            class="w-4 h-4 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3]"
          />
          <span class="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
        </label>
      </div>

      <!-- จำนวนความพยายามเข้าสู่ระบบที่ผิด (ครั้ง) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">จำนวนความพยายามเข้าสู่ระบบที่ผิด (ครั้ง)</label>
        <p class="text-xs text-gray-500 mb-2">จำนวนครั้งที่อนุญาตให้ลงชื่อเข้าใช้ผิดพลาดก่อนล็อก</p>
        <BaseInput
          v-model="settings.maxLoginAttempts"
          type="number"
          placeholder="5"
          min="1"
        />
      </div>

      <!-- ปุ่มบันทึก -->
      <div class="flex justify-end pt-4">
        <BaseButton variant="primary" @click="saveSettings" :loading="saving">
          บันทึกการตั้งค่า
        </BaseButton>
      </div>
    </div>

    <!-- Modals ถูกย้ายไปใช้ Teleport ด้านล่าง -->

    <!-- Modal: เพิ่ม/แก้ไข Admin -->
    <Teleport to="body">
      <div v-if="adminModal.show" class="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" style="backdrop-filter: blur(4px);" @click.self="closeAdminModal">
        <div class="browser-modal">
          <!-- Browser Tabs Header -->
          <div class="tabs-head">
            <div class="tabs">
              <div class="tab-open">
                <span>{{ adminModal.title }}</span>
                <button @click="closeAdminModal" class="close-tab">✕</button>
              </div>
            </div>
            <div class="window-opt">
              <button>−</button>
              <button>□</button>
              <button @click="closeAdminModal" class="window-close">✕</button>
            </div>
          </div>

          <!-- Browser URL Bar -->
          <div class="head-browser">
            <button disabled>←</button>
            <button disabled>→</button>
            <div class="url-bar">
              <span class="url-text">{{ adminModal.isEdit ? 'admin/edit' : 'admin/create' }}</span>
              <button class="star">★</button>
            </div>
            <button>⋮</button>
          </div>

          <!-- Content Area -->
          <div class="browser-content">
            <!-- รหัส -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2">รหัส <span class="text-red-500">*</span></label>
              <BaseInput v-model="adminForm.code" placeholder="เช่น MRG001" />
            </div>

            <!-- ชื่อ -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2">ชื่อ <span class="text-red-500">*</span></label>
              <BaseInput v-model="adminForm.name1" placeholder="ชื่อเต็ม" />
            </div>

            <!-- ชื่อย่อ -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2">ชื่อย่อ</label>
              <BaseInput v-model="adminForm.name2" placeholder="ชื่อย่อ (ถ้ามี)" />
            </div>

            <!-- Username -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2">Username <span class="text-red-500">*</span></label>
              <BaseInput v-model="adminForm.username" placeholder="Username สำหรับเข้าสู่ระบบ" />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2">
                รหัสผ่าน <span v-if="!adminModal.isEdit" class="text-red-500">*</span>
                <span v-if="adminModal.isEdit" class="text-gray-500 text-xs font-normal">(เว้นว่างหากไม่ต้องการเปลี่ยน)</span>
              </label>
              <div class="relative">
                <BaseInput
                  v-model="adminForm.password"
                  :type="showAdminPassword ? 'text' : 'password'"
                  placeholder="รหัสผ่าน (8-50 ตัวอักษร, A-Z, a-z, 0-9)"
                />
                <button
                  type="button"
                  @click="showAdminPassword = !showAdminPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg v-if="!showAdminPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2">Email</label>
              <BaseInput v-model="adminForm.email" type="email" placeholder="email@example.com" />
            </div>

            <!-- สถานะ -->
            <div class="pt-2">
              <label class="flex items-center cursor-pointer group">
                <input
                  v-model="adminForm.active"
                  type="checkbox"
                  class="w-5 h-5 text-[#0090D3] border-gray-300 rounded focus:ring-[#0090D3] focus:ring-2 transition-all"
                />
                <span class="ml-3 text-sm font-medium text-gray-800 group-hover:text-[#0090D3] transition-colors">เปิดใช้งาน</span>
              </label>
            </div>

            <!-- หมายเหตุ -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2">หมายเหตุ</label>
              <textarea
                v-model="adminForm.remarks"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0090D3] focus:border-[#0090D3] transition-all"
                placeholder="หมายเหตุเพิ่มเติม"
              ></textarea>
            </div>

            <!-- ปุ่ม -->
            <div class="flex justify-end gap-4 px-6 py-4 border-t bg-gray-50">
              <BaseButton variant="secondary" @click="closeAdminModal" class="min-w-[100px]">ยกเลิก</BaseButton>
              <BaseButton variant="primary" @click="saveAdmin" class="min-w-[100px]">บันทึก</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: เปลี่ยนรหัสผ่าน -->
    <Teleport to="body">
      <div v-if="passwordModal.show" class="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" style="backdrop-filter: blur(4px);" @click.self="closePasswordModal">
        <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all duration-300">
          <div class="flex justify-between items-center px-8 py-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-2xl">
            <h3 class="text-2xl font-bold text-white tracking-wide">{{ passwordModal.title }}</h3>
            <button @click="closePasswordModal" class="text-white hover:text-gray-200 transition-all duration-200 hover:rotate-90 transform">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-8 space-y-5">
            <!-- ข้อมูล User -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl mb-4 border border-blue-100 shadow-sm">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="text-gray-700 font-medium">ชื่อ:</div>
                <div class="font-bold text-gray-900">{{ passwordForm.name }}</div>
                <div class="text-gray-700 font-medium">Username:</div>
                <div class="font-bold text-gray-900">{{ passwordForm.username }}</div>
                <div class="text-gray-700 font-medium">บริษัท:</div>
                <div class="font-bold text-gray-900">{{ passwordForm.companyName }}</div>
              </div>
            </div>

            <!-- คำเตือน -->
            <div class="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-5 mb-4 rounded-lg shadow-sm">
              <div class="flex">
                <svg class="w-6 h-6 text-amber-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div>
                  <p class="text-sm text-amber-800 font-bold">คำเตือน</p>
                  <p class="text-sm text-amber-700 mt-1 leading-relaxed">การเปลี่ยนรหัสผ่านจะมีผลทันที และระบบจะบันทึกประวัติการเปลี่ยนแปลง</p>
                </div>
              </div>
            </div>

            <!-- รหัสผ่านใหม่ -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2">รหัสผ่านใหม่ <span class="text-red-500">*</span></label>
              <div class="relative">
                <BaseInput
                  v-model="passwordForm.newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="รหัสผ่าน (8-50 ตัวอักษร, A-Z, a-z, 0-9)"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- ยืนยันรหัสผ่าน -->
            <div>
              <label class="block text-sm font-semibold text-gray-800 mb-2">ยืนยันรหัสผ่านใหม่ <span class="text-red-500">*</span></label>
              <div class="relative">
                <BaseInput
                  v-model="passwordForm.confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                />
              </div>
            </div>

            <!-- ข้อกำหนดรหัสผ่าน -->
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100 shadow-sm">
              <p class="text-sm font-bold text-blue-900 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                ข้อกำหนดรหัสผ่าน:
              </p>
              <ul class="text-xs text-blue-800 space-y-2">
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">✓</span>
                  <span>ความยาว 8-50 ตัวอักษร</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">✓</span>
                  <span>มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">✓</span>
                  <span>มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">✓</span>
                  <span>มีตัวเลขอย่างน้อย 1 ตัว (0-9)</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- ปุ่ม -->
          <div class="flex justify-end gap-4 px-8 py-6 border-t bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl">
            <BaseButton variant="secondary" @click="closePasswordModal" class="min-w-[120px]">ยกเลิก</BaseButton>
            <BaseButton variant="primary" @click="changePassword" :loading="passwordChanging" class="min-w-[120px]">
              เปลี่ยนรหัสผ่าน
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </BaseCard>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import BaseCard from '../base/BaseCard.vue';
import BaseInput from '../base/BaseInput.vue';
import BaseButton from '../base/BaseButton.vue';
import BaseTable from '../base/BaseTable.vue';
import { systemSettingsAPI, usersAPI } from '@/services/api';

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  }
});

const settings = ref({
  sessionTimeout: 1440,
  minPasswordLength: 8,
  requireSpecialChar: false,
  requireNumber: false,
  requireUppercase: false,
  passwordExpiry: false,
  passwordExpiryDays: 90,
  inactivityTimeout: 15,
  twoFactorAuth: false,
  maxLoginAttempts: 5
});

const saving = ref(false);

// ==================== จัดการ Admin ของบริษัท ====================
const admins = ref([]);
const adminLoading = ref(false);
const adminModal = ref({ show: false, isEdit: false, title: '', id: null });
const adminForm = ref({
  code: '', name1: '', name2: '', username: '', password: '',
  email: '', active: true, remarks: ''
});

const passwordModal = ref({ show: false, title: 'เปลี่ยนรหัสผ่าน', id: null });
const passwordForm = ref({
  name: '', username: '', companyName: '', newPassword: '', confirmPassword: ''
});
const passwordChanging = ref(false);
const showPassword = ref(false);
const showAdminPassword = ref(false);

const adminColumns = [
  { key: 'SU_Code', label: 'รหัส' },
  { key: 'SU_Name1', label: 'ชื่อ' },
  { key: 'SU_Username', label: 'Username' },
  { key: 'SU_Email', label: 'Email' },
  { key: 'SU_Active', label: 'สถานะ' }
];

// Fetch admins by companyId (only company admins, excludes Super Admin)
const fetchAdmins = async () => {
  adminLoading.value = true;
  try {
    console.log('[SecuritySettings] Fetching admins for companyId:', props.companyId);
    const response = await usersAPI.getAll();

    if (response.data.success) {
      // Filter: Only show Company Admins (IC_ID matches company)
      // Exclude Super Admin (IC_ID = NULL)
      const allUsers = response.data.data;
      admins.value = allUsers.filter(user => {
        // Only show admins that belong to this specific company
        // Pattern matching: Check multiple patterns (case-insensitive)
        const code = (user.SU_Code || '').toUpperCase();
        const name = (user.SU_Name1 || '').toLowerCase();

        const isAdmin = code.includes('ADM') ||
                       code.includes('ADMIN') ||
                       name.includes('admin') ||
                       name.includes('administrator') ||
                       name.includes('ผู้ดูแล');

        return user.IC_ID === props.companyId && isAdmin;
      });

      console.log('[SecuritySettings] Company Admins fetched:', admins.value.length);
      console.log('[SecuritySettings] Admins:', admins.value.map(a => `${a.SU_Code} (IC_ID=${a.IC_ID})`));
    }
  } catch (error) {
    console.error('[SecuritySettings] Error fetching admins:', error);
  } finally {
    adminLoading.value = false;
  }
};

const openAdminModal = () => {
  adminModal.value = {
    show: true,
    isEdit: false,
    title: 'เพิ่ม Admin',
    id: null
  };
  adminForm.value = {
    code: '',
    name1: '',
    name2: '',
    username: '',
    password: '',
    email: '',
    active: true,
    remarks: ''
  };
};

const editAdmin = (row) => {
  adminModal.value = {
    show: true,
    isEdit: true,
    title: 'แก้ไข Admin',
    id: row.SU_ID
  };
  adminForm.value = {
    code: row.SU_Code,
    name1: row.SU_Name1,
    name2: row.SU_Name2 || '',
    username: row.SU_Username,
    password: '', // Don't show existing password
    email: row.SU_Email || '',
    active: row.SU_Active,
    remarks: row.SU_Remarks || ''
  };
};

const closeAdminModal = () => {
  adminModal.value = { show: false, isEdit: false, title: '', id: null };
};

const saveAdmin = async () => {
  try {
    // Validation
    if (!adminForm.value.code || !adminForm.value.name1 || !adminForm.value.username) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // Password validation for new admin
    if (!adminModal.value.isEdit && !adminForm.value.password) {
      alert('กรุณากรอกรหัสผ่าน');
      return;
    }

    if (adminForm.value.password) {
      // Validate password
      if (adminForm.value.password.length < 8 || adminForm.value.password.length > 50) {
        alert('รหัสผ่านต้องมีความยาว 8-50 ตัวอักษร');
        return;
      }
      if (!/[A-Z]/.test(adminForm.value.password)) {
        alert('รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)');
        return;
      }
      if (!/[a-z]/.test(adminForm.value.password)) {
        alert('รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)');
        return;
      }
      if (!/[0-9]/.test(adminForm.value.password)) {
        alert('รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)');
        return;
      }
    }

    const data = {
      code: adminForm.value.code,
      name1: adminForm.value.name1,
      name2: adminForm.value.name2,
      username: adminForm.value.username,
      password: adminForm.value.password,
      email: adminForm.value.email,
      active: adminForm.value.active,
      remarks: adminForm.value.remarks,
      companyId: props.companyId
    };

    if (adminModal.value.isEdit) {
      await usersAPI.update(adminModal.value.id, data);
      alert('แก้ไขข้อมูล Admin สำเร็จ');
    } else {
      await usersAPI.create(data);
      alert('เพิ่ม Admin สำเร็จ');
    }

    closeAdminModal();
    fetchAdmins();
  } catch (error) {
    console.error('Error saving admin:', error);
    alert('เกิดข้อผิดพลาดในการบันทึก: ' + (error.response?.data?.message || error.message));
  }
};

const deleteAdmin = async (row) => {
  if (!confirm(`คุณต้องการลบ Admin "${row.SU_Name1}" ใช่หรือไม่?`)) {
    return;
  }

  try {
    await usersAPI.delete(row.SU_ID);
    alert('ลบ Admin สำเร็จ');
    fetchAdmins();
  } catch (error) {
    console.error('Error deleting admin:', error);
    alert('เกิดข้อผิดพลาดในการลบ');
  }
};

const openPasswordModal = (row) => {
  passwordModal.value = {
    show: true,
    title: 'เปลี่ยนรหัสผ่าน',
    id: row.SU_ID
  };
  passwordForm.value = {
    name: row.SU_Name1,
    username: row.SU_Username,
    companyName: row.CompanyName || 'Super Admin',
    newPassword: '',
    confirmPassword: ''
  };
};

const closePasswordModal = () => {
  passwordModal.value = { show: false, title: '', id: null };
  passwordForm.value = { name: '', username: '', companyName: '', newPassword: '', confirmPassword: '' };
  showPassword.value = false;
};

const changePassword = async () => {
  try {
    // Validation
    if (!passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
      alert('กรุณากรอกรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (passwordForm.value.newPassword.length < 8 || passwordForm.value.newPassword.length > 50) {
      alert('รหัสผ่านต้องมีความยาว 8-50 ตัวอักษร');
      return;
    }

    if (!/[A-Z]/.test(passwordForm.value.newPassword)) {
      alert('รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)');
      return;
    }

    if (!/[a-z]/.test(passwordForm.value.newPassword)) {
      alert('รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)');
      return;
    }

    if (!/[0-9]/.test(passwordForm.value.newPassword)) {
      alert('รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)');
      return;
    }

    passwordChanging.value = true;
    await usersAPI.resetPassword(passwordModal.value.id, {
      password: passwordForm.value.newPassword
    });

    alert('เปลี่ยนรหัสผ่านสำเร็จ');
    closePasswordModal();
  } catch (error) {
    console.error('Error changing password:', error);
    alert('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: ' + (error.response?.data?.message || error.message));
  } finally {
    passwordChanging.value = false;
  }
};

// ==================== Security Settings ====================

const loadSettings = async () => {
  try {
    console.log('[SecuritySettings] Loading settings for companyId:', props.companyId);
    const response = await systemSettingsAPI.getSecurity(props.companyId);
    console.log('[SecuritySettings] API Response:', response.data);
    if (response.data.success) {
      const data = response.data.data;
      console.log('[SecuritySettings] Data from database:', data);
      settings.value = {
        sessionTimeout: parseInt(data.sessionTimeout) || 1440,
        minPasswordLength: parseInt(data.minPasswordLength) || 8,
        requireSpecialChar: data.requireSpecialChar === 'true',
        requireNumber: data.requireNumber === 'true',
        requireUppercase: data.requireUppercase === 'true',
        passwordExpiry: data.passwordExpiry === 'true',
        passwordExpiryDays: parseInt(data.passwordExpiryDays) || 90,
        inactivityTimeout: parseInt(data.inactivityTimeout) || 15,
        twoFactorAuth: data.twoFactorAuth === 'true',
        maxLoginAttempts: parseInt(data.maxLoginAttempts) || 5
      };
      console.log('[SecuritySettings] Settings updated:', settings.value);
    }
  } catch (error) {
    console.error('[SecuritySettings] Error loading settings:', error);
  }
};

const saveSettings = async () => {
  try {
    saving.value = true;
    const response = await systemSettingsAPI.updateSecurity(settings.value, props.companyId);
    if (response.data.success) {
      alert('บันทึกการตั้งค่าความปลอดภัยสำเร็จ');
    }
  } catch (error) {
    console.error('Error saving security settings:', error);
    alert('เกิดข้อผิดพลาดในการบันทึก');
  } finally {
    saving.value = false;
  }
};

// Watch companyId changes to reload admins
watch(() => props.companyId, () => {
  fetchAdmins();
  loadSettings();
});

onMounted(() => {
  loadSettings();
  fetchAdmins();
});
</script>

<style>
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

/* Browser Tabs Header */
.tabs-head {
  background: #3c3c3c;
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
  max-width: 170px;
  height: 26px;
  border-radius: 5px 5px 0 0;
  background-color: #535353;
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  position: relative;
}

.tabs-head .tab-open span {
  color: #e8e8e8;
  font-size: 12px;
  font-weight: 400;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tabs-head .tab-open .close-tab {
  color: #b0b0b0;
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
}

.tabs-head .tab-open .close-tab:hover {
  background-color: #6a6a6a;
  color: #fff;
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
  color: #b0b0b0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 12px;
}

.tabs-head .window-opt button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tabs-head .window-opt .window-close:hover {
  background-color: #e81123;
  color: #fff;
}

/* Browser URL Bar */
.head-browser {
  position: relative;
  width: 100%;
  height: 42px;
  background-color: #535353;
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
  color: #b0b0b0;
  border-radius: 3px;
  transition: 0.15s ease-in-out;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.head-browser button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.head-browser button:hover:not(:disabled) {
  background-color: #6a6a6a;
  color: #fff;
}

.head-browser .url-bar {
  background-color: #404040;
  border: 1px solid #606060;
  height: 30px;
  border-radius: 15px;
  color: #e8e8e8;
  padding: 0 14px;
  flex: 1;
  transition: 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.head-browser .url-bar:hover {
  border-color: #707070;
  background-color: #4a4a4a;
}

.head-browser .url-text {
  color: #e8e8e8;
  font-size: 13px;
  font-weight: 400;
}

.head-browser .star {
  color: #b0b0b0;
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
  background-color: #606060;
  opacity: 1;
  color: #ffd700;
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
</style>
