-- ============================================================
-- PRODUCTION DATABASE SYNC SCRIPT
-- ============================================================
-- วัตถุประสงค์: ทำให้ DB ฝั่ง Production มี Schema เหมือนฝั่ง Test
-- วันที่: 2026-01-28
--
-- คำเตือน:
--   - BACKUP DATABASE ก่อนรัน Script นี้เสมอ
--   - Script นี้ไม่ลบข้อมูลเดิม (เพิ่มเฉพาะที่ขาด)
--   - รัน Script ทั้งหมดตามลำดับ Step 1 → Step 7
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' PRODUCTION DATABASE SYNC SCRIPT';
PRINT ' เริ่มต้น Sync Database ให้ตรงกับฝั่ง Test';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- STEP 1: ตรวจสอบและเพิ่ม Columns ที่ขาดในตารางหลัก
-- ============================================================
PRINT '============================================================';
PRINT ' STEP 1: ตรวจสอบ Columns ที่ขาดในตารางหลัก';
PRINT '============================================================';
PRINT '';

-- 1.1 InternalCompany: เพิ่ม columns ที่อาจขาด
-- IC_ShortLocalName
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_ShortLocalName')
BEGIN
    ALTER TABLE [dbo].[InternalCompany] ADD IC_ShortLocalName NVARCHAR(255) NULL;
    PRINT '  + เพิ่ม Column: InternalCompany.IC_ShortLocalName';
END
ELSE PRINT '  OK: InternalCompany.IC_ShortLocalName มีอยู่แล้ว';

-- IC_ShortEnglishName
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_ShortEnglishName')
BEGIN
    ALTER TABLE [dbo].[InternalCompany] ADD IC_ShortEnglishName NVARCHAR(255) NULL;
    PRINT '  + เพิ่ม Column: InternalCompany.IC_ShortEnglishName';
END
ELSE PRINT '  OK: InternalCompany.IC_ShortEnglishName มีอยู่แล้ว';

-- IC_LogoPath
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_LogoPath')
BEGIN
    ALTER TABLE [dbo].[InternalCompany] ADD IC_LogoPath NVARCHAR(500) NULL;
    PRINT '  + เพิ่ม Column: InternalCompany.IC_LogoPath';
END
ELSE PRINT '  OK: InternalCompany.IC_LogoPath มีอยู่แล้ว';

-- Company_Sequence
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'Company_Sequence')
BEGIN
    ALTER TABLE [dbo].[InternalCompany] ADD Company_Sequence INT NULL;
    PRINT '  + เพิ่ม Column: InternalCompany.Company_Sequence';
END
ELSE PRINT '  OK: InternalCompany.Company_Sequence มีอยู่แล้ว';

-- IC_Remarks
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_Remarks')
BEGIN
    ALTER TABLE [dbo].[InternalCompany] ADD IC_Remarks NVARCHAR(MAX) NULL;
    PRINT '  + เพิ่ม Column: InternalCompany.IC_Remarks';
END
ELSE PRINT '  OK: InternalCompany.IC_Remarks มีอยู่แล้ว';

PRINT '';

-- 1.2 SystemUser: เพิ่ม columns ที่อาจขาด
-- SU_Code
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_Code')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SU_Code NVARCHAR(50) NULL;
    PRINT '  + เพิ่ม Column: SystemUser.SU_Code';
END
ELSE PRINT '  OK: SystemUser.SU_Code มีอยู่แล้ว';

-- SU_Name2
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_Name2')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SU_Name2 NVARCHAR(255) NULL;
    PRINT '  + เพิ่ม Column: SystemUser.SU_Name2';
END
ELSE PRINT '  OK: SystemUser.SU_Name2 มีอยู่แล้ว';

-- SU_PinCode
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_PinCode')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SU_PinCode NVARCHAR(50) NULL;
    PRINT '  + เพิ่ม Column: SystemUser.SU_PinCode';
END
ELSE PRINT '  OK: SystemUser.SU_PinCode มีอยู่แล้ว';

-- SU_Remarks
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_Remarks')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SU_Remarks NVARCHAR(MAX) NULL;
    PRINT '  + เพิ่ม Column: SystemUser.SU_Remarks';
END
ELSE PRINT '  OK: SystemUser.SU_Remarks มีอยู่แล้ว';

