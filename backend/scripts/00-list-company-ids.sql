-- ============================================================
-- แสดง IC_ID ที่มีจริงในระบบ
-- ============================================================
-- ใช้สำหรับดู IC_ID ที่จะใช้ใน companyIds array
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' IC_ID ที่มีจริงในระบบ';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. แสดง InternalCompany ทั้งหมด (พร้อม IC_ID)
-- ============================================================
PRINT ' 1. InternalCompany ทั้งหมด (พร้อม IC_ID):';
PRINT '------------------------------------------------------------';

SELECT 
    IC_ID,
    IC_Code,
    IC_LocalName,
    IC_EnglishName,
    IC_IsActive,
    Company_Sequence
FROM [dbo].[InternalCompany]
WHERE IC_IsActive = 1
ORDER BY 
    CASE 
        WHEN Company_Sequence IS NULL THEN 999999
        ELSE Company_Sequence
    END ASC,
    IC_Code ASC;

PRINT '';

-- ============================================================
-- 2. แสดง IC_ID ที่มี Users ใช้งานอยู่
-- ============================================================
PRINT ' 2. IC_ID ที่มี Users ใช้งานอยู่:';
PRINT '------------------------------------------------------------';

SELECT 
    IC.IC_ID,
    IC.IC_Code,
    IC.IC_LocalName,
    COUNT(DISTINCT SU.SU_ID) AS 'User Count',
    STRING_AGG(SU.SU_Username, ', ') AS 'Usernames'
FROM [dbo].[InternalCompany] IC
INNER JOIN [dbo].[SystemUser] SU ON IC.IC_ID = SU.IC_ID
WHERE IC.IC_IsActive = 1
    AND SU.SU_Active = 1
GROUP BY IC.IC_ID, IC.IC_Code, IC.IC_LocalName
ORDER BY COUNT(DISTINCT SU.SU_ID) DESC;

PRINT '';

-- ============================================================
-- 3. ตัวอย่าง: User ที่มี IC_ID = 3 (Enmax)
-- ============================================================
PRINT ' 3. ตัวอย่าง: Users ที่อยู่ใน Company IC_ID = 3 (Enmax):';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID,
    IC.IC_LocalName,
    SR.SR_Code,
    SR.SR_Name
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
LEFT JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
WHERE SU.IC_ID = 3
    AND SU.SU_Active = 1
    AND IC.IC_IsActive = 1
ORDER BY SU.SU_Username;

PRINT '';

-- ============================================================
-- 4. ตัวอย่าง: ถ้า User นี้จะเห็นหลาย Company
-- ============================================================
PRINT ' 4. ตัวอย่าง: ถ้า User นี้จะเห็นหลาย Company:';
PRINT '------------------------------------------------------------';

-- ตัวอย่าง: User ที่อยู่ใน Company IC_ID = 3
-- ถ้า Admin ต้องการให้ User นี้เห็น Company 3, 4, 5
-- จะได้ companyIds: [3, 4, 5]

SELECT 
    'ตัวอย่าง User' AS 'Description',
    SU.SU_ID AS 'User ID',
    SU.SU_Username AS 'Username',
    SU.IC_ID AS 'Current IC_ID',
    '3, 4, 5' AS 'Example companyIds Array',
    'User จะเห็น Company: Enmax, Simpletech, RC' AS 'Result'
FROM [dbo].[SystemUser] SU
WHERE SU.IC_ID = 3
    AND SU.SU_Active = 1
ORDER BY SU.SU_ID
OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY;

PRINT '';

-- ============================================================
-- 5. แสดง IC_ID ทั้งหมดพร้อมชื่อ (สำหรับใช้ใน Frontend)
-- ============================================================
PRINT ' 5. IC_ID ทั้งหมดพร้อมชื่อ (สำหรับใช้ใน Frontend):';
PRINT '------------------------------------------------------------';

SELECT 
    IC_ID AS 'value',
    IC_Code + ' - ' + IC_LocalName AS 'label',
    IC_Code,
    IC_LocalName,
    IC_EnglishName
FROM [dbo].[InternalCompany]
WHERE IC_IsActive = 1
ORDER BY 
    CASE 
        WHEN Company_Sequence IS NULL THEN 999999
        ELSE Company_Sequence
    END ASC,
    IC_Code ASC;

PRINT '';

-- ============================================================
-- 6. ตัวอย่างการใช้งานจริง
-- ============================================================
PRINT ' 6. ตัวอย่างการใช้งานจริง:';
PRINT '------------------------------------------------------------';
PRINT '';
PRINT 'ตัวอย่างที่ 1: User อยู่ใน Company IC_ID = 3';
PRINT '  → Admin เลือกให้เห็น Company: 3, 4, 5';
PRINT '  → companyIds: [3, 4, 5]';
PRINT '';
PRINT 'ตัวอย่างที่ 2: User อยู่ใน Company IC_ID = 1';
PRINT '  → Admin เลือกให้เห็น Company: 1, 2, 3, 4';
PRINT '  → companyIds: [1, 2, 3, 4]';
PRINT '';
PRINT 'ตัวอย่างที่ 3: Super Admin (IC_ID = NULL)';
PRINT '  → ไม่ต้องกำหนด companyIds';
PRINT '  → เห็นทุกบริษัทอัตโนมัติ';
PRINT '';

-- ============================================================
-- 7. แสดง IC_ID ที่จะใช้ในตัวอย่าง
-- ============================================================
PRINT ' 7. IC_ID ที่จะใช้ในตัวอย่าง (จากข้อมูลจริง):';
PRINT '------------------------------------------------------------';

SELECT 
    'IC_ID ที่มีในระบบ' AS 'Type',
    STRING_AGG(CAST(IC_ID AS VARCHAR), ', ') AS 'Values'
FROM (
    SELECT DISTINCT IC_ID
    FROM [dbo].[InternalCompany]
    WHERE IC_IsActive = 1
) AS Companies;

PRINT '';
PRINT '============================================================';
PRINT ' เสร็จสิ้น!';
PRINT '============================================================';
PRINT '';
PRINT ' คำอธิบาย:';
PRINT '   - ตัวเลข [20, 30, 40] เป็นเพียงตัวอย่าง';
PRINT '   - IC_ID จริงๆ มาจากตาราง InternalCompany';
PRINT '   - Admin จะเลือก IC_ID จาก dropdown ของ InternalCompany';
PRINT '   - ระบบจะเก็บ IC_ID เหล่านั้นใน SystemUserCompany';

