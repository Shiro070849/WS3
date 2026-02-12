# 📁 สถานะไฟล์ SQL Scripts

## 🎯 ลำดับการรันหลัก (Deploy ชุดจบ)

รันตามลำดับนี้บน **Backup Server** (เลือก DB ใน SSMS ก่อนรัน):

1. **NumBer1_deploy-sync-to-backup.sql** – โครงสร้าง, คอลัมน์ WayIn, ตาราง SystemUserCompany / SystemSettings / GuardLocation, SystemScreen, สิทธิ์ Role, migrate User→SystemUserCompany  
2. **NumBer2_map-user-role-company.sql** – ตั้ง SR_ID/IC_ID บนเทส + เติม SystemUserCompany  
3. **Number3_systemadminuser.sql** – สร้าง/อัปเดต user sysadmin (SU_ID 7777, username sysadmin)

---

## ✅ ไฟล์ที่เก็บไว้ (ยังใช้อยู่)

### 🚀 Deploy หลัก (ชุดจบ)
- ✅ `NumBer1_deploy-sync-to-backup.sql`
- ✅ `NumBer2_map-user-role-company.sql`
- ✅ `Number3_systemadminuser.sql`

### 🖥️ ฝั่ง Full/Production (ใช้เมื่อรันบน Production)
- ✅ `add-role-emp-on-full-server.sql` – สร้าง Role Emp + สิทธิ์ (ใช้เฉพาะ full server)

### 🔍 Check / Verify (ใช้ตรวจสอบ Database)
- ✅ `00-check-backward-compat.sql`
- ✅ `00-check-before-migration.sql`
- ✅ `00-check-critical-issues.sql`
- ✅ `00-check-data-relationships.sql`
- ✅ `00-check-database-structure.sql`
- ✅ `00-check-role-permissions.sql`
- ✅ `00-check-user-schema.sql`
- ✅ `05-final-database-check.sql`
- ✅ `check-backup-server-gaps.sql` – ตรวจ gaps หลัง deploy
- ✅ `check-complete-server-baseline.sql` – ดู baseline ฝั่ง full

### 🔨 Fix (ใช้แก้ปัญหาเฉพาะจุด)
- ✅ `00-fix-role-id-zero-check.sql`
- ✅ `00-fix-role-id-zero-fix.sql`
- ✅ `fix-sysadmin-see-all-companies.sql` – แก้ sysadmin ให้ IC_ID = NULL (เห็นทุกบริษัท)

### 🛠️ อื่นๆ (อ้างอิง / optional)
- ✅ `00-list-company-ids.sql` – แสดง IC_ID ที่มีในระบบ
- ✅ `03-verify-migration.sql` – ตรวจหลัง migration
- ✅ `11-migrate-user-locations.sql` – migrate User_Location → GuardLocation (optional)
- ✅ `12-verify-guard-location.sql` – ตรวจ GuardLocation

### 📚 Documentation
- ✅ `README.md`
- ✅ `START_HERE.md`
- ✅ `README-GUARD-LOCATION.md`

---

## ❌ ไฟล์ที่ลบแล้ว (ไม่ใช้แล้ว – logic ไปอยู่ชุด NumBer1/2/3)

- ~~add-wayin-missing-columns.sql~~ – รวมใน NumBer1
- ~~NEW-DB-FULL-SETUP.sql~~ – แทนที่โดย NumBer1+2+3
- ~~01-create-systemusercompany-table.sql~~ – ใน NumBer1
- ~~02-migrate-user-companies.sql~~ – ใน NumBer1
- ~~04-example-joins.sql~~ – ตัวอย่าง
- ~~10-create-guard-location.sql~~ – ใน NumBer1
- ~~00-setup-role-permissions.sql~~ – ใน NumBer1
- ~~PROD-step1-check-add-columns.sql~~ – โฟลว์เก่า
- ~~PROD-step2-create-systemusercompany.sql~~ – โฟลว์เก่า
- ~~PRODUCTION-sync-database.sql~~ – แทนที่โดย NumBer1

---

## 📊 สรุป

- **รัน deploy:** NumBer1 → NumBer2 → Number3  
- **ฝั่ง production:** ใช้ `add-role-emp-on-full-server.sql` เมื่อต้องการ Role Emp  
- **ตรวจสอบ:** ใช้ชุด `00-check-*` และ `check-backup-server-gaps.sql` / `check-complete-server-baseline.sql` ตามต้องการ
