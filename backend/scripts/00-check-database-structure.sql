-- ============================================================
-- ตรวจสอบโครงสร้าง Database ทั้งหมด
-- ============================================================
-- ใช้สำหรับตรวจสอบโครงสร้างก่อนเริ่มงาน
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' ตรวจสอบโครงสร้าง Database ทั้งหมด';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ตรวจสอบตารางหลัก (Core Tables)
-- ============================================================
PRINT ' 1. ตารางหลัก (Core Tables):';
PRINT '------------------------------------------------------------';

SELECT 
    TABLE_NAME AS 'Table Name',
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) AS 'Column Count'
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
    AND TABLE_NAME IN (
        'SystemUser',
        'SystemRole',
        'SystemScreen',
        'InternalCompany',
        'InternalDepartment',
        'VisitType',
        'WayIn',
        'WayOut',
        'SystemSettings'
    )
ORDER BY TABLE_NAME;

PRINT '';

-- ============================================================
-- 2. ตรวจสอบตาราง Junction (Many-to-Many)
-- ============================================================
PRINT ' 2. ตาราง Junction (Many-to-Many):';
PRINT '------------------------------------------------------------';

SELECT 
    TABLE_NAME AS 'Table Name',
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) AS 'Column Count'
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
    AND TABLE_NAME IN (
        'SystemUserSystemRole',
        'SystemRoleSystemScreen',
        'InternalCompanyDepartment'
    )
ORDER BY TABLE_NAME;

PRINT '';

-- ============================================================
-- 3. ตรวจสอบโครงสร้าง SystemUser
-- ============================================================
PRINT ' 3. โครงสร้าง SystemUser:';
PRINT '------------------------------------------------------------';

SELECT
    COLUMN_NAME AS 'Column',
    DATA_TYPE AS 'Type',
    CHARACTER_MAXIMUM_LENGTH AS 'Max Length',
    IS_NULLABLE AS 'Nullable',
    COLUMN_DEFAULT AS 'Default'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SystemUser'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- ============================================================
-- 4. ตรวจสอบ Foreign Keys ของ SystemUser
-- ============================================================
PRINT ' 4. Foreign Keys ของ SystemUser:';
PRINT '------------------------------------------------------------';

SELECT
    fk.name AS 'Constraint Name',
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS 'Column',
    OBJECT_NAME(fk.referenced_object_id) AS 'Referenced Table',
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS 'Referenced Column'
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fc
    ON fk.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) = 'SystemUser'
ORDER BY fk.name;

PRINT '';

-- ============================================================
-- 5. ตรวจสอบตาราง SystemUserSystemRole (ถ้ามี)
-- ============================================================
PRINT ' 5. ตรวจสอบตาราง SystemUserSystemRole:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserSystemRole')
BEGIN
    SELECT
        COLUMN_NAME AS 'Column',
        DATA_TYPE AS 'Type',
        IS_NULLABLE AS 'Nullable'
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'SystemUserSystemRole'
    ORDER BY ORDINAL_POSITION;
    
    PRINT '';
    PRINT ' ข้อมูลตัวอย่าง:';
    SELECT TOP 5 * FROM [dbo].[SystemUserSystemRole];
END
ELSE
BEGIN
    PRINT 'ERROR: ไม่พบตาราง SystemUserSystemRole';
END

PRINT '';

-- ============================================================
-- 6. ตรวจสอบตาราง SystemRoleSystemScreen
-- ============================================================
PRINT ' 6. โครงสร้าง SystemRoleSystemScreen:';
PRINT '------------------------------------------------------------';

SELECT
    COLUMN_NAME AS 'Column',
    DATA_TYPE AS 'Type',
    IS_NULLABLE AS 'Nullable'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SystemRoleSystemScreen'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- ============================================================
-- 7. ตรวจสอบตาราง InternalCompanyDepartment
-- ============================================================
PRINT ' 7. โครงสร้าง InternalCompanyDepartment:';
PRINT '------------------------------------------------------------';



