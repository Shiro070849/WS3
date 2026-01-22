-- ============================================================
-- Fix RCT Permissions - เพิ่ม Dashboard และ permissions อื่นๆ
-- ============================================================

USE [SmartSecurity];
GO

-- ขั้นตอนที่ 1: หา SR_ID ของ RCT role
PRINT '📋 ค้นหา RCT Role...';
SELECT SR_ID, SR_Code, SR_Name
FROM SystemRole
WHERE SR_Code LIKE '%RCT%' OR SR_Name LIKE '%Receptionist%' OR SR_Name LIKE '%พนักงาน%';

PRINT '';
PRINT '📋 แสดง Roles ทั้งหมด:';
SELECT SR_ID, SR_Code, SR_Name
FROM SystemRole
ORDER BY SR_ID;

PRINT '';
PRINT '⚠️  กรุณาตรวจสอบ SR_ID ของ RCT จากผลลัพธ์ข้างบน';
PRINT '⚠️  แล้วรันสคริปต์ด้านล่างโดยแก้ @RoleRCT ให้ถูกต้อง';
PRINT '';

-- ============================================================
-- ขั้นตอนที่ 2: เพิ่ม Permissions (แก้ @RoleRCT ให้ตรงกับ SR_ID ที่ได้)
-- ============================================================

-- ใช้ SR_ID = 6 สำหรับ RCT (Reception)
DECLARE @RoleRCT INT = 6;

PRINT '============================================================';
PRINT '🔧 กำลังเพิ่ม Permissions สำหรับ RCT (SR_ID = ' + CAST(@RoleRCT AS VARCHAR) + ')';
PRINT '============================================================';

-- Dashboard (2000) - สำคัญมาก! ไม่มีจะเข้าระบบไม่ได้
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 2000)
BEGIN
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleRCT, 2000, NULL, '', '');
  PRINT '✅ เพิ่ม Dashboard (2000)';
END
ELSE
  PRINT '⏭️  Dashboard (2000) มีอยู่แล้ว';

-- Statistics (3000)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 3000)
BEGIN
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleRCT, 3000, NULL, '', '');
  PRINT '✅ เพิ่ม Statistics (3000)';
END
ELSE
  PRINT '⏭️  Statistics (3000) มีอยู่แล้ว';

-- Reports (1000)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 1000)
BEGIN
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleRCT, 1000, NULL, '', '');
  PRINT '✅ เพิ่ม Reports (1000)';
END
ELSE
  PRINT '⏭️  Reports (1000) มีอยู่แล้ว';

-- Visit (1100)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 1100)
BEGIN
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleRCT, 1100, NULL, '', '');
  PRINT '✅ เพิ่ม Visit (1100)';
END
ELSE
  PRINT '⏭️  Visit (1100) มีอยู่แล้ว';

-- Reprint (4000)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 4000)
BEGIN
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleRCT, 4000, NULL, '', '');
  PRINT '✅ เพิ่ม Reprint (4000)';
END
ELSE
  PRINT '⏭️  Reprint (4000) มีอยู่แล้ว';

PRINT '';
PRINT '============================================================';
PRINT '📊 สรุป Permissions ของ RCT หลังอัปเดต:';
PRINT '============================================================';

SELECT
  SR.SR_Code AS 'Role Code',
  SR.SR_Name AS 'Role Name',
  SS.SS_ID AS 'Screen ID',
  SS.SS_Name AS 'Screen Name'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SRSS.SR_ID = @RoleRCT
ORDER BY SS.SS_ID;

PRINT '';
PRINT '✅ เสร็จสิ้น!';
