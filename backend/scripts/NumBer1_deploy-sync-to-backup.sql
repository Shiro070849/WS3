-- ============================================================
-- DEPLOY SYNC — สคริปต์เดียวพร้อมรันบน DB ฝั่งเทส/backup
-- ============================================================
-- วัตถุประสงค์: เติมโครงสร้างและสิทธิ์ที่ขาดให้ตรงกับฝั่งสมบูรณ์
--   (ตาราง, คอลัมน์, แถว SystemScreen 2000/3000/4000/12005, สิทธิ์ Role, Migrate User-Company)
--
-- วิธีใช้:
--   1. BACKUP DB ฝั่งเทสก่อน
--   2. ใน SSMS เลือก Database เป็น DB ฝั่งเทส (ที่ restore จาก backup)
--   3. รันทั้งไฟล์นี้ (ไม่ต้องแก้ USE)
--   4. ตรวจสอบ Messages / Results แล้วทดสอบ Login + เมนู
-- ============================================================

PRINT '============================================================';
PRINT ' DEPLOY SYNC — เริ่มรันบน DB: ' + DB_NAME();
PRINT '============================================================';
PRINT '';

-- ============================================================
-- STEP 1: เพิ่ม Columns ที่ขาดในตารางหลัก
-- ============================================================
PRINT '--- STEP 1: Columns ที่ขาด ---';

-- InternalCompany
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_ShortLocalName')
    ALTER TABLE [dbo].[InternalCompany] ADD IC_ShortLocalName NVARCHAR(255) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_ShortEnglishName')
    ALTER TABLE [dbo].[InternalCompany] ADD IC_ShortEnglishName NVARCHAR(255) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_LogoPath')
    ALTER TABLE [dbo].[InternalCompany] ADD IC_LogoPath NVARCHAR(500) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'Company_Sequence')
    ALTER TABLE [dbo].[InternalCompany] ADD Company_Sequence INT NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_Remarks')
    ALTER TABLE [dbo].[InternalCompany] ADD IC_Remarks NVARCHAR(MAX) NULL;

-- SystemUser
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_Code')
    ALTER TABLE [dbo].[SystemUser] ADD SU_Code NVARCHAR(50) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_Name2')
    ALTER TABLE [dbo].[SystemUser] ADD SU_Name2 NVARCHAR(255) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_PinCode')
    ALTER TABLE [dbo].[SystemUser] ADD SU_PinCode NVARCHAR(50) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_Remarks')
    ALTER TABLE [dbo].[SystemUser] ADD SU_Remarks NVARCHAR(MAX) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_LogOn')
    ALTER TABLE [dbo].[SystemUser] ADD SU_LogOn BIT DEFAULT 0;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SR_ID')
    ALTER TABLE [dbo].[SystemUser] ADD SR_ID INT NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'IC_ID')
    ALTER TABLE [dbo].[SystemUser] ADD IC_ID INT NULL;

-- SystemRoleSystemScreen
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'IC_ID')
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD IC_ID INT NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'SRSS_HiddenFieldIds')
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD SRSS_HiddenFieldIds VARCHAR(MAX) DEFAULT '';
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'SRSS_ReadOnlyFieldIds')
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD SRSS_ReadOnlyFieldIds VARCHAR(MAX) DEFAULT '';

-- InternalDepartment
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'InternalDepartment')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalDepartment' AND COLUMN_NAME = 'ID_Type')
        ALTER TABLE [dbo].[InternalDepartment] ADD ID_Type NVARCHAR(50) DEFAULT 'department';
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalDepartment' AND COLUMN_NAME = 'Parent_ID_ID')
        ALTER TABLE [dbo].[InternalDepartment] ADD Parent_ID_ID INT NULL;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalDepartment' AND COLUMN_NAME = 'ID_Remarks')
        ALTER TABLE [dbo].[InternalDepartment] ADD ID_Remarks NVARCHAR(MAX) NULL;
