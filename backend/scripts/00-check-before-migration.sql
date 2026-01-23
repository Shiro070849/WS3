-- ============================================================
-- ตรวจสอบความพร้อมสำหรับ Migration
-- ============================================================
-- ใช้สำหรับตรวจสอบว่าพร้อมสำหรับ Migration หรือไม่
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' ตรวจสอบความพร้อมสำหรับ Migration';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ตรวจสอบว่ามีตาราง SystemUserCompany หรือไม่
-- ============================================================
PRINT ' 1. ตรวจสอบตาราง SystemUserCompany:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    PRINT ' ตาราง SystemUserCompany มีอยู่แล้ว';
    PRINT '';
    PRINT 'WARNING: คำเตือน: ถ้ามีตารางอยู่แล้ว ต้องตรวจสอบว่า:';
    PRINT '   1. โครงสร้างถูกต้องหรือไม่';
    PRINT '   2. มีข้อมูลอยู่แล้วหรือไม่';
    PRINT '   3. ข้อมูลสอดคล้องกับ SystemUser.IC_ID หรือไม่';
END
ELSE
BEGIN
    PRINT 'ERROR: ไม่พบตาราง SystemUserCompany';
    PRINT ' พร้อมสร้างตารางใหม่';
END

PRINT '';

-- ============================================================
-- 2. ตรวจสอบ Foreign Key Constraints ที่อาจขัดขวาง Migration
-- ============================================================
PRINT ' 2. ตรวจสอบ Foreign Key Constraints:';
PRINT '------------------------------------------------------------';

DECLARE @HasFK_IC_ID BIT = 0;
DECLARE @HasFK_SR_ID BIT = 0;

-- ตรวจสอบ FK ของ IC_ID
IF EXISTS (
    SELECT 1 
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fc ON fk.object_id = fc.constraint_object_id
    WHERE OBJECT_NAME(fk.parent_object_id) = 'SystemUser'
        AND COL_NAME(fc.parent_object_id, fc.parent_column_id) = 'IC_ID'
)
BEGIN
    SET @HasFK_IC_ID = 1;
    PRINT 'WARNING: SystemUser.IC_ID มี Foreign Key Constraint';
    PRINT '   → ต้องระวังตอน Migration';
END
ELSE
BEGIN
    PRINT ' SystemUser.IC_ID ไม่มี Foreign Key Constraint';
    PRINT '   → Migration ง่ายขึ้น';
END

-- ตรวจสอบ FK ของ SR_ID
IF EXISTS (
    SELECT 1 
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fc ON fk.object_id = fc.constraint_object_id
    WHERE OBJECT_NAME(fk.parent_object_id) = 'SystemUser'
        AND COL_NAME(fc.parent_object_id, fc.parent_column_id) = 'SR_ID'
)
BEGIN
    SET @HasFK_SR_ID = 1;
    PRINT 'WARNING: SystemUser.SR_ID มี Foreign Key Constraint';
END
ELSE
BEGIN
    PRINT ' SystemUser.SR_ID ไม่มี Foreign Key Constraint';
END

PRINT '';

-- ============================================================
-- 3. ตรวจสอบ Indexes ที่มีอยู่
-- ============================================================
PRINT ' 3. ตรวจสอบ Indexes:';
PRINT '------------------------------------------------------------';

IF EXISTS (
    SELECT 1 
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    WHERE OBJECT_NAME(i.object_id) = 'SystemUser'
        AND COL_NAME(ic.object_id, ic.column_id) = 'IC_ID'
        AND i.is_primary_key = 0
)
BEGIN
    PRINT ' SystemUser.IC_ID มี Index';
    PRINT '   → Performance ดี';
END
ELSE
BEGIN
    PRINT 'WARNING: SystemUser.IC_ID ไม่มี Index';
    PRINT '   → ควรสร้าง Index สำหรับ Performance';
END

PRINT '';

-- ============================================================
-- 4. ตรวจสอบข้อมูลที่ต้องแก้ไขก่อน Migration
-- ============================================================
PRINT ' 4. ข้อมูลที่ต้องแก้ไขก่อน Migration:';
PRINT '------------------------------------------------------------';

-- Users ที่มี IC_ID แต่ Company ไม่มี
DECLARE @InvalidIC_ID INT;
SELECT @InvalidIC_ID = COUNT(*)
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL 
    AND IC.IC_ID IS NULL
    AND SU.SU_Active = 1;

