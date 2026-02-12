-- ============================================================
-- แก้ให้ user sysadmin เห็นทุกบริษัท (Super Admin)
-- ============================================================
-- สาเหตุ: ระบบใช้คอลัมน์ IC_ID ใน SystemUser ในการตัดสินว่าเป็น Super Admin
--   - IC_ID = NULL  → Super Admin (เห็นทุกบริษัท)
--   - IC_ID มีค่า   → User ปกติ (เห็นเฉพาะบริษัทใน SystemUserCompany หรือ IC_ID นั้น)
-- SR_ID ไม่ต้องเป็น NULL — ใช้ 1 (ADM) ได้ตามปกติ
--
-- วิธีใช้: เลือก Database ใน SSMS แล้วรันทั้งไฟล์
-- ============================================================

PRINT 'ตรวจสอบและแก้ไข user sysadmin ให้ IC_ID = NULL (เห็นทุกบริษัท)';
PRINT '';

-- 1. แสดงสถานะก่อนแก้
SELECT
    SU_ID,
    SU_Username,
    SU_Name1,
    IC_ID AS 'IC_ID (ต้องเป็น NULL สำหรับ Super Admin)',
    SR_ID AS 'SR_ID (1 = ADM ใช้ได้)'
FROM [dbo].[SystemUser]
WHERE SU_Username = 'sysadmin' OR SU_ID = 7777;

-- 2. ตั้ง IC_ID = NULL สำหรับ sysadmin (และลบแถวใน SystemUserCompany ถ้ามี)
UPDATE [dbo].[SystemUser]
SET IC_ID = NULL
WHERE (SU_Username = 'sysadmin' OR SU_ID = 7777)
  AND IC_ID IS NOT NULL;

IF @@ROWCOUNT > 0
    PRINT 'อัปเดต SystemUser: ตั้ง IC_ID = NULL สำหรับ sysadmin แล้ว';
ELSE
    PRINT 'SystemUser: sysadmin มี IC_ID = NULL อยู่แล้ว';

-- 3. (Optional) ลบแถวใน SystemUserCompany ของ sysadmin — Super Admin ไม่ต้องมีแถว here
DELETE FROM [dbo].[SystemUserCompany]
WHERE SU_ID IN (SELECT SU_ID FROM [dbo].[SystemUser] WHERE SU_Username = 'sysadmin' OR SU_ID = 7777);

IF @@ROWCOUNT > 0
    PRINT 'ลบแถว SystemUserCompany ของ sysadmin แล้ว (Super Admin ใช้ IC_ID = NULL ไม่ใช้ตารางนี้)';

-- 4. แสดงสถานะหลังแก้
PRINT '';
PRINT 'สถานะหลังแก้:';
SELECT
    SU_ID,
    SU_Username,
    IC_ID AS 'IC_ID (NULL = เห็นทุกบริษัท)',
    SR_ID AS 'SR_ID'
FROM [dbo].[SystemUser]
WHERE SU_Username = 'sysadmin' OR SU_ID = 7777;

PRINT '';
PRINT 'เสร็จสิ้น — ลอง login ใหม่แล้วเปิด Dashboard ควรเห็นบริษัททั้งหมด';
