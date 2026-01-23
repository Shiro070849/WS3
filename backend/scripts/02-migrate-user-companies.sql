-- ============================================================
-- Migration: ย้ายข้อมูลจาก SystemUser.IC_ID → SystemUserCompany
-- ============================================================
-- WARNING: คำเตือน: รัน Script นี้ใน Dev Database ก่อน!
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' Migration: ย้ายข้อมูลจาก SystemUser.IC_ID → SystemUserCompany';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ตรวจสอบข้อมูลก่อน Migration
-- ============================================================
PRINT ' 1. ตรวจสอบข้อมูลก่อน Migration:';
PRINT '------------------------------------------------------------';

SELECT 
    'Users ที่จะ migrate (IC_ID IS NOT NULL)' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser]
WHERE IC_ID IS NOT NULL 
    AND SU_Active = 1

UNION ALL

SELECT 
    'Super Admin (IC_ID = NULL)' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser]
WHERE IC_ID IS NULL 
    AND SU_Active = 1

UNION ALL

SELECT 
    'Records ที่มีใน SystemUserCompany แล้ว' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUserCompany]
WHERE SUC_IsActive = 1;

PRINT '';

-- ============================================================
-- 2. ตรวจสอบ Users ที่มี IC_ID แต่ Company ไม่มี
-- ============================================================
PRINT ' 2. ตรวจสอบ Users ที่มี IC_ID แต่ Company ไม่มี:';
PRINT '------------------------------------------------------------';

DECLARE @InvalidUsers INT;
SELECT @InvalidUsers = COUNT(*)
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL 
    AND IC.IC_ID IS NULL
    AND SU.SU_Active = 1;

IF @InvalidUsers > 0
BEGIN
    PRINT 'ERROR: พบ Users ที่มี IC_ID แต่ Company ไม่มี: ' + CAST(@InvalidUsers AS VARCHAR) + ' คน';
    PRINT '   → ต้องแก้ไขก่อน Migration';
    PRINT '';
    PRINT 'Users ที่มีปัญหา:';
    SELECT 
        SU.SU_ID,
        SU.SU_Username,
        SU.SU_Name1,
        SU.IC_ID,
        'Company ไม่มีใน InternalCompany' AS 'Issue'
    FROM [dbo].[SystemUser] SU
    LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
    WHERE SU.IC_ID IS NOT NULL 
        AND IC.IC_ID IS NULL
        AND SU.SU_Active = 1
    ORDER BY SU.IC_ID, SU.SU_ID;
    PRINT '';
    PRINT 'WARNING: แนะนำ: แก้ไข Users เหล่านี้ก่อน Migration';
    RETURN;  -- หยุด Migration ถ้ามีปัญหา
END
ELSE
BEGIN
    PRINT ' ไม่มี Users ที่มี IC_ID แต่ Company ไม่มี';
END

PRINT '';

-- ============================================================
-- 3. Migration: ย้ายข้อมูลจาก SystemUser.IC_ID → SystemUserCompany
-- ============================================================
PRINT ' 3. Migration: ย้ายข้อมูล:';
PRINT '------------------------------------------------------------';

BEGIN TRANSACTION;

