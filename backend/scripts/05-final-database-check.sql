-- ============================================================
-- ตรวจสอบสุดท้าย: Database พร้อมใช้งานหรือไม่
-- ============================================================
-- ใช้สำหรับตรวจสอบว่าทุกอย่างครบถ้วนหรือไม่
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' ตรวจสอบสุดท้าย: Database พร้อมใช้งานหรือไม่';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ตรวจสอบว่าตาราง SystemUserCompany มีอยู่
-- ============================================================
PRINT ' 1. ตรวจสอบตาราง SystemUserCompany:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    PRINT ' ตาราง SystemUserCompany มีอยู่แล้ว';
    
    -- ตรวจสอบโครงสร้าง
    SELECT 
        COLUMN_NAME AS 'Column',
        DATA_TYPE AS 'Type',
        IS_NULLABLE AS 'Nullable',
        COLUMN_DEFAULT AS 'Default'
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'SystemUserCompany'
    ORDER BY ORDINAL_POSITION;
END
ELSE
BEGIN
    PRINT 'ERROR: ตาราง SystemUserCompany ไม่มี → ต้องสร้างก่อน';
END

PRINT '';

-- ============================================================
-- 2. ตรวจสอบ Indexes
-- ============================================================
PRINT ' 2. ตรวจสอบ Indexes:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
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
    
    -- ตรวจสอบว่า Indexes ครบหรือไม่
    DECLARE @IndexCount INT;
    SELECT @IndexCount = COUNT(DISTINCT i.name)
    FROM sys.indexes i
    WHERE OBJECT_NAME(i.object_id) = 'SystemUserCompany'
        AND i.is_primary_key = 0;
    
    IF @IndexCount >= 4
    BEGIN
        PRINT ' Indexes ครบถ้วน (' + CAST(@IndexCount AS VARCHAR) + ' indexes)';
    END
    ELSE
    BEGIN
        PRINT 'WARNING: Indexes ไม่ครบ (มี ' + CAST(@IndexCount AS VARCHAR) + ' indexes, ควรมี 4+)';
    END
END

PRINT '';

-- ============================================================
-- 3. ตรวจสอบ Constraints
-- ============================================================
PRINT ' 3. ตรวจสอบ Constraints:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    SELECT 
        tc.CONSTRAINT_NAME AS 'Constraint Name',
        tc.CONSTRAINT_TYPE AS 'Type',
        kcu.COLUMN_NAME AS 'Column Name'
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
    WHERE tc.TABLE_NAME = 'SystemUserCompany'
    ORDER BY tc.CONSTRAINT_TYPE, kcu.ORDINAL_POSITION;
    
    -- ตรวจสอบว่า UNIQUE Constraint มีหรือไม่
    IF EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_NAME = 'SystemUserCompany' 
            AND CONSTRAINT_TYPE = 'UNIQUE'
    )
    BEGIN
        PRINT ' UNIQUE Constraint มีอยู่แล้ว (ป้องกันซ้ำ)';
    END
    ELSE
    BEGIN
        PRINT 'WARNING: UNIQUE Constraint ไม่มี → ควรสร้าง';
    END
END

PRINT '';

-- ============================================================
-- 4. ตรวจสอบข้อมูลใน SystemUserCompany
-- ============================================================
PRINT ' 4. ตรวจสอบข้อมูลใน SystemUserCompany:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    SELECT 
        COUNT(*) AS 'Total Records',
        COUNT(DISTINCT SU_ID) AS 'Unique Users',
        COUNT(DISTINCT IC_ID) AS 'Unique Companies',
        COUNT(CASE WHEN SUC_IsActive = 1 THEN 1 END) AS 'Active Records',
        COUNT(CASE WHEN SUC_IsActive = 0 THEN 1 END) AS 'Inactive Records'
    FROM [dbo].[SystemUserCompany];
    
    -- ตรวจสอบว่ามีข้อมูลหรือไม่
    DECLARE @RecordCount INT;
    SELECT @RecordCount = COUNT(*) FROM [dbo].[SystemUserCompany] WHERE SUC_IsActive = 1;
    
    IF @RecordCount > 0
    BEGIN
        PRINT ' มีข้อมูลใน SystemUserCompany (' + CAST(@RecordCount AS VARCHAR) + ' records)';
    END
    ELSE
    BEGIN
        PRINT 'WARNING: ยังไม่มีข้อมูลใน SystemUserCompany → ต้อง Migration';
    END
END

PRINT '';

-- ============================================================
-- 5. ตรวจสอบความสอดคล้อง: SystemUser vs SystemUserCompany
-- ============================================================
PRINT ' 5. ตรวจสอบความสอดคล้อง: SystemUser vs SystemUserCompany:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    -- Users ที่มี IC_ID ใน SystemUser แต่ไม่มีใน SystemUserCompany
    DECLARE @MissingCount INT;
    SELECT @MissingCount = COUNT(*)
    FROM [dbo].[SystemUser] SU
    INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
    WHERE SU.IC_ID IS NOT NULL 
        AND SU.SU_Active = 1
        AND IC.IC_IsActive = 1
        AND NOT EXISTS (
            SELECT 1 
            FROM [dbo].[SystemUserCompany] SUC
            WHERE SUC.SU_ID = SU.SU_ID 
                AND SUC.IC_ID = SU.IC_ID
                AND SUC.SUC_IsActive = 1
        );
    
    IF @MissingCount = 0
    BEGIN
        PRINT ' ข้อมูลสอดคล้องกัน (ไม่มี Users ที่ยังไม่ได้ migrate)';
    END
    ELSE
    BEGIN
        PRINT 'WARNING: พบ Users ที่ยังไม่ได้ migrate: ' + CAST(@MissingCount AS VARCHAR) + ' คน';
        PRINT '   → ต้องรัน Migration Script อีกครั้ง';
    END
