-- ============================================================
-- ตรวจสอบสิทธิ์ (Permissions) ของแต่ละ Role
-- ============================================================
-- ใช้สำหรับตรวจสอบว่าแต่ละ Role มีการเข้าถึง Screen/Menu อะไรบ้าง
-- 
-- สิ่งที่ Script นี้ตรวจสอบ:
-- 1. แสดง Role ทั้งหมดและจำนวน Permissions
-- 2. แสดง Permissions รายละเอียดของแต่ละ Role
-- 3. สรุป Permissions (Global vs Company-Specific)
-- 4. เปรียบเทียบ Permissions ระหว่าง Roles
-- 5. ตรวจสอบ Roles ที่ไม่มี Permissions
-- 6. ตรวจสอบ Permissions ที่อ้างอิง Company ผิด
-- 7. สรุปจำนวน Users ที่ใช้แต่ละ Role
-- 8. แสดง Screen ทั้งหมดและ Role ที่เข้าถึงได้
-- 9. ตรวจสอบ Permissions ที่ซ้ำซ้อน
-- 
-- หมายเหตุ:
-- - Global Permission: IC_ID = NULL (เข้าถึงได้ทุกบริษัท)
-- - Company-Specific Permission: IC_ID = ตัวเลข (เข้าถึงได้เฉพาะบริษัทนั้น)
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT 'ตรวจสอบสิทธิ์ (Permissions) ของแต่ละ Role';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. แสดง Role ทั้งหมดในระบบ
-- ============================================================
PRINT '1. Role ทั้งหมดในระบบ:';
PRINT '------------------------------------------------------------';

SELECT 
    SR.SR_ID,
    SR.SR_Code,
    SR.SR_Name,
    SR.SR_Description,
    SR.SR_Active,
    COUNT(DISTINCT SRSS.SS_ID) AS 'Total Permissions',
    COUNT(CASE WHEN SRSS.IC_ID IS NULL THEN 1 END) AS 'Global Permissions',
    COUNT(CASE WHEN SRSS.IC_ID IS NOT NULL THEN 1 END) AS 'Company-Specific Permissions'
FROM [dbo].[SystemRole] SR
LEFT JOIN [dbo].[SystemRoleSystemScreen] SRSS ON SR.SR_ID = SRSS.SR_ID
WHERE SR.SR_Active = 1
GROUP BY SR.SR_ID, SR.SR_Code, SR.SR_Name, SR.SR_Description, SR.SR_Active
ORDER BY SR.SR_Code;

PRINT '';

-- ============================================================
-- 2. แสดง Permissions รายละเอียดของแต่ละ Role
-- ============================================================
PRINT '2. Permissions รายละเอียดของแต่ละ Role:';
PRINT '------------------------------------------------------------';

SELECT 
    SR.SR_Code AS 'Role Code',
    SR.SR_Name AS 'Role Name',
    SS.SS_ID AS 'Screen ID',
    SS.SS_Name AS 'Screen Name',
    SS.SS_RelativePath AS 'Screen Path',
    CASE 
        WHEN SRSS.IC_ID IS NULL THEN 'Global (ทุกบริษัท)'
        ELSE 'Company: ' + CAST(SRSS.IC_ID AS VARCHAR) + ' - ' + ISNULL(IC.IC_LocalName, 'N/A')
    END AS 'Permission Scope',
    SRSS.SRSS_HiddenFieldIds AS 'Hidden Fields',
    SRSS.SRSS_ReadOnlyFieldIds AS 'ReadOnly Fields'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
LEFT JOIN [dbo].[InternalCompany] IC ON SRSS.IC_ID = IC.IC_ID
WHERE SR.SR_Active = 1
    AND SS.SS_IsActive = 1
ORDER BY SR.SR_Code, SRSS.IC_ID, SS.SS_ID;

PRINT '';

-- ============================================================
-- 3. สรุป Permissions ของแต่ละ Role (แยก Global vs Company-Specific)
-- ============================================================
PRINT '3. สรุป Permissions ของแต่ละ Role:';
PRINT '------------------------------------------------------------';

