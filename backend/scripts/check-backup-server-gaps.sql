-- ============================================================
-- ฝั่งเทส / Backup — เช็คว่า DB นี้ขาดอะไร (ก่อนรัน setup script)
-- ============================================================
-- วัตถุประสงค์: เช็คว่าขาดตาราง/คอลัมน์/แถวอะไร → ไว้เตรียม script deploy
--
-- วิธีใช้ (รันบนฝั่งเทส — DB ที่ดึง backup มา ยังไม่ได้เซ็ต):
--   1. ใน SSMS เลือก Database เป็น DB ฝั่งเทส (ที่ restore มา)
--   2. รันทั้งไฟล์นี้ (ไม่ต้องแก้ USE — ใช้ DB ที่เลือกอยู่)
--   3. ดูผล โดยเฉพาะส่วนท้าย "สรุป: สิ่งที่ขาด"
-- ============================================================

-- ไม่ใส่ USE — ให้เลือก DB ฝั่งเทสใน SSMS แล้วรัน

PRINT '============================================================';
PRINT ' [GAP CHECK] ฝั่งเทส — เช็คว่าขาดอะไร';
PRINT '============================================================';
PRINT ' Database ปัจจุบัน: ' + DB_NAME();
PRINT '';

-- ==================== 1. ตารางที่ขาด ====================
PRINT '--- 1. ตารางที่ควรมีแต่ไม่มี (Missing Tables) ---';

SELECT expected.TABLE_NAME AS [MissingTable]
FROM (
    SELECT 'SystemUserCompany' AS TABLE_NAME UNION ALL SELECT 'SystemSettings' UNION ALL SELECT 'GuardLocation'
    UNION ALL SELECT 'ConnectionHistory' UNION ALL SELECT 'InternalCompanyDepartment'
) AS expected
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES t
    WHERE t.TABLE_SCHEMA = 'dbo' AND t.TABLE_NAME = expected.TABLE_NAME
)
ORDER BY expected.TABLE_NAME;

-- แสดงตารางหลักที่ต้องมีเสมอ (ถ้าขาด = DB ไม่พร้อม)
PRINT '';
PRINT '--- 1b. ตารางหลักที่แอปต้องใช้ (มีหรือไม่) ---';

SELECT
    expected.TABLE_NAME AS [TableName],
    CASE WHEN t.TABLE_NAME IS NOT NULL THEN N'มี' ELSE N'ไม่มี' END AS [Status]
FROM (
    SELECT 'SystemUser' AS TABLE_NAME UNION ALL SELECT 'SystemRole' UNION ALL SELECT 'SystemScreen'
    UNION ALL SELECT 'SystemUserSystemRole' UNION ALL SELECT 'SystemRoleSystemScreen'
    UNION ALL SELECT 'InternalCompany' UNION ALL SELECT 'InternalDepartment'
    UNION ALL SELECT 'SystemUserCompany' UNION ALL SELECT 'VisitType' UNION ALL SELECT 'WayIn' UNION ALL SELECT 'WayOut'
) AS expected
LEFT JOIN INFORMATION_SCHEMA.TABLES t ON t.TABLE_SCHEMA = 'dbo' AND t.TABLE_NAME = expected.TABLE_NAME
ORDER BY expected.TABLE_NAME;

PRINT '';

-- ==================== 2. คอลัมน์สำคัญที่ขาด ====================
PRINT '--- 2. คอลัมน์ที่ขาดใน SystemRoleSystemScreen ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemRoleSystemScreen')
BEGIN
    SELECT 'IC_ID' AS [MissingColumn] WHERE NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'IC_ID')
    UNION ALL
    SELECT 'SRSS_HiddenFieldIds' WHERE NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'SRSS_HiddenFieldIds')
    UNION ALL
    SELECT 'SRSS_ReadOnlyFieldIds' WHERE NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'SRSS_ReadOnlyFieldIds');
END
ELSE
    PRINT 'ตาราง SystemRoleSystemScreen ไม่มี → ต้องมีก่อน';

PRINT '';

PRINT '--- 2b. คอลัมน์ที่ขาดใน SystemUser ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUser')
BEGIN
    SELECT 'SR_ID' AS [MissingColumn] WHERE NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SR_ID')
    UNION ALL
    SELECT 'IC_ID' WHERE NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'IC_ID')
    UNION ALL
    SELECT 'SU_Code' WHERE NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_Code')
    UNION ALL
    SELECT 'SU_PinCode' WHERE NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SU_PinCode');
