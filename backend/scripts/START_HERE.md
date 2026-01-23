# 🚀 เริ่มงานที่นี่ (START HERE)

## 📋 สรุปสิ่งที่ต้องทำ

### เป้าหมาย
เปลี่ยนจาก **1 User = 1 Company** เป็น **1 User = หลาย Company**

---

## ✅ ขั้นตอนการทำงาน (ตามลำดับ)

### Phase 0: ตรวจสอบและแก้ไขปัญหา (ก่อนเริ่ม Migration)

#### 1. ตรวจสอบโครงสร้าง Database
```sql
-- รัน: 00-check-database-structure.sql
```
**สิ่งที่ตรวจสอบ:**
- โครงสร้างตาราง
- Foreign Keys
- Indexes
- Constraints

#### 2. ตรวจสอบข้อมูลและความสัมพันธ์
```sql
-- รัน: 00-check-data-relationships.sql
```
**สิ่งที่ตรวจสอบ:**
- ข้อมูล SystemUser และ IC_ID
- Super Admin (IC_ID = NULL)
- Users ที่ไม่มี Role
- Permissions ของแต่ละ Role

#### 3. ตรวจสอบปัญหาสำคัญ
```sql
-- รัน: 00-check-critical-issues.sql
```
**สิ่งที่ตรวจสอบ:**
- Users ที่มี SR_ID = 0 หรือไม่มี Role
- Users ที่มี IC_ID แต่ Company ถูกลบ
- Foreign Key Constraints
- Indexes

#### 4. แก้ไขปัญหา Role ID = 0 (ถ้ามี)
```sql
-- ตรวจสอบ: 00-fix-role-id-zero-check.sql
-- แก้ไข: 00-fix-role-id-zero-fix.sql
```
**สิ่งที่ทำ:**
- วิเคราะห์ Users ที่มี SR_ID = 0
- อัพเดท SystemUserSystemRole.SR_ID

#### 5. ตรวจสอบความพร้อมสำหรับ Migration
```sql
-- รัน: 00-check-before-migration.sql
```
**สิ่งที่ตรวจสอบ:**
- ตาราง SystemUserCompany มีอยู่แล้วหรือไม่
- Foreign Key Constraints
- Indexes
- ข้อมูลที่ต้องแก้ไข

---

### Phase 1: Migration Database

#### 1. สร้างตาราง SystemUserCompany
```sql
-- รัน: 01-create-systemusercompany-table.sql
```
**สิ่งที่ทำ:**
- สร้างตาราง SystemUserCompany
- สร้าง Indexes (4 ตัว)
- ตรวจสอบโครงสร้าง

#### 2. Migration ข้อมูล
```sql
-- รัน: 02-migrate-user-companies.sql
```
**สิ่งที่ทำ:**
- ย้ายข้อมูลจาก SystemUser.IC_ID → SystemUserCompany
- ใช้ Transaction (Rollback ถ้า Error)
- ตรวจสอบผลลัพธ์

#### 3. ตรวจสอบผลลัพธ์
```sql
-- รัน: 03-verify-migration.sql
```
**สิ่งที่ตรวจสอบ:**
- เปรียบเทียบ SystemUser vs SystemUserCompany
- Users ที่ยังไม่ได้ migrate
- ความสอดคล้องของข้อมูล

---

### Phase 2: แก้ไข Backend Code

#### 1. Service Layer
- `settings.service.js` → `getUserAccessibleCompanies()`
- `vehicle.service.js` → Filter ด้วย `IN`
- `dashboard.service.js` → Filter ด้วย `IN`
- `statistics.service.js` → Filter ด้วย `IN`
- `report.service.js` → Filter ด้วย `IN`
- `permission.service.js` → ใช้ `getUserAccessibleCompanyIds()`

