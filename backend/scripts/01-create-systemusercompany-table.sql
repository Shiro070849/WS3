-- ============================================================
-- สร้างตาราง SystemUserCompany
-- ============================================================
-- ใช้สำหรับเก็บความสัมพันธ์ Many-to-Many ระหว่าง User และ Company
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' สร้างตาราง SystemUserCompany';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ตรวจสอบว่ามีตาราง SystemUserCompany อยู่แล้วหรือไม่
-- ============================================================
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    PRINT 'WARNING: ตาราง SystemUserCompany มีอยู่แล้ว';
    PRINT '   → ต้องการลบตารางเก่าและสร้างใหม่หรือไม่?';
    PRINT '   → ถ้าใช่ ให้ uncomment บรรทัด DROP TABLE ด้านล่าง';
    PRINT '';
    -- ถ้าต้องการลบตารางเก่า → uncomment บรรทัดนี้
    -- DROP TABLE [dbo].[SystemUserCompany];
END
ELSE
BEGIN
    PRINT ' ไม่พบตาราง SystemUserCompany → สร้างใหม่';
END

PRINT '';

-- ============================================================
-- 2. สร้างตาราง SystemUserCompany
-- ============================================================
PRINT ' 2. สร้างตาราง SystemUserCompany:';
PRINT '------------------------------------------------------------';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    CREATE TABLE [dbo].[SystemUserCompany] (
        SUC_ID INT PRIMARY KEY IDENTITY(1,1),
        SU_ID INT NOT NULL,                    -- User ID (FK to SystemUser)
        IC_ID INT NOT NULL,                     -- Company ID (FK to InternalCompany)
        SUC_IsActive BIT DEFAULT 1,             -- Soft Delete (1 = Active, 0 = Inactive)
        SUC_CreatedAt DATETIME DEFAULT GETDATE(),
        SUC_CreatedBy INT NULL,                 -- SU_ID ของคนที่สร้าง
        SUC_UpdatedAt DATETIME NULL,
        SUC_UpdatedBy INT NULL,                 -- SU_ID ของคนที่แก้ไข
        -- ไม่มี Foreign Key Constraint (ตามที่ต้องการ)
        CONSTRAINT UK_SystemUserCompany UNIQUE (SU_ID, IC_ID)  -- ป้องกันซ้ำ
    );
    
    PRINT ' สร้างตาราง SystemUserCompany สำเร็จ';
END
ELSE
BEGIN
    PRINT 'WARNING: ตาราง SystemUserCompany มีอยู่แล้ว';
END

PRINT '';

-- ============================================================
-- 3. สร้าง Indexes เพื่อ Performance
-- ============================================================
PRINT ' 3. สร้าง Indexes:';
PRINT '------------------------------------------------------------';

-- Index บน SU_ID (ใช้บ่อยที่สุด)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_SU_ID' AND object_id = OBJECT_ID('SystemUserCompany'))
BEGIN
    CREATE INDEX IX_SystemUserCompany_SU_ID ON [dbo].[SystemUserCompany](SU_ID);
    PRINT ' สร้าง Index IX_SystemUserCompany_SU_ID';
END
ELSE
BEGIN
    PRINT 'WARNING: Index IX_SystemUserCompany_SU_ID มีอยู่แล้ว';
END

-- Index บน IC_ID
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_IC_ID' AND object_id = OBJECT_ID('SystemUserCompany'))
BEGIN
    CREATE INDEX IX_SystemUserCompany_IC_ID ON [dbo].[SystemUserCompany](IC_ID);
    PRINT ' สร้าง Index IX_SystemUserCompany_IC_ID';
END
ELSE
BEGIN
    PRINT 'WARNING: Index IX_SystemUserCompany_IC_ID มีอยู่แล้ว';
END

-- Index บน SUC_IsActive (สำหรับ Filter Active records)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_IsActive' AND object_id = OBJECT_ID('SystemUserCompany'))
BEGIN
    CREATE INDEX IX_SystemUserCompany_IsActive ON [dbo].[SystemUserCompany](SUC_IsActive);
    PRINT ' สร้าง Index IX_SystemUserCompany_IsActive';
END
ELSE
BEGIN
    PRINT 'WARNING: Index IX_SystemUserCompany_IsActive มีอยู่แล้ว';
END

-- Composite Index สำหรับ Query ที่ใช้บ่อย (SU_ID + SUC_IsActive)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_SU_ID_IsActive' AND object_id = OBJECT_ID('SystemUserCompany'))
BEGIN
    CREATE INDEX IX_SystemUserCompany_SU_ID_IsActive ON [dbo].[SystemUserCompany](SU_ID, SUC_IsActive);
    PRINT ' สร้าง Index IX_SystemUserCompany_SU_ID_IsActive';
END
ELSE
BEGIN
    PRINT 'WARNING: Index IX_SystemUserCompany_SU_ID_IsActive มีอยู่แล้ว';
END

PRINT '';

-- ============================================================
-- 4. ตรวจสอบโครงสร้างตาราง
-- ============================================================
PRINT ' 4. ตรวจสอบโครงสร้างตาราง:';
PRINT '------------------------------------------------------------';

SELECT
    COLUMN_NAME AS 'Column',
    DATA_TYPE AS 'Type',
    CHARACTER_MAXIMUM_LENGTH AS 'Max Length',
    IS_NULLABLE AS 'Nullable',
    COLUMN_DEFAULT AS 'Default'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SystemUserCompany'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- ============================================================
-- 5. ตรวจสอบ Indexes
-- ============================================================
PRINT ' 5. ตรวจสอบ Indexes:';
PRINT '------------------------------------------------------------';

SELECT 
    i.name AS 'Index Name',
    i.type_desc AS 'Index Type',
    COL_NAME(ic.object_id, ic.column_id) AS 'Column Name',
    i.is_unique AS 'Is Unique'
FROM sys.indexes i
INNER JOIN sys.index_columns ic 
    ON i.object_id = ic.object_id AND i.index_id = ic.index_id
WHERE OBJECT_NAME(i.object_id) = 'SystemUserCompany'
    AND i.is_primary_key = 0
ORDER BY i.name, ic.key_ordinal;

PRINT '';

-- ============================================================
-- 6. ตรวจสอบ Constraints
-- ============================================================
PRINT ' 6. ตรวจสอบ Constraints:';
PRINT '------------------------------------------------------------';

SELECT 
    tc.CONSTRAINT_NAME AS 'Constraint Name',
    tc.CONSTRAINT_TYPE AS 'Type',
    kcu.COLUMN_NAME AS 'Column Name'
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
    ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
WHERE tc.TABLE_NAME = 'SystemUserCompany'
ORDER BY tc.CONSTRAINT_TYPE, kcu.ORDINAL_POSITION;

PRINT '';
PRINT '============================================================';
PRINT ' เสร็จสิ้นการสร้างตาราง!';
PRINT '============================================================';
PRINT '';
PRINT ' ขั้นตอนต่อไป:';
PRINT '   1. รัน Script: 02-migrate-user-companies.sql';
PRINT '   2. ตรวจสอบข้อมูลด้วย: 03-verify-migration.sql';

