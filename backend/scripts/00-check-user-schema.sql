-- ============================================================
-- ตรวจสอบ Schema ของตาราง SystemUser
-- ============================================================
-- เช็คก่อนทำการแก้ไขอะไรก็ตาม
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' ตรวจสอบโครงสร้างของตาราง SystemUser';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ดูโครงสร้าง Columns ทั้งหมด
-- ============================================================
PRINT ' 1. Column Schema:';
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
-- 2. ดู Foreign Key Constraints
-- ============================================================
PRINT ' 2. Foreign Key Constraints:';
PRINT '------------------------------------------------------------';

SELECT
    fk.name AS 'Constraint Name',
    OBJECT_NAME(fk.parent_object_id) AS 'Table',
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
-- 3. ดู Primary Key และ Unique Constraints
-- ============================================================
PRINT ' 3. Primary Key และ Unique Constraints:';
PRINT '------------------------------------------------------------';

SELECT
    tc.CONSTRAINT_NAME AS 'Constraint',
    tc.CONSTRAINT_TYPE AS 'Type',
    kcu.COLUMN_NAME AS 'Column'
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
    ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
WHERE tc.TABLE_NAME = 'SystemUser'
    AND tc.CONSTRAINT_TYPE IN ('PRIMARY KEY', 'UNIQUE')
ORDER BY tc.CONSTRAINT_TYPE, kcu.ORDINAL_POSITION;

PRINT '';

-- ============================================================
-- 4. ดู Indexes
-- ============================================================
PRINT ' 4. Indexes:';
PRINT '------------------------------------------------------------';

SELECT
    i.name AS 'Index Name',
    i.type_desc AS 'Type',
    COL_NAME(ic.object_id, ic.column_id) AS 'Column',
    i.is_unique AS 'Is Unique',
    i.is_primary_key AS 'Is Primary Key'
FROM sys.indexes i
INNER JOIN sys.index_columns ic
    ON i.object_id = ic.object_id
    AND i.index_id = ic.index_id
WHERE OBJECT_NAME(i.object_id) = 'SystemUser'
ORDER BY i.name, ic.key_ordinal;

PRINT '';

-- ============================================================
-- 5. ตรวจสอบข้อมูลตัวอย่าง IC_ID
-- ============================================================
PRINT ' 5. ตัวอย่างข้อมูล IC_ID ปัจจุบัน:';
PRINT '------------------------------------------------------------';

SELECT TOP 10
    SU_ID,
    SU_Code,
    SU_Username,
    IC_ID,
    SR_ID,
    SU_Active
FROM [dbo].[SystemUser]
ORDER BY SU_ID;

PRINT '';

-- ============================================================
-- 6. สถิติข้อมูล IC_ID
-- ============================================================
PRINT ' 6. สถิติ IC_ID:';
PRINT '------------------------------------------------------------';

SELECT
    IC_ID,
    COUNT(*) AS 'จำนวน Users',
    STRING_AGG(SU_Code, ', ') AS 'User Codes'
FROM [dbo].[SystemUser]
WHERE SU_Active = 1
GROUP BY IC_ID
ORDER BY IC_ID;

PRINT '';

-- ============================================================
-- 7. ตรวจสอบว่า IC_ID เป็น NULL ได้หรือไม่
-- ============================================================
PRINT ' 7. Users ที่มี IC_ID = NULL (Super Admin):';
PRINT '------------------------------------------------------------';

SELECT
    SU_ID,
    SU_Code,
    SU_Username,
    SR_ID,
    IC_ID
FROM [dbo].[SystemUser]
WHERE IC_ID IS NULL
ORDER BY SU_ID;

PRINT '';
PRINT '============================================================';
PRINT ' เสร็จสิ้น!';
PRINT '============================================================';