PRINT '';

-- ============================================================
-- 8. ตรวจสอบว่ามีตาราง SystemUserCompany หรือไม่
-- ============================================================
PRINT ' 8. ตรวจสอบตาราง SystemUserCompany:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    PRINT ' พบตาราง SystemUserCompany';
    SELECT
        COLUMN_NAME AS 'Column',
        DATA_TYPE AS 'Type',
        IS_NULLABLE AS 'Nullable'
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'SystemUserCompany'
    ORDER BY ORDINAL_POSITION;
    
    PRINT '';
    PRINT ' ข้อมูลตัวอย่าง:';
    SELECT TOP 5 * FROM [dbo].[SystemUserCompany];
END
ELSE
BEGIN
    PRINT 'ERROR: ไม่พบตาราง SystemUserCompany (ต้องสร้างใหม่)';
END

PRINT '';

-- ============================================================
-- 9. สถิติข้อมูล SystemUser
-- ============================================================
PRINT ' 9. สถิติข้อมูล SystemUser:';
PRINT '------------------------------------------------------------';

SELECT
    COUNT(*) AS 'Total Users',
    COUNT(CASE WHEN IC_ID IS NULL THEN 1 END) AS 'Super Admin (IC_ID = NULL)',
    COUNT(CASE WHEN IC_ID IS NOT NULL THEN 1 END) AS 'Company Users',
    COUNT(DISTINCT IC_ID) AS 'Unique Companies'
FROM [dbo].[SystemUser]
WHERE SU_Active = 1;

PRINT '';

-- ============================================================
-- 10. ตรวจสอบความสัมพันธ์ User-Role
-- ============================================================
PRINT ' 10. ความสัมพันธ์ User-Role:';
PRINT '------------------------------------------------------------';

-- Users ที่มี SR_ID ใน SystemUser
SELECT 
    'SystemUser.SR_ID' AS 'Source',
    COUNT(*) AS 'User Count',
    COUNT(DISTINCT SR_ID) AS 'Unique Roles'
FROM [dbo].[SystemUser]
WHERE SR_ID IS NOT NULL AND SU_Active = 1;

-- Users ที่มี Role ใน SystemUserSystemRole
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserSystemRole')
BEGIN
    SELECT 
        'SystemUserSystemRole' AS 'Source',
        COUNT(*) AS 'User Count',
        COUNT(DISTINCT SR_ID) AS 'Unique Roles'
    FROM [dbo].[SystemUserSystemRole];
END

PRINT '';

-- ============================================================
-- 11. ตรวจสอบความสัมพันธ์ User-Company
-- ============================================================
PRINT ' 11. ความสัมพันธ์ User-Company:';
PRINT '------------------------------------------------------------';

-- Users ที่มี IC_ID ใน SystemUser
SELECT 
    'SystemUser.IC_ID' AS 'Source',
    COUNT(*) AS 'User Count',
    COUNT(DISTINCT IC_ID) AS 'Unique Companies'
FROM [dbo].[SystemUser]
WHERE IC_ID IS NOT NULL AND SU_Active = 1;

-- Users ที่มี Company ใน SystemUserCompany (ถ้ามี)
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    SELECT 
        'SystemUserCompany' AS 'Source',
        COUNT(*) AS 'Record Count',
        COUNT(DISTINCT SU_ID) AS 'Unique Users',
        COUNT(DISTINCT IC_ID) AS 'Unique Companies'
    FROM [dbo].[SystemUserCompany]
    WHERE SUC_IsActive = 1;
END

PRINT '';

