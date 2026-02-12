# เริ่มงานที่นี่ (START HERE)

## ลำดับการรัน Deploy (ชุดจบ)

**Backup DB ปลายทางก่อน** แล้วเลือก DB ใน SSMS จากนั้นรันตามลำดับ:

### 1. NumBer1_deploy-sync-to-backup.sql
- โครงสร้าง, คอลัมน์ WayIn, ตาราง SystemUserCompany / SystemSettings / GuardLocation  
- SystemScreen (2000, 3000, 4000, 12005), สิทธิ์ Role  
- Migrate User → SystemUserCompany  

### 2. NumBer2_map-user-role-company.sql
- ตั้ง SR_ID / IC_ID (เทส) + เติม SystemUserCompany  

### 3. Number3_systemadminuser.sql
- สร้าง/อัปเดต user **sysadmin** (SU_ID 7777, username: sysadmin)  

---

## ฝั่ง Full/Production

ถ้ารันบน **Production** และต้องการ Role **Emp** + สิทธิ์:
- รัน **add-role-emp-on-full-server.sql** (หลังชุด 1–2–3 ตามต้องการ)

---

## ตรวจสอบหลัง Deploy

- `00-check-role-permissions.sql` – ตรวจสิทธิ์แต่ละ Role  
- `05-final-database-check.sql` – ตรวจสถานะ DB  
- `check-backup-server-gaps.sql` – ตรวจ gaps หลัง sync  

---

## หมายเหตุ

- ทุกสคริปต์ **ไม่มี USE [DatabaseName]** — เลือก DB ใน SSMS ก่อนรัน  
- รายการไฟล์ทั้งหมดและสถานะดูที่ **FILES_STATUS.md**
