-- ============================================================
-- STEP 2: สร้างตาราง SystemUserCompany
-- ============================================================
-- ตารางนี้เก็บความสัมพันธ์ระหว่าง User กับ Company (หลายบริษัทต่อ 1 คน)
-- Backend ใช้ตารางนี้ใน:
--   - settings.service.js -> getUserAccessibleCompanies()
--   - settings.service.js -> getUserAccessibleCompanyIds()
--   - settings.service.js -> getUserById()
--   - settings.service.js -> createUser(), updateUser()
--   - permission.service.js -> getUserAccessibleScreens()
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' STEP 2: สร้างตาราง SystemUserCompany';
PRINT '============================================================';
PRINT '';

-- สร้างตาราง
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    CREATE TABLE [dbo].[SystemUserCompany] (
        SUC_ID INT PRIMARY KEY IDENTITY(1,1),    -- PK อัตโนมัติ
        SU_ID INT NOT NULL,                       -- รหัส User
        IC_ID INT NOT NULL,                       -- รหัสบริษัท
        SUC_IsActive BIT DEFAULT 1,               -- 1 = ใช้งาน, 0 = ปิด
        SUC_CreatedAt DATETIME DEFAULT GETDATE(), -- วันที่สร้าง
        SUC_CreatedBy INT NULL,                   -- สร้างโดย User ไหน
        SUC_UpdatedAt DATETIME NULL,              -- วันที่แก้ไขล่าสุด
        SUC_UpdatedBy INT NULL,                   -- แก้ไขโดย User ไหน
        CONSTRAINT UK_SystemUserCompany UNIQUE (SU_ID, IC_ID) -- ป้องกันข้อมูลซ้ำ
    );
    PRINT '  [สร้างสำเร็จ] ตาราง SystemUserCompany';
END
ELSE
BEGIN
    PRINT '  [มีแล้ว] ตาราง SystemUserCompany';
END

PRINT '';

-- สร้าง Indexes สำหรับความเร็ว
PRINT '--- สร้าง Indexes ---';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_SU_ID' AND object_id = OBJECT_ID('SystemUserCompany'))
BEGIN
    CREATE INDEX IX_SystemUserCompany_SU_ID ON [dbo].[SystemUserCompany](SU_ID);
    PRINT '  [สร้าง] IX_SystemUserCompany_SU_ID (ค้นหาตาม User)';
END
ELSE PRINT '  [มีแล้ว] IX_SystemUserCompany_SU_ID';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_IC_ID' AND object_id = OBJECT_ID('SystemUserCompany'))
BEGIN
    CREATE INDEX IX_SystemUserCompany_IC_ID ON [dbo].[SystemUserCompany](IC_ID);
    PRINT '  [สร้าง] IX_SystemUserCompany_IC_ID (ค้นหาตามบริษัท)';
END
ELSE PRINT '  [มีแล้ว] IX_SystemUserCompany_IC_ID';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_IsActive' AND object_id = OBJECT_ID('SystemUserCompany'))
BEGIN
    CREATE INDEX IX_SystemUserCompany_IsActive ON [dbo].[SystemUserCompany](SUC_IsActive);
    PRINT '  [สร้าง] IX_SystemUserCompany_IsActive (กรองสถานะ)';
END
ELSE PRINT '  [มีแล้ว] IX_SystemUserCompany_IsActive';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_SU_ID_IsActive' AND object_id = OBJECT_ID('SystemUserCompany'))
BEGIN
    CREATE INDEX IX_SystemUserCompany_SU_ID_IsActive ON [dbo].[SystemUserCompany](SU_ID, SUC_IsActive);
    PRINT '  [สร้าง] IX_SystemUserCompany_SU_ID_IsActive (ค้นหา User + สถานะ)';
END
ELSE PRINT '  [มีแล้ว] IX_SystemUserCompany_SU_ID_IsActive';

PRINT '';

-- แสดงโครงสร้างตารางที่สร้าง
PRINT '--- ตรวจสอบโครงสร้าง ---';
SELECT
    COLUMN_NAME AS [ชื่อ Column],
    DATA_TYPE AS [ชนิดข้อมูล],
    IS_NULLABLE AS [อนุญาต NULL],
    COLUMN_DEFAULT AS [ค่าเริ่มต้น]
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SystemUserCompany'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '============================================================';
PRINT ' STEP 2 เสร็จสิ้น';
PRINT ' ขั้นตอนต่อไป: รัน PROD-step3-create-support-tables.sql';
PRINT '============================================================';
