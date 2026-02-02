-- ============================================================
-- Migrate ข้อมูล User_Location เก่า (ถ้ามี)
-- ============================================================

PRINT '============================================================';
PRINT ' Migrate User Locations';
PRINT '============================================================';

-- ============================================================
-- 1. ตรวจสอบข้อมูลก่อน Migrate
-- ============================================================

PRINT '1. ตรวจสอบข้อมูลก่อน Migrate:';
PRINT '------------------------------------------------------------';

SELECT
    'Users with existing User_Location' AS 'Type',
    COUNT(*) AS 'Count'
FROM [dbo].[SystemUser]
WHERE User_Location IS NOT NULL
    AND CAST(User_Location AS NVARCHAR(MAX)) != ''
    AND SR_ID IN (2, 3);

PRINT '';

-- ============================================================
-- 2. สร้าง Location records จากข้อมูลเก่า (ถ้ายังไม่มี)
-- ============================================================

PRINT '2. สร้าง Location records จากข้อมูลเก่า:';
PRINT '------------------------------------------------------------';

-- หา User_Location ที่ซ้ำกัน และยังไม่มีใน GuardLocation
INSERT INTO [dbo].[GuardLocation] (GL_Code, GL_Name, GL_Active, GL_CreatedBy)
SELECT DISTINCT
    CAST(User_Location AS NVARCHAR(255)) AS GL_Code,
    CAST(User_Location AS NVARCHAR(255)) AS GL_Name,
    1 AS GL_Active,
    1 AS GL_CreatedBy
FROM [dbo].[SystemUser]
WHERE User_Location IS NOT NULL
    AND CAST(User_Location AS NVARCHAR(MAX)) != ''
    AND SR_ID IN (2, 3)
    AND CAST(User_Location AS NVARCHAR(255)) NOT IN (SELECT GL_Code FROM [dbo].[GuardLocation]);

PRINT CONCAT('✅ Migrated ', @@ROWCOUNT, ' unique locations');

PRINT '';

-- ============================================================
-- 3. Verify
-- ============================================================

PRINT '3. Verification:';
PRINT '------------------------------------------------------------';

-- แสดง User พร้อม Location ที่ Join มา
SELECT TOP 10
    SU.SU_ID,
    SU.SU_Username,
    SU.SU_Name1,
    CAST(SU.User_Location AS NVARCHAR(255)) AS User_Location,
    GL.GL_Name AS LocationName,
    CASE
        WHEN GL.GL_ID IS NULL THEN '❌ No Match'
        ELSE '✅ Matched'
    END AS Status
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[GuardLocation] GL ON CAST(SU.User_Location AS NVARCHAR(255)) = GL.GL_Code
WHERE SU.SR_ID IN (2, 3)
    AND SU.SU_Active = 1
ORDER BY SU.SU_ID;

PRINT '';
PRINT '============================================================';
PRINT '✅ Migration completed!';
PRINT '============================================================';
