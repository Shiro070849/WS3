-- ============================================================
-- ลบสิทธิ์ Statistics (3000) ออกจาก HRU
-- ============================================================
-- ใช้สคริปต์นี้ถ้าต้องการให้ HRU ไม่เห็นหน้า Statistics
-- ============================================================

USE [SmartSecurity];
GO

DECLARE @RoleHRU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');

PRINT '============================================================';
PRINT '🗑️  กำลังลบสิทธิ์ Statistics (3000) จาก HRU';
PRINT '============================================================';

IF @RoleHRU IS NULL
BEGIN
  PRINT '❌ ไม่พบ Role HRU ในระบบ';
  RETURN;
END

PRINT '📌 HRU Role: SR_ID = ' + CAST(@RoleHRU AS VARCHAR);
PRINT '';

-- เช็คว่ามี Statistics หรือไม่
IF EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 3000)
BEGIN
  DELETE FROM [dbo].[SystemRoleSystemScreen]
  WHERE SR_ID = @RoleHRU AND SS_ID = 3000;

  PRINT '✅ ลบ Statistics (3000) จาก HRU สำเร็จ';
END
ELSE
BEGIN
  PRINT '⏭️  HRU ไม่มี Statistics (3000) อยู่แล้ว - ไม่ต้องทำอะไร';
END

PRINT '';

-- แสดงสรุป
PRINT '============================================================';
PRINT '📊 Permissions ของ HRU หลังลบ Statistics:';
PRINT '============================================================';

SELECT
  SS.SS_ID AS 'Screen ID',
  SS.SS_Name AS 'Screen Name',
  SS.SS_LocalName AS 'Screen Name (TH)'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SRSS.SR_ID = @RoleHRU
ORDER BY SS.SS_ID;

PRINT '';
PRINT '✅ เสร็จสิ้น!';
PRINT '============================================================';
