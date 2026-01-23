-- ============================================================
-- รีเซ็ต Permissions ของ HRU ให้เหลือเฉพาะที่ต้องการ
-- ============================================================
-- HRU ควรเข้าถึงได้เฉพาะ:
-- 1. Dashboard (2000)
-- 2. Visit (1100) - รายการเข้า-ออก (ไม่มีรีปริ้น)
-- 3. Reports (1000) - รายงาน
-- ============================================================
-- ⚠️  WARNING: สคริปต์นี้จะลบ Permissions เดิมทั้งหมดของ HRU!
-- ============================================================

USE [SmartSecurity];
GO

-- ดึง SR_ID ของ HRU
DECLARE @RoleHRU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');

PRINT '============================================================';
PRINT '🔄 กำลังรีเซ็ต Permissions ของ HRU';
PRINT '============================================================';

-- ตรวจสอบว่า HRU role มีอยู่หรือไม่
IF @RoleHRU IS NULL
BEGIN
  PRINT '❌ ไม่พบ Role HRU ในระบบ';
  PRINT '⚠️  กรุณาตรวจสอบว่ามี Role HRU (SR_Code = ''HRU'') ในตาราง SystemRole หรือไม่';
  RETURN;
END

PRINT '📌 พบ HRU Role: SR_ID = ' + CAST(@RoleHRU AS VARCHAR);
PRINT '';

-- ============================================================
-- ขั้นตอนที่ 1: แสดง Permissions เดิมก่อนลบ
-- ============================================================
PRINT '📋 Permissions เดิมของ HRU (ก่อนลบ):';
PRINT '------------------------------------------------------------';

DECLARE @OldPermissionCount INT;
SELECT @OldPermissionCount = COUNT(*)
FROM [dbo].[SystemRoleSystemScreen]
WHERE SR_ID = @RoleHRU;

PRINT 'จำนวน Permissions เดิม: ' + CAST(@OldPermissionCount AS VARCHAR);

SELECT
  SS.SS_ID AS 'Screen ID',
  SS.SS_Name AS 'Screen Name'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SRSS.SR_ID = @RoleHRU
ORDER BY SS.SS_ID;

PRINT '';

-- ============================================================
-- ขั้นตอนที่ 2: ลบ Permissions ทั้งหมดของ HRU
-- ============================================================
PRINT '🗑️  กำลังลบ Permissions ทั้งหมดของ HRU...';

DELETE FROM [dbo].[SystemRoleSystemScreen]
WHERE SR_ID = @RoleHRU;

PRINT '✅ ลบ Permissions เดิม ' + CAST(@OldPermissionCount AS VARCHAR) + ' รายการสำเร็จ';
PRINT '';

-- ============================================================
-- ขั้นตอนที่ 3: เพิ่ม Permissions ใหม่ (เฉพาะที่ต้องการ)
-- ============================================================
PRINT '➕ กำลังเพิ่ม Permissions ใหม่ (เฉพาะที่จำเป็น)...';
PRINT '';

-- 1. Dashboard (2000) - สำคัญมาก! ไม่มีจะเข้าระบบไม่ได้
PRINT '  1️⃣  เพิ่ม Dashboard (2000)';
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
VALUES (@RoleHRU, 2000, NULL, '', '');

-- 2. Visit (1100) - รายการเข้า-ออก (ไม่รวมรีปริ้น)
PRINT '  2️⃣  เพิ่ม Visit (1100) - รายการเข้า-ออก';
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
VALUES (@RoleHRU, 1100, NULL, '', '');

-- 3. Reports (1000) - รายงาน
PRINT '  3️⃣  เพิ่ม Reports (1000) - รายงาน';
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
VALUES (@RoleHRU, 1000, NULL, '', '');

PRINT '';
PRINT '✅ เพิ่ม Permissions ใหม่ 3 รายการสำเร็จ';
PRINT '';

-- ============================================================
-- ขั้นตอนที่ 4: แสดงสรุป Permissions หลังอัปเดต
-- ============================================================
PRINT '============================================================';
PRINT '📊 สรุป Permissions ของ HRU หลังรีเซ็ต:';
PRINT '============================================================';

SELECT
  SR.SR_Code AS 'Role Code',
  SR.SR_Name AS 'Role Name',
  SS.SS_ID AS 'Screen ID',
  SS.SS_Name AS 'Screen Name',
  SS.SS_RelativePath AS 'Route Path',
  CASE
    WHEN SRSS.IC_ID IS NULL THEN 'Global (ทุกบริษัท)'
    ELSE 'Company ID: ' + CAST(SRSS.IC_ID AS VARCHAR)
  END AS 'Scope'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SRSS.SR_ID = @RoleHRU
ORDER BY SS.SS_ID;

PRINT '';
PRINT '============================================================';
PRINT '✅ เสร็จสิ้น! HRU ตอนนี้มีสิทธิ์เข้าถึงเฉพาะ:';
PRINT '------------------------------------------------------------';
PRINT '   1. Dashboard (2000) - หน้าแรก';
PRINT '   2. Visit (1100) - รายการเข้า-ออก (ไม่มีรีปริ้น)';
PRINT '   3. Reports (1000) - รายงาน';
PRINT '';
PRINT '❌ HRU ไม่สามารถเข้าถึง:';
PRINT '   - Reprint (4000) - รีปริ้น';
PRINT '   - Settings (10000) - ตั้งค่า';
PRINT '   - Statistics (3000) - สถิติ';
PRINT '   - User Management - จัดการผู้ใช้';
PRINT '   - และอื่นๆ ทั้งหมด';
PRINT '';
PRINT '📌 หมายเหตุ:';
PRINT '   - Permissions เหล่านี้เป็นแบบ Global (IC_ID = NULL)';
PRINT '   - HRU จะเห็นเฉพาะข้อมูลของบริษัทตัวเอง (กรองโดย IC_ID)';
PRINT '   - เว้นแต่เป็น Super Admin (IC_ID = NULL) จะเห็นทุกบริษัท';
PRINT '============================================================';