-- ============================================================
-- 12. ตรวจสอบ Users ที่มีหลาย Company (ถ้ามี SystemUserCompany)
-- ============================================================
PRINT ' 12. Users ที่มีหลาย Company:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    SELECT 
        SU.SU_ID,
        SU.SU_Username,
        SU.SU_Name1,
        COUNT(SUC.IC_ID) AS 'Company Count',
        STRING_AGG(CAST(SUC.IC_ID AS VARCHAR), ', ') AS 'Company IDs'
    FROM [dbo].[SystemUser] SU
    INNER JOIN [dbo].[SystemUserCompany] SUC ON SU.SU_ID = SUC.SU_ID
    WHERE SUC.SUC_IsActive = 1
    GROUP BY SU.SU_ID, SU.SU_Username, SU.SU_Name1
    HAVING COUNT(SUC.IC_ID) > 1
    ORDER BY COUNT(SUC.IC_ID) DESC;
END
ELSE
BEGIN
    PRINT 'ERROR: ไม่พบตาราง SystemUserCompany';
END

PRINT '';

-- ============================================================
-- 13. ตรวจสอบ Indexes ที่เกี่ยวข้อง
-- ============================================================
PRINT ' 13. Indexes ที่เกี่ยวข้อง:';
PRINT '------------------------------------------------------------';

SELECT 
    OBJECT_NAME(i.object_id) AS 'Table Name',
    i.name AS 'Index Name',
    i.type_desc AS 'Index Type',
    COL_NAME(ic.object_id, ic.column_id) AS 'Column Name',
    i.is_unique AS 'Is Unique'
FROM sys.indexes i
INNER JOIN sys.index_columns ic 
    ON i.object_id = ic.object_id AND i.index_id = ic.index_id
WHERE OBJECT_NAME(i.object_id) IN (
    'SystemUser',
    'SystemUserSystemRole',
    'SystemUserCompany',
    'SystemRoleSystemScreen',
    'InternalCompany',
    'InternalCompanyDepartment'
)
AND i.is_primary_key = 0  -- ไม่แสดง Primary Key
ORDER BY OBJECT_NAME(i.object_id), i.name, ic.key_ordinal;

PRINT '';

-- ============================================================
-- 14. ตรวจสอบ Constraints (Unique, Check)
-- ============================================================
PRINT ' 14. Constraints (Unique, Check):';
PRINT '------------------------------------------------------------';

SELECT 
    tc.TABLE_NAME AS 'Table Name',
    tc.CONSTRAINT_NAME AS 'Constraint Name',
    tc.CONSTRAINT_TYPE AS 'Type',
    kcu.COLUMN_NAME AS 'Column Name'
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
    ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
WHERE tc.TABLE_NAME IN (
    'SystemUser',
    'SystemUserSystemRole',
    'SystemUserCompany',
    'SystemRoleSystemScreen',
    'InternalCompanyDepartment'
)
AND tc.CONSTRAINT_TYPE IN ('UNIQUE', 'CHECK')
ORDER BY tc.TABLE_NAME, tc.CONSTRAINT_TYPE, kcu.ORDINAL_POSITION;

PRINT '';

-- ============================================================
-- 15. สรุปโครงสร้างที่ต้องสร้าง
-- ============================================================
PRINT ' 15. สรุปโครงสร้างที่ต้องสร้าง:';
PRINT '------------------------------------------------------------';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    PRINT ' ต้องสร้างตาราง SystemUserCompany';
    PRINT '   - SUC_ID (INT, PK, IDENTITY)';
    PRINT '   - SU_ID (INT, NOT NULL)';
    PRINT '   - IC_ID (INT, NOT NULL)';
    PRINT '   - SUC_IsActive (BIT, DEFAULT 1)';
    PRINT '   - SUC_CreatedAt (DATETIME, DEFAULT GETDATE())';
    PRINT '   - SUC_CreatedBy (INT, NULL)';
    PRINT '   - UNIQUE (SU_ID, IC_ID)';
END
ELSE
BEGIN
    PRINT ' ตาราง SystemUserCompany มีอยู่แล้ว';
END

PRINT '';
PRINT '============================================================';
PRINT ' เสร็จสิ้นการตรวจสอบ!';
PRINT '============================================================';

