-- ============================================================
-- ตรวจสอบปัญหาสำคัญและข้อมูลที่ต้องแก้ไขก่อนเริ่มงาน
-- ============================================================
-- ใช้สำหรับตรวจสอบปัญหาที่อาจเกิดตอน Migration
-- ============================================================

USE [SmartSecurity];
GO

PRINT '============================================================';
PRINT ' ตรวจสอบปัญหาสำคัญและข้อมูลที่ต้องแก้ไข';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ตรวจสอบ Users ที่มี SR_ID = 0 หรือ SR_ID ที่ไม่มีใน SystemRole
-- ============================================================
PRINT ' 1. Users ที่มี SR_ID = 0 หรือ SR_ID ที่ไม่มีใน SystemRole:';
PRINT '------------------------------------------------------------';

-- จาก SystemUser.SR_ID
SELECT 
    'SystemUser.SR_ID' AS 'Source',
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.SR_ID,
    SU.IC_ID,
    CASE 
        WHEN SU.SR_ID = 0 THEN 'SR_ID = 0 (Invalid)'
        WHEN SU.SR_ID IS NOT NULL AND SR.SR_ID IS NULL THEN 'SR_ID ไม่มีใน SystemRole'
        ELSE 'OK'
    END AS 'Issue'
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
WHERE SU.SU_Active = 1
    AND (SU.SR_ID = 0 OR (SU.SR_ID IS NOT NULL AND SR.SR_ID IS NULL))
ORDER BY SU.SU_ID;

-- จาก SystemUserSystemRole
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserSystemRole')
BEGIN
    SELECT 
        'SystemUserSystemRole' AS 'Source',
        SU.SU_ID,
        SU.SU_Username,
        SU.SU_Name1,
        SUSR.SR_ID,
        SU.IC_ID,
        CASE 
            WHEN SUSR.SR_ID = 0 THEN 'SR_ID = 0 (Invalid)'
            WHEN SUSR.SR_ID IS NOT NULL AND SR.SR_ID IS NULL THEN 'SR_ID ไม่มีใน SystemRole'
            ELSE 'OK'
        END AS 'Issue'
    FROM [dbo].[SystemUser] SU
    INNER JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
    LEFT JOIN [dbo].[SystemRole] SR ON SUSR.SR_ID = SR.SR_ID
    WHERE SU.SU_Active = 1
        AND (SUSR.SR_ID = 0 OR (SUSR.SR_ID IS NOT NULL AND SR.SR_ID IS NULL))
    ORDER BY SU.SU_ID, SUSR.SR_ID;
END

PRINT '';

-- ============================================================
-- 2. ตรวจสอบ Users ที่มี IC_ID แต่ Company ถูกลบไปแล้ว
-- ============================================================
PRINT ' 2. Users ที่มี IC_ID แต่ Company ถูกลบไปแล้ว:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID,
    SU.SR_ID,
    'Company ไม่มีใน InternalCompany' AS 'Issue'
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL 
    AND IC.IC_ID IS NULL
    AND SU.SU_Active = 1
ORDER BY SU.IC_ID, SU.SU_ID;

PRINT '';

-- ============================================================
-- 3. ตรวจสอบ Users ที่มี IC_ID แต่ Company ไม่ Active
-- ============================================================
PRINT ' 3. Users ที่มี IC_ID แต่ Company ไม่ Active:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID,
    IC.IC_Code,
    IC.IC_LocalName,
    IC.IC_IsActive,
    'Company ไม่ Active' AS 'Issue'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL 
    AND IC.IC_IsActive = 0
    AND SU.SU_Active = 1
ORDER BY SU.IC_ID, SU.SU_ID;

PRINT '';

-- ============================================================
-- 4. ตรวจสอบ Users ที่มีทั้ง SR_ID ใน SystemUser และ SystemUserSystemRole
-- ============================================================
PRINT ' 4. Users ที่มีทั้ง SR_ID ใน SystemUser และ SystemUserSystemRole:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserSystemRole')
BEGIN
    SELECT 
        SU.SU_ID,
        SU.SU_Username,
        SU.SU_Name1,
        SU.SR_ID AS 'SystemUser.SR_ID',
        (SELECT TOP 1 SR_ID FROM [dbo].[SystemUserSystemRole] WHERE SU_ID = SU.SU_ID) AS 'SystemUserSystemRole.SR_ID',
        CASE 
            WHEN SU.SR_ID IS NOT NULL AND EXISTS (SELECT 1 FROM [dbo].[SystemUserSystemRole] WHERE SU_ID = SU.SU_ID) 
                THEN 'มีทั้งสองที่ (อาจซ้ำซ้อน)'
            ELSE 'OK'
        END AS 'Status'
    FROM [dbo].[SystemUser] SU
    WHERE SU.SU_Active = 1
        AND SU.SR_ID IS NOT NULL
        AND EXISTS (SELECT 1 FROM [dbo].[SystemUserSystemRole] WHERE SU_ID = SU.SU_ID)
    ORDER BY SU.SU_ID;