SELECT 
    SR.SR_Code AS 'Role Code',
    SR.SR_Name AS 'Role Name',
    COUNT(DISTINCT CASE WHEN SRSS.IC_ID IS NULL THEN SRSS.SS_ID END) AS 'Global Screen Count',
    COUNT(DISTINCT CASE WHEN SRSS.IC_ID IS NOT NULL THEN SRSS.SS_ID END) AS 'Company-Specific Screen Count',
    COUNT(DISTINCT SRSS.SS_ID) AS 'Total Unique Screens',
    COUNT(*) AS 'Total Permission Records',
    ISNULL((
        SELECT STRING_AGG(CAST(SS2.SS_ID AS VARCHAR), ', ') WITHIN GROUP (ORDER BY SS2.SS_ID)
        FROM (
            SELECT DISTINCT SRSS2.SS_ID
            FROM [dbo].[SystemRoleSystemScreen] SRSS2
            INNER JOIN [dbo].[SystemScreen] SS2 ON SRSS2.SS_ID = SS2.SS_ID
            WHERE SRSS2.SR_ID = SR.SR_ID
                AND (SS2.SS_IsActive = 1 OR SS2.SS_IsActive IS NULL)
        ) SS2
    ), 'N/A') AS 'Screen IDs'
FROM [dbo].[SystemRole] SR
LEFT JOIN [dbo].[SystemRoleSystemScreen] SRSS ON SR.SR_ID = SRSS.SR_ID
LEFT JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SR.SR_Active = 1
    AND (SS.SS_IsActive = 1 OR SS.SS_IsActive IS NULL)
GROUP BY SR.SR_ID, SR.SR_Code, SR.SR_Name
ORDER BY SR.SR_Code;

PRINT '';

-- ============================================================
-- 4. แสดง Screen ที่แต่ละ Role เข้าถึงได้ (Global Permissions)
-- ============================================================
PRINT '4. Global Permissions (IC_ID = NULL) ของแต่ละ Role:';
PRINT '------------------------------------------------------------';

SELECT 
    SR.SR_Code AS 'Role Code',
    SR.SR_Name AS 'Role Name',
    SS.SS_ID AS 'Screen ID',
    SS.SS_Name AS 'Screen Name',
    SS.SS_RelativePath AS 'Screen Path'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SRSS.IC_ID IS NULL
    AND SR.SR_Active = 1
    AND SS.SS_IsActive = 1
ORDER BY SR.SR_Code, SS.SS_ID;

PRINT '';

-- ============================================================
-- 5. แสดง Company-Specific Permissions ของแต่ละ Role
-- ============================================================
PRINT '5. Company-Specific Permissions (IC_ID IS NOT NULL) ของแต่ละ Role:';
PRINT '------------------------------------------------------------';

SELECT 
    SR.SR_Code AS 'Role Code',
    SR.SR_Name AS 'Role Name',
    SS.SS_ID AS 'Screen ID',
    SS.SS_Name AS 'Screen Name',
    SRSS.IC_ID AS 'Company ID',
    IC.IC_Code AS 'Company Code',
    IC.IC_LocalName AS 'Company Name'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
LEFT JOIN [dbo].[InternalCompany] IC ON SRSS.IC_ID = IC.IC_ID
WHERE SRSS.IC_ID IS NOT NULL
    AND SR.SR_Active = 1
    AND SS.SS_IsActive = 1
ORDER BY SR.SR_Code, SRSS.IC_ID, SS.SS_ID;

PRINT '';

-- ============================================================
-- 6. เปรียบเทียบ Permissions ระหว่าง Roles
-- ============================================================
PRINT '6. เปรียบเทียบ Permissions ระหว่าง Roles:';
PRINT '------------------------------------------------------------';

-- สร้างตารางเปรียบเทียบ
SELECT 
    SS.SS_ID AS 'Screen ID',
    SS.SS_Name AS 'Screen Name',
    MAX(CASE WHEN SR.SR_Code = 'ADM' THEN 'YES' ELSE 'NO' END) AS 'ADM',
    MAX(CASE WHEN SR.SR_Code = 'HRU' THEN 'YES' ELSE 'NO' END) AS 'HRU',
    MAX(CASE WHEN SR.SR_Code = 'QA' THEN 'YES' ELSE 'NO' END) AS 'QA',
    MAX(CASE WHEN SR.SR_Code = 'RCT' THEN 'YES' ELSE 'NO' END) AS 'RCT',
    MAX(CASE WHEN SR.SR_Code = 'SGU' THEN 'YES' ELSE 'NO' END) AS 'SGU',
    MAX(CASE WHEN SR.SR_Code = 'SGS' THEN 'YES' ELSE 'NO' END) AS 'SGS'
