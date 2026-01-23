-- ============================================================
-- ตรวจสอบข้อมูลและความสัมพันธ์ (Data Relationships)
-- ============================================================
-- ใช้สำหรับตรวจสอบข้อมูลก่อนเริ่มงาน
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' ตรวจสอบข้อมูลและความสัมพันธ์';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ตรวจสอบข้อมูล SystemUser และ IC_ID
-- ============================================================
PRINT ' 1. ข้อมูล SystemUser และ IC_ID:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID AS 'SystemUser.IC_ID',
    SU.SR_ID AS 'SystemUser.SR_ID',
    IC.IC_LocalName AS 'Company Name',
    SR.SR_Code AS 'Role Code',
    SR.SR_Name AS 'Role Name',
    SU.SU_Active
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
LEFT JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
WHERE SU.SU_Active = 1
ORDER BY SU.IC_ID, SU.SU_ID;

PRINT '';

-- ============================================================
-- 2. ตรวจสอบ Users ที่มี IC_ID = NULL (Super Admin)
-- ============================================================
PRINT ' 2. Users ที่เป็น Super Admin (IC_ID = NULL):';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.SR_ID,
    SR.SR_Code,
    SR.SR_Name
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
WHERE SU.IC_ID IS NULL 
    AND SU.SU_Active = 1
ORDER BY SU.SU_ID;

PRINT '';

-- ============================================================
-- 3. ตรวจสอบ Users ที่มี SR_ID = NULL
-- ============================================================
PRINT ' 3. Users ที่ไม่มี Role (SR_ID = NULL):';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID,
    IC.IC_LocalName
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.SR_ID IS NULL 
    AND SU.SU_Active = 1
ORDER BY SU.SU_ID;

PRINT '';

-- ============================================================
-- 4. ตรวจสอบ Users ที่มี Role ใน SystemUserSystemRole (ถ้ามี)
-- ============================================================
PRINT ' 4. Users ที่มี Role ใน SystemUserSystemRole:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserSystemRole')
BEGIN
    SELECT 
        SU.SU_ID,
        SU.SU_Username,
        SU.SU_Name1,
        SUSR.SR_ID,
        SR.SR_Code,
        SR.SR_Name
    FROM [dbo].[SystemUser] SU
    INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
    LEFT JOIN [dbo].[SystemRole] SR ON SUSR.SR_ID = SR.SR_ID
    WHERE SU.SU_Active = 1
    ORDER BY SU.SU_ID, SUSR.SR_ID;
END
ELSE
BEGIN
    PRINT 'ERROR: ไม่พบตาราง SystemUserSystemRole';
END

PRINT '';

-- ============================================================
-- 5. ตรวจสอบ Permissions ของแต่ละ Role
-- ============================================================
PRINT ' 5. Permissions ของแต่ละ Role:';
PRINT '------------------------------------------------------------';

SELECT 
    SR.SR_ID,
    SR.SR_Code,
    SR.SR_Name,
    COUNT(DISTINCT SRSS.SS_ID) AS 'Screen Count',
    COUNT(CASE WHEN SRSS.IC_ID IS NULL THEN 1 END) AS 'Global Permissions',
    COUNT(CASE WHEN SRSS.IC_ID IS NOT NULL THEN 1 END) AS 'Company-Specific Permissions'
FROM [dbo].[SystemRole] SR
LEFT JOIN [dbo].[SystemRoleSystemScreen] SRSS ON SR.SR_ID = SRSS.SR_ID
WHERE SR.SR_Active = 1
GROUP BY SR.SR_ID, SR.SR_Code, SR.SR_Name
ORDER BY SR.SR_Code;

PRINT '';

-- ============================================================
-- 6. ตรวจสอบ Company-Department Relationships
-- ============================================================
PRINT ' 6. Company-Department Relationships:';
PRINT '------------------------------------------------------------';

SELECT 
    IC.IC_ID,
    IC.IC_Code,
    IC.IC_LocalName,
    COUNT(DISTINCT ICD.ID_ID) AS 'Department Count'
FROM [dbo].[InternalCompany] IC
LEFT JOIN [dbo].[InternalCompanyDepartment] ICD ON IC.IC_ID = ICD.IC_ID
WHERE IC.IC_IsActive = 1
    AND (ICD.ICD_IsActive = 1 OR ICD.ICD_IsActive IS NULL)
