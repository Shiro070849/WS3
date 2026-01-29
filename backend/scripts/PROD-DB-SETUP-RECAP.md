# สรุปลำดับการตั้งค่า DB โปรดักชัน (จากศูนย์)

ใช้เมื่อต้องการ **เอาไปเซ็ตอีก DB** (DB ใหม่ / อีก environment) ให้เหมือนที่เราทำแล้ว (ตาราง + สิทธิ์ + user พื้นฐาน)

---

## วิธีใช้เร็ว (Quick start)

1. **Backup DB ปลายทางก่อนทุกครั้ง**
2. แทนที่ `[RC_SmartSecurity_SC]` ด้วย **ชื่อ DB จริง** ในทุกสคริปต์
3. รันตามลำดับ **1 → 10** ด้านล่าง (อันไหนใช้ได้แล้วรันได้ ไม่ต้องรันซ้ำก็ได้ เพราะมี `IF NOT EXISTS` / เช็คแล้วค่อย INSERT)

**สคริปต์รวมรันครั้งเดียว:** ใช้ไฟล์ **`NEW-DB-FULL-SETUP.sql`** — แก้ `USE [ชื่อDB];` ด้านบนแล้วรันทั้งไฟล์ (หรือรันทีละส่วนตาม comment ในไฟล์)

---

## ลำดับที่ 1: สร้างตารางที่ขาด

### 1.1 สร้างตาราง `SystemSettings`

```sql
USE [RC_SmartSecurity_SC];
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemSettings')
BEGIN
    CREATE TABLE [dbo].[SystemSettings] (
        SS_ID          INT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
        SS_Key         NVARCHAR(100) NOT NULL,
        SS_Value       NVARCHAR(MAX) NULL,
        SS_Type        NVARCHAR(50)  NULL,
        SS_Category    NVARCHAR(50)  NULL,
        SS_Description NVARCHAR(255) NULL,
        SS_UpdatedAt    DATETIME      NULL,
        SS_UpdatedBy    INT           NULL,
        IC_ID          INT           NULL
    );
END;
```

### 1.2 สร้างตาราง `SystemUserCompany`

```sql
USE [RC_SmartSecurity_SC];
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    CREATE TABLE [dbo].[SystemUserCompany] (
        SUC_ID        INT       NOT NULL IDENTITY(1,1) PRIMARY KEY,
        SU_ID         INT       NOT NULL,
        IC_ID         INT       NOT NULL,
        SUC_IsActive  BIT       NULL,
        SUC_CreatedAt DATETIME  NULL,
        SUC_CreatedBy INT       NULL,
        SUC_UpdatedAt DATETIME  NULL,
        SUC_UpdatedBy INT       NULL,
        CONSTRAINT UK_SystemUserCompany UNIQUE (SU_ID, IC_ID)
    );
    CREATE INDEX IX_SystemUserCompany_SU_ID ON [dbo].[SystemUserCompany](SU_ID);
    CREATE INDEX IX_SystemUserCompany_IC_ID ON [dbo].[SystemUserCompany](IC_ID);
END;
```

### 1.3 เพิ่มคอลัมน์ `IC_ID` ใน `SystemRoleSystemScreen`

```sql
USE [RC_SmartSecurity_SC];
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'IC_ID'
)
BEGIN
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD IC_ID INT NULL;
END;
```

---

## ลำดับที่ 2: เพิ่มแถวใน `SystemScreen` ที่ขาด (2000, 3000, 4000, 12005)

**หมายเหตุ:** ถ้า DB ฝั่งโปรดักชันมีโครงสร้าง `SystemScreen` ไม่ตรงกับเทส (เช่น มี `SS_ShowInMenu` NOT NULL) ต้องใส่ค่าทุกคอลัมน์บังคับ ให้อิงจาก DB เทสหรือใช้ Script As → INSERT จากเทสแล้วแก้ `USE` + เปิด `IDENTITY_INSERT`

ตัวอย่าง (กรณีมีคอลัมน์ SS_RelativePath, SS_Description, SS_IsActive, SS_ShowInMenu ฯลฯ):

