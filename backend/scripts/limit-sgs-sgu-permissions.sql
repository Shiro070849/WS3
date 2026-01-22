-- ============================================================
-- จำกัด Permissions ของ SGS และ SGU ให้เหลือแค่ Dashboard
-- ============================================================
-- SGS (Security Guards Supervisor) = SR_ID 2
-- SGU (Security Guards User) = SR_ID 3
-- ให้เข้าได้เฉพาะ Dashboard (2000) เท่านั้น
-- ============================================================

USE [SmartSecurity];
GO

DECLARE @RoleSGS INT = 2;  -- Security Guards Supervisor
DECLARE @RoleSGU INT = 3;  -- Security Guards User

PRINT '============================================================';
PRINT '🔧 กำลังจำกัด Permissions ของ SGS และ SGU';
PRINT '============================================================';

-- ============================================================
-- 1. ลบ permissions ทั้งหมดของ SGS ยกเว้น Dashboard
-- ============================================================
PRINT '';
PRINT '📋 ลบ permissions ของ SGS (Security Guards Supervisor)...';

DELETE FROM [dbo].[SystemRoleSystemScreen]
WHERE SR_ID = @RoleSGS
  AND SS_ID NOT IN (2000);  -- เก็บไว้แค่ Dashboard

PRINT '✅ ลบ permissions ที่ไม่ใช่ Dashboard ของ SGS แล้ว';

-- เพิ่ม Dashboard ถ้ายังไม่มี
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGS AND SS_ID = 2000)
BEGIN
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleSGS, 2000, NULL, '', '');
  PRINT '✅ เพิ่ม Dashboard (2000) ให้ SGS';
END
ELSE
  PRINT '⏭️  SGS มี Dashboard (2000) อยู่แล้ว';

-- ============================================================
-- 2. ลบ permissions ทั้งหมดของ SGU ยกเว้น Dashboard
-- ============================================================
PRINT '';
PRINT '📋 ลบ permissions ของ SGU (Security Guards User)...';

DELETE FROM [dbo].[SystemRoleSystemScreen]
WHERE SR_ID = @RoleSGU
  AND SS_ID NOT IN (2000);  -- เก็บไว้แค่ Dashboard

PRINT '✅ ลบ permissions ที่ไม่ใช่ Dashboard ของ SGU แล้ว';

-- เพิ่ม Dashboard ถ้ายังไม่มี
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000)
BEGIN
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleSGU, 2000, NULL, '', '');
  PRINT '✅ เพิ่ม Dashboard (2000) ให้ SGU';
END
ELSE
  PRINT '⏭️  SGU มี Dashboard (2000) อยู่แล้ว';

-- ============================================================
-- 3. แสดงสรุป Permissions หลังอัปเดต
-- ============================================================
PRINT '';
PRINT '============================================================';
PRINT '📊 สรุป Permissions ของ SGS และ SGU:';
PRINT '============================================================';

SELECT
  SR.SR_Code AS 'Role Code',
  SR.SR_Name AS 'Role Name',
  SS.SS_ID AS 'Screen ID',
  SS.SS_Name AS 'Screen Name'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SRSS.SR_ID IN (@RoleSGS, @RoleSGU)
ORDER BY SR.SR_Code, SS.SS_ID;

PRINT '';
PRINT '✅ เสร็จสิ้น! SGS และ SGU มีสิทธิ์เข้าได้เฉพาะ Dashboard (2000) เท่านั้น';
PRINT '============================================================';