END

PRINT '';

-- ============================================================
-- 6. ตรวจสอบ Foreign Keys (ถ้าต้องการ)
-- ============================================================
PRINT ' 6. ตรวจสอบ Foreign Keys:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    SELECT
        fk.name AS 'FK Name',
        COL_NAME(fc.parent_object_id, fc.parent_column_id) AS 'Column',
        OBJECT_NAME(fk.referenced_object_id) AS 'Referenced Table',
        COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS 'Referenced Column'
    FROM sys.foreign_keys AS fk
    INNER JOIN sys.foreign_key_columns AS fc
        ON fk.object_id = fc.constraint_object_id
    WHERE OBJECT_NAME(fk.parent_object_id) = 'SystemUserCompany'
    ORDER BY fk.name;
    
    DECLARE @FKCount INT;
    SELECT @FKCount = COUNT(*)
    FROM sys.foreign_keys
    WHERE OBJECT_NAME(parent_object_id) = 'SystemUserCompany';
    
    IF @FKCount = 0
    BEGIN
        PRINT ' ไม่มี Foreign Key (ตามที่ต้องการ - ไม่ enforce FK)';
    END
    ELSE
    BEGIN
        PRINT 'WARNING: มี Foreign Key (' + CAST(@FKCount AS VARCHAR) + ' FKs)';
    END
END

PRINT '';

-- ============================================================
-- 7. สรุป: Database พร้อมใช้งานหรือไม่
-- ============================================================
PRINT ' 7. สรุป: Database พร้อมใช้งานหรือไม่';
PRINT '------------------------------------------------------------';

DECLARE @ReadyScore INT = 0;
DECLARE @TotalChecks INT = 5;

-- Check 1: ตารางมีอยู่
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
    SET @ReadyScore = @ReadyScore + 1;

-- Check 2: มี Indexes
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    DECLARE @IndexCount2 INT;
    SELECT @IndexCount2 = COUNT(DISTINCT i.name)
    FROM sys.indexes i
    WHERE OBJECT_NAME(i.object_id) = 'SystemUserCompany'
        AND i.is_primary_key = 0;
    
    IF @IndexCount2 >= 4
        SET @ReadyScore = @ReadyScore + 1;
END

-- Check 3: มี UNIQUE Constraint
IF EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_NAME = 'SystemUserCompany' 
        AND CONSTRAINT_TYPE = 'UNIQUE'
)
    SET @ReadyScore = @ReadyScore + 1;

-- Check 4: มีข้อมูล
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    DECLARE @RecordCount2 INT;
    SELECT @RecordCount2 = COUNT(*) FROM [dbo].[SystemUserCompany] WHERE SUC_IsActive = 1;
    
    IF @RecordCount2 > 0
        SET @ReadyScore = @ReadyScore + 1;
END

-- Check 5: ข้อมูลสอดคล้อง
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    DECLARE @MissingCount2 INT;
    SELECT @MissingCount2 = COUNT(*)
    FROM [dbo].[SystemUser] SU
    INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
    WHERE SU.IC_ID IS NOT NULL 
        AND SU.SU_Active = 1
        AND IC.IC_IsActive = 1
        AND NOT EXISTS (
            SELECT 1 
            FROM [dbo].[SystemUserCompany] SUC
            WHERE SUC.SU_ID = SU.SU_ID 
                AND SUC.IC_ID = SU.IC_ID
                AND SUC.SUC_IsActive = 1
        );
    
    IF @MissingCount2 = 0
        SET @ReadyScore = @ReadyScore + 1;
END

PRINT 'คะแนนความพร้อม: ' + CAST(@ReadyScore AS VARCHAR) + '/' + CAST(@TotalChecks AS VARCHAR);

IF @ReadyScore = @TotalChecks
BEGIN
    PRINT ' Database พร้อมใช้งาน!';
    PRINT '';
    PRINT ' ขั้นตอนต่อไป:';
    PRINT '   1. แก้ไข Backend Code';
    PRINT '   2. แก้ไข Frontend Code';
    PRINT '   3. ทดสอบระบบ';
END
ELSE IF @ReadyScore >= 3
BEGIN
    PRINT 'WARNING: Database พร้อมบางส่วน - ควรแก้ไขปัญหาที่พบ';
END
ELSE
BEGIN
    PRINT 'ERROR: Database ยังไม่พร้อม - ต้องแก้ไขปัญหาก่อน';
END

PRINT '';
PRINT '============================================================';
PRINT ' เสร็จสิ้นการตรวจสอบ!';
PRINT '============================================================';