END

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'WayIn')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WayIn' AND COLUMN_NAME = 'WI_Sequence')
        ALTER TABLE [dbo].[WayIn] ADD WI_Sequence INT NULL;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WayIn' AND COLUMN_NAME = 'WI_ReprintOn')
        ALTER TABLE [dbo].[WayIn] ADD WI_ReprintOn DATETIME NULL;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WayIn' AND COLUMN_NAME = 'WI_FromCompany')
        ALTER TABLE [dbo].[WayIn] ADD WI_FromCompany NVARCHAR(255) NULL;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WayIn' AND COLUMN_NAME = 'WI_ContactName')
        ALTER TABLE [dbo].[WayIn] ADD WI_ContactName NVARCHAR(255) NULL;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WayIn' AND COLUMN_NAME = 'WI_InternalDivision')
        ALTER TABLE [dbo].[WayIn] ADD WI_InternalDivision NVARCHAR(255) NULL;
END

PRINT '  STEP 1 เสร็จ';
PRINT '';

-- ============================================================
-- STEP 2: สร้างตาราง SystemUserCompany
-- ============================================================
PRINT '--- STEP 2: SystemUserCompany ---';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    CREATE TABLE [dbo].[SystemUserCompany] (
        SUC_ID INT PRIMARY KEY IDENTITY(1,1),
        SU_ID INT NOT NULL,
        IC_ID INT NOT NULL,
        SUC_IsActive BIT DEFAULT 1,
        SUC_CreatedAt DATETIME DEFAULT GETDATE(),
        SUC_CreatedBy INT NULL,
        SUC_UpdatedAt DATETIME NULL,
        SUC_UpdatedBy INT NULL,
        CONSTRAINT UK_SystemUserCompany UNIQUE (SU_ID, IC_ID)
    );
    CREATE INDEX IX_SystemUserCompany_SU_ID ON [dbo].[SystemUserCompany](SU_ID);
    CREATE INDEX IX_SystemUserCompany_IC_ID ON [dbo].[SystemUserCompany](IC_ID);
    CREATE INDEX IX_SystemUserCompany_IsActive ON [dbo].[SystemUserCompany](SUC_IsActive);
    CREATE INDEX IX_SystemUserCompany_SU_ID_IsActive ON [dbo].[SystemUserCompany](SU_ID, SUC_IsActive);
    PRINT '  สร้างตาราง SystemUserCompany';
END
ELSE
    PRINT '  มีอยู่แล้ว';

PRINT '';

-- ============================================================
-- STEP 3: สร้างตาราง InternalCompanyDepartment, ConnectionHistory
-- ============================================================
PRINT '--- STEP 3: InternalCompanyDepartment, ConnectionHistory ---';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'InternalCompanyDepartment')
BEGIN
    CREATE TABLE [dbo].[InternalCompanyDepartment] (
        ICD_ID INT PRIMARY KEY IDENTITY(1,1),
        IC_ID INT NOT NULL,
        ID_ID INT NOT NULL,
        ICD_IsActive BIT DEFAULT 1
    );
    PRINT '  สร้าง InternalCompanyDepartment';
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ConnectionHistory')
BEGIN
    CREATE TABLE [dbo].[ConnectionHistory] (
        CH_ID INT PRIMARY KEY IDENTITY(1,1),
        SU_ID INT NOT NULL,
        CH_EventType NVARCHAR(50) NULL,
        CH_IPAddress NVARCHAR(15) NULL,
        CH_RecordedOn DATETIME DEFAULT GETDATE()
    );
    PRINT '  สร้าง ConnectionHistory';
END

PRINT '';

-- ============================================================
-- STEP 4: สร้างตาราง SystemSettings
-- ============================================================
PRINT '--- STEP 4: SystemSettings ---';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemSettings')
BEGIN
    CREATE TABLE [dbo].[SystemSettings] (
        SS_ID INT PRIMARY KEY IDENTITY(1,1),
        SS_Key NVARCHAR(255) NOT NULL,
        SS_Value NVARCHAR(MAX) NULL,
        SS_Type NVARCHAR(50) DEFAULT 'text',
        SS_Category NVARCHAR(50) NULL,
        SS_UpdatedAt DATETIME NULL,
        SS_UpdatedBy INT NULL,
        IC_ID INT NULL
    );
    PRINT '  สร้าง SystemSettings';
