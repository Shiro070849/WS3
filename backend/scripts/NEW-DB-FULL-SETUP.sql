-- ============================================================
-- NEW-DB-FULL-SETUP.sql
-- รันตามลำดับสำหรับ DB ใหม่ / อีก DB (แทนที่ USE [ชื่อDB] ด้านล่าง)
-- Backup DB ก่อนรันทุกครั้ง
-- ============================================================

USE [RC_SmartSecurity_SC];  -- แทนที่ด้วยชื่อ DB จริง
GO

-- ==================== ลำดับ 1: สร้างตารางที่ขาด ====================

-- 1.1 SystemSettings
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemSettings')
BEGIN
    CREATE TABLE [dbo].[SystemSettings] (
        SS_ID          INT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
        SS_Key         NVARCHAR(100) NOT NULL,
        SS_Value       NVARCHAR(MAX) NULL,
        SS_Type        NVARCHAR(50)  NULL,
        SS_Category    NVARCHAR(50)  NULL,
        SS_Description NVARCHAR(255) NULL,
        SS_UpdatedAt   DATETIME      NULL,
        SS_UpdatedBy   INT           NULL,
        IC_ID          INT           NULL
    );
END;
GO

-- 1.2 SystemUserCompany
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    CREATE TABLE [dbo].[SystemUserCompany] (
        SUC_ID        INT      NOT NULL IDENTITY(1,1) PRIMARY KEY,
        SU_ID         INT      NOT NULL,
        IC_ID         INT      NOT NULL,
        SUC_IsActive  BIT      NULL,
        SUC_CreatedAt DATETIME NULL,
        SUC_CreatedBy INT      NULL,
        SUC_UpdatedAt DATETIME NULL,
        SUC_UpdatedBy INT      NULL,
        CONSTRAINT UK_SystemUserCompany UNIQUE (SU_ID, IC_ID)
    );
    CREATE INDEX IX_SystemUserCompany_SU_ID ON [dbo].[SystemUserCompany](SU_ID);
    CREATE INDEX IX_SystemUserCompany_IC_ID ON [dbo].[SystemUserCompany](IC_ID);
END;
GO

-- 1.3 คอลัมน์ IC_ID ใน SystemRoleSystemScreen
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'IC_ID'
)
BEGIN
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD IC_ID INT NULL;
END;
GO

-- ==================== ลำดับ 2: แถว SystemScreen ที่ขาด ====================

SET IDENTITY_INSERT [dbo].[SystemScreen] ON;

IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 2000)
INSERT INTO [dbo].[SystemScreen] (SS_ID, SS_RelativePath, SS_Description, SS_IsActive, SS_Remarks, SS_ShowInMenu, SS_ImagePath, SS_Position, SS_IDParent, SS_SortChildrenByName, SS_IsExpanded, SS_Name)
VALUES (2000, '/dashboard', N'Dashboard - ภาพรวมระบบ', 1, NULL, 1, '/_base/content/images/icons-apps/bullet_green.png', 0, NULL, 0, 1, N'Dashboard');

IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 3000)
INSERT INTO [dbo].[SystemScreen] (SS_ID, SS_RelativePath, SS_Description, SS_IsActive, SS_Remarks, SS_ShowInMenu, SS_ImagePath, SS_Position, SS_IDParent, SS_SortChildrenByName, SS_IsExpanded, SS_Name)
VALUES (3000, '/statistics', N'Statistics - สถิติและการวิเคราะห์', 1, NULL, 1, '/_base/content/images/icons-apps/bullet_green.png', 0, NULL, 0, 1, N'Statistics');

IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 4000)
INSERT INTO [dbo].[SystemScreen] (SS_ID, SS_RelativePath, SS_Description, SS_IsActive, SS_Remarks, SS_ShowInMenu, SS_ImagePath, SS_Position, SS_IDParent, SS_SortChildrenByName, SS_IsExpanded, SS_Name)
VALUES (4000, '/vehicle/reprint', N'Reprint - ระบบรีปริ้น', 1, NULL, 0, '/_base/content/images/icons-apps/bullet_green.png', 1, 1101, 0, 1, N'Reprint');

IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 12005)
INSERT INTO [dbo].[SystemScreen] (SS_ID, SS_RelativePath, SS_Description, SS_IsActive, SS_Remarks, SS_ShowInMenu, SS_ImagePath, SS_Position, SS_IDParent, SS_SortChildrenByName, SS_IsExpanded, SS_Name)
VALUES (12005, '/settings/appearance', NULL, 1, NULL, 1, NULL, 11002, 11000, NULL, NULL, N'Appearance Settings');

SET IDENTITY_INSERT [dbo].[SystemScreen] OFF;
GO

-- ==================== ลำดับ 3: สิทธิ์ Role (จาก 00-setup-role-permissions) ====================

DECLARE @RoleADM INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM');
DECLARE @RoleHRU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');
DECLARE @RoleQA INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'QA');
DECLARE @RoleRCT INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'RCT');
DECLARE @RoleSGU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU');
DECLARE @RoleSGS INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGS');

-- ADM
IF @RoleADM IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 2000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 2000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 3000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 3000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 1000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 1000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 1100)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 1100, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 10000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 10000, NULL, '', '');
END

IF @RoleHRU IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 2000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 2000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 1000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 1000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 3000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 3000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 1100)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 1100, NULL, '', '');
END

