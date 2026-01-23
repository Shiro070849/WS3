-- ============================================================
-- ตรวจสอบ Permissions ปัจจุบันของ HRU
-- ============================================================
-- ใช้สำหรับ Debug และตรวจสอบว่า HRU มีสิทธิ์อะไรบ้าง
-- ============================================================

USE [SmartSecurity];
GO

DECLARE @RoleHRU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');

PRINT '============================================================';
PRINT '🔍 ตรวจสอบ Permissions ของ HRU (Human Resource User)';
PRINT '============================================================';

-- ตรวจสอบว่า HRU role มีอยู่หรือไม่
IF @RoleHRU IS NULL
BEGIN
  PRINT '❌ ไม่พบ Role HRU ในระบบ';
  PRINT '';
  PRINT '📋 Roles ทั้งหมดที่มีในระบบ:';
  SELECT SR_ID, SR_Code, SR_Name, SR_Description
  FROM [dbo].[SystemRole]
  WHERE SR_Active = 1
  ORDER BY SR_ID;
  RETURN;
END

PRINT '✅ พบ HRU Role: SR_ID = ' + CAST(@RoleHRU AS VARCHAR);
PRINT '';

-- แสดง Permissions ทั้งหมดของ HRU
PRINT '📊 Permissions ทั้งหมดของ HRU:';
PRINT '============================================================';

SELECT
  SRSS.SRSS_ID AS 'Permission ID',
  SS.SS_ID AS 'Screen ID',
  SS.SS_Name AS 'Screen Name (EN)',
  SS.SS_LocalName AS 'Screen Name (TH)',
  SS.SS_RelativePath AS 'Route Path',
  CASE
    WHEN SRSS.IC_ID IS NULL THEN 'Global (ทุกบริษัท)'
    ELSE 'Company ID: ' + CAST(SRSS.IC_ID AS VARCHAR)
  END AS 'Scope'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SRSS.SR_ID = @RoleHRU
  AND SS.SS_IsActive = 1
ORDER BY SS.SS_ID;

PRINT '';

-- เช็คว่ามี Dashboard หรือไม่ (สำคัญมาก!)
IF EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 2000)
  PRINT '✅ HRU มี Dashboard (2000) - OK';
ELSE
  PRINT '❌ HRU ไม่มี Dashboard (2000) - ต้องเพิ่ม!';

-- เช็คว่ามี Visit หรือไม่
IF EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 1100)
  PRINT '✅ HRU มี Visit (1100) - รายการเข้า-ออก';
ELSE
  PRINT '❌ HRU ไม่มี Visit (1100) - รายการเข้า-ออก';

-- เช็คว่ามี Reports หรือไม่
IF EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 1000)
  PRINT '✅ HRU มี Reports (1000) - รายงาน';
ELSE
  PRINT '❌ HRU ไม่มี Reports (1000) - รายงาน';

-- เช็คว่ามี Statistics หรือไม่
IF EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 3000)
  PRINT '⚠️  HRU มี Statistics (3000) - สถิติ';
ELSE
  PRINT '   HRU ไม่มี Statistics (3000)';

-- เช็คว่ามี Reprint หรือไม่ (ไม่ควรมี)
IF EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 4000)
  PRINT '⚠️  HRU มี Reprint (4000) - รีปริ้น (ไม่ควรมี!)';
ELSE
  PRINT '✅ HRU ไม่มี Reprint (4000) - OK';

PRINT '============================================================';

-- แสดง Users ทั้งหมดที่เป็น HRU
PRINT '';
PRINT '👥 Users ที่มี Role HRU:';
PRINT '============================================================';

SELECT
  SU.SU_ID,
  SU.SU_Code,
  SU.SU_Name1,
  SU.SU_Username,
  SU.SU_Active AS 'Active',
  IC.IC_LocalName AS 'Company'
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.SR_ID = @RoleHRU
ORDER BY SU.SU_Active DESC, SU.SU_Code;

PRINT '';
PRINT '✅ เสร็จสิ้น!';
PRINT '============================================================';