-- SU_LogOn
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_LogOn')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SU_LogOn BIT DEFAULT 0;
    PRINT '  + เพิ่ม Column: SystemUser.SU_LogOn';
END
ELSE PRINT '  OK: SystemUser.SU_LogOn มีอยู่แล้ว';

-- SR_ID (ใน SystemUser - สำหรับ backward compat)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SR_ID')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SR_ID INT NULL;
    PRINT '  + เพิ่ม Column: SystemUser.SR_ID';
END
ELSE PRINT '  OK: SystemUser.SR_ID มีอยู่แล้ว';

-- IC_ID (ใน SystemUser)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'IC_ID')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD IC_ID INT NULL;
    PRINT '  + เพิ่ม Column: SystemUser.IC_ID';
END
ELSE PRINT '  OK: SystemUser.IC_ID มีอยู่แล้ว';

PRINT '';

-- 1.3 SystemRoleSystemScreen: เพิ่ม columns ที่อาจขาด
-- IC_ID
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'IC_ID')
BEGIN
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD IC_ID INT NULL;
    PRINT '  + เพิ่ม Column: SystemRoleSystemScreen.IC_ID';
END
ELSE PRINT '  OK: SystemRoleSystemScreen.IC_ID มีอยู่แล้ว';

-- SRSS_HiddenFieldIds
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'SRSS_HiddenFieldIds')
BEGIN
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD SRSS_HiddenFieldIds VARCHAR(MAX) DEFAULT '';
    PRINT '  + เพิ่ม Column: SystemRoleSystemScreen.SRSS_HiddenFieldIds';
END
ELSE PRINT '  OK: SystemRoleSystemScreen.SRSS_HiddenFieldIds มีอยู่แล้ว';

-- SRSS_ReadOnlyFieldIds
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'SRSS_ReadOnlyFieldIds')
BEGIN
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD SRSS_ReadOnlyFieldIds VARCHAR(MAX) DEFAULT '';
    PRINT '  + เพิ่ม Column: SystemRoleSystemScreen.SRSS_ReadOnlyFieldIds';
END
ELSE PRINT '  OK: SystemRoleSystemScreen.SRSS_ReadOnlyFieldIds มีอยู่แล้ว';

-- SRSS_ID (Primary Key - ตรวจสอบว่ามีหรือไม่)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'SRSS_ID')
BEGIN
    -- ถ้าไม่มี PK column ต้องเพิ่ม (แต่ต้องระวังถ้ามี PK อื่นอยู่แล้ว)
    PRINT '  WARNING: SystemRoleSystemScreen.SRSS_ID ไม่มี (ตรวจสอบ PK ของตารางด้วยตนเอง)';
END
ELSE PRINT '  OK: SystemRoleSystemScreen.SRSS_ID มีอยู่แล้ว';

PRINT '';

-- 1.4 InternalDepartment: เพิ่ม columns ที่อาจขาด
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'InternalDepartment')
BEGIN
    -- ID_Type
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalDepartment' AND COLUMN_NAME = 'ID_Type')
    BEGIN
        ALTER TABLE [dbo].[InternalDepartment] ADD ID_Type NVARCHAR(50) DEFAULT 'department';
        PRINT '  + เพิ่ม Column: InternalDepartment.ID_Type';
    END
    ELSE PRINT '  OK: InternalDepartment.ID_Type มีอยู่แล้ว';

    -- Parent_ID_ID
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalDepartment' AND COLUMN_NAME = 'Parent_ID_ID')
    BEGIN
        ALTER TABLE [dbo].[InternalDepartment] ADD Parent_ID_ID INT NULL;
        PRINT '  + เพิ่ม Column: InternalDepartment.Parent_ID_ID';
    END
    ELSE PRINT '  OK: InternalDepartment.Parent_ID_ID มีอยู่แล้ว';

    -- ID_Remarks
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalDepartment' AND COLUMN_NAME = 'ID_Remarks')
    BEGIN
        ALTER TABLE [dbo].[InternalDepartment] ADD ID_Remarks NVARCHAR(MAX) NULL;
        PRINT '  + เพิ่ม Column: InternalDepartment.ID_Remarks';
    END
    ELSE PRINT '  OK: InternalDepartment.ID_Remarks มีอยู่แล้ว';
