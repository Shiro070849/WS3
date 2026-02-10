-- ============================================================
-- ฝั่งสมบูรณ์ (Baseline) — รันบน SERVER ที่ใช้งานอยู่แล้ว
-- ============================================================
-- วัตถุประสงค์: ดูว่าฝั่งสมบูรณ์มีตาราง/คอลัมน์/แถวอะไรบ้าง
--              เก็บผลรันไว้เป็นอ้างอิง แล้วไปเทียบกับฝั่ง backup
--
-- วิธีใช้ (รันบนฝั่งสมบูรณ์):
--   1. ใน SSMS เลือก Database เป็น DB ฝั่งสมบูรณ์ (ที่ใช้งานอยู่)
--   2. รันทั้งไฟล์นี้ (ไม่ต้องแก้ USE — ใช้ DB ที่เลือกอยู่)
--   3. เก็บผลไว้เทียบกับฝั่ง backup
-- ============================================================

-- ไม่ใส่ USE — ให้เลือก DB ฝั่งสมบูรณ์ใน SSMS แล้วรัน

PRINT '============================================================';
PRINT ' [BASELINE] ฝั่งสมบูรณ์ — สิ่งที่มีใน DB นี้';
PRINT '============================================================';
PRINT ' Database ปัจจุบัน: ' + DB_NAME();
PRINT '';

-- ==================== 1. ตารางทั้งหมดที่แอปใช้ (มีหรือไม่) ====================
PRINT '--- 1. ตารางที่แอปใช้ (มี = 1, ไม่มี = 0) ---';

SELECT
    t.TABLE_NAME AS [TableName],
    CASE WHEN t.TABLE_NAME IS NOT NULL THEN 1 ELSE 0 END AS [Exists]
FROM (
    SELECT 'SystemUser' AS TABLE_NAME UNION ALL SELECT 'SystemRole' UNION ALL SELECT 'SystemScreen'
    UNION ALL SELECT 'SystemUserSystemRole' UNION ALL SELECT 'SystemRoleSystemScreen'
    UNION ALL SELECT 'SystemUserCompany' UNION ALL SELECT 'InternalCompany' UNION ALL SELECT 'InternalDepartment'
    UNION ALL SELECT 'InternalCompanyDepartment' UNION ALL SELECT 'VisitType' UNION ALL SELECT 'WayIn' UNION ALL SELECT 'WayOut'
    UNION ALL SELECT 'SystemSettings' UNION ALL SELECT 'ConnectionHistory' UNION ALL SELECT 'GuardLocation'
    UNION ALL SELECT 'ChangeHistory' UNION ALL SELECT 'ExternalCompany' UNION ALL SELECT 'VehicleType'
) AS expected
LEFT JOIN INFORMATION_SCHEMA.TABLES t
    ON t.TABLE_SCHEMA = 'dbo' AND t.TABLE_NAME = expected.TABLE_NAME
ORDER BY expected.TABLE_NAME;

PRINT '';

-- ==================== 2. คอลัมน์สำคัญของตารางหลัก ====================
PRINT '--- 2. คอลัมน์สำคัญ (SystemUser) ---';

SELECT COLUMN_NAME AS [Column], DATA_TYPE AS [Type], IS_NULLABLE AS [Nullable]
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUser'
ORDER BY ORDINAL_POSITION;

PRINT '';

PRINT '--- 2b. คอลัมน์สำคัญ (SystemRoleSystemScreen) ---';

SELECT COLUMN_NAME AS [Column], DATA_TYPE AS [Type], IS_NULLABLE AS [Nullable]
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemRoleSystemScreen'
ORDER BY ORDINAL_POSITION;

PRINT '';

PRINT '--- 2c. คอลัมน์สำคัญ (InternalCompany) ---';

SELECT COLUMN_NAME AS [Column], DATA_TYPE AS [Type], IS_NULLABLE AS [Nullable]
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'InternalCompany'
ORDER BY ORDINAL_POSITION;

PRINT '';

-- ==================== 3. SystemRole ทั้งหมด (ต้องมี ADM, HRU, QA, RCT, SGU, SGS) ====================
PRINT '--- 3. SystemRole ทั้งหมด ---';

SELECT SR_ID, SR_Code, SR_Name, SR_Active
FROM [dbo].[SystemRole]
ORDER BY SR_Code;

PRINT '';