GROUP BY IC.IC_ID, IC.IC_Code, IC.IC_LocalName
ORDER BY IC.IC_Code;

PRINT '';

-- ============================================================
-- 7. ตรวจสอบ Users ที่มีหลาย Company (ถ้ามี SystemUserCompany)
-- ============================================================
PRINT ' 7. Users ที่มีหลาย Company (ถ้ามี SystemUserCompany):';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
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
END
ELSE
BEGIN
    PRINT 'ERROR: ไม่พบตาราง SystemUserCompany';
    PRINT '';
    PRINT ' Users ที่มี IC_ID ใน SystemUser:';
    SELECT 
        IC_ID,
        COUNT(*) AS 'User Count',
        STRING_AGG(SU_Username, ', ') AS 'Usernames'
    FROM [dbo].[SystemUser]
    WHERE IC_ID IS NOT NULL AND SU_Active = 1
    GROUP BY IC_ID
    ORDER BY COUNT(*) DESC;
END

PRINT '';

-- ============================================================
-- 8. ตรวจสอบข้อมูล WayIn ที่เกี่ยวข้องกับ Company
-- ============================================================
PRINT ' 8. ข้อมูล WayIn ที่เกี่ยวข้องกับ Company:';
PRINT '------------------------------------------------------------';

SELECT 
    IC.IC_ID,
    IC.IC_Code,
    IC.IC_LocalName,
    COUNT(*) AS 'WayIn Count',
    MIN(WI.WI_RecordedOn) AS 'First Record',
    MAX(WI.WI_RecordedOn) AS 'Last Record'
FROM [dbo].[WayIn] WI
INNER JOIN [dbo].[InternalCompany] IC ON WI.IC_ID = IC.IC_ID
WHERE IC.IC_IsActive = 1
GROUP BY IC.IC_ID, IC.IC_Code, IC.IC_LocalName
ORDER BY COUNT(*) DESC;

PRINT '';

-- ============================================================
-- 9. ตรวจสอบความสอดคล้องของข้อมูล
-- ============================================================
PRINT ' 9. ตรวจสอบความสอดคล้องของข้อมูล:';
PRINT '------------------------------------------------------------';

-- Users ที่มี IC_ID แต่ Company ไม่มีอยู่
SELECT 
    'Users with invalid IC_ID' AS 'Issue',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL 
    AND IC.IC_ID IS NULL
    AND SU.SU_Active = 1;

-- Users ที่มี SR_ID แต่ Role ไม่มีอยู่
SELECT 
    'Users with invalid SR_ID' AS 'Issue',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
WHERE SU.SR_ID IS NOT NULL 
    AND SR.SR_ID IS NULL
    AND SU.SU_Active = 1;

PRINT '';

-- ============================================================
-- 10. สรุปข้อมูลสำหรับ Migration
-- ============================================================
PRINT ' 10. สรุปข้อมูลสำหรับ Migration:';
PRINT '------------------------------------------------------------';

SELECT 
    'Total Active Users' AS 'Metric',
    COUNT(*) AS 'Value'
FROM [dbo].[SystemUser]
WHERE SU_Active = 1

UNION ALL

SELECT 
    'Users with IC_ID (can migrate)' AS 'Metric',
    COUNT(*) AS 'Value'
FROM [dbo].[SystemUser]
WHERE IC_ID IS NOT NULL AND SU_Active = 1

UNION ALL

SELECT 
    'Super Admin (IC_ID = NULL)' AS 'Metric',
    COUNT(*) AS 'Value'
FROM [dbo].[SystemUser]
WHERE IC_ID IS NULL AND SU_Active = 1

UNION ALL

SELECT 
    'Total Companies' AS 'Metric',
    COUNT(*) AS 'Value'
FROM [dbo].[InternalCompany]
WHERE IC_IsActive = 1

UNION ALL

SELECT 
    'Total Roles' AS 'Metric',
    COUNT(*) AS 'Value'
FROM [dbo].[SystemRole]
WHERE SR_Active = 1;

PRINT '';
PRINT '============================================================';
PRINT 'เสร็จสิ้นการตรวจสอบข้อมูล!';
PRINT '============================================================';