END
ELSE PRINT '  WARNING: ตาราง InternalDepartment ไม่มี (อาจต้องสร้างด้วยตนเอง)';

PRINT '';

-- ============================================================
-- STEP 2: สร้างตาราง SystemUserCompany (ถ้ายังไม่มี)
-- ============================================================
PRINT '============================================================';
PRINT ' STEP 2: สร้างตาราง SystemUserCompany';
PRINT '============================================================';
PRINT '';

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
    PRINT '  + สร้างตาราง SystemUserCompany สำเร็จ';

    -- สร้าง Indexes
    CREATE INDEX IX_SystemUserCompany_SU_ID ON [dbo].[SystemUserCompany](SU_ID);
    PRINT '  + สร้าง Index: IX_SystemUserCompany_SU_ID';

    CREATE INDEX IX_SystemUserCompany_IC_ID ON [dbo].[SystemUserCompany](IC_ID);
    PRINT '  + สร้าง Index: IX_SystemUserCompany_IC_ID';

    CREATE INDEX IX_SystemUserCompany_IsActive ON [dbo].[SystemUserCompany](SUC_IsActive);
    PRINT '  + สร้าง Index: IX_SystemUserCompany_IsActive';

    CREATE INDEX IX_SystemUserCompany_SU_ID_IsActive ON [dbo].[SystemUserCompany](SU_ID, SUC_IsActive);
    PRINT '  + สร้าง Index: IX_SystemUserCompany_SU_ID_IsActive';
END
ELSE
BEGIN
    PRINT '  OK: ตาราง SystemUserCompany มีอยู่แล้ว';

    -- ตรวจสอบ Indexes ที่อาจขาด
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_SU_ID' AND object_id = OBJECT_ID('SystemUserCompany'))
    BEGIN
        CREATE INDEX IX_SystemUserCompany_SU_ID ON [dbo].[SystemUserCompany](SU_ID);
        PRINT '  + เพิ่ม Index: IX_SystemUserCompany_SU_ID';
    END

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_IC_ID' AND object_id = OBJECT_ID('SystemUserCompany'))
    BEGIN
        CREATE INDEX IX_SystemUserCompany_IC_ID ON [dbo].[SystemUserCompany](IC_ID);
        PRINT '  + เพิ่ม Index: IX_SystemUserCompany_IC_ID';
    END

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_IsActive' AND object_id = OBJECT_ID('SystemUserCompany'))
    BEGIN
        CREATE INDEX IX_SystemUserCompany_IsActive ON [dbo].[SystemUserCompany](SUC_IsActive);
        PRINT '  + เพิ่ม Index: IX_SystemUserCompany_IsActive';
    END

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SystemUserCompany_SU_ID_IsActive' AND object_id = OBJECT_ID('SystemUserCompany'))
    BEGIN
        CREATE INDEX IX_SystemUserCompany_SU_ID_IsActive ON [dbo].[SystemUserCompany](SU_ID, SUC_IsActive);
        PRINT '  + เพิ่ม Index: IX_SystemUserCompany_SU_ID_IsActive';
    END
END

PRINT '';

-- ============================================================
-- STEP 3: สร้างตาราง InternalCompanyDepartment (ถ้ายังไม่มี)
-- ============================================================
PRINT '============================================================';
PRINT ' STEP 3: สร้างตาราง InternalCompanyDepartment';
PRINT '============================================================';
PRINT '';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'InternalCompanyDepartment')
BEGIN
    CREATE TABLE [dbo].[InternalCompanyDepartment] (
        ICD_ID INT PRIMARY KEY IDENTITY(1,1),
        IC_ID INT NOT NULL,
        ID_ID INT NOT NULL,
        ICD_IsActive BIT DEFAULT 1
    );
    PRINT '  + สร้างตาราง InternalCompanyDepartment สำเร็จ';
END
ELSE
BEGIN
    PRINT '  OK: ตาราง InternalCompanyDepartment มีอยู่แล้ว';

    -- ตรวจสอบ column ICD_IsActive
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompanyDepartment' AND COLUMN_NAME = 'ICD_IsActive')
    BEGIN
        ALTER TABLE [dbo].[InternalCompanyDepartment] ADD ICD_IsActive BIT DEFAULT 1;
        PRINT '  + เพิ่ม Column: InternalCompanyDepartment.ICD_IsActive';
    END
END

