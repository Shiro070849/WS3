-- ============================================================
-- แก้ไขปัญหา Users ที่มี SR_ID = 0 ใน SystemUserSystemRole (EXECUTE)
-- ============================================================
-- WARNING: คำเตือน: รัน Script นี้ใน Dev Database ก่อน!
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' แก้ไขปัญหา Users ที่มี SR_ID = 0';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. Backup: ตรวจสอบข้อมูลก่อนแก้ไข
-- ============================================================
PRINT ' 1. ตรวจสอบข้อมูลก่อนแก้ไข:';
PRINT '------------------------------------------------------------';

SELECT 
    COUNT(*) AS 'Total Users with SR_ID = 0',
    COUNT(CASE WHEN SU.SR_ID IS NOT NULL THEN 1 END) AS 'Users with SR_ID in SystemUser',
    COUNT(CASE WHEN SU.SR_ID IS NULL THEN 1 END) AS 'Users without SR_ID in SystemUser'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
WHERE SUSR.SR_ID = 0
    AND SU.SU_Active = 1;

PRINT '';

-- ============================================================
-- 2. อัพเดท Users ที่มี SR_ID ใน SystemUser
-- ============================================================
PRINT ' 2. อัพเดท Users ที่มี SR_ID ใน SystemUser:';
PRINT '------------------------------------------------------------';

BEGIN TRANSACTION;

BEGIN TRY
    UPDATE SUSR
    SET SUSR.SR_ID = SU.SR_ID
    FROM [dbo].[SystemUserSystemRole] SUSR
    INNER JOIN [dbo].[SystemUser] SU ON SUSR.SU_ID = SU.SU_ID
    WHERE SUSR.SR_ID = 0
        AND SU.SU_Active = 1
        AND SU.SR_ID IS NOT NULL;

    DECLARE @UpdatedCount INT = @@ROWCOUNT;
    
    PRINT ' อัพเดทสำเร็จ: ' + CAST(@UpdatedCount AS VARCHAR) + ' records';
    PRINT '';
    
    -- ตรวจสอบผลลัพธ์
    DECLARE @RemainingCount INT;
    SELECT @RemainingCount = COUNT(*)
    FROM [dbo].[SystemUserSystemRole] SUSR
    INNER JOIN [dbo].[SystemUser] SU ON SUSR.SU_ID = SU.SU_ID
    WHERE SUSR.SR_ID = 0
        AND SU.SU_Active = 1
        AND SU.SR_ID IS NOT NULL;
    
    IF @RemainingCount = 0
    BEGIN
        PRINT ' ไม่มี Users ที่มี SR_ID = 0 และมี SR_ID ใน SystemUser เหลืออยู่แล้ว';
    END
    ELSE
    BEGIN
        PRINT 'WARNING: ยังมี Users ที่ต้องแก้ไข: ' + CAST(@RemainingCount AS VARCHAR) + ' คน';
    END
    
    COMMIT TRANSACTION;
    PRINT '';
    PRINT ' Transaction Committed';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '';
    PRINT 'ERROR: Error: ' + ERROR_MESSAGE();
    PRINT 'WARNING: Transaction Rolled Back';
END CATCH

PRINT '';

-- ============================================================
-- 3. แสดง Users ที่ยังมี SR_ID = 0 (ต้องกำหนด Role)
-- ============================================================
PRINT ' 3. Users ที่ยังมี SR_ID = 0 (ต้องกำหนด Role):';
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
-- 4. สรุปผลลัพธ์
-- ============================================================
PRINT ' 4. สรุปผลลัพธ์:';
PRINT '------------------------------------------------------------';

SELECT 
    'Users ที่แก้ไขแล้ว (มี SR_ID ใน SystemUser)' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
WHERE SUSR.SR_ID != 0
    AND SU.SU_Active = 1
    AND SU.SR_ID IS NOT NULL
    AND SUSR.SR_ID = SU.SR_ID

UNION ALL

SELECT 
    'Users ที่ยังมี SR_ID = 0 (ไม่มี SR_ID ใน SystemUser)' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
WHERE SUSR.SR_ID = 0
    AND SU.SU_Active = 1
    AND SU.SR_ID IS NULL;

PRINT '';
PRINT '============================================================';
PRINT ' เสร็จสิ้นการแก้ไข!';
PRINT '============================================================';
PRINT '';
PRINT 'WARNING: ขั้นตอนต่อไป:';
PRINT '   1. ตรวจสอบ Users ที่ยังมี SR_ID = 0';
PRINT '   2. กำหนด Role ให้ Users เหล่านั้น';
PRINT '   3. อัพเดท SystemUserSystemRole อีกครั้ง';

