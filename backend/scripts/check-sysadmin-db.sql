-- ============================================================
-- เช็คใน DB ว่า user sysadmin ตั้งค่าถูกหรือไม่ (ให้เห็นทุกบริษัท)
-- วิธีใช้: เลือก Database ใน SSMS แล้วรัน
-- ============================================================
-- สิทธิ์ Super Admin = IC_ID ต้องเป็น NULL (ไม่ใช้ SR_ID)

PRINT '1. ข้อมูล user sysadmin ใน SystemUser';
SELECT
    SU_ID,
    SU_Username,
    SU_Name1,
    IC_ID   AS 'IC_ID (ต้อง NULL = เห็นทุกบริษัท)',
    SR_ID   AS 'SR_ID'
FROM [dbo].[SystemUser]
WHERE SU_Username = 'sysadmin' OR SU_ID = 7777;

PRINT '';
PRINT '2. แถวใน SystemUserCompany ของ sysadmin (ถ้ามี = ระบบอาจใช้กรองบริษัท)';
SELECT SUC_ID, SU_ID, IC_ID, SUC_IsActive
FROM [dbo].[SystemUserCompany]
WHERE SU_ID IN (SELECT SU_ID FROM [dbo].[SystemUser] WHERE SU_Username = 'sysadmin' OR SU_ID = 7777);

PRINT '';
PRINT 'สรุป: ถ้า IC_ID ไม่ใช่ NULL หรือมีแถวใน SystemUserCompany → รัน fix-sysadmin-see-all-companies.sql';
