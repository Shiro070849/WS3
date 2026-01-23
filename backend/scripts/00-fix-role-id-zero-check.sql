-- ============================================================
-- ตรวจสอบปัญหา Users ที่มี SR_ID = 0 ใน SystemUserSystemRole
-- ============================================================
-- ใช้สำหรับตรวจสอบปัญหาก่อนเริ่ม Migration
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' ตรวจสอบปัญหา Users ที่มี SR_ID = 0 ใน SystemUserSystemRole';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ตรวจสอบ Users ที่มี SR_ID = 0
-- ============================================================
PRINT ' 1. ตรวจสอบ Users ที่มี SR_ID = 0:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID,
    SU.SR_ID AS 'SystemUser.SR_ID',
    SUSR.SR_ID AS 'SystemUserSystemRole.SR_ID',
    CASE 
        WHEN SU.SR_ID IS NOT NULL THEN 'มี SR_ID ใน SystemUser'
        ELSE 'ไม่มี SR_ID ใน SystemUser'
    END AS 'Status'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
WHERE SUSR.SR_ID = 0
    AND SU.SU_Active = 1
ORDER BY SU.SU_ID;

PRINT '';

-- ============================================================
-- 2. ตรวจสอบว่า Users เหล่านี้มี SR_ID ใน SystemUser หรือไม่
-- ============================================================
PRINT ' 2. ตรวจสอบว่า Users เหล่านี้มี SR_ID ใน SystemUser หรือไม่:';
PRINT '------------------------------------------------------------';

SELECT 
    CASE 
        WHEN SU.SR_ID IS NOT NULL THEN 'มี SR_ID ใน SystemUser'
        ELSE 'ไม่มี SR_ID ใน SystemUser'
    END AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
WHERE SUSR.SR_ID = 0
    AND SU.SU_Active = 1
GROUP BY CASE 
    WHEN SU.SR_ID IS NOT NULL THEN 'มี SR_ID ใน SystemUser'
    ELSE 'ไม่มี SR_ID ใน SystemUser'
END;

PRINT '';

-- ============================================================
-- 3. แสดง Users ที่มี SR_ID ใน SystemUser (ใช้ค่าเดิม)
-- ============================================================
PRINT ' 3. Users ที่มี SR_ID ใน SystemUser (ใช้ค่าเดิม):';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.SR_ID AS 'SystemUser.SR_ID',
    SR.SR_Code,
    SR.SR_Name,
    'จะอัพเดท SystemUserSystemRole.SR_ID = ' + CAST(SU.SR_ID AS VARCHAR) AS 'Action'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
LEFT JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
WHERE SUSR.SR_ID = 0
    AND SU.SU_Active = 1
    AND SU.SR_ID IS NOT NULL
ORDER BY SU.SU_ID;

PRINT '';

-- ============================================================
-- 4. แสดง Users ที่ไม่มี SR_ID ใน SystemUser (ต้องกำหนด Role)
-- ============================================================
PRINT ' 4. Users ที่ไม่มี SR_ID ใน SystemUser (ต้องกำหนด Role):';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID,
    IC.IC_LocalName,
    'ต้องกำหนด Role ให้ User นี้' AS 'Action'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SUSR.SR_ID = 0
    AND SU.SU_Active = 1
    AND SU.SR_ID IS NULL
ORDER BY SU.SU_ID;

PRINT '';

-- ============================================================
-- 5. สรุปการแก้ไข
-- ============================================================
PRINT ' 5. สรุปการแก้ไข:';
PRINT '------------------------------------------------------------';

DECLARE @UsersWithSR_ID INT;
DECLARE @UsersWithoutSR_ID INT;

SELECT @UsersWithSR_ID = COUNT(*)
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
WHERE SUSR.SR_ID = 0
    AND SU.SU_Active = 1
    AND SU.SR_ID IS NOT NULL;

SELECT @UsersWithoutSR_ID = COUNT(*)
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
WHERE SUSR.SR_ID = 0
    AND SU.SU_Active = 1
    AND SU.SR_ID IS NULL;

PRINT 'Users ที่มี SR_ID ใน SystemUser: ' + CAST(@UsersWithSR_ID AS VARCHAR) + ' คน';
PRINT '   → สามารถอัพเดท SystemUserSystemRole.SR_ID ได้ทันที';
PRINT '';
PRINT 'Users ที่ไม่มี SR_ID ใน SystemUser: ' + CAST(@UsersWithoutSR_ID AS VARCHAR) + ' คน';
PRINT '   → ต้องกำหนด Role ให้ User ก่อน';
PRINT '';

-- ============================================================
-- 6. Script สำหรับแก้ไข (UPDATE)
-- ============================================================
PRINT ' 6. Script สำหรับแก้ไข (UPDATE):';
PRINT '------------------------------------------------------------';
PRINT '';
PRINT '-- ============================================================';
PRINT '-- อัพเดท Users ที่มี SR_ID ใน SystemUser';
PRINT '-- ============================================================';
PRINT '';

PRINT 'UPDATE SUSR
SET SUSR.SR_ID = SU.SR_ID
FROM [dbo].[SystemUserSystemRole] SUSR
INNER JOIN [dbo].[SystemUser] SU ON SUSR.SU_ID = SU.SU_ID
WHERE SUSR.SR_ID = 0
    AND SU.SU_Active = 1
    AND SU.SR_ID IS NOT NULL;';
PRINT '';

PRINT '-- ตรวจสอบผลลัพธ์';
PRINT 'SELECT COUNT(*) AS ''Updated Records''
FROM [dbo].[SystemUserSystemRole] SUSR
INNER JOIN [dbo].[SystemUser] SU ON SUSR.SU_ID = SU.SU_ID
WHERE SUSR.SR_ID = 0
    AND SU.SU_Active = 1
    AND SU.SR_ID IS NOT NULL;';
PRINT '';

-- ============================================================
-- 7. Script สำหรับลบ Users ที่ไม่มี SR_ID (ถ้าต้องการ)
-- ============================================================
PRINT ' 7. Script สำหรับลบ Users ที่ไม่มี SR_ID (ถ้าต้องการ):';
PRINT '------------------------------------------------------------';
PRINT '';
PRINT '-- WARNING: คำเตือน: ลบเฉพาะใน SystemUserSystemRole เท่านั้น';
PRINT '-- ไม่ลบ User ใน SystemUser';
PRINT '';

PRINT '-- DELETE FROM [dbo].[SystemUserSystemRole]
-- WHERE SR_ID = 0
--     AND SU_ID IN (
--         SELECT SU_ID 
--         FROM [dbo].[SystemUser] 
--         WHERE SR_ID IS NULL 
--             AND SU_Active = 1
--     );';
PRINT '';

PRINT '============================================================';
PRINT ' เสร็จสิ้นการตรวจสอบ!';
PRINT '============================================================';
PRINT '';
PRINT 'WARNING: ขั้นตอนต่อไป:';
PRINT '   1. ตรวจสอบ Users ที่มี SR_ID = 0';
PRINT '   2. อัพเดท SystemUserSystemRole.SR_ID สำหรับ Users ที่มี SR_ID ใน SystemUser';
PRINT '   3. กำหนด Role ให้ Users ที่ไม่มี SR_ID';
PRINT '   4. ลบหรือแก้ไข SystemUserSystemRole สำหรับ Users ที่ไม่มี SR_ID (ถ้าต้องการ)';

