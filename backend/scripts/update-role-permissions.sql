-- ============================================================
-- สคริปต์อัปเดต Permissions ให้ตรงกับ Screen IDs ที่แก้ไขใหม่
-- ============================================================
-- เปลี่ยนจาก DATA_DAILY (1101) เป็น REPORTS (1000) และ VISIT (1100)
-- ============================================================

USE [SmartSecurity];
GO

-- ประกาศตัวแปร Role IDs
DECLARE @RoleADM INT = 6;  -- Administrator
DECLARE @RoleHRU INT = 8;  -- Human Resource User
DECLARE @RoleQA INT = 7;   -- Quality Assurance
DECLARE @RoleRCT INT = 9;  -- Receptionist
DECLARE @RoleSGU INT = 3;  -- Security Guards User
DECLARE @RoleSGS INT = 10; -- Security Guards Supervisor

-- ============================================================
-- 1. ลบ permissions เก่าที่ใช้ DATA_DAILY (1101) ออก
-- ============================================================
PRINT '🗑️  ลบ permissions เก่าที่ใช้ DATA_DAILY (1101)...';

DELETE FROM [dbo].[SystemRoleSystemScreen]
WHERE SS_ID = 1101
  AND SR_ID IN (@RoleADM, @RoleHRU, @RoleQA, @RoleRCT, @RoleSGU, @RoleSGS);

PRINT '✅ ลบ DATA_DAILY permissions เรียบร้อย';

-- ============================================================
-- 2. เพิ่ม permissions ใหม่ให้ทุก role
-- ============================================================

-- ========== Super Admin / Administrator (ADM) ==========
-- มีทุก permissions ยกเว้น Settings ที่ต้องเป็น Super Admin
PRINT '📝 เพิ่ม permissions สำหรับ Administrator (ADM)...';

-- Dashboard
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 2000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleADM, 2000, NULL, '', '');

-- Statistics
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 3000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleADM, 3000, NULL, '', '');

-- Reports
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 1000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleADM, 1000, NULL, '', '');

-- Visit (รายการเข้า-ออก)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 1100)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleADM, 1100, NULL, '', '');

-- Reprint
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 4000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleADM, 4000, NULL, '', '');

PRINT '✅ Administrator (ADM) permissions เสร็จสิ้น';

-- ========== Human Resource User (HRU) ==========
PRINT '📝 เพิ่ม permissions สำหรับ Human Resource User (HRU)...';

-- Dashboard
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 2000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleHRU, 2000, NULL, '', '');

-- Statistics
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 3000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleHRU, 3000, NULL, '', '');

-- Reports
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 1000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleHRU, 1000, NULL, '', '');

PRINT '✅ Human Resource User (HRU) permissions เสร็จสิ้น';

-- ========== Quality Assurance (QA) ==========
PRINT '📝 เพิ่ม permissions สำหรับ Quality Assurance (QA)...';

-- Dashboard
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 2000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleQA, 2000, NULL, '', '');

-- Statistics
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 3000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleQA, 3000, NULL, '', '');

-- Reports
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 1000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleQA, 1000, NULL, '', '');

-- Visit (รายการเข้า-ออก)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 1100)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleQA, 1100, NULL, '', '');

-- Reprint
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 4000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleQA, 4000, NULL, '', '');

PRINT '✅ Quality Assurance (QA) permissions เสร็จสิ้น';

-- ========== Receptionist (RCT) ==========
PRINT '📝 เพิ่ม permissions สำหรับ Receptionist (RCT)...';

-- Dashboard
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 2000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleRCT, 2000, NULL, '', '');

-- Statistics
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 3000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleRCT, 3000, NULL, '', '');

-- Reports
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 1000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleRCT, 1000, NULL, '', '');

-- Visit (รายการเข้า-ออก)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 1100)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleRCT, 1100, NULL, '', '');

-- Reprint
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 4000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleRCT, 4000, NULL, '', '');

PRINT '✅ Receptionist (RCT) permissions เสร็จสิ้น';

-- ========== Security Guards User (SGU) ==========
PRINT '📝 เพิ่ม permissions สำหรับ Security Guards User (SGU)...';

-- Dashboard only
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleSGU, 2000, NULL, '', '');

PRINT '✅ Security Guards User (SGU) permissions เสร็จสิ้น';

-- ========== Security Guards Supervisor (SGS) ==========
PRINT '📝 เพิ่ม permissions สำหรับ Security Guards Supervisor (SGS)...';

-- Dashboard only
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGS AND SS_ID = 2000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
  VALUES (@RoleSGS, 2000, NULL, '', '');

PRINT '✅ Security Guards Supervisor (SGS) permissions เสร็จสิ้น';

-- ============================================================
-- 3. แสดงสรุป permissions ทั้งหมด
-- ============================================================
PRINT '';
PRINT '📊 สรุป Permissions หลังอัปเดต:';
PRINT '================================================';

SELECT
  SR.SR_Code AS 'Role Code',
  SR.SR_Name AS 'Role Name',
  SS.SS_ID AS 'Screen ID',
  SS.SS_LocalName AS 'Screen Name'
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SRSS.SR_ID IN (@RoleADM, @RoleHRU, @RoleQA, @RoleRCT, @RoleSGU, @RoleSGS)
ORDER BY SR.SR_Code, SS.SS_ID;

PRINT '';
PRINT '✅ อัปเดต permissions เรียบร้อยแล้ว!';
PRINT '================================================';
