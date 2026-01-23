-- ============================================================
-- ตัวอย่างการ JOIN ตาราง SystemUserCompany
-- ============================================================
-- แสดงวิธีการ JOIN กับตารางอื่นๆ
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' ตัวอย่างการ JOIN ตาราง SystemUserCompany';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. JOIN กับ SystemUser และ InternalCompany (พื้นฐาน)
-- ============================================================
PRINT ' 1. JOIN กับ SystemUser และ InternalCompany:';
PRINT '------------------------------------------------------------';

SELECT 
    SUC.SUC_ID,
    SUC.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SUC.IC_ID,
    IC.IC_Code,
    IC.IC_LocalName,
    IC.IC_EnglishName,
    SUC.SUC_IsActive,
    SUC.SUC_CreatedAt
FROM [dbo].[SystemUserCompany] SUC
INNER JOIN [dbo].[SystemUser] SU ON SUC.SU_ID = SU.SU_ID
INNER JOIN [dbo].[InternalCompany] IC ON SUC.IC_ID = IC.IC_ID
WHERE SUC.SUC_IsActive = 1
    AND SU.SU_Active = 1
    AND IC.IC_IsActive = 1
ORDER BY SUC.SU_ID, SUC.IC_ID;

PRINT '';

-- ============================================================
-- 2. ดึง Company ที่ User เห็นได้ (ใช้บ่อยที่สุด)
-- ============================================================
PRINT ' 2. ดึง Company ที่ User เห็นได้:';
PRINT '------------------------------------------------------------';

-- ตัวอย่าง: User ID = 100
DECLARE @UserId INT = 100;

SELECT 
    IC.IC_ID,
    IC.IC_Code,
    IC.IC_LocalName,
    IC.IC_EnglishName,
    IC.IC_ShortLocalName,
    IC.IC_ShortEnglishName,
    IC.IC_LogoPath
FROM [dbo].[SystemUserCompany] SUC
INNER JOIN [dbo].[InternalCompany] IC ON SUC.IC_ID = IC.IC_ID
WHERE SUC.SU_ID = @UserId
    AND SUC.SUC_IsActive = 1
    AND IC.IC_IsActive = 1
ORDER BY IC.IC_Code;

PRINT '';

-- ============================================================
-- 3. ดึง Users ที่เห็น Company นี้ (Reverse Lookup)
-- ============================================================
PRINT ' 3. ดึง Users ที่เห็น Company นี้:';
PRINT '------------------------------------------------------------';

-- ตัวอย่าง: Company ID = 3
DECLARE @CompanyId INT = 3;

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.SU_Email,
    SR.SR_Code,
    SR.SR_Name
FROM [dbo].[SystemUserCompany] SUC
INNER JOIN [dbo].[SystemUser] SU ON SUC.SU_ID = SU.SU_ID
LEFT JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
WHERE SUC.IC_ID = @CompanyId
    AND SUC.SUC_IsActive = 1
    AND SU.SU_Active = 1
ORDER BY SU.SU_Username;

PRINT '';

-- ============================================================
-- 4. Filter ข้อมูลตาม Company ที่ User เห็นได้ (ใช้กับ WayIn)
-- ============================================================
PRINT ' 4. Filter ข้อมูลตาม Company ที่ User เห็นได้:';
PRINT '------------------------------------------------------------';

-- ตัวอย่าง: User ID = 100, Filter Vehicle (WayIn)
DECLARE @UserId2 INT = 100;

SELECT 
    WI.WI_ID,
    WI.WI_LicensePlate,
    WI.WI_FullName,
    WI.IC_ID,
    IC.IC_LocalName AS CompanyName,
    WI.WI_RecordedOn
FROM [dbo].[WayIn] WI
INNER JOIN [dbo].[InternalCompany] IC ON WI.IC_ID = IC.IC_ID
WHERE WI.IC_ID IN (
    SELECT IC_ID 
    FROM [dbo].[SystemUserCompany] 
    WHERE SU_ID = @UserId2 
      AND SUC_IsActive = 1
)
ORDER BY WI.WI_RecordedOn DESC;

PRINT '';

-- ============================================================
-- 5. เปรียบเทียบ: SystemUser.IC_ID vs SystemUserCompany
-- ============================================================
PRINT ' 5. เปรียบเทียบ: SystemUser.IC_ID vs SystemUserCompany:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
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
GROUP BY SU.SU_ID, SU.SU_Username, SU.SU_Name1, SU.IC_ID
ORDER BY SU.SU_ID
OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY;

PRINT '';

-- ============================================================
-- 6. Users ที่มีหลาย Company
-- ============================================================
PRINT ' 6. Users ที่มีหลาย Company:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID AS 'SystemUser.IC_ID',
    COUNT(SUC.IC_ID) AS 'Company Count',
    STRING_AGG(CAST(SUC.IC_ID AS VARCHAR) + ' (' + IC.IC_Code + ')', ', ') WITHIN GROUP (ORDER BY SUC.IC_ID) AS 'Company IDs'
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[SystemUserCompany] SUC ON SU.SU_ID = SUC.SU_ID AND SUC.SUC_IsActive = 1
LEFT JOIN [dbo].[InternalCompany] IC ON SUC.IC_ID = IC.IC_ID
WHERE SU.SU_Active = 1
GROUP BY SU.SU_ID, SU.SU_Username, SU.SU_Name1, SU.IC_ID
HAVING COUNT(SUC.IC_ID) > 1
ORDER BY COUNT(SUC.IC_ID) DESC;

PRINT '';

-- ============================================================
-- 7. สรุป: ตารางที่ JOIN กับ SystemUserCompany
-- ============================================================
PRINT ' 7. สรุป: ตารางที่ JOIN กับ SystemUserCompany:';
PRINT '------------------------------------------------------------';

PRINT ' ตารางที่ JOIN ได้:';
PRINT '   1. SystemUser (ผ่าน SU_ID)';
PRINT '      → ใช้ดึงข้อมูล User (Username, Name, Email, etc.)';
PRINT '';
PRINT '   2. InternalCompany (ผ่าน IC_ID)';
PRINT '      → ใช้ดึงข้อมูล Company (Code, Name, Logo, etc.)';
PRINT '';
PRINT '   3. SystemRole (ผ่าน SystemUser.SR_ID)';
PRINT '      → ใช้ดึงข้อมูล Role ของ User';
PRINT '';
PRINT '   4. WayIn, WayOut, Dashboard, Statistics, Reports';
PRINT '      → ใช้ Filter ข้อมูลตาม Company ที่ User เห็นได้';
PRINT '';
PRINT ' ตัวอย่างการใช้งาน:';
PRINT '   - ดึง Company ที่ User เห็นได้';
PRINT '   - Filter ข้อมูลตาม Company ที่ User เห็นได้';
PRINT '   - ตรวจสอบว่า User เห็น Company นี้หรือไม่';
PRINT '   - ดึง Users ที่เห็น Company นี้';

PRINT '';
PRINT '============================================================';
PRINT ' เสร็จสิ้น!';
PRINT '============================================================';

