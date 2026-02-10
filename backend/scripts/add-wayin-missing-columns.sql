-- ============================================================
-- เพิ่มคอลัมน์ที่ขาดในตาราง WayIn (แก้ Error: Invalid column name 'WI_ReprintOn', 'WI_Sequence')
-- ============================================================
-- รันบน DB ฝั่งเทส หรือ DB ที่ยังไม่มีคอลัมน์เหล่านี้
-- วิธีใช้: เลือก DB ใน SSMS แล้วรันทั้งไฟล์
-- ============================================================

PRINT 'Database: ' + DB_NAME();
PRINT '';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'WayIn' AND COLUMN_NAME = 'WI_Sequence')
BEGIN
    ALTER TABLE [dbo].[WayIn] ADD WI_Sequence INT NULL;
    PRINT '  + เพิ่ม WayIn.WI_Sequence';
END
ELSE
    PRINT '  OK: WayIn.WI_Sequence มีอยู่แล้ว';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'WayIn' AND COLUMN_NAME = 'WI_ReprintOn')
BEGIN
    ALTER TABLE [dbo].[WayIn] ADD WI_ReprintOn DATETIME NULL;
    PRINT '  + เพิ่ม WayIn.WI_ReprintOn';
END
ELSE
    PRINT '  OK: WayIn.WI_ReprintOn มีอยู่แล้ว';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'WayIn' AND COLUMN_NAME = 'WI_FromCompany')
BEGIN
    ALTER TABLE [dbo].[WayIn] ADD WI_FromCompany NVARCHAR(255) NULL;
    PRINT '  + เพิ่ม WayIn.WI_FromCompany';
END
ELSE
    PRINT '  OK: WayIn.WI_FromCompany มีอยู่แล้ว';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'WayIn' AND COLUMN_NAME = 'WI_ContactName')
BEGIN
    ALTER TABLE [dbo].[WayIn] ADD WI_ContactName NVARCHAR(255) NULL;
    PRINT '  + เพิ่ม WayIn.WI_ContactName';
END
ELSE
    PRINT '  OK: WayIn.WI_ContactName มีอยู่แล้ว';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'WayIn' AND COLUMN_NAME = 'WI_InternalDivision')
BEGIN
    ALTER TABLE [dbo].[WayIn] ADD WI_InternalDivision NVARCHAR(255) NULL;
    PRINT '  + เพิ่ม WayIn.WI_InternalDivision';
END
ELSE
    PRINT '  OK: WayIn.WI_InternalDivision มีอยู่แล้ว';

PRINT '';
PRINT 'เสร็จ — ลองโหลดหน้า Vehicle อีกครั้ง';