BEGIN TRY
    -- ตรวจสอบว่ามีข้อมูลใน SystemUserCompany อยู่แล้วหรือไม่
    IF EXISTS (SELECT 1 FROM [dbo].[SystemUserCompany])
    BEGIN
        PRINT 'WARNING: พบข้อมูลใน SystemUserCompany อยู่แล้ว';
        PRINT '   → ต้องการลบข้อมูลเก่าก่อน Migration หรือไม่?';
        PRINT '   → ถ้าใช่ ให้ uncomment บรรทัด DELETE ด้านล่าง';
        PRINT '';
        -- ถ้าต้องการลบข้อมูลเก่า → uncomment บรรทัดนี้
        -- DELETE FROM [dbo].[SystemUserCompany];
    END
    
    -- Migration: INSERT ข้อมูลจาก SystemUser.IC_ID
    INSERT INTO [dbo].[SystemUserCompany] (
        SU_ID,
        IC_ID,
        SUC_IsActive,
        SUC_CreatedAt
    )
    SELECT 
        SU.SU_ID,
        SU.IC_ID,
        1,  -- Active
        GETDATE()
    FROM [dbo].[SystemUser] SU
    INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
    WHERE SU.IC_ID IS NOT NULL 
        AND SU.SU_Active = 1
        AND IC.IC_IsActive = 1
        -- ไม่ insert ถ้ามีอยู่แล้ว (ป้องกัน duplicate)
        AND NOT EXISTS (
            SELECT 1 
            FROM [dbo].[SystemUserCompany] SUC
            WHERE SUC.SU_ID = SU.SU_ID 
                AND SUC.IC_ID = SU.IC_ID
        );
    
    DECLARE @MigratedCount INT = @@ROWCOUNT;
    
    PRINT ' Migration สำเร็จ: ' + CAST(@MigratedCount AS VARCHAR) + ' records';
    PRINT '';
    
    COMMIT TRANSACTION;
    PRINT ' Transaction Committed';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '';
    PRINT 'ERROR: Error: ' + ERROR_MESSAGE();
    PRINT 'WARNING: Transaction Rolled Back';
    PRINT '';
    PRINT 'Stack Trace:';
    PRINT ERROR_LINE();
    PRINT ERROR_PROCEDURE();
    RETURN;
END CATCH

PRINT '';

-- ============================================================
-- 4. ตรวจสอบผลลัพธ์หลัง Migration
-- ============================================================
PRINT ' 4. ตรวจสอบผลลัพธ์หลัง Migration:';
PRINT '------------------------------------------------------------';

-- จำนวน Users ที่ migrate
SELECT 
    'Users ที่ migrate สำเร็จ' AS 'Category',
    COUNT(DISTINCT SU_ID) AS 'Count'
FROM [dbo].[SystemUserCompany]
WHERE SUC_IsActive = 1;

-- จำนวน Company assignments
SELECT 
    'Total Company Assignments' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUserCompany]
WHERE SUC_IsActive = 1;

-- เปรียบเทียบ: SystemUser vs SystemUserCompany
SELECT 
    'SystemUser (IC_ID IS NOT NULL)' AS 'Source',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser]
WHERE IC_ID IS NOT NULL 
    AND SU_Active = 1

UNION ALL

SELECT 
    'SystemUserCompany (Active)' AS 'Source',
    COUNT(DISTINCT SU_ID) AS 'Count'
FROM [dbo].[SystemUserCompany]
WHERE SUC_IsActive = 1;

PRINT '';

-- ============================================================
-- 5. แสดงตัวอย่างข้อมูลที่ migrate
-- ============================================================
PRINT ' 5. ตัวอย่างข้อมูลที่ migrate (Top 10):';
PRINT '------------------------------------------------------------';

SELECT TOP 10
    SUC.SUC_ID,
    SUC.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SUC.IC_ID,
    IC.IC_Code,
    IC.IC_LocalName,
    SUC.SUC_IsActive,
    SUC.SUC_CreatedAt
FROM [dbo].[SystemUserCompany] SUC
INNER JOIN [dbo].[SystemUser] SU ON SUC.SU_ID = SU.SU_ID
INNER JOIN [dbo].[InternalCompany] IC ON SUC.IC_ID = IC.IC_ID
WHERE SUC.SUC_IsActive = 1
ORDER BY SUC.SUC_ID;

PRINT '';

-- ============================================================
-- 6. ตรวจสอบความสอดคล้อง
-- ============================================================
PRINT ' 6. ตรวจสอบความสอดคล้อง:';
PRINT '------------------------------------------------------------';

-- Users ที่มี IC_ID ใน SystemUser แต่ไม่มีใน SystemUserCompany
SELECT 
    'Users ที่ยังไม่ได้ migrate' AS 'Issue',
    COUNT(*) AS 'Count'
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

PRINT '';
PRINT '============================================================';
PRINT ' เสร็จสิ้น Migration!';
PRINT '============================================================';
PRINT '';
PRINT ' ขั้นตอนต่อไป:';
PRINT '   1. ตรวจสอบข้อมูลด้วย: 03-verify-migration.sql';
PRINT '   2. เริ่มแก้ไข Backend Code';