PRINT '';

-- ============================================================
-- STEP 4: สร้างตาราง ConnectionHistory (ถ้ายังไม่มี)
-- ============================================================
PRINT '============================================================';
PRINT ' STEP 4: สร้างตาราง ConnectionHistory';
PRINT '============================================================';
PRINT '';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ConnectionHistory')
BEGIN
    CREATE TABLE [dbo].[ConnectionHistory] (
        CH_ID INT PRIMARY KEY IDENTITY(1,1),
        SU_ID INT NOT NULL,
        CH_EventType NVARCHAR(50) NULL,
        CH_IPAddress NVARCHAR(15) NULL,
        CH_RecordedOn DATETIME DEFAULT GETDATE()
    );
    PRINT '  + สร้างตาราง ConnectionHistory สำเร็จ';
END
ELSE
BEGIN
    PRINT '  OK: ตาราง ConnectionHistory มีอยู่แล้ว';

    -- ตรวจสอบ columns ที่อาจขาด
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ConnectionHistory' AND COLUMN_NAME = 'CH_EventType')
    BEGIN
        ALTER TABLE [dbo].[ConnectionHistory] ADD CH_EventType NVARCHAR(50) NULL;
        PRINT '  + เพิ่ม Column: ConnectionHistory.CH_EventType';
    END

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ConnectionHistory' AND COLUMN_NAME = 'CH_IPAddress')
    BEGIN
        ALTER TABLE [dbo].[ConnectionHistory] ADD CH_IPAddress NVARCHAR(15) NULL;
        PRINT '  + เพิ่ม Column: ConnectionHistory.CH_IPAddress';
    END
END

PRINT '';

-- ============================================================
-- STEP 5: สร้างตาราง SystemSettings (ถ้ายังไม่มี)
-- ============================================================
PRINT '============================================================';
PRINT ' STEP 5: สร้างตาราง SystemSettings';
PRINT '============================================================';
PRINT '';

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
    PRINT '  + สร้างตาราง SystemSettings สำเร็จ';
END
ELSE
BEGIN
    PRINT '  OK: ตาราง SystemSettings มีอยู่แล้ว';

    -- ตรวจสอบ columns ที่อาจขาด
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemSettings' AND COLUMN_NAME = 'SS_Type')
    BEGIN
        ALTER TABLE [dbo].[SystemSettings] ADD SS_Type NVARCHAR(50) DEFAULT 'text';
        PRINT '  + เพิ่ม Column: SystemSettings.SS_Type';
    END

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemSettings' AND COLUMN_NAME = 'SS_Category')
    BEGIN
        ALTER TABLE [dbo].[SystemSettings] ADD SS_Category NVARCHAR(50) NULL;
        PRINT '  + เพิ่ม Column: SystemSettings.SS_Category';
    END

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemSettings' AND COLUMN_NAME = 'SS_UpdatedAt')
    BEGIN
        ALTER TABLE [dbo].[SystemSettings] ADD SS_UpdatedAt DATETIME NULL;
        PRINT '  + เพิ่ม Column: SystemSettings.SS_UpdatedAt';
    END

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemSettings' AND COLUMN_NAME = 'SS_UpdatedBy')
    BEGIN
        ALTER TABLE [dbo].[SystemSettings] ADD SS_UpdatedBy INT NULL;
        PRINT '  + เพิ่ม Column: SystemSettings.SS_UpdatedBy';
    END

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemSettings' AND COLUMN_NAME = 'IC_ID')
    BEGIN
        ALTER TABLE [dbo].[SystemSettings] ADD IC_ID INT NULL;
        PRINT '  + เพิ่ม Column: SystemSettings.IC_ID';
    END
END

PRINT '';

-- ============================================================
-- STEP 6: ตั้งค่า Role Permissions (เพิ่มเฉพาะที่ยังไม่มี)
-- ============================================================
PRINT '============================================================';
PRINT ' STEP 6: ตั้งค่า Role Permissions';
PRINT '============================================================';
PRINT '';

-- ดึง Role IDs
DECLARE @RoleADM INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM');
DECLARE @RoleHRU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU');
DECLARE @RoleQA INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'QA');
DECLARE @RoleRCT INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'RCT');
DECLARE @RoleSGU INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU');
DECLARE @RoleSGS INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'SGS');

