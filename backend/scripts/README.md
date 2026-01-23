# SQL Scripts Directory

## 📋 สรุปไฟล์ SQL Scripts

### ✅ ไฟล์ที่ใช้ (Keep)

#### 1. Migration Scripts (สำหรับงานใหม่)
- `01-create-systemusercompany-table.sql` - สร้างตาราง SystemUserCompany
- `02-migrate-user-companies.sql` - Migration ข้อมูล
- `03-verify-migration.sql` - ตรวจสอบผลลัพธ์

#### 2. Check Scripts (สำหรับตรวจสอบ)
- `00-check-database-structure.sql` - ตรวจสอบโครงสร้าง Database
- `00-check-data-relationships.sql` - ตรวจสอบข้อมูลและความสัมพันธ์
- `00-check-critical-issues.sql` - ตรวจสอบปัญหาสำคัญ
- `00-check-before-migration.sql` - ตรวจสอบความพร้อมก่อน Migration
- `00-check-backward-compat.sql` - ตรวจสอบผลกระทบต่อระบบเก่า
- `00-check-user-schema.sql` - ตรวจสอบ Schema ของ SystemUser

#### 3. Fix Scripts (สำหรับแก้ไข)
- `00-fix-role-id-zero-check.sql` - ตรวจสอบปัญหา Role ID = 0
- `00-fix-role-id-zero-fix.sql` - แก้ไขปัญหา Role ID = 0

#### 4. Utility Scripts (สำหรับอ้างอิง)
- `00-list-company-ids.sql` - แสดงรายการ IC_ID ที่มีในระบบ
- `00-setup-role-permissions.sql` - Setup Role Permissions
- `00-check-role-permissions.sql` - ตรวจสอบสิทธิ์ (Permissions) ของแต่ละ Role

---

### ❌ ไฟล์ที่ลบได้ (Delete - ไม่ได้ใช้)

#### 1. HRU Specific Scripts (เฉพาะ HRU Role)
- `check-hru-permissions.sql` - ตรวจสอบ Permissions ของ HRU เท่านั้น
- `reset-hru-permissions.sql` - Reset Permissions ของ HRU เท่านั้น
- `remove-hru-statistics.sql` - ลบ Statistics Permission ของ HRU เท่านั้น

#### 2. Duplicate Scripts
- `update-role-permissions.sql` - อาจซ้ำกับ `setup-role-permissions.sql`

---

## 🚀 ขั้นตอนการเริ่มงาน

### Phase 1: ตรวจสอบ (Pre-Migration)
1. รัน `00-check-database-structure.sql` - ดูโครงสร้าง
2. รัน `00-check-data-relationships.sql` - ดูข้อมูล
3. รัน `00-check-critical-issues.sql` - ดูปัญหา
4. รัน `00-check-before-migration.sql` - ดูความพร้อมก่อน Migration

### Phase 2: แก้ไขปัญหา (ถ้ามี)
1. รัน `00-fix-role-id-zero-check.sql` - ตรวจสอบปัญหา Role ID = 0
2. รัน `00-fix-role-id-zero-fix.sql` - แก้ไขปัญหา Role ID = 0

### Phase 3: Migration
1. รัน `01-create-systemusercompany-table.sql` - สร้างตาราง
2. รัน `02-migrate-user-companies.sql` - Migration ข้อมูล
3. รัน `03-verify-migration.sql` - ตรวจสอบผลลัพธ์

### Phase 4: ตรวจสอบผลกระทบ
1. รัน `00-check-backward-compat.sql` - ดูผลกระทบต่อระบบเก่า

---

## 📝 หมายเหตุ

- ไฟล์ที่ขึ้นต้นด้วย `00-` = Check/Utility Scripts
- ไฟล์ที่ขึ้นต้นด้วย `01-`, `02-`, `03-` = Migration Scripts (ต้องรันตามลำดับ)
- ไฟล์ที่ไม่มี prefix = Legacy Scripts (อาจใช้หรือไม่ใช้)

