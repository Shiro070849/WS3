-- ============================================================
-- เพิ่ม Statistics Permission ให้ QA Role
-- ============================================================
-- ทำให้ QA มีสิทธิ์เท่ากับ RCT (เพิ่ม Statistics 3000)
-- ============================================================

USE [SmartSecurity];
GO

DECLARE @RoleQA INT = 7;

PRINT '🔧 กำลังเพิ่ม Statistics Permission ให้ QA (SR_ID = 7)';
PRINT '============================================================';

-- Statistics (3000)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 3000)
BEGIN
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleQA, 3000, NULL, '', '');
  PRINT '✅ เพิ่ม Statistics (3000) ให้ QA';
END
ELSE
BEGIN
  PRINT '⏭️  QA มี Statistics (3000) อยู่แล้ว';
END

PRINT '';
PRINT '============================================================';
PRINT '📊 สรุป Permissions ของ QA หลังอัปเดต:';
PRINT '============================================================';

SELECT
  SR.SR_Code AS 'Role Code',
  SR.SR_Name AS 'Role Name',
  SS.SS_ID AS 'Screen ID',
  SS.SS_Name AS 'Screen Name'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SRSS.SR_ID = @RoleQA
ORDER BY SS.SS_ID;

PRINT '';
PRINT '✅ เสร็จสิ้น! QA ตอนนี้มีสิทธิ์เท่ากับ RCT แล้ว';
PRINT '   - Dashboard (2000)';
PRINT '   - Reports (1000)';
PRINT '   - Visit (1100)';
PRINT '   - Statistics (3000)';
PRINT '   - Reprint (4000)';
