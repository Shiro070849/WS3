-- ========================================
-- Script: Add Missing Role Permissions
-- Purpose: เพิ่มสิทธิ์ที่ยังไม่มีให้แต่ละ Role (ไม่ลบของเก่า)
-- Date: 2026-01-21
-- ========================================

-- Screen IDs (จากภาพที่ส่งมา)
-- 1 = Systems
-- 1000 = Reports
-- 1100 = Visit (รายการ การเข้า-ออก)
-- 1101 = Data Daily
-- 2000 = Dashboard
-- 3000 = Statistics
-- 4000 = Reprint
-- 10000 = Settings

-- ดึง Role IDs
DECLARE @RoleADM INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM');
DECLARE @RoleHRU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');
DECLARE @RoleQA INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'QA');
DECLARE @RoleRCT INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'RCT');
DECLARE @RoleSGU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU');
DECLARE @RoleSGS INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGS');

PRINT '========================================';
PRINT 'Starting Permission Setup (Add Missing Only)';
PRINT '========================================';

-- ========================================
-- Role: ADM (Administrator)
-- Permissions: Dashboard, Statistics, Reports, Visit, Settings
-- ========================================
IF @RoleADM IS NOT NULL
BEGIN
  -- เพิ่มเฉพาะที่ยังไม่มี
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 2000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleADM, 2000, NULL, '', '');  -- Dashboard

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 3000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleADM, 3000, NULL, '', '');  -- Statistics

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 1000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleADM, 1000, NULL, '', '');  -- Reports

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 1100)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleADM, 1100, NULL, '', '');  -- Visit

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 10000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleADM, 10000, NULL, '', '');  -- Settings

  PRINT 'Added missing permissions for ADM';
END
ELSE
  PRINT 'Warning: Role ADM not found';

-- ========================================
-- Role: HRU (HR User)
-- Permissions: Dashboard, Reports, Statistics
-- ========================================
IF @RoleHRU IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 2000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleHRU, 2000, NULL, '', '');

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 1000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleHRU, 1000, NULL, '', '');

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 3000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleHRU, 3000, NULL, '', '');

  PRINT 'Added missing permissions for HRU';
END
ELSE
  PRINT 'Warning: Role HRU not found';

-- ========================================
-- Role: QA (Quality Assurance)
-- Permissions: Dashboard, Reports, Statistics, Visit
-- ========================================
IF @RoleQA IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 2000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleQA, 2000, NULL, '', '');

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 1000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleQA, 1000, NULL, '', '');

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 3000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleQA, 3000, NULL, '', '');

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 1100)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleQA, 1100, NULL, '', '');

  PRINT 'Added missing permissions for QA';
END
ELSE
  PRINT 'Warning: Role QA not found';

-- ========================================
-- Role: RCT (Reception)
-- Permissions: Dashboard, Reports, Statistics, Visit
-- ========================================
IF @RoleRCT IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 2000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleRCT, 2000, NULL, '', '');

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 1000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleRCT, 1000, NULL, '', '');

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 3000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleRCT, 3000, NULL, '', '');

  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 1100)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleRCT, 1100, NULL, '', '');

  PRINT 'Added missing permissions for RCT';
END
ELSE
  PRINT 'Warning: Role RCT not found';

-- ========================================
-- Role: SGU (Security Guard User)
-- Permissions: Dashboard อย่างเดียว
-- ========================================
IF @RoleSGU IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleSGU, 2000, NULL, '', '');

  PRINT 'Added missing permissions for SGU';
END
ELSE
  PRINT 'Warning: Role SGU not found';

-- ========================================
-- Role: SGS (Security Supervisor)
-- Permissions: Dashboard อย่างเดียว
-- ========================================
IF @RoleSGS IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGS AND SS_ID = 2000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds)
    VALUES (@RoleSGS, 2000, NULL, '', '');

  PRINT 'Added missing permissions for SGS';
END
ELSE
  PRINT 'Warning: Role SGS not found';

-- ========================================
-- Verify Results
-- ========================================
SELECT
  sr.SR_Code AS [Role Code],
  sr.SR_Name AS [Role Name],
  ss.SS_ID AS [Screen ID],
  ss.SS_Name AS [Screen Name],
  CASE
    WHEN srss.IC_ID IS NULL THEN 'Global (ทุกบริษัท)'
    ELSE CAST(srss.IC_ID AS VARCHAR)
  END AS [Company]
FROM [dbo].[SystemRoleSystemScreen] srss
INNER JOIN [dbo].[SystemRole] sr ON srss.SR_ID = sr.SR_ID
INNER JOIN [dbo].[SystemScreen] ss ON srss.SS_ID = ss.SS_ID
ORDER BY sr.SR_Code, ss.SS_ID;

PRINT 'Setup completed successfully!';