#### 2. Controller Layer
- `settings.controller.js` → `createUser()`, `updateUser()`
- `vehicle.controller.js` → ใช้ `getUserAccessibleCompanyIds()`
- `dashboard.controller.js` → ใช้ `getUserAccessibleCompanyIds()`

#### 3. Middleware
- `auth.js` → เพิ่ม `accessibleCompanyIds`

---

### Phase 3: แก้ไข Frontend Code

#### 1. User Management
- `SettingsView.vue` → Multi-select Company

#### 2. Company Dropdown
- แสดงหลายบริษัท (ตาม SystemUserCompany)

---

## 📁 ไฟล์ที่เก็บไว้ (Keep)

### Migration Scripts
- ✅ `01-create-systemusercompany-table.sql`
- ✅ ✅ `02-migrate-user-companies.sql`
- ✅ `03-verify-migration.sql`

### Check Scripts
- ✅ `00-check-database-structure.sql` - ตรวจสอบโครงสร้าง Database
- ✅ `00-check-data-relationships.sql` - ตรวจสอบข้อมูลและความสัมพันธ์
- ✅ `00-check-critical-issues.sql` - ตรวจสอบปัญหาสำคัญ
- ✅ `00-check-before-migration.sql` - ตรวจสอบความพร้อมก่อน Migration
- ✅ `00-check-backward-compat.sql` - ตรวจสอบผลกระทบต่อระบบเก่า
- ✅ `00-check-user-schema.sql` - ตรวจสอบ Schema ของ SystemUser

### Fix Scripts
- ✅ `00-fix-role-id-zero-check.sql` - ตรวจสอบปัญหา Role ID = 0
- ✅ `00-fix-role-id-zero-fix.sql` - แก้ไขปัญหา Role ID = 0

### Utility Scripts
- ✅ `00-list-company-ids.sql` - แสดงรายการ IC_ID ที่มีในระบบ
- ✅ `00-setup-role-permissions.sql` - Setup Role Permissions

---

## ❌ ไฟล์ที่ลบแล้ว (Deleted)

- ❌ `check-hru-permissions.sql` (เฉพาะ HRU)
- ❌ `reset-hru-permissions.sql` (เฉพาะ HRU)
- ❌ `remove-hru-statistics.sql` (เฉพาะ HRU)
- ❌ `update-role-permissions.sql` (ซ้ำกับ setup-role-permissions.sql)

---

## ⚠️ คำเตือน

1. **Backup Database ก่อนเริ่มงาน**
2. **รันใน Dev Database ก่อน**
3. **ตรวจสอบผลลัพธ์ทุกขั้นตอน**
4. **แก้ไขปัญหาให้เสร็จก่อน Migration**

---

## 📋 Checklist

### Phase 0: ตรวจสอบ
- [ ] รัน `00-check-database-structure.sql`
- [ ] รัน `00-check-data-relationships.sql`
- [ ] รัน `00-check-critical-issues.sql`
- [ ] รัน `00-check-before-migration.sql`
- [ ] แก้ไขปัญหา SR_ID = 0 (ถ้ามี)

### Phase 1: Migration
- [ ] Backup Database
- [ ] รัน `01-create-systemusercompany-table.sql`
- [ ] รัน `02-migrate-user-companies.sql`
- [ ] รัน `03-verify-migration.sql`

### Phase 2: Backend Code
- [ ] แก้ไข Service Layer
- [ ] แก้ไข Controller Layer
- [ ] แก้ไข Middleware
- [ ] ทดสอบ API

### Phase 3: Frontend Code
- [ ] แก้ไข User Management
- [ ] แก้ไข Company Dropdown
- [ ] ทดสอบ UI

---

## 🎯 สรุป

**เริ่มจาก:** Phase 0 (ตรวจสอบและแก้ไขปัญหา)  
**แล้วทำ:** Phase 1 (Migration Database)  
**แล้วทำ:** Phase 2 (แก้ไข Backend Code)  
**แล้วทำ:** Phase 3 (แก้ไข Frontend Code)

