-- ============================================================
-- เปิด Active ทุกบริษัท (InternalCompany)
-- วิธีใช้: เลือก Database ใน SSMS แล้วรัน
-- ============================================================

-- แสดงสถานะก่อนแก้
PRINT 'สถานะก่อนแก้ (InternalCompany):';
SELECT IC_ID, IC_Code, IC_LocalName, IC_IsActive
FROM [dbo].[InternalCompany]
ORDER BY IC_ID;

-- เปิด Active ทุกบริษัท
UPDATE [dbo].[InternalCompany]
SET IC_IsActive = 1
WHERE IC_IsActive = 0 OR IC_IsActive IS NULL;

PRINT '';
PRINT 'อัปเดตแล้ว: ตั้ง IC_IsActive = 1 ให้ทุกบริษัทที่ปิดอยู่';
PRINT 'จำนวนแถวที่แก้: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- แสดงสถานะหลังแก้
PRINT '';
PRINT 'สถานะหลังแก้:';
SELECT IC_ID, IC_Code, IC_LocalName, IC_IsActive
FROM [dbo].[InternalCompany]
ORDER BY IC_ID;
