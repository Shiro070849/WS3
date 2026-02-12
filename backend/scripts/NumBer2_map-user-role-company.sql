-- ============================================================
-- Map ข้อมูล SystemUser: ตั้ง SR_ID = 6 (RCT), IC_ID = 5
-- ============================================================
-- รันบน DB ฝั่งเทส ที่ SR_ID, IC_ID ยังเป็น NULL
-- วิธีใช้: เลือก DB ใน SSMS แล้วรันทั้งไฟล์
-- ============================================================

PRINT 'Database: ' + DB_NAME();
PRINT '';

-- ==================== 1. เช็ค Data Type ของ SR_ID, IC_ID ====================
PRINT '--- 1. Data Type ของ SR_ID, IC_ID ใน SystemUser ---';

SELECT
    COLUMN_NAME AS [Column],
    DATA_TYPE AS [Type],
    CHARACTER_MAXIMUM_LENGTH AS [MaxLength],
    IS_NULLABLE AS [Nullable]
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_NAME = 'SystemUser'
  AND COLUMN_NAME IN ('SR_ID', 'IC_ID')
ORDER BY COLUMN_NAME;

PRINT '';

-- ==================== 2. ตรวจสอบว่ามี Role RCT (SR_ID=6) และ Company IC_ID=5 ====================
PRINT '--- 2. ตรวจสอบ Role RCT และ Company 5 ---';

IF EXISTS (SELECT 1 FROM [dbo].[SystemRole] WHERE SR_ID = 6 AND SR_Code = 'RCT')
    PRINT '  [OK] SystemRole: SR_ID=6 (RCT) มีอยู่';
ELSE
    PRINT '  [WARN] ไม่พบ SR_ID=6 (RCT) — เช็คจาก SystemRole ว่า RCT มี SR_ID เท่าไหร่';

IF EXISTS (SELECT 1 FROM [dbo].[InternalCompany] WHERE IC_ID = 5)
    PRINT '  [OK] InternalCompany: IC_ID=5 มีอยู่';
ELSE
    PRINT '  [WARN] ไม่พบ IC_ID=5 ใน InternalCompany';

PRINT '';

-- ==================== 3. แสดงจำนวนแถวที่จะถูกอัปเดต ====================
PRINT '--- 3. จำนวน User ที่ SR_ID, IC_ID เป็น NULL (จะถูกตั้งเป็น RCT + IC_ID 5) ---';

SELECT COUNT(*) AS [CountToUpdate]
FROM [dbo].[SystemUser]
WHERE SR_ID IS NULL AND IC_ID IS NULL AND SU_Active = 1;

PRINT '';

-- ==================== 4. อัปเดต: ตั้ง SR_ID = 6 (RCT), IC_ID = 5 ====================
PRINT '--- 4. รัน UPDATE ---';

BEGIN TRY
    UPDATE [dbo].[SystemUser]
    SET SR_ID = 6,   -- RCT (Reception)
        IC_ID = 5    -- บริษัทหลัก (รักชัยท้องเย็น)
    WHERE SR_ID IS NULL
      AND IC_ID IS NULL
      AND SU_Active = 1;

    PRINT '  อัปเดตแล้ว: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' แถว (SR_ID=6, IC_ID=5)';
END TRY
BEGIN CATCH
    PRINT '  ERROR: ' + ERROR_MESSAGE();
END CATCH

PRINT '';

-- ==================== 5. Migrate ไป SystemUserCompany (ถ้ามี User ที่มี IC_ID แล้ว) ====================
PRINT '--- 5. เติม SystemUserCompany จาก SystemUser.IC_ID (ถ้าขาด) ---';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'SystemUserCompany')
BEGIN
    INSERT INTO [dbo].[SystemUserCompany] (SU_ID, IC_ID, SUC_IsActive, SUC_CreatedAt)
    SELECT SU.SU_ID, SU.IC_ID, 1, GETDATE()
    FROM [dbo].[SystemUser] SU
    INNER JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
    WHERE SU.IC_ID IS NOT NULL
      AND SU.SU_Active = 1
      AND IC.IC_IsActive = 1
      AND NOT EXISTS (SELECT 1 FROM [dbo].[SystemUserCompany] SUC WHERE SUC.SU_ID = SU.SU_ID AND SUC.IC_ID = SU.IC_ID);

    PRINT '  เพิ่มใน SystemUserCompany: ' + CAST(@@ROWCOUNT AS VARCHAR) + ' แถว';
END

PRINT '';

-- ==================== 6. แสดงผลหลังอัปเดต ====================
PRINT '--- 6. ตัวอย่าง SystemUser หลังอัปเดต (SR_ID=6, IC_ID=5) ---';

SELECT TOP (20)
    SU_ID, SU_Code, SU_Name1, SU_Username, SU_Active, SR_ID, IC_ID
FROM [dbo].[SystemUser]
WHERE SR_ID = 6 AND IC_ID = 5
ORDER BY SU_ID;

PRINT '';
PRINT 'เสร็จ';