END;

PRINT '';

PRINT '--- 2c. คอลัมน์ที่ขาดใน InternalCompany ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'InternalCompany')
BEGIN
    SELECT 'IC_ShortLocalName' AS [MissingColumn] WHERE NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_ShortLocalName')
    UNION ALL
    SELECT 'IC_LogoPath' WHERE NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'IC_LogoPath')
    UNION ALL
    SELECT 'Company_Sequence' WHERE NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'InternalCompany' AND COLUMN_NAME = 'Company_Sequence');
END;

PRINT '';

-- ==================== 3. SystemRole ที่ควรมี (ADM, HRU, QA, RCT, SGU, SGS) ====================
PRINT '--- 3. SystemRole ที่มีอยู่ ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemRole')
BEGIN
    SELECT SR_ID, SR_Code, SR_Name
    FROM [dbo].[SystemRole]
    WHERE SR_Active = 1
    ORDER BY SR_Code;

    -- แสดง Role ที่ขาด
    PRINT '';
    PRINT '--- 3b. Role ที่ควรมีแต่ไม่มี ---';
    SELECT expected.SR_Code AS [MissingRole]
    FROM (SELECT 'ADM' AS SR_Code UNION ALL SELECT 'HRU' UNION ALL SELECT 'QA' UNION ALL SELECT 'RCT' UNION ALL SELECT 'SGU' UNION ALL SELECT 'SGS' UNION ALL SELECT 'Emp') AS expected
    WHERE NOT EXISTS (SELECT 1 FROM [dbo].[SystemRole] r WHERE r.SR_Code = expected.SR_Code AND r.SR_Active = 1);
END
ELSE
    PRINT 'ตาราง SystemRole ไม่มี';

PRINT '';

-- ==================== 4. SystemScreen ที่ต้องมีสำหรับสิทธิ์ (2000, 3000, 1000, 1100, 10000) ====================
PRINT '--- 4. SystemScreen ที่มีอยู่ (SS_ID สำหรับสิทธิ์) ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemScreen')
BEGIN
    SELECT SS_ID, SS_Name, SS_RelativePath, SS_IsActive
    FROM [dbo].[SystemScreen]
    WHERE SS_ID IN (1, 1000, 1100, 1101, 2000, 3000, 4000, 10000, 11000, 12000, 12005)
    ORDER BY SS_ID;

    PRINT '';
    PRINT '--- 4b. Screen ID ที่ควรมีแต่ไม่มี ---';
    SELECT expected.SS_ID AS [MissingSS_ID]
    FROM (SELECT 2000 AS SS_ID UNION ALL SELECT 3000 UNION ALL SELECT 1000 UNION ALL SELECT 1100 UNION ALL SELECT 10000) AS expected
    WHERE NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] s WHERE s.SS_ID = expected.SS_ID);
END
ELSE
    PRINT 'ตาราง SystemScreen ไม่มี';

PRINT '';

-- ==================== 5. สิทธิ์ Role–Screen (มีแถวหรือไม่) ====================
PRINT '--- 5. จำนวน Permission ต่อ Role (ฝั่ง backup) ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemRoleSystemScreen')
BEGIN
    SELECT
        sr.SR_Code AS [Role],
        COUNT(srss.SS_ID) AS [PermissionCount]
    FROM [dbo].[SystemRole] sr
    LEFT JOIN [dbo].[SystemRoleSystemScreen] srss ON sr.SR_ID = srss.SR_ID
    WHERE sr.SR_Active = 1
    GROUP BY sr.SR_Code
    ORDER BY sr.SR_Code;
END;

PRINT '';

-- ==================== 6. SystemUserCompany ====================
PRINT '--- 6. SystemUserCompany (มีตาราง + มีข้อมูลหรือไม่) ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUserCompany')
BEGIN
    SELECT
        COUNT(*) AS [TotalRecords],
        COUNT(DISTINCT SU_ID) AS [UniqueUsers],
        COUNT(CASE WHEN SUC_IsActive = 1 THEN 1 END) AS [ActiveRecords]
    FROM [dbo].[SystemUserCompany];
END
ELSE
    PRINT 'ตาราง SystemUserCompany ไม่มี → ต้องสร้างและ Migrate';

PRINT '';

-- ==================== 7. User ที่ SR_ID = NULL หรือ 0 (เสี่ยง Error) ====================
PRINT '--- 7. User ที่ไม่มี Role (SR_ID NULL หรือ 0) ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUser')
   AND EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'SR_ID')
   AND EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUser' AND COLUMN_NAME = 'IC_ID')