END
ELSE
BEGIN
    PRINT 'ERROR: ไม่พบตาราง SystemUserSystemRole';
END

PRINT '';

-- ============================================================
-- 5. ตรวจสอบ Users ที่ไม่มี SR_ID ทั้งใน SystemUser และ SystemUserSystemRole
-- ============================================================
PRINT ' 5. Users ที่ไม่มี SR_ID ทั้งใน SystemUser และ SystemUserSystemRole:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserSystemRole')
BEGIN
    SELECT 
        SU.SU_ID,
        SU.SU_Username,
        SU.SU_Name1,
        SU.IC_ID,
        'ไม่มี Role ทั้งสองที่' AS 'Issue'
    FROM [dbo].[SystemUser] SU
    LEFT JOIN [dbo].[SystemUserSystemRole] SUSR ON SU.SU_ID = SUSR.SU_ID
    WHERE SU.SU_Active = 1
        AND SU.SR_ID IS NULL
        AND SUSR.SU_ID IS NULL
    ORDER BY SU.SU_ID;
END
ELSE
BEGIN
    SELECT 
        SU.SU_ID,
        SU.SU_Username,
        SU.SU_Name1,
        SU.IC_ID,
        'ไม่มี Role (SR_ID = NULL)' AS 'Issue'
    FROM [dbo].[SystemUser] SU
    WHERE SU.SU_Active = 1
        AND SU.SR_ID IS NULL
    ORDER BY SU.SU_ID;
END

PRINT '';

-- ============================================================
-- 6. ตรวจสอบ Users ที่มี IC_ID แต่ไม่มีข้อมูลใน WayIn
-- ============================================================
PRINT ' 6. Users ที่มี IC_ID แต่ไม่มีข้อมูลใน WayIn:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    SU.IC_ID,
    IC.IC_LocalName,
    'ไม่มีข้อมูล WayIn' AS 'Note'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL
    AND SU.SU_Active = 1
    AND NOT EXISTS (
        SELECT 1 FROM [dbo].[WayIn] WI 
        WHERE WI.IC_ID = SU.IC_ID
    )
ORDER BY SU.IC_ID, SU.SU_ID;

PRINT '';

-- ============================================================
-- 7. ตรวจสอบข้อมูลสำหรับ Migration (สรุป)
-- ============================================================
PRINT ' 7. สรุปข้อมูลสำหรับ Migration:';
PRINT '------------------------------------------------------------';

-- จำนวน Users ที่จะ migrate
SELECT 
    'Users ที่จะ migrate (IC_ID IS NOT NULL)' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser]
WHERE IC_ID IS NOT NULL AND SU_Active = 1

UNION ALL

-- จำนวน Super Admin
SELECT 
    'Super Admin (IC_ID = NULL)' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser]
WHERE IC_ID IS NULL AND SU_Active = 1

UNION ALL

-- จำนวน Users ที่มีปัญหา
SELECT 
    'Users ที่มี IC_ID แต่ Company ไม่มี' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SU.IC_ID IS NOT NULL 
    AND IC.IC_ID IS NULL
    AND SU.SU_Active = 1

UNION ALL

-- จำนวน Users ที่ไม่มี Role
SELECT 
    'Users ที่ไม่มี Role (SR_ID = NULL)' AS 'Category',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser]
WHERE SR_ID IS NULL 
    AND SU_Active = 1
    AND NOT EXISTS (
        SELECT 1 FROM [dbo].[SystemUserSystemRole] 
        WHERE SU_ID = [dbo].[SystemUser].SU_ID
    );

PRINT '';

-- ============================================================
-- 8. ตรวจสอบ Foreign Key Constraints
-- ============================================================
PRINT ' 8. Foreign Key Constraints ของ SystemUser:';
PRINT '------------------------------------------------------------';

SELECT
    fk.name AS 'FK Name',
    OBJECT_NAME(fk.parent_object_id) AS 'Table',
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS 'Column',
    OBJECT_NAME(fk.referenced_object_id) AS 'Referenced Table',
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS 'Referenced Column',
    fk.is_disabled AS 'Is Disabled',
    fk.is_not_trusted AS 'Is Not Trusted'
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fc
    ON fk.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) = 'SystemUser'
ORDER BY fk.name;

PRINT '';

-- ============================================================
-- 9. ตรวจสอบ Indexes บน SystemUser.IC_ID และ SystemUser.SR_ID
-- ============================================================
PRINT ' 9. Indexes บน SystemUser.IC_ID และ SystemUser.SR_ID:';
PRINT '------------------------------------------------------------';

