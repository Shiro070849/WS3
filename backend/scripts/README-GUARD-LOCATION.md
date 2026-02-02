# Guard Location Setup Scripts

## ขั้นตอนการรัน (เรียงตามลำดับ)

### 1. สร้าง Table + Insert ข้อมูลตัวอย่าง
```sql
-- รันไฟล์นี้ก่อน
10-create-guard-location.sql
```
- สร้าง `GuardLocation` table
- Insert ข้อมูลตัวอย่าง 3 locations (P-01, P-02, P-03)

---

### 2. Migrate ข้อมูลเก่า (Optional)
```sql
-- รันถ้ามี User ที่มี User_Location อยู่แล้ว
11-migrate-user-locations.sql
```
- ดึง User_Location ที่มีอยู่มาสร้างเป็น Location records
- ป้องกันข้อมูลซ้ำ

---

### 3. Verify
```sql
-- ตรวจสอบว่าทุกอย่างถูกต้อง
12-verify-guard-location.sql
```
- แสดงข้อมูล GuardLocation
- แสดงสถิติ Users
- Test JOIN query
- หา Location ที่ไม่ถูกใช้งาน

---

## ⚠️ สำคัญ: เลือก Database ก่อนรัน

Scripts เหล่านี้ **ไม่มี USE [DatabaseName]**
กรุณาเลือก Database ใน SSMS ก่อนรัน หรือเพิ่ม:
```sql
USE [YourDatabaseName];
```

## 📝 หมายเหตุ

- ✅ รองรับ `User_Location` เป็น **TEXT** data type
- Scripts ใช้ `CAST(User_Location AS NVARCHAR(255))` สำหรับ JOIN
- `GL_Code` เป็น NVARCHAR(255) เพื่อรองรับข้อมูลยาว

---

## Quick Test Query

```sql
-- ทดสอบ JOIN ระหว่าง SystemUser + GuardLocation
SELECT
    SU.SU_Username,
    SU.User_Location,
    GL.GL_Name AS LocationName
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[GuardLocation] GL ON SU.User_Location = GL.GL_Code
WHERE SU.SR_ID IN (2, 3) AND SU.SU_Active = 1;
```

---

## ผลลัพธ์ที่คาดหวัง

- ✅ Table `GuardLocation` ถูกสร้างสำเร็จ
- ✅ มี Location ตัวอย่าง 3 รายการ
- ✅ JOIN query ทำงานได้ปกติ
- ✅ ไม่มี error

---

## Rollback (ถ้าต้องการลบ)

```sql
-- ลบ Table (ระวัง!)
DROP TABLE [dbo].[GuardLocation];
```