IF @InvalidIC_ID > 0
BEGIN
    PRINT 'ERROR: พบ Users ที่มี IC_ID แต่ Company ไม่มี: ' + CAST(@InvalidIC_ID AS VARCHAR) + ' คน';
    PRINT '   → ต้องแก้ไขก่อน Migration';
END
ELSE
BEGIN
    PRINT ' ไม่มี Users ที่มี IC_ID แต่ Company ไม่มี';
END

-- Users ที่มี SR_ID = 0 หรือไม่มี Role
DECLARE @InvalidSR_ID INT;
SELECT @InvalidSR_ID = COUNT(*)
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
WHERE SU.SU_Active = 1
    AND (SU.SR_ID = 0 OR (SU.SR_ID IS NOT NULL AND SR.SR_ID IS NULL));

IF @InvalidSR_ID > 0
BEGIN
    PRINT 'WARNING: พบ Users ที่มี SR_ID = 0 หรือไม่มี Role: ' + CAST(@InvalidSR_ID AS VARCHAR) + ' คน';
    PRINT '   → ควรแก้ไขก่อน Migration';
END
ELSE
BEGIN
    PRINT ' ไม่มี Users ที่มี SR_ID = 0 หรือไม่มี Role';
END

PRINT '';

-- ============================================================
-- 5. สรุปความพร้อมสำหรับ Migration
-- ============================================================
PRINT ' 5. สรุปความพร้อมสำหรับ Migration:';
PRINT '------------------------------------------------------------';

DECLARE @ReadyScore INT = 0;
DECLARE @TotalChecks INT = 4;

-- Check 1: ตาราง SystemUserCompany
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
    SET @ReadyScore = @ReadyScore + 1;

-- Check 2: ไม่มี FK ที่ขัดขวาง
IF @HasFK_IC_ID = 0
    SET @ReadyScore = @ReadyScore + 1;

-- Check 3: ไม่มีข้อมูลผิดพลาด
IF @InvalidIC_ID = 0
    SET @ReadyScore = @ReadyScore + 1;

-- Check 4: มี Index
IF EXISTS (
    SELECT 1 FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    WHERE OBJECT_NAME(i.object_id) = 'SystemUser'
        AND COL_NAME(ic.object_id, ic.column_id) = 'IC_ID'
        AND i.is_primary_key = 0
)
    SET @ReadyScore = @ReadyScore + 1;

PRINT 'คะแนนความพร้อม: ' + CAST(@ReadyScore AS VARCHAR) + '/' + CAST(@TotalChecks AS VARCHAR);

IF @ReadyScore = @TotalChecks
BEGIN
    PRINT ' พร้อมสำหรับ Migration!';
END
ELSE IF @ReadyScore >= 2
BEGIN
    PRINT 'WARNING: พร้อมบางส่วน - ควรแก้ไขปัญหาที่พบก่อน';
END
ELSE
BEGIN
    PRINT 'ERROR: ยังไม่พร้อม - ต้องแก้ไขปัญหาก่อน Migration';
END

PRINT '';

-- ============================================================
-- 6. แนะนำขั้นตอนต่อไป
-- ============================================================
PRINT ' 6. แนะนำขั้นตอนต่อไป:';
PRINT '------------------------------------------------------------';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    PRINT '1.  สร้างตาราง SystemUserCompany';
END

IF @InvalidIC_ID > 0
BEGIN
    PRINT '2. ERROR: แก้ไข Users ที่มี IC_ID แต่ Company ไม่มี (' + CAST(@InvalidIC_ID AS VARCHAR) + ' คน)';
END

IF @InvalidSR_ID > 0
BEGIN
    PRINT '3. WARNING: แก้ไข Users ที่มี SR_ID = 0 หรือไม่มี Role (' + CAST(@InvalidSR_ID AS VARCHAR) + ' คน)';
END

IF @HasFK_IC_ID = 1
BEGIN
    PRINT '4. WARNING: ระวัง Foreign Key Constraint บน SystemUser.IC_ID';
    PRINT '   → อาจต้อง disable FK ชั่วคราวตอน Migration';
END

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    WHERE OBJECT_NAME(i.object_id) = 'SystemUser'
        AND COL_NAME(ic.object_id, ic.column_id) = 'IC_ID'
        AND i.is_primary_key = 0
)
BEGIN
    PRINT '5. WARNING: ควรสร้าง Index บน SystemUser.IC_ID สำหรับ Performance';
END

PRINT '';
PRINT '============================================================';
PRINT ' เสร็จสิ้นการตรวจสอบความพร้อม!';
PRINT '============================================================';