BEGIN
    EXEC sp_executesql N'
        SELECT SU_ID, SU_Username, SU_Name1, SR_ID, IC_ID
        FROM [dbo].[SystemUser]
        WHERE SU_Active = 1 AND (SR_ID IS NULL OR SR_ID = 0);
    ';
END
ELSE IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUser')
BEGIN
    PRINT '  ตาราง SystemUser ยังไม่มีคอลัมน์ SR_ID หรือ IC_ID → ต้องเพิ่มก่อน (รัน PRODUCTION-sync-database.sql STEP 1)';
END;

PRINT '';

-- ==================== 8. สรุป: สิ่งที่ขาด ====================
PRINT '============================================================';
PRINT ' สรุป: สิ่งที่ขาด / ต้องทำ';
PRINT '============================================================';

DECLARE @MissingTable NVARCHAR(500) = N'';
DECLARE @MissingColSRSS NVARCHAR(500) = N'';
DECLARE @MissingScreen NVARCHAR(200) = N'';
DECLARE @MissingRole NVARCHAR(200) = N'';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUserCompany')
    SET @MissingTable = @MissingTable + N' SystemUserCompany';
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemSettings')
    SET @MissingTable = @MissingTable + N' SystemSettings';
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'GuardLocation')
    SET @MissingTable = @MissingTable + N' GuardLocation';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemRoleSystemScreen')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemRoleSystemScreen' AND COLUMN_NAME = 'IC_ID')
        SET @MissingColSRSS = @MissingColSRSS + N' IC_ID';
END

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemScreen')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 2000) SET @MissingScreen = @MissingScreen + N' 2000';
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 3000) SET @MissingScreen = @MissingScreen + N' 3000';
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 1000) SET @MissingScreen = @MissingScreen + N' 1000';
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 1100) SET @MissingScreen = @MissingScreen + N' 1100';
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemScreen] WHERE SS_ID = 10000) SET @MissingScreen = @MissingScreen + N' 10000';
END

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemRole')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRole] WHERE SR_Code = 'ADM' AND SR_Active = 1) SET @MissingRole = @MissingRole + N' ADM';
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRole] WHERE SR_Code = 'HRU' AND SR_Active = 1) SET @MissingRole = @MissingRole + N' HRU';
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRole] WHERE SR_Code = 'SGU' AND SR_Active = 1) SET @MissingRole = @MissingRole + N' SGU';
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRole] WHERE SR_Code = 'SGS' AND SR_Active = 1) SET @MissingRole = @MissingRole + N' SGS';
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRole] WHERE SR_Code = 'Emp' AND SR_Active = 1) SET @MissingRole = @MissingRole + N' Emp';
END

PRINT N'  ตารางที่ขาด:' + CASE WHEN @MissingTable = N'' THEN N' (ไม่มี)' ELSE @MissingTable END;
PRINT N'  คอลัมน์ที่ขาดใน SystemRoleSystemScreen:' + CASE WHEN @MissingColSRSS = N'' THEN N' (ไม่มี)' ELSE @MissingColSRSS END;
PRINT N'  SystemScreen SS_ID ที่ขาด:' + CASE WHEN @MissingScreen = N'' THEN N' (ไม่มี)' ELSE @MissingScreen END;
PRINT N'  SystemRole ที่ขาด:' + CASE WHEN @MissingRole = N'' THEN N' (ไม่มี)' ELSE @MissingRole END;
PRINT '';
PRINT '  ขั้นตอนถัดไป:';
PRINT '  - ถ้าขาดตาราง/คอลัมน์ → รัน PRODUCTION-sync-database.sql (แก้ USE [ชื่อDB] ให้ตรง)';
PRINT '  - ถ้าขาดแถว SystemScreen (2000,3000,...) → รันส่วน "ลำดับ 2" ใน NEW-DB-FULL-SETUP.sql';
PRINT '  - ถ้าขาดสิทธิ์ Role → รัน 00-setup-role-permissions.sql หรือ STEP 6 ใน PRODUCTION-sync-database.sql';
PRINT '  - ถ้าไม่มีข้อมูล SystemUserCompany → รัน STEP 7 ใน PRODUCTION-sync-database.sql (Migrate)';
PRINT '  - ถ้ามี User ที่ SR_ID NULL/0 → รัน 00-fix-role-id-zero-fix.sql';
PRINT '============================================================';