-- ==================== 4. SystemScreen ที่เกี่ยวกับสิทธิ์ (ต้องมี 2000, 3000, 1000, 1100, 10000 ฯลฯ) ====================
PRINT '--- 4. SystemScreen (SS_ID ที่ใช้ในสิทธิ์) ---';

SELECT SS_ID, SS_Name, SS_RelativePath, SS_IsActive
FROM [dbo].[SystemScreen]
WHERE SS_ID IN (1, 1000, 1100, 1101, 2000, 3000, 4000, 10000, 11000, 12000, 12005)
ORDER BY SS_ID;

PRINT '';

-- ==================== 5. สรุปสิทธิ์ Role–Screen (แต่ละ Role เข้า Screen ไหนบ้าง) ====================
PRINT '--- 5. สิทธิ์ Role–Screen (Global: IC_ID = NULL) ---';

SELECT
    sr.SR_Code AS [Role],
    srss.SS_ID AS [ScreenId],
    ss.SS_Name AS [ScreenName],
    CASE WHEN srss.IC_ID IS NULL THEN N'Global' ELSE CAST(srss.IC_ID AS NVARCHAR(20)) END AS [Scope]
FROM [dbo].[SystemRoleSystemScreen] srss
INNER JOIN [dbo].[SystemRole] sr ON srss.SR_ID = sr.SR_ID
INNER JOIN [dbo].[SystemScreen] ss ON srss.SS_ID = ss.SS_ID
WHERE sr.SR_Active = 1
ORDER BY sr.SR_Code, srss.SS_ID, srss.IC_ID;

PRINT '';

-- ==================== 6. นับจำนวนแถวสิทธิ์ต่อ Role ====================
PRINT '--- 6. จำนวน Permission ต่อ Role ---';

SELECT
    sr.SR_Code AS [Role],
    COUNT(*) AS [PermissionCount]
FROM [dbo].[SystemRole] sr
LEFT JOIN [dbo].[SystemRoleSystemScreen] srss ON sr.SR_ID = srss.SR_ID
WHERE sr.SR_Active = 1
GROUP BY sr.SR_Code
ORDER BY sr.SR_Code;

PRINT '';

-- ==================== 7. SystemUserCompany (มีตารางและมีข้อมูลหรือไม่) ====================
PRINT '--- 7. SystemUserCompany สถิติ ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUserCompany')
BEGIN
    SELECT
        COUNT(*) AS [TotalRecords],
        COUNT(DISTINCT SU_ID) AS [UniqueUsers],
        COUNT(DISTINCT IC_ID) AS [UniqueCompanies],
        COUNT(CASE WHEN SUC_IsActive = 1 THEN 1 END) AS [ActiveRecords]
    FROM [dbo].[SystemUserCompany];
END
ELSE
    PRINT 'ตาราง SystemUserCompany ไม่มี';

PRINT '';

-- ==================== 8. SystemSettings (มีตารางหรือไม่) ====================
PRINT '--- 8. SystemSettings (มีตารางหรือไม่) ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemSettings')
    SELECT COUNT(*) AS [SystemSettingsRowCount] FROM [dbo].[SystemSettings];
ELSE
    PRINT 'ตาราง SystemSettings ไม่มี';

PRINT '';

-- ==================== 9. GuardLocation (มีตารางหรือไม่) ====================
PRINT '--- 9. GuardLocation (มีตารางหรือไม่) ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'GuardLocation')
    SELECT COUNT(*) AS [GuardLocationRowCount] FROM [dbo].[GuardLocation];
ELSE
    PRINT 'ตาราง GuardLocation ไม่มี';

PRINT '';

-- ==================== 10. User สรุป (Super Admin vs มี Company) ====================
PRINT '--- 10. SystemUser สรุป ---';

SELECT
    COUNT(*) AS [TotalActiveUsers],
    COUNT(CASE WHEN IC_ID IS NULL THEN 1 END) AS [SuperAdmin_IC_ID_NULL],
    COUNT(CASE WHEN IC_ID IS NOT NULL THEN 1 END) AS [HasCompany_IC_ID],
    COUNT(CASE WHEN SR_ID IS NULL OR SR_ID = 0 THEN 1 END) AS [NoRole_SR_ID_NULL_OrZero]
FROM [dbo].[SystemUser]
WHERE SU_Active = 1;

PRINT '';
PRINT '============================================================';
PRINT ' [BASELINE] จบ — เก็บผลรันไว้เทียบกับฝั่ง backup';
PRINT '============================================================';