FROM [dbo].[SystemScreen] SS
LEFT JOIN [dbo].[SystemRoleSystemScreen] SRSS ON SS.SS_ID = SRSS.SS_ID
LEFT JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID AND SR.SR_Active = 1
WHERE SS.SS_IsActive = 1
GROUP BY SS.SS_ID, SS.SS_Name
ORDER BY SS.SS_ID;

PRINT '';

-- ============================================================
-- 7. ตรวจสอบ Roles ที่ไม่มี Permissions
-- ============================================================
PRINT '7. Roles ที่ไม่มี Permissions:';
PRINT '------------------------------------------------------------';

SELECT 
    SR.SR_ID,
    SR.SR_Code,
    SR.SR_Name,
    'ไม่มี Permissions' AS 'Status'
FROM [dbo].[SystemRole] SR
LEFT JOIN [dbo].[SystemRoleSystemScreen] SRSS ON SR.SR_ID = SRSS.SR_ID
WHERE SR.SR_Active = 1
    AND SRSS.SR_ID IS NULL
ORDER BY SR.SR_Code;

PRINT '';

-- ============================================================
-- 8. ตรวจสอบ Permissions ที่อ้างอิงถึง Company ที่ไม่มีอยู่
-- ============================================================
PRINT '8. Permissions ที่อ้างอิงถึง Company ที่ไม่มีอยู่:';
PRINT '------------------------------------------------------------';

SELECT 
    SRSS.SR_ID,
    SR.SR_Code,
    SR.SR_Name,
    SRSS.SS_ID,
    SS.SS_Name,
    SRSS.IC_ID AS 'Invalid Company ID',
    'Company ไม่มีใน InternalCompany' AS 'Issue'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
LEFT JOIN [dbo].[InternalCompany] IC ON SRSS.IC_ID = IC.IC_ID
WHERE SRSS.IC_ID IS NOT NULL
    AND IC.IC_ID IS NULL
ORDER BY SR.SR_Code, SRSS.IC_ID;

PRINT '';

-- ============================================================
-- 9. สรุปจำนวน Users ที่ใช้แต่ละ Role
-- ============================================================
PRINT '9. จำนวน Users ที่ใช้แต่ละ Role:';
PRINT '------------------------------------------------------------';

SELECT 
    SR.SR_ID,
    SR.SR_Code,
    SR.SR_Name,
    COUNT(DISTINCT SU.SU_ID) AS 'User Count',
    ISNULL((
        SELECT STRING_AGG(SU2.SU_Username, ', ') WITHIN GROUP (ORDER BY SU2.SU_Username)
        FROM (
            SELECT DISTINCT SU2.SU_Username
            FROM [dbo].[SystemUser] SU2
            WHERE SU2.SR_ID = SR.SR_ID AND SU2.SU_Active = 1
        ) SU2
    ), 'N/A') AS 'Usernames'
FROM [dbo].[SystemRole] SR
LEFT JOIN [dbo].[SystemUser] SU ON SR.SR_ID = SU.SR_ID AND SU.SU_Active = 1
WHERE SR.SR_Active = 1
GROUP BY SR.SR_ID, SR.SR_Code, SR.SR_Name
ORDER BY COUNT(DISTINCT SU.SU_ID) DESC, SR.SR_Code;

PRINT '';

-- ============================================================
-- 10. สรุป Screen ทั้งหมดในระบบ
-- ============================================================
PRINT '10. Screen ทั้งหมดในระบบ:';
PRINT '------------------------------------------------------------';

