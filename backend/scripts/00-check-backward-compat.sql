-- ============================================================
-- ตรวจสอบผลกระทบต่อระบบเก่า (Backward Compatibility)
-- ============================================================
-- ใช้สำหรับตรวจสอบว่าการเปลี่ยนแปลงจะกระทบระบบเก่าหรือไม่
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT 'ตรวจสอบผลกระทบต่อระบบเก่า';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ตรวจสอบว่า SystemUser.IC_ID ยังใช้อยู่หรือไม่
-- ============================================================
PRINT '1. ตรวจสอบ SystemUser.IC_ID:';
PRINT '------------------------------------------------------------';

SELECT 
    'Total Users' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser]
WHERE SU_Active = 1

UNION ALL

SELECT 
    'Users with IC_ID (NOT NULL)' AS 'Category',
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
    AND SU_Active = 1;

PRINT '';

-- ============================================================
-- 2. ตรวจสอบความสอดคล้อง: SystemUser.IC_ID vs SystemUserCompany
-- ============================================================
PRINT '2. ตรวจสอบความสอดคล้อง: SystemUser.IC_ID vs SystemUserCompany:';
PRINT '------------------------------------------------------------';

-- Users ที่มี IC_ID ใน SystemUser แต่ไม่มีใน SystemUserCompany
SELECT 
    'Users ที่มี IC_ID แต่ไม่มีใน SystemUserCompany' AS 'Issue',
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

-- Users ที่มี IC_ID ใน SystemUser และมีใน SystemUserCompany (สอดคล้อง)
SELECT 
    'Users ที่สอดคล้อง (มีทั้งสองที่)' AS 'Status',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL 
    AND SU.SU_Active = 1
    AND IC.IC_IsActive = 1
    AND EXISTS (
        SELECT 1 
        FROM [dbo].[SystemUserCompany] SUC
        WHERE SUC.SU_ID = SU.SU_ID 
            AND SUC.IC_ID = SU.IC_ID
            AND SUC.SUC_IsActive = 1
    );

PRINT '';

-- ============================================================
-- 3. ตรวจสอบ Users ที่มีหลาย Company (จะกระทบระบบเก่า)
-- ============================================================
PRINT '3. ตรวจสอบ Users ที่มีหลาย Company:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    SELECT 
        SU.SU_ID,
        SU.SU_Username,
        SU.SU_Name1,
        SU.IC_ID AS 'SystemUser.IC_ID',
        COUNT(SUC.IC_ID) AS 'Company Count in SystemUserCompany',
        STRING_AGG(CAST(SUC.IC_ID AS VARCHAR), ', ') WITHIN GROUP (ORDER BY SUC.IC_ID) AS 'Company IDs',
        CASE 
            WHEN SU.IC_ID IS NOT NULL AND EXISTS (
                SELECT 1 FROM [dbo].[SystemUserCompany] 
                WHERE SU_ID = SU.SU_ID AND IC_ID = SU.IC_ID AND SUC_IsActive = 1
            ) THEN 'OK - SystemUser.IC_ID อยู่ใน SystemUserCompany'
            WHEN SU.IC_ID IS NOT NULL THEN 'WARNING: SystemUser.IC_ID ไม่อยู่ใน SystemUserCompany'
            ELSE 'N/A (Super Admin)'
        END AS 'Compatibility Status'
    FROM [dbo].[SystemUser] SU
    LEFT JOIN [dbo].[SystemUserCompany] SUC ON SU.SU_ID = SUC.SU_ID AND SUC.SUC_IsActive = 1
    WHERE SU.SU_Active = 1
    GROUP BY SU.SU_ID, SU.SU_Username, SU.SU_Name1, SU.IC_ID
    HAVING COUNT(SUC.IC_ID) > 1
    ORDER BY COUNT(SUC.IC_ID) DESC;
END
ELSE
BEGIN
    PRINT 'ERROR: ไม่พบตาราง SystemUserCompany';
    PRINT '   → ยังไม่มีการ Migration';
END

PRINT '';

-- ============================================================
-- 4. สรุปผลกระทบ
-- ============================================================
PRINT '4. สรุปผลกระทบ:';
PRINT '------------------------------------------------------------';

PRINT 'สิ่งที่ไม่กระทบ:';
PRINT '   1. SystemUser.IC_ID ยังคงอยู่ (ไม่ลบ)';
PRINT '   2. Super Admin (IC_ID = NULL) ยังทำงานเหมือนเดิม';
PRINT '   3. ข้อมูลเดิมยังใช้ได้ (Backward Compatible)';
PRINT '';
PRINT 'WARNING: สิ่งที่ต้องแก้ไข:';
PRINT '   1. getUserAccessibleCompanies() → ใช้ SystemUserCompany แทน';
PRINT '   2. Filter ข้อมูล (Vehicle, Dashboard, Statistics) → ใช้ IN แทน =';
PRINT '   3. createUser() / updateUser() → รองรับหลาย Company';
PRINT '';
PRINT 'ขั้นตอนการแก้ไข:';
PRINT '   1. สร้างตาราง SystemUserCompany (ไม่กระทบระบบเก่า)';
PRINT '   2. Migration ข้อมูล (ไม่กระทบระบบเก่า)';
PRINT '   3. แก้ไข Backend Code (ต้องแก้ไข)';
PRINT '   4. ทดสอบระบบเก่า (ยังทำงานได้)';

PRINT '';
PRINT '============================================================';
PRINT 'เสร็จสิ้นการตรวจสอบ!';
PRINT '============================================================';