-- ตรวจสอบว่ามี Roles ที่ต้องการหรือไม่
IF @RoleADM IS NULL PRINT '  WARNING: Role ADM ไม่พบ';
IF @RoleHRU IS NULL PRINT '  WARNING: Role HRU ไม่พบ';
IF @RoleQA IS NULL PRINT '  WARNING: Role QA ไม่พบ';
IF @RoleRCT IS NULL PRINT '  WARNING: Role RCT ไม่พบ';
IF @RoleSGU IS NULL PRINT '  WARNING: Role SGU ไม่พบ';
IF @RoleSGS IS NULL PRINT '  WARNING: Role SGS ไม่พบ';

-- Screen IDs:
-- 1     = Systems
-- 1000  = Reports
-- 1100  = Visit (รายการ การเข้า-ออก)
-- 1101  = Data Daily
-- 2000  = Dashboard
-- 3000  = Statistics
-- 4000  = Reprint
-- 10000 = Settings

-- ADM: Dashboard, Statistics, Reports, Visit, Settings
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
    PRINT '  OK: เพิ่ม Permissions สำหรับ ADM (Dashboard, Statistics, Reports, Visit, Settings)';
END

-- HRU: Dashboard, Reports, Statistics
IF @RoleHRU IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 2000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 2000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 1000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 1000, NULL, '', '');
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleHRU AND SS_ID = 3000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleHRU, 3000, NULL, '', '');
    PRINT '  OK: เพิ่ม Permissions สำหรับ HRU (Dashboard, Reports, Statistics)';
END

-- QA: Dashboard, Reports, Statistics, Visit
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
    PRINT '  OK: เพิ่ม Permissions สำหรับ QA (Dashboard, Reports, Statistics, Visit)';
END

-- RCT: Dashboard, Reports, Statistics, Visit
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
    PRINT '  OK: เพิ่ม Permissions สำหรับ RCT (Dashboard, Reports, Statistics, Visit)';
END

-- SGU: Dashboard
IF @RoleSGU IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGU AND SS_ID = 2000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGU, 2000, NULL, '', '');
    PRINT '  OK: เพิ่ม Permissions สำหรับ SGU (Dashboard)';
END

-- SGS: Dashboard
IF @RoleSGS IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleSGS AND SS_ID = 2000 AND IC_ID IS NULL)
        INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleSGS, 2000, NULL, '', '');
    PRINT '  OK: เพิ่ม Permissions สำหรับ SGS (Dashboard)';
END

PRINT '';

-- ============================================================
-- STEP 7: Migrate ข้อมูลจาก SystemUser.IC_ID → SystemUserCompany
-- ============================================================
PRINT '============================================================';
PRINT ' STEP 7: Migrate ข้อมูล User-Company';
PRINT '============================================================';
PRINT '';

-- ตรวจสอบว่ามีข้อมูลที่ต้อง migrate หรือไม่
DECLARE @UsersToMigrate INT;
SELECT @UsersToMigrate = COUNT(*)
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL
    AND SU.SU_Active = 1
    AND IC.IC_IsActive = 1
    AND NOT EXISTS (
        SELECT 1 FROM [dbo].[SystemUserCompany] SUC
        WHERE SUC.SU_ID = SU.SU_ID AND SUC.IC_ID = SU.IC_ID
    );

PRINT '  Users ที่ต้อง migrate: ' + CAST(@UsersToMigrate AS VARCHAR);

IF @UsersToMigrate > 0
BEGIN
    BEGIN TRY
        INSERT INTO [dbo].[SystemUserCompany] (SU_ID, IC_ID, SUC_IsActive, SUC_CreatedAt)
        SELECT
            SU.SU_ID,
            SU.IC_ID,
            1,
            GETDATE()
        FROM [dbo].[SystemUser] SU
        INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
        WHERE SU.IC_ID IS NOT NULL
            AND SU.SU_Active = 1
            AND IC.IC_IsActive = 1
            AND NOT EXISTS (
                SELECT 1 FROM [dbo].[SystemUserCompany] SUC
                WHERE SUC.SU_ID = SU.SU_ID AND SUC.IC_ID = SU.IC_ID
            );

        DECLARE @MigratedCount INT = @@ROWCOUNT;
        PRINT '  + Migrate สำเร็จ: ' + CAST(@MigratedCount AS VARCHAR) + ' records';
    END TRY
    BEGIN CATCH
        PRINT '  ERROR: ' + ERROR_MESSAGE();
    END CATCH