IF @RoleQA IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 2000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA, 2000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 1000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA, 1000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 3000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA, 3000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 1100)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA, 1100, NULL, '', '');
END

IF @RoleRCT IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 2000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT, 2000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 1000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT, 1000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 3000)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT, 3000, NULL, '', '');
  IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 1100)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT, 1100, NULL, '', '');
END

IF @RoleSGU IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGU, 2000, NULL, '', '');

IF @RoleSGS IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGS AND SS_ID = 2000)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGS, 2000, NULL, '', '');
GO

-- ==================== ลำดับ 4: Migrate User–Company ====================

INSERT INTO [dbo].[SystemUserCompany] (SU_ID, IC_ID, SUC_IsActive, SUC_CreatedAt)
SELECT SU.SU_ID, SU.IC_ID, 1, GETDATE()
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL
  AND SU.SU_Active = 1
  AND IC.IC_IsActive = 1
  AND NOT EXISTS (
      SELECT 1 FROM [dbo].[SystemUserCompany] SUC
      WHERE SUC.SU_ID = SU.SU_ID AND SUC.IC_ID = SU.IC_ID
  );
GO

-- ==================== ลำดับ 5: Dashboard (2000) Global ทุก Role ====================

DECLARE @RoleADM2 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM');
DECLARE @RoleHRU2 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');
DECLARE @RoleQA2  INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'QA');
DECLARE @RoleRCT2 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'RCT');
DECLARE @RoleSGU2 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU');
DECLARE @RoleSGS2 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGS');

IF @RoleADM2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM2 AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM2, 2000, NULL, '', '');
IF @RoleHRU2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU2 AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU2, 2000, NULL, '', '');
IF @RoleQA2  IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA2  AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA2,  2000, NULL, '', '');
IF @RoleRCT2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT2 AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT2, 2000, NULL, '', '');
IF @RoleSGU2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU2 AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGU2, 2000, NULL, '', '');
IF @RoleSGS2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGS2 AND SS_ID = 2000 AND IC_ID IS NULL)
INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGS2, 2000, NULL, '', '');
GO

-- ==================== ลำดับ 6: ตัดสิทธิ์ HRU เหลือ 1000, 1100, 2000 ====================

DECLARE @RoleHRU3 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');
IF @RoleHRU3 IS NOT NULL
  DELETE FROM [dbo].[SystemRoleSystemScreen]
  WHERE SR_ID = @RoleHRU3 AND SS_ID NOT IN (1000, 1100, 2000);
GO

-- ==================== ลำดับ 7: ตัดสิทธิ์ SGS/SGU เหลือแค่ 2000 ====================

DECLARE @RoleSGS3 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGS');
DECLARE @RoleSGU3 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU');
IF @RoleSGS3 IS NOT NULL
  DELETE FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGS3 AND SS_ID <> 2000;
IF @RoleSGU3 IS NOT NULL
  DELETE FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU3 AND SS_ID <> 2000;
GO

-- ==================== ลำดับ 8: QA / RCT / ADM ดู Statistics (3000) ====================

DECLARE @RoleQA3  INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'QA');
DECLARE @RoleRCT3 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'RCT');
DECLARE @RoleADM3 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM');

IF @RoleQA3  IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA3  AND SS_ID = 3000 AND IC_ID IS NULL)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA3,  3000, NULL, '', '');
IF @RoleRCT3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT3 AND SS_ID = 3000 AND IC_ID IS NULL)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT3, 3000, NULL, '', '');
IF @RoleADM3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM3 AND SS_ID = 3000 AND IC_ID IS NULL)
  INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM3, 3000, NULL, '', '');
GO

-- ==================== ลำดับ 9 (ถ้าต้องการ): สร้าง Superadmin ====================

DECLARE @RoleADM4 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM');
IF @RoleADM4 IS NULL BEGIN RAISERROR('Role ADM not found', 16, 1); RETURN; END;

IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemUser] WHERE SU_ID = 9999 OR SU_Username = 'sysadmin')
BEGIN
    SET IDENTITY_INSERT [dbo].[SystemUser] ON;
    INSERT INTO [dbo].[SystemUser] (SU_ID, SU_Code, SU_Name1, SU_Name2, SU_Email, SU_Username, SU_Password, SU_Remarks, SU_Active, SU_LogOn, SU_PinCode, User_Location, IC_ID, SR_ID)
    VALUES (9999, '9999', N'Systemadmin', N'Systemadmin', NULL, 'sysadmin', 'simpleadmin', N'Super Admin', 1, NULL, NULL, NULL, NULL, @RoleADM4);
    SET IDENTITY_INSERT [dbo].[SystemUser] OFF;
END;
GO

-- ==================== ลำดับ 10 (ถ้าต้องการ): User เก่า SR_ID = NULL → SGU ====================

DECLARE @RoleSGU4 INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU');
IF @RoleSGU4 IS NULL BEGIN RAISERROR('Role SGU not found', 16, 1); RETURN; END;

UPDATE SU SET SR_ID = @RoleSGU4
FROM [dbo].[SystemUser] SU
WHERE SU.SR_ID IS NULL
  AND SU.SU_Active = 1
  AND SU.SU_Username <> 'sysadmin'
  AND SU.SU_ID <> 9999;
GO

PRINT 'NEW-DB-FULL-SETUP completed.';