END
ELSE
    PRINT '  มีอยู่แล้ว';

PRINT '';

-- ============================================================
-- STEP 5: สร้างตาราง GuardLocation
-- ============================================================
PRINT '--- STEP 5: GuardLocation ---';

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GuardLocation]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[GuardLocation] (
        GL_ID           INT IDENTITY(1,1) PRIMARY KEY,
        GL_Code         NVARCHAR(255) NOT NULL UNIQUE,
        GL_Name         NVARCHAR(100) NOT NULL,
        GL_Description  NVARCHAR(255) NULL,
        GL_Active       BIT NOT NULL DEFAULT 1,
        GL_CreatedAt    DATETIME DEFAULT GETDATE(),
        GL_CreatedBy    INT NULL,
        GL_UpdatedAt    DATETIME NULL,
        GL_UpdatedBy    INT NULL
    );
    CREATE INDEX IX_GuardLocation_Active ON [dbo].[GuardLocation](GL_Active);
    CREATE INDEX IX_GuardLocation_Code ON [dbo].[GuardLocation](GL_Code);
    PRINT '  สร้าง GuardLocation';
END
ELSE
    PRINT '  มีอยู่แล้ว';

PRINT '';

-- ============================================================
-- STEP 6: เพิ่มแถว SystemScreen (2000, 3000, 4000, 12005)
-- ============================================================
PRINT '--- STEP 6: SystemScreen แถวที่ขาด ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemScreen')
BEGIN
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
    PRINT '  เพิ่มแถว SystemScreen 2000, 3000, 4000, 12005 (ถ้าขาด)';
END

PRINT '';

-- แยก batch เพื่อให้ STEP 7 รันหลังคอลัมน์ IC_ID ถูกเพิ่มใน SystemRoleSystemScreen แล้ว
-- (ไม่ฮาดข้อมูลบริษัท — อิง IC_ID 5 เป็นหลัก)
GO

-- ============================================================
-- STEP 7: ตั้งค่า Role Permissions (ตาม baseline, อิง IC_ID 5)
-- ============================================================
PRINT '--- STEP 7: สิทธิ์ Role–Screen ---';

-- เพิ่ม Role Emp (Employees) ถ้ายังไม่มี — สิทธิ์เหมือน QA/RCT (Dashboard, Reports, Visit, Statistics ไม่มี Settings)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRole] WHERE SR_Code = 'Emp')
BEGIN
    INSERT INTO [dbo].[SystemRole] (SR_Code, SR_Name, SR_Active)
    VALUES ('Emp', N'Employees', 1);
    PRINT '  + เพิ่ม Role: Emp (Employees)';
END

DECLARE @RoleADM INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM');
DECLARE @RoleHRU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');
DECLARE @RoleQA INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'QA');
DECLARE @RoleRCT INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'RCT');
DECLARE @RoleSGU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU');
DECLARE @RoleSGS INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGS');
DECLARE @RoleEmp INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'Emp');

-- ADM: 2000, 3000, 1000, 1100, 10000 (Global) + 2000 IC_ID 5
IF @RoleADM IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 2000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 2000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 3000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 3000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 1000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 1000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 1100 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 1100, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 10000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 10000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleADM AND SS_ID = 2000 AND IC_ID = 5)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleADM, 2000, 5, '', '');
END

-- HRU: 1000, 1100, 1101, 2000 (Global)
IF @RoleHRU IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 2000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 2000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 1000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 1000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 3000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 3000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 1100 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 1100, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 1101 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 1101, NULL, '', '');
END

