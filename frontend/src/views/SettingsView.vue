<template>
  <div class="settings-container">
    <h1 class="page-title">ตั้งค่าระบบ</h1>
    <p class="page-subtitle">จัดการการตั้งค่าและข้อมูลหลักของระบบ Smart Security</p>

    <!-- Settings Tabs -->
    <div class="settings-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
      >
        <span v-html="tab.icon"></span>
        <span>{{ tab.name }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Company Settings Tab -->
      <div v-if="activeTab === 'company'" class="content-section">
        <h2 class="section-title">ข้อมูลบริษัท</h2>
        <p class="section-description">จัดการข้อมูลบริษัทและสาขา (Multi-tenant)</p>

        <div class="info-box">
          <p>⏳ รอ API จาก Backend Team</p>
          <p class="small">หลังจาก Backend API เสร็จ จะทำ CRUD สำหรับ:</p>
          <ul>
            <li>เพิ่ม/ลบ/แก้ไข บริษัท</li>
            <li>จัดการสาขา (Branches)</li>
            <li>กำหนด Company Code</li>
          </ul>
        </div>
      </div>

      <!-- User Management Tab -->
      <div v-if="activeTab === 'users'" class="content-section">
        <h2 class="section-title">จัดการผู้ใช้งาน</h2>
        <p class="section-description">เพิ่ม ลบ แก้ไข User และกำหนดสิทธิ์</p>

        <div class="info-box">
          <p>⏳ รอ API จาก Backend Team</p>
          <p class="small">หลังจาก Backend API เสร็จ จะทำ CRUD สำหรับ:</p>
          <ul>
            <li>เพิ่ม/ลบ/แก้ไข User</li>
            <li>กำหนด Role & Permissions</li>
            <li>Reset Password</li>
            <li>Assign User ให้แต่ละ Company</li>
          </ul>
        </div>
      </div>

      <!-- Vehicle Settings Tab -->
      <div v-if="activeTab === 'vehicles'" class="content-section">
        <h2 class="section-title">การตั้งค่ายานพาหนะ</h2>
        <p class="section-description">จัดการประเภทรถ ป้ายทะเบียน</p>

        <div class="info-box">
          <p>⏳ รอ API จาก Backend Team</p>
          <p class="small">หลังจาก Backend API เสร็จ จะทำ:</p>
          <ul>
            <li>จัดการประเภทยานพาหนะ</li>
            <li>License Plate Recognition Settings</li>
            <li>Whitelist/Blacklist รถ</li>
          </ul>
        </div>
      </div>

      <!-- Weighbridge Settings Tab -->
      <div v-if="activeTab === 'weighbridge'" class="content-section">
        <h2 class="section-title">การตั้งค่าเครื่องชั่ง</h2>
        <p class="section-description">กำหนดค่าน้ำหนัก ขีดจำกัด และระบบชั่งน้ำหนัก</p>

        <div class="info-box">
          <p>⏳ รอ API จาก Backend Team</p>
          <p class="small">หลังจาก Backend API เสร็จ จะทำ:</p>
          <ul>
            <li>กำหนดขีดจำกัดน้ำหนัก (Max/Min)</li>
            <li>ตั้งค่า Entry/Exit Weighing</li>
            <li>Weight Alert Threshold</li>
            <li>เชื่อมต่อกับ Weighing Device</li>
          </ul>
        </div>
      </div>

      <!-- App Integration Tab -->
      <div v-if="activeTab === 'app'" class="content-section">
        <h2 class="section-title">การเชื่อมต่อกับ Mobile App</h2>
        <p class="section-description">API Endpoints และการซิงค์ข้อมูลระหว่าง App กับระบบ</p>

        <div class="info-box">
          <p>📱 รอทีม App และ Backend</p>
          <p class="small">API Endpoints ที่ต้องมี:</p>
          <ul>
            <li>POST /api/entry - บันทึกการเข้า</li>
            <li>POST /api/exit - บันทึกการออก</li>
            <li>POST /api/weight - บันทึกน้ำหนัก</li>
            <li>GET /api/vehicle/:licensePlate - ดึงข้อมูลรถ</li>
            <li>POST /api/license-plate/scan - อ่านป้ายทะเบียน</li>
          </ul>
        </div>
      </div>

      <!-- System Settings Tab -->
      <div v-if="activeTab === 'system'" class="content-section">
        <h2 class="section-title">ตั้งค่าระบบทั่วไป</h2>
        <p class="section-description">การตั้งค่าพื้นฐานของระบบ</p>

        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">ภาษาระบบ</label>
            <select class="setting-input">
              <option value="th">ไทย</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="setting-item">
            <label class="setting-label">Timezone</label>
            <select class="setting-input">
              <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div class="setting-item">
            <label class="setting-label">รูปแบบวันที่</label>
            <select class="setting-input">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div class="setting-item">
            <label class="setting-label">Auto Logout (นาที)</label>
            <input type="number" class="setting-input" value="30" min="5" max="120">
          </div>
        </div>

        <div class="save-section">
          <button class="btn-save">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('company')

const tabs = [
  {
    id: 'company',
    name: 'ข้อมูลบริษัท',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7v1a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V7m-18 0V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2M3 7h18"/><path d="M13 7v4m-2-4v4m-2-4v4"/></svg>'
  },
  {
    id: 'users',
    name: 'ผู้ใช้งาน',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  },
  {
    id: 'vehicles',
    name: 'ยานพาหนะ',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>'
  },
  {
    id: 'weighbridge',
    name: 'เครื่องชั่ง',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/></svg>'
  },
  {
    id: 'app',
    name: 'App Integration',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
  },
  {
    id: 'system',
    name: 'ระบบทั่วไป',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/></svg>'
  }
]
</script>

<style scoped>
.settings-container {
  width: 100%;
  min-height: 100vh;
  font-family: 'Prompt', sans-serif;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #718096;
  margin-bottom: 2rem;
}

/* Tabs */
.settings-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
  padding-bottom: 0;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: 'Prompt', sans-serif;
}

.tab-button:hover {
  color: #047685;
  background: rgba(4, 118, 133, 0.05);
}

.tab-button.active {
  color: #047685;
  border-bottom-color: #047685;
  font-weight: 600;
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-section {
  animation: fadeIn 0.3s ease-in;
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

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.section-description {
  font-size: 0.95rem;
  color: #718096;
  margin-bottom: 1.5rem;
}

/* Info Box */
.info-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.info-box p {
  margin: 0 0 0.75rem 0;
  font-weight: 600;
}

.info-box .small {
  font-size: 0.9rem;
  font-weight: 400;
  opacity: 0.9;
}

.info-box ul {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.info-box li {
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
}

.setting-input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Prompt', sans-serif;
  transition: all 0.2s;
}

.setting-input:focus {
  outline: none;
  border-color: #047685;
  box-shadow: 0 0 0 3px rgba(4, 118, 133, 0.1);
}

/* Save Section */
.save-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #047685 0%, #0090D3 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Prompt', sans-serif;
  box-shadow: 0 4px 12px rgba(4, 118, 133, 0.3);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(4, 118, 133, 0.4);
}

.btn-save:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .settings-tabs {
    gap: 0.25rem;
  }

  .tab-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .tab-content {
    padding: 1.5rem;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
