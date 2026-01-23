-- ============================================================
-- ตรวจสอบผลลัพธ์หลัง Migration
-- ============================================================
-- ใช้สำหรับตรวจสอบว่า Migration สำเร็จหรือไม่
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' ตรวจสอบผลลัพธ์หลัง Migration';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. เปรียบเทียบ SystemUser vs SystemUserCompany
-- ============================================================
PRINT ' 1. เปรียบเทียบ SystemUser vs SystemUserCompany:';
PRINT '------------------------------------------------------------';

SELECT 
    'SystemUser (IC_ID IS NOT NULL, Active)' AS 'Source',
    COUNT(*) AS 'User Count'
FROM [dbo].[SystemUser]
WHERE IC_ID IS NOT NULL 
    AND SU_Active = 1

UNION ALL

SELECT 
    'SystemUserCompany (Active)' AS 'Source',
    COUNT(DISTINCT SU_ID) AS 'User Count'
FROM [dbo].[SystemUserCompany]
WHERE SUC_IsActive = 1;

PRINT '';

-- ============================================================
-- 2. ตรวจสอบ Users ที่ยังไม่ได้ migrate
-- ============================================================
PRINT ' 2. Users ที่ยังไม่ได้ migrate:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID,
    IC.IC_LocalName,
    'ยังไม่ได้ migrate' AS 'Status'
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
    )
ORDER BY SU.SU_ID;

PRINT '';

-- ============================================================
-- 3. ตรวจสอบ Users ที่มีหลาย Company (ถ้ามี)
-- ============================================================
PRINT ' 3. Users ที่มีหลาย Company:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID AS 'SystemUser.IC_ID',
    COUNT(SUC.IC_ID) AS 'Company Count in SystemUserCompany',
    STRING_AGG(CAST(SUC.IC_ID AS VARCHAR), ', ') WITHIN GROUP (ORDER BY SUC.IC_ID) AS 'Company IDs'
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[SystemUserCompany] SUC ON SU.SU_ID = SUC.SU_ID AND SUC.SUC_IsActive = 1
WHERE SU.SU_Active = 1
GROUP BY SU.SU_ID, SU.SU_Username, SU.SU_Name1, SU.IC_ID
HAVING COUNT(SUC.IC_ID) > 1
ORDER BY COUNT(SUC.IC_ID) DESC;

PRINT '';

-- ============================================================
-- 4. ตรวจสอบความสอดคล้อง: SystemUser.IC_ID vs SystemUserCompany
-- ============================================================
PRINT ' 4. ตรวจสอบความสอดคล้อง: SystemUser.IC_ID vs SystemUserCompany:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.IC_ID AS 'SystemUser.IC_ID',
    STRING_AGG(CAST(SUC.IC_ID AS VARCHAR), ', ') WITHIN GROUP (ORDER BY SUC.IC_ID) AS 'SystemUserCompany.IC_ID',
    CASE 
        WHEN SU.IC_ID IS NOT NULL AND EXISTS (
            SELECT 1 FROM [dbo].[SystemUserCompany] 
            WHERE SU_ID = SU.SU_ID AND IC_ID = SU.IC_ID AND SUC_IsActive = 1
        ) THEN ' สอดคล้อง'
        WHEN SU.IC_ID IS NOT NULL THEN 'WARNING: ไม่สอดคล้อง'
        ELSE 'N/A (Super Admin)'
    END AS 'Status'
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[SystemUserCompany] SUC ON SU.SU_ID = SUC.SU_ID AND SUC.SUC_IsActive = 1
WHERE SU.SU_Active = 1
GROUP BY SU.SU_ID, SU.SU_Username, SU.IC_ID
ORDER BY SU.SU_ID
OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY;  -- แสดง 20 records แรก

PRINT '';

-- ============================================================
-- 5. สรุปผลลัพธ์
-- ============================================================
PRINT ' 5. สรุปผลลัพธ์:';
PRINT '------------------------------------------------------------';

DECLARE @TotalUsers INT;
DECLARE @MigratedUsers INT;
DECLARE @TotalAssignments INT;

SELECT @TotalUsers = COUNT(*)
FROM [dbo].[SystemUser]
WHERE IC_ID IS NOT NULL 
    AND SU_Active = 1;

SELECT @MigratedUsers = COUNT(DISTINCT SU_ID)
FROM [dbo].[SystemUserCompany]
WHERE SUC_IsActive = 1;

SELECT @TotalAssignments = COUNT(*)
FROM [dbo].[SystemUserCompany]
WHERE SUC_IsActive = 1;

PRINT 'Total Users (IC_ID IS NOT NULL): ' + CAST(@TotalUsers AS VARCHAR);
PRINT 'Migrated Users: ' + CAST(@MigratedUsers AS VARCHAR);
PRINT 'Total Company Assignments: ' + CAST(@TotalAssignments AS VARCHAR);
PRINT '';

IF @TotalUsers = @MigratedUsers
BEGIN
    PRINT ' Migration สำเร็จ 100%';
END
ELSE
BEGIN
    PRINT 'WARNING: Migration ไม่ครบ: ' + CAST(@TotalUsers - @MigratedUsers AS VARCHAR) + ' Users ยังไม่ได้ migrate';
END

PRINT '';
PRINT '============================================================';
PRINT ' เสร็จสิ้นการตรวจสอบ!';
PRINT '============================================================';

