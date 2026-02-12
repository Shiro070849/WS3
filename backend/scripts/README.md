# SQL Scripts Directory

## ลำดับการรันหลัก (Deploy ชุดจบ)

รันบน **Backup Server** ตามลำดับ (เลือก DB ใน SSMS ก่อนรัน):

1. **NumBer1_deploy-sync-to-backup.sql** – โครงสร้าง, WayIn, SystemUserCompany / SystemSettings / GuardLocation, SystemScreen, สิทธิ์ Role, migrate User→SystemUserCompany  
2. **NumBer2_map-user-role-company.sql** – ตั้ง SR_ID/IC_ID + เติม SystemUserCompany  
3. **Number3_systemadminuser.sql** – สร้าง/อัปเดต user sysadmin (SU_ID 7777)

---

## ไฟล์ที่ใช้อยู่

### Deploy หลัก
- `NumBer1_deploy-sync-to-backup.sql`
- `NumBer2_map-user-role-company.sql`
- `Number3_systemadminuser.sql`

### ฝั่ง Full/Production
- `add-role-emp-on-full-server.sql` – สร้าง Role Emp + สิทธิ์ (ใช้เฉพาะ full server)

### Check / Verify
- `00-check-database-structure.sql`, `00-check-data-relationships.sql`, `00-check-critical-issues.sql`
- `00-check-before-migration.sql`, `00-check-backward-compat.sql`, `00-check-user-schema.sql`, `00-check-role-permissions.sql`
- `05-final-database-check.sql`
- `check-backup-server-gaps.sql`, `check-complete-server-baseline.sql`

### Fix
- `00-fix-role-id-zero-check.sql`, `00-fix-role-id-zero-fix.sql`

### อื่นๆ
- `00-list-company-ids.sql` – แสดง IC_ID ในระบบ
- `03-verify-migration.sql`, `11-migrate-user-locations.sql`, `12-verify-guard-location.sql`

---

รายละเอียดเพิ่มเติมดูที่ **FILES_STATUS.md**