END
ELSE
BEGIN
    PRINT '  OK: ไม่มี Users ที่ต้อง migrate (ข้อมูลครบแล้ว หรือยังไม่มี User ที่มี IC_ID)';
END

PRINT '';

-- ============================================================
-- STEP 8: ตรวจสอบผลลัพธ์สุดท้าย
-- ============================================================
PRINT '============================================================';
PRINT ' STEP 8: สรุปผลลัพธ์';
PRINT '============================================================';
PRINT '';

-- ตรวจสอบตารางที่สำคัญ
PRINT '  --- ตารางที่สำคัญ ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUser')
    PRINT '  [OK] SystemUser';
ELSE PRINT '  [MISSING] SystemUser';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemRole')
    PRINT '  [OK] SystemRole';
ELSE PRINT '  [MISSING] SystemRole';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemScreen')
    PRINT '  [OK] SystemScreen';
ELSE PRINT '  [MISSING] SystemScreen';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserSystemRole')
    PRINT '  [OK] SystemUserSystemRole';
ELSE PRINT '  [MISSING] SystemUserSystemRole';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemRoleSystemScreen')
    PRINT '  [OK] SystemRoleSystemScreen';
ELSE PRINT '  [MISSING] SystemRoleSystemScreen';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
    PRINT '  [OK] SystemUserCompany';
ELSE PRINT '  [MISSING] SystemUserCompany';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'InternalCompany')
    PRINT '  [OK] InternalCompany';
ELSE PRINT '  [MISSING] InternalCompany';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'InternalDepartment')
    PRINT '  [OK] InternalDepartment';
ELSE PRINT '  [MISSING] InternalDepartment';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'InternalCompanyDepartment')
    PRINT '  [OK] InternalCompanyDepartment';
ELSE PRINT '  [MISSING] InternalCompanyDepartment';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ConnectionHistory')
    PRINT '  [OK] ConnectionHistory';
ELSE PRINT '  [MISSING] ConnectionHistory';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemSettings')
    PRINT '  [OK] SystemSettings';
ELSE PRINT '  [MISSING] SystemSettings';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'VisitType')
    PRINT '  [OK] VisitType';
ELSE PRINT '  [MISSING] VisitType';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'WayIn')
    PRINT '  [OK] WayIn';
ELSE PRINT '  [MISSING] WayIn';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'WayOut')
    PRINT '  [OK] WayOut';
ELSE PRINT '  [MISSING] WayOut';

PRINT '';

-- ตรวจสอบ Role Permissions
PRINT '  --- Role Permissions ---';
SELECT
    sr.SR_Code AS [Role],
    COUNT(DISTINCT srss.SS_ID) AS [Permission Count]
FROM [dbo].[SystemRole] sr
LEFT JOIN [dbo].[SystemRoleSystemScreen] srss ON sr.SR_ID = srss.SR_ID
WHERE sr.SR_Active = 1
GROUP BY sr.SR_Code
ORDER BY sr.SR_Code;

-- ตรวจสอบ SystemUserCompany
PRINT '';
PRINT '  --- SystemUserCompany ---';
SELECT
    COUNT(*) AS [Total Records],
    COUNT(DISTINCT SU_ID) AS [Unique Users],
    COUNT(DISTINCT IC_ID) AS [Unique Companies]
FROM [dbo].[SystemUserCompany]
WHERE SUC_IsActive = 1;

PRINT '';
PRINT '============================================================';
PRINT ' Sync เสร็จสมบูรณ์!';
PRINT '============================================================';
PRINT '';
PRINT ' ถ้ามีตารางที่ [MISSING] → ต้องสร้างด้วยตนเอง';
PRINT ' (ตารางหลักเช่น SystemUser, SystemRole, SystemScreen,';
PRINT '  InternalCompany, WayIn, WayOut ควรมีอยู่แล้วใน DB เดิม)';
PRINT '';
PRINT ' ขั้นตอนต่อไป:';
PRINT '   1. ตรวจสอบว่า Backend server connect ได้';
PRINT '   2. ทดสอบ Login';
PRINT '   3. ทดสอบ Dashboard, Reports, Settings';
