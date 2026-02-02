-- ============================================================
-- Verify GuardLocation Setup
-- ============================================================

PRINT '============================================================';
PRINT ' Verification Report';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- 1. ตรวจสอบ GuardLocation Table
-- ============================================================

PRINT '1. GuardLocation Table:';
PRINT '------------------------------------------------------------';

SELECT
    GL_ID,
    GL_Code,
    GL_Name,
    GL_Description,
    GL_Active,
    GL_CreatedAt
FROM [dbo].[GuardLocation]
ORDER BY GL_ID;

PRINT '';

-- ============================================================
-- 2. ตรวจสอบ Users ที่เป็นยาม (SGS/SGU)
-- ============================================================

PRINT '2. Guard Users Summary:';
PRINT '------------------------------------------------------------';

SELECT
    'Total Guards (SGS/SGU)' AS Category,
    COUNT(*) AS Count
FROM [dbo].[SystemUser]
WHERE SR_ID IN (2, 3) AND SU_Active = 1

UNION ALL

SELECT
    'Guards with Location',
    COUNT(*)
FROM [dbo].[SystemUser]
WHERE SR_ID IN (2, 3)
    AND SU_Active = 1
    AND User_Location IS NOT NULL
    AND CAST(User_Location AS NVARCHAR(MAX)) != ''

UNION ALL

SELECT
    'Guards without Location',
    COUNT(*)
FROM [dbo].[SystemUser]
WHERE SR_ID IN (2, 3)
    AND SU_Active = 1
    AND (User_Location IS NULL OR CAST(User_Location AS NVARCHAR(MAX)) = '');

PRINT '';

-- ============================================================
-- 3. Test Query: JOIN SystemUser + GuardLocation
-- ============================================================

PRINT '3. Test Query (JOIN Result):';
PRINT '------------------------------------------------------------';

SELECT TOP 20
    SU.SU_ID,
    SU.SU_Code,
    SU.SU_Username,
    SU.SU_Name1,
    SR.SR_Code AS RoleCode,
    CAST(SU.User_Location AS NVARCHAR(255)) AS User_Location,
    GL.GL_Name AS LocationName,
    CASE
        WHEN SU.User_Location IS NOT NULL AND GL.GL_ID IS NULL THEN '⚠️ Invalid Location'
        WHEN SU.User_Location IS NULL THEN '📍 No Location'
        ELSE '✅ Valid'
    END AS Status
FROM [dbo].[SystemUser] SU
LEFT JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
LEFT JOIN [dbo].[GuardLocation] GL ON CAST(SU.User_Location AS NVARCHAR(255)) = GL.GL_Code
WHERE SU.SR_ID IN (2, 3)
    AND SU.SU_Active = 1
ORDER BY SU.SU_ID;

PRINT '';

-- ============================================================
-- 4. ตรวจสอบ Location ที่ไม่ถูกใช้งาน
-- ============================================================

PRINT '4. Unused Locations:';
PRINT '------------------------------------------------------------';

SELECT
    GL.GL_Code,
    GL.GL_Name,
    COUNT(SU.SU_ID) AS UsedByUsersCount
FROM [dbo].[GuardLocation] GL
LEFT JOIN [dbo].[SystemUser] SU ON GL.GL_Code = CAST(SU.User_Location AS NVARCHAR(255)) AND SU.SU_Active = 1
GROUP BY GL.GL_Code, GL.GL_Name
ORDER BY UsedByUsersCount ASC;

PRINT '';
PRINT '============================================================';
PRINT '✅ Verification completed!';
PRINT '============================================================';