```sql
SET IDENTITY_INSERT [dbo].[SystemScreen] ON;

-- 2000 Dashboard
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 2000)
INSERT INTO [dbo].[SystemScreen] (SS_ID, SS_RelativePath, SS_Description, SS_IsActive, SS_Remarks, SS_ShowInMenu, SS_ImagePath, SS_Position, SS_IDParent, SS_SortChildrenByName, SS_IsExpanded, SS_Name)
VALUES (2000, '/dashboard', N'Dashboard - ภาพรวมระบบ', 1, NULL, 1, '/_base/content/images/icons-apps/bullet_green.png', 0, NULL, 0, 1, N'Dashboard');

-- 3000 Statistics
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 3000)
INSERT INTO [dbo].[SystemScreen] (SS_ID, SS_RelativePath, SS_Description, SS_IsActive, SS_Remarks, SS_ShowInMenu, SS_ImagePath, SS_Position, SS_IDParent, SS_SortChildrenByName, SS_IsExpanded, SS_Name)
VALUES (3000, '/statistics', N'Statistics - สถิติและการวิเคราะห์', 1, NULL, 1, '/_base/content/images/icons-apps/bullet_green.png', 0, NULL, 0, 1, N'Statistics');

-- 4000 Reprint
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 4000)
INSERT INTO [dbo].[SystemScreen] (SS_ID, SS_RelativePath, SS_Description, SS_IsActive, SS_Remarks, SS_ShowInMenu, SS_ImagePath, SS_Position, SS_IDParent, SS_SortChildrenByName, SS_IsExpanded, SS_Name)
VALUES (4000, '/vehicle/reprint', N'Reprint - ระบบรีปริ้น', 1, NULL, 0, '/_base/content/images/icons-apps/bullet_green.png', 1, 1101, 0, 1, N'Reprint');

-- 12005 Appearance Settings
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 12005)
INSERT INTO [dbo].[SystemScreen] (SS_ID, SS_RelativePath, SS_Description, SS_IsActive, SS_Remarks, SS_ShowInMenu, SS_ImagePath, SS_Position, SS_IDParent, SS_SortChildrenByName, SS_IsExpanded, SS_Name)
VALUES (12005, '/settings/appearance', NULL, 1, NULL, 1, NULL, 11002, 11000, NULL, NULL, N'Appearance Settings');

SET IDENTITY_INSERT [dbo].[SystemScreen] OFF;
```

---

## ลำดับที่ 3: ตั้งค่า Role Permissions (เพิ่มสิทธิ์พื้นฐาน)

- เปิดไฟล์ **`00-setup-role-permissions.sql`**
- แก้บรรทัดบนสุดเป็น: `USE [RC_SmartSecurity_SC];` (หรือชื่อ DB จริง)
- รันทั้งไฟล์

(สคริปต์นี้เพิ่มสิทธิ์ ADM/HRU/QA/RCT/SGU/SGS ให้ครบตาม design; บาง role อาจมีสิทธิ์เกินต้องตัดในขั้นถัดไป)

---

## ลำดับที่ 4: Migrate ข้อมูล User–Company

```sql
USE [RC_SmartSecurity_SC];
GO

INSERT INTO [dbo].[SystemUserCompany] (SU_ID, IC_ID, SUC_IsActive, SUC_CreatedAt)
SELECT SU.SU_ID, SU.IC_ID, 1, GETDATE()
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL
  AND SU.SU_Active = 1
  AND IC.IC_IsActive = 1
  AND NOT EXISTS (
      SELECT 1 FROM [dbo].[SystemUserCompany] SUC
      WHERE SUC.SU_ID = SU.SU_ID AND SUC.IC_ID = SU.IC_ID
  );
```

---

## ลำดับที่ 5: ให้ทุก Role เข้า Dashboard ได้ (Global)

```sql
USE [RC_SmartSecurity_SC];
GO

DECLARE @RoleADM INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM');
DECLARE @RoleHRU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');
DECLARE @RoleQA  INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'QA');
DECLARE @RoleRCT INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'RCT');
DECLARE @RoleSGU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU');
DECLARE @RoleSGS INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGS');

IF @RoleADM IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 2000, NULL, '', '');
IF @RoleHRU IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 2000, NULL, '', '');
IF @RoleQA  IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA  AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA,  2000, NULL, '', '');
IF @RoleRCT IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT, 2000, NULL, '', '');
IF @RoleSGU IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGU, 2000, NULL, '', '');
IF @RoleSGS IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGS AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGS, 2000, NULL, '', '');
```

---

## ลำดับที่ 6: ตัดสิทธิ์ส่วนเกินของ HRU (เหลือแค่ Reports, Visit, Dashboard)

```sql
USE [RC_SmartSecurity_SC];
GO

DECLARE @RoleHRU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');
IF @RoleHRU IS NOT NULL
DELETE FROM [dbo].[SystemRoleSystemScreen]
WHERE SR_ID = @RoleHRU AND SS_ID NOT IN (1000, 1100, 2000);
```

---

## ลำดับที่ 7: ตัดสิทธิ์ส่วนเกินของ SGS / SGU (เหลือแค่ Dashboard)

```sql
USE [RC_SmartSecurity_SC];
GO

DECLARE @RoleSGS INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGS');
DECLARE @RoleSGU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU');
IF @RoleSGS IS NOT NULL
DELETE FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGS AND SS_ID <> 2000;
IF @RoleSGU IS NOT NULL
DELETE FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID <> 2000;
```

---

## ลำดับที่ 8: ให้ QA / RCT / ADM ดู Statistics (3000)