SELECT 
    SS.SS_ID,
    SS.SS_Name,
    SS.SS_RelativePath,
    SS.SS_IsActive,
    COUNT(DISTINCT SRSS.SR_ID) AS 'Role Count (มีกี่ Role ที่เข้าถึงได้)',
    ISNULL((
        SELECT STRING_AGG(SR2.SR_Code, ', ') WITHIN GROUP (ORDER BY SR2.SR_Code)
        FROM (
            SELECT DISTINCT SR2.SR_Code
            FROM [dbo].[SystemRoleSystemScreen] SRSS2
            INNER JOIN [dbo].[SystemRole] SR2 ON SRSS2.SR_ID = SR2.SR_ID
            WHERE SRSS2.SS_ID = SS.SS_ID
                AND SR2.SR_Active = 1
        ) SR2
    ), 'N/A') AS 'Roles'
FROM [dbo].[SystemScreen] SS
LEFT JOIN [dbo].[SystemRoleSystemScreen] SRSS ON SS.SS_ID = SRSS.SS_ID
LEFT JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID AND SR.SR_Active = 1
WHERE SS.SS_IsActive = 1
GROUP BY SS.SS_ID, SS.SS_Name, SS.SS_RelativePath, SS.SS_IsActive
ORDER BY SS.SS_ID;

PRINT '';

-- ============================================================
-- 11. ตรวจสอบ Permissions ที่ซ้ำซ้อน (Role + Screen + Company เดียวกัน)
-- ============================================================
PRINT '11. Permissions ที่ซ้ำซ้อน:';
PRINT '------------------------------------------------------------';

SELECT 
    SRSS.SR_ID,
    SR.SR_Code,
    SRSS.SS_ID,
    SS.SS_Name,
    SRSS.IC_ID,
    COUNT(*) AS 'Duplicate Count'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
GROUP BY SRSS.SR_ID, SR.SR_Code, SRSS.SS_ID, SS.SS_Name, SRSS.IC_ID
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, SR.SR_Code;

PRINT '';

-- ============================================================
-- 12. สรุปผลการตรวจสอบ
-- ============================================================
PRINT '12. สรุปผลการตรวจสอบ:';
PRINT '------------------------------------------------------------';

DECLARE @TotalRoles INT;
DECLARE @TotalScreens INT;
DECLARE @TotalPermissions INT;
DECLARE @RolesWithoutPermissions INT;
DECLARE @InvalidCompanyPermissions INT;

SELECT @TotalRoles = COUNT(*) FROM [dbo].[SystemRole] WHERE SR_Active = 1;
SELECT @TotalScreens = COUNT(*) FROM [dbo].[SystemScreen] WHERE SS_IsActive = 1;
SELECT @TotalPermissions = COUNT(*) FROM [dbo].[SystemRoleSystemScreen];
SELECT @RolesWithoutPermissions = COUNT(*) 
FROM [dbo].[SystemRole] SR
LEFT JOIN [dbo].[SystemRoleSystemScreen] SRSS ON SR.SR_ID = SRSS.SR_ID
WHERE SR.SR_Active = 1 AND SRSS.SR_ID IS NULL;
SELECT @InvalidCompanyPermissions = COUNT(*)
FROM [dbo].[SystemRoleSystemScreen] SRSS
LEFT JOIN [dbo].[InternalCompany] IC ON SRSS.IC_ID = IC.IC_ID
WHERE SRSS.IC_ID IS NOT NULL AND IC.IC_ID IS NULL;

PRINT 'Total Active Roles: ' + CAST(@TotalRoles AS VARCHAR);
PRINT 'Total Active Screens: ' + CAST(@TotalScreens AS VARCHAR);
PRINT 'Total Permission Records: ' + CAST(@TotalPermissions AS VARCHAR);
PRINT 'Roles without Permissions: ' + CAST(@RolesWithoutPermissions AS VARCHAR);
PRINT 'Invalid Company Permissions: ' + CAST(@InvalidCompanyPermissions AS VARCHAR);
PRINT '';

IF @RolesWithoutPermissions > 0
BEGIN
    PRINT 'WARNING: พบ Roles ที่ไม่มี Permissions';
END

IF @InvalidCompanyPermissions > 0
BEGIN
    PRINT 'ERROR: พบ Permissions ที่อ้างอิงถึง Company ที่ไม่มีอยู่';
END

PRINT '';
PRINT '============================================================';
PRINT 'เสร็จสิ้นการตรวจสอบสิทธิ์!';
PRINT '============================================================';