-- QA: 1000, 1100, 2000, 3000 (Global)
IF @RoleQA IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 2000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA, 2000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 1000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA, 1000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 3000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA, 3000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleQA AND SS_ID = 1100 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleQA, 1100, NULL, '', '');
END

-- RCT: 1000, 1100, 2000, 3000 (Global)
IF @RoleRCT IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 2000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT, 2000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 1000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT, 1000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 3000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT, 3000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleRCT AND SS_ID = 1100 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleRCT, 1100, NULL, '', '');
END

-- Emp (Employees): เหมือน QA/RCT — 1000, 1100, 2000, 3000 (Global), ไม่มี Settings
IF @RoleEmp IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleEmp AND SS_ID = 2000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleEmp, 2000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleEmp AND SS_ID = 1000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleEmp, 1000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleEmp AND SS_ID = 3000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleEmp, 3000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleEmp AND SS_ID = 1100 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleEmp, 1100, NULL, '', '');
END

-- SGS: 2000 (Global)
IF @RoleSGS IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGS AND SS_ID = 2000 AND IC_ID IS NULL)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGS, 2000, NULL, '', '');

-- SGU: 2000 (Global) + 2000 IC_ID 1,2,3,6,7
IF @RoleSGU IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGU, 2000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000 AND IC_ID = 1)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGU, 2000, 1, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000 AND IC_ID = 2)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGU, 2000, 2, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000 AND IC_ID = 3)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGU, 2000, 3, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000 AND IC_ID = 6)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGU, 2000, 6, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000 AND IC_ID = 7)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGU, 2000, 7, '', '');
END

PRINT '  STEP 7 เสร็จ';
PRINT '';

-- ============================================================
-- STEP 8: Migrate SystemUser.IC_ID → SystemUserCompany
-- ============================================================
PRINT '--- STEP 8: Migrate User-Company ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
   AND EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'IC_ID')
BEGIN
    DECLARE @UsersToMigrate INT;
    SELECT @UsersToMigrate = COUNT(*)
    FROM [dbo].[SystemUser] SU
    INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
    WHERE SU.IC_ID IS NOT NULL
        AND SU.SU_Active = 1
        AND IC.IC_IsActive = 1
        AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemUserCompany] SUC WHERE SUC.SU_ID = SU.SU_ID AND SUC.IC_ID = SU.IC_ID);

    PRINT '  Users ที่ต้อง migrate: ' + CAST(ISNULL(@UsersToMigrate, 0) AS VARCHAR);

    IF @UsersToMigrate > 0
    BEGIN
        BEGIN TRY
            INSERT INTO [dbo].[SystemUserCompany] (SU_ID, IC_ID, SUC_IsActive, SUC_CreatedAt)
            SELECT SU.SU_ID, SU.IC_ID, 1, GETDATE()
            FROM [dbo].[SystemUser] SU
            INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
            WHERE SU.IC_ID IS NOT NULL AND SU.SU_Active = 1 AND IC.IC_IsActive = 1
              AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemUserCompany] SUC WHERE SUC.SU_ID = SU.SU_ID AND SUC.IC_ID = SU.IC_ID);
            PRINT '  Migrate สำเร็จ: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' records';
        END TRY
        BEGIN CATCH
            PRINT '  ERROR: ' + ERROR_MESSAGE();
        END CATCH
    END
    ELSE
        PRINT '  ไม่มี User ที่ต้อง migrate';
END
ELSE
    PRINT '  ข้าม (ไม่มีตารางหรือคอลัมน์ IC_ID)';

PRINT '';

-- ============================================================
-- STEP 9: สรุป
-- ============================================================
PRINT '============================================================';
PRINT ' DEPLOY SYNC เสร็จ — DB: ' + DB_NAME();
PRINT '============================================================';
PRINT ' ตรวจสอบ: รัน check-backup-server-gaps.sql อีกครั้งควรเหลือสิ่งที่ขาดน้อยลง';
PRINT ' ทดสอบ: Login + Dashboard, Reports, Statistics, Settings';
PRINT '============================================================';