SELECT 
    i.name AS 'Index Name',
    i.type_desc AS 'Index Type',
    COL_NAME(ic.object_id, ic.column_id) AS 'Column Name',
    i.is_unique AS 'Is Unique',
    i.is_primary_key AS 'Is Primary Key',
    i.is_unique_constraint AS 'Is Unique Constraint'
FROM sys.indexes i
INNER JOIN sys.index_columns ic 
    ON i.object_id = ic.object_id AND i.index_id = ic.index_id
WHERE OBJECT_NAME(i.object_id) = 'SystemUser'
    AND COL_NAME(ic.object_id, ic.column_id) IN ('IC_ID', 'SR_ID')
ORDER BY i.name, ic.key_ordinal;

PRINT '';

-- ============================================================
-- 10. ตรวจสอบว่ามีตาราง SystemUserCompany หรือไม่ (พร้อมโครงสร้าง)
-- ============================================================
PRINT ' 10. ตรวจสอบตาราง SystemUserCompany:';
PRINT '------------------------------------------------------------';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SystemUserCompany')
BEGIN
    PRINT ' พบตาราง SystemUserCompany';
    PRINT '';
    PRINT ' โครงสร้าง:';
    SELECT
        COLUMN_NAME AS 'Column',
        DATA_TYPE AS 'Type',
        CHARACTER_MAXIMUM_LENGTH AS 'Max Length',
        IS_NULLABLE AS 'Nullable',
        COLUMN_DEFAULT AS 'Default'
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'SystemUserCompany'
    ORDER BY ORDINAL_POSITION;
    
    PRINT '';
    PRINT ' จำนวนข้อมูล:';
    SELECT 
        COUNT(*) AS 'Total Records',
        COUNT(DISTINCT SU_ID) AS 'Unique Users',
        COUNT(DISTINCT IC_ID) AS 'Unique Companies',
        COUNT(CASE WHEN SUC_IsActive = 1 THEN 1 END) AS 'Active Records'
    FROM [dbo].[SystemUserCompany];
    
    PRINT '';
    PRINT ' ข้อมูลตัวอย่าง (Top 10):';
    SELECT TOP 10 * FROM [dbo].[SystemUserCompany] ORDER BY SUC_ID;
END
ELSE
BEGIN
    PRINT 'ERROR: ไม่พบตาราง SystemUserCompany (ต้องสร้างใหม่)';
END

PRINT '';

-- ============================================================
-- 11. ตรวจสอบ Users ที่ควรมีหลาย Company (สำหรับทดสอบ)
-- ============================================================
PRINT ' 11. Users ที่ควรมีหลาย Company (ตัวอย่าง):';
PRINT '------------------------------------------------------------';

-- หา Users ที่อยู่ใน Company เดียวกันหลายคน (อาจจะต้องการหลาย Company)
SELECT 
    IC_ID,
    COUNT(*) AS 'User Count',
    STRING_AGG(SU_Username, ', ') AS 'Usernames'
FROM [dbo].[SystemUser]
WHERE IC_ID IS NOT NULL 
    AND SU_Active = 1
GROUP BY IC_ID
HAVING COUNT(*) > 5  -- Company ที่มี Users มากกว่า 5 คน
ORDER BY COUNT(*) DESC;

PRINT '';

-- ============================================================
-- 12. ตรวจสอบความสอดคล้องระหว่าง SystemUser.IC_ID และ WayIn.IC_ID
-- ============================================================
PRINT ' 12. ตรวจสอบความสอดคล้องระหว่าง SystemUser.IC_ID และ WayIn.IC_ID:';
PRINT '------------------------------------------------------------';

SELECT 
    SU.IC_ID,
    IC.IC_LocalName,
    COUNT(DISTINCT SU.SU_ID) AS 'User Count',
    COUNT(DISTINCT WI.WI_ID) AS 'WayIn Count',
    CASE 
        WHEN COUNT(DISTINCT WI.WI_ID) = 0 THEN 'ไม่มีข้อมูล WayIn'
        ELSE 'OK'
    END AS 'Status'
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
LEFT JOIN [dbo].[WayIn] WI ON SU.IC_ID = WI.IC_ID
WHERE SU.IC_ID IS NOT NULL 
    AND SU.SU_Active = 1
GROUP BY SU.IC_ID, IC.IC_LocalName
ORDER BY SU.IC_ID;

PRINT '';

PRINT '============================================================';
PRINT 'เสร็จสิ้นการตรวจสอบปัญหาสำคัญ!';
PRINT '============================================================';
PRINT '';
PRINT 'WARNING: หมายเหตุ:';
PRINT '   - ตรวจสอบ Users ที่มี SR_ID = 0 หรือไม่มี Role';
PRINT '   - ตรวจสอบ Users ที่มี IC_ID แต่ Company ไม่มี';
PRINT '   - ตรวจสอบ Foreign Key Constraints';
PRINT '   - ตรวจสอบ Indexes';
PRINT '   - แก้ไขปัญหาที่พบก่อนเริ่ม Migration';

