-- ============================================================
-- STEP 1: ตรวจสอบและเพิ่ม Columns ที่ขาดในตารางเดิม
-- ============================================================
-- รันบน Production Server (192.168.31.36)
-- Database: SmartSecurity
-- ปลอดภัย: ใช้ IF NOT EXISTS ไม่ลบข้อมูลเดิม
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' STEP 1: ตรวจสอบและเพิ่ม Columns ที่ขาด';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1.1 ตาราง InternalCompany - เพิ่ม columns ที่เว็บต้องใช้
-- ============================================================
PRINT '--- ตาราง InternalCompany ---';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_ShortLocalName')
BEGIN
    ALTER TABLE [dbo].[InternalCompany] ADD IC_ShortLocalName NVARCHAR(255) NULL;
    PRINT '  [เพิ่ม] IC_ShortLocalName (ชื่อย่อภาษาไทย)';
END
ELSE PRINT '  [มีแล้ว] IC_ShortLocalName';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_ShortEnglishName')
BEGIN
    ALTER TABLE [dbo].[InternalCompany] ADD IC_ShortEnglishName NVARCHAR(255) NULL;
    PRINT '  [เพิ่ม] IC_ShortEnglishName (ชื่อย่อภาษาอังกฤษ)';
END
ELSE PRINT '  [มีแล้ว] IC_ShortEnglishName';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_LogoPath')
BEGIN
    ALTER TABLE [dbo].[InternalCompany] ADD IC_LogoPath NVARCHAR(500) NULL;
    PRINT '  [เพิ่ม] IC_LogoPath (ที่อยู่ไฟล์โลโก้)';
END
ELSE PRINT '  [มีแล้ว] IC_LogoPath';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'Company_Sequence')
BEGIN
    ALTER TABLE [dbo].[InternalCompany] ADD Company_Sequence INT NULL;
    PRINT '  [เพิ่ม] Company_Sequence (ลำดับการแสดงผล)';
END
ELSE PRINT '  [มีแล้ว] Company_Sequence';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_Remarks')
BEGIN
    ALTER TABLE [dbo].[InternalCompany] ADD IC_Remarks NVARCHAR(MAX) NULL;
    PRINT '  [เพิ่ม] IC_Remarks (หมายเหตุ)';
END
ELSE PRINT '  [มีแล้ว] IC_Remarks';

PRINT '';

-- ============================================================
-- 1.2 ตาราง SystemUser - เพิ่ม columns ที่เว็บต้องใช้
-- ============================================================
PRINT '--- ตาราง SystemUser ---';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_Code')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SU_Code NVARCHAR(50) NULL;
    PRINT '  [เพิ่ม] SU_Code (รหัสพนักงาน)';
END
ELSE PRINT '  [มีแล้ว] SU_Code';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_Name2')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SU_Name2 NVARCHAR(255) NULL;
    PRINT '  [เพิ่ม] SU_Name2 (ชื่อ 2 / นามสกุล)';
END
ELSE PRINT '  [มีแล้ว] SU_Name2';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_PinCode')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SU_PinCode NVARCHAR(50) NULL;
    PRINT '  [เพิ่ม] SU_PinCode (รหัส PIN)';
END
ELSE PRINT '  [มีแล้ว] SU_PinCode';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_Remarks')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SU_Remarks NVARCHAR(MAX) NULL;
    PRINT '  [เพิ่ม] SU_Remarks (หมายเหตุ)';
END
ELSE PRINT '  [มีแล้ว] SU_Remarks';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_LogOn')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SU_LogOn BIT DEFAULT 0;
    PRINT '  [เพิ่ม] SU_LogOn (สถานะล็อกอิน)';
END
ELSE PRINT '  [มีแล้ว] SU_LogOn';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SR_ID')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD SR_ID INT NULL;
    PRINT '  [เพิ่ม] SR_ID (Role ID)';
END
ELSE PRINT '  [มีแล้ว] SR_ID';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'IC_ID')
BEGIN
    ALTER TABLE [dbo].[SystemUser] ADD IC_ID INT NULL;
    PRINT '  [เพิ่ม] IC_ID (Company ID)';
END
ELSE PRINT '  [มีแล้ว] IC_ID';

PRINT '';

-- ============================================================
-- 1.3 ตาราง SystemRoleSystemScreen - เพิ่ม columns สำหรับสิทธิ์
-- ============================================================
PRINT '--- ตาราง SystemRoleSystemScreen ---';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'IC_ID')
BEGIN
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD IC_ID INT NULL;
    PRINT '  [เพิ่ม] IC_ID (กำหนดสิทธิ์เฉพาะบริษัท, NULL = ทุกบริษัท)';
END
ELSE PRINT '  [มีแล้ว] IC_ID';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'SRSS_HiddenFieldIds')
BEGIN
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD SRSS_HiddenFieldIds VARCHAR(MAX) DEFAULT '';
    PRINT '  [เพิ่ม] SRSS_HiddenFieldIds (ฟิลด์ที่ซ่อน)';
END
ELSE PRINT '  [มีแล้ว] SRSS_HiddenFieldIds';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'SRSS_ReadOnlyFieldIds')
BEGIN
    ALTER TABLE [dbo].[SystemRoleSystemScreen] ADD SRSS_ReadOnlyFieldIds VARCHAR(MAX) DEFAULT '';
    PRINT '  [เพิ่ม] SRSS_ReadOnlyFieldIds (ฟิลด์ที่อ่านอย่างเดียว)';
END
ELSE PRINT '  [มีแล้ว] SRSS_ReadOnlyFieldIds';

PRINT '';

-- ============================================================
-- 1.4 ตาราง InternalDepartment - เพิ่ม columns สำหรับ hierarchy
-- ============================================================
PRINT '--- ตาราง InternalDepartment ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'InternalDepartment')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalDepartment' AND COLUMN_NAME = 'ID_Type')
    BEGIN
        ALTER TABLE [dbo].[InternalDepartment] ADD ID_Type NVARCHAR(50) DEFAULT 'department';
        PRINT '  [เพิ่ม] ID_Type (ประเภท: office/branch/department)';
    END
    ELSE PRINT '  [มีแล้ว] ID_Type';

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalDepartment' AND COLUMN_NAME = 'Parent_ID_ID')
    BEGIN
        ALTER TABLE [dbo].[InternalDepartment] ADD Parent_ID_ID INT NULL;
        PRINT '  [เพิ่ม] Parent_ID_ID (แผนกแม่)';
    END
    ELSE PRINT '  [มีแล้ว] Parent_ID_ID';

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InternalDepartment' AND COLUMN_NAME = 'ID_Remarks')
    BEGIN
        ALTER TABLE [dbo].[InternalDepartment] ADD ID_Remarks NVARCHAR(MAX) NULL;
        PRINT '  [เพิ่ม] ID_Remarks (หมายเหตุ)';
    END
    ELSE PRINT '  [มีแล้ว] ID_Remarks';
END
ELSE PRINT '  [ไม่พบ] ตาราง InternalDepartment (ต้องสร้างด้วยตนเอง)';

PRINT '';
PRINT '============================================================';
PRINT ' STEP 1 เสร็จสิ้น';
PRINT ' ขั้นตอนต่อไป: รัน PROD-step2-create-systemusercompany.sql';
PRINT '============================================================';