```sql
USE [RC_SmartSecurity_SC];
GO

DECLARE @RoleQA  INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'QA');
DECLARE @RoleRCT INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'RCT');
DECLARE @RoleADM INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM');

IF @RoleQA  IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA  AND SS_ID = 3000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA,  3000, NULL, '', '');
IF @RoleRCT IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 3000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT, 3000, NULL, '', '');
IF @RoleADM IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 3000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 3000, NULL, '', '');
```

---

## ลำดับที่ 9 (ถ้าต้องการ): สร้าง user Superadmin

```sql
USE [RC_SmartSecurity_SC];
GO

DECLARE @RoleADM INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM');
IF @RoleADM IS NULL BEGIN RAISERROR('Role ADM not found', 16, 1); RETURN; END;

IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemUser] WHERE SU_ID = 9999 OR SU_Username = 'sysadmin')
BEGIN
    SET IDENTITY_INSERT [dbo].[SystemUser] ON;
    INSERT INTO [dbo].[SystemUser] (SU_ID, SU_Code, SU_Name1, SU_Name2, SU_Email, SU_Username, SU_Password, SU_Remarks, SU_Active, SU_LogOn, SU_PinCode, User_Location, IC_ID, SR_ID)
    VALUES (9999, '9999', N'Systemadmin', N'Systemadmin', NULL, 'sysadmin', 'simpleadmin', N'Super Admin', 1, NULL, NULL, NULL, NULL, @RoleADM);
    SET IDENTITY_INSERT [dbo].[SystemUser] OFF;
END;
```

**หมายเหตุ:** Superadmin ไม่ต้องมีแถวใน `SystemUserCompany` (IC_ID = NULL = ดูได้ทุกบริษัท)

---

## ลำดับที่ 10 (ถ้าต้องการ): ให้ user เก่าที่ SR_ID เป็น NULL กลายเป็น SGU (ไม่ทับ sysadmin)

```sql
USE [RC_SmartSecurity_SC];
GO

DECLARE @RoleSGU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU');
IF @RoleSGU IS NULL BEGIN RAISERROR('Role SGU not found', 16, 1); RETURN; END;

UPDATE SU SET SR_ID = @RoleSGU
FROM [dbo].[SystemUser] SU
WHERE SU.SR_ID IS NULL
  AND SU.SU_Active = 1
  AND SU.SU_Username <> 'sysadmin'
  AND SU.SU_ID <> 9999;
```

---

## สรุป: อันไหนใช้ได้ / ใช้เมื่อไหร่ (ใช้ได้ทั้งหมด ✅)

| ลำดับ | ใช้ได้ | ใช้เมื่อ |
|-------|--------|----------|
| **1.1** | ✅ | DB ยังไม่มีตาราง `SystemSettings` |
| **1.2** | ✅ | DB ยังไม่มีตาราง `SystemUserCompany` |
| **1.3** | ✅ | ตาราง `SystemRoleSystemScreen` ยังไม่มีคอลัมน์ `IC_ID` |
| **2** | ✅ | DB ยังไม่มีแถว `SystemScreen` สำหรับ 2000, 3000, 4000, 12005 (เช็คโครงสร้างคอลัมน์ให้ตรงเทส) |
| **3** | ✅ | ตั้งสิทธิ์ Role พื้นฐาน (ADM/HRU/QA/RCT/SGU/SGS) — รันหลังขั้น 2 |
| **4** | ✅ | มี `SystemUser` + `InternalCompany` อยู่แล้ว ต้องการเติม `SystemUserCompany` จาก `IC_ID` เดิม |
| **5** | ✅ | ให้ทุก Role เข้า Dashboard (2000) ได้แบบ Global (ป้องกัน Permission denied) |
| **6** | ✅ | ตัดสิทธิ์ HRU เหลือแค่ 1000, 1100, 2000 |
| **7** | ✅ | ตัดสิทธิ์ SGS/SGU เหลือแค่ 2000 (Dashboard เท่านั้น) |
| **8** | ✅ | ให้ QA, RCT, ADM ดู Statistics (3000) ได้ |
| **9** | ✅ | (ถ้าต้องการ) สร้าง user Superadmin: `sysadmin` / `simpleadmin` |
| **10** | ✅ | (ถ้าต้องการ) ให้ user เก่าที่ `SR_ID = NULL` กลายเป็น SGU (ไม่ทับ sysadmin) |

**รันครั้งเดียว:** ใช้ `NEW-DB-FULL-SETUP.sql` — แก้ `USE [ชื่อDB];` ด้านบนแล้วรันทั้งไฟล์ (ลำดับ 1→10 อยู่ในไฟล์เดียว)

**ตรวจสอบหลังตั้งค่า:** รัน `00-check-role-permissions.sql` (แก้ USE เป็นชื่อ DB จริง) แล้วทดสอบ login แต่ละ role บนเว็บ
