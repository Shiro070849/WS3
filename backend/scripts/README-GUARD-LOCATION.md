# Guard Location

## ที่มาของตาราง GuardLocation

ตาราง **GuardLocation** ถูกสร้างใน **NumBer1_deploy-sync-to-backup.sql** แล้ว  
ไม่ต้องรันสคริปต์แยกเพื่อสร้างตาราง

---

## ขั้นตอนเสริม (Optional)

### 1. Migrate ข้อมูลเก่า (User_Location → GuardLocation)
```sql
-- รันถ้ามี User ที่มี User_Location อยู่แล้ว
11-migrate-user-locations.sql
```

### 2. Verify
```sql
12-verify-guard-location.sql
```
- แสดงข้อมูล GuardLocation
- สถิติ Users
- ทดสอบ JOIN

---

## เลือก Database ก่อนรัน

Scripts **ไม่มี USE [DatabaseName]** — เลือก DB ใน SSMS ก่อนรัน

---

## ทดสอบ JOIN

```sql
SELECT SU.SU_Username, SU.User_Location, GL.GL_Name AS LocationName
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[GuardLocation] GL ON SU.User_Location = GL.GL_Code
WHERE SU.SR_ID IN (2, 3) AND SU.SU_Active = 1;
```
