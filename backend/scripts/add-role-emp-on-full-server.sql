-- ============================================================
-- เพิ่ม Role Emp (Employees) บน SERVER ตัวเต็ม (ฝั่งสมบูรณ์)
-- ============================================================
-- ใช้รันบน DB ฝั่งที่ใช้งานอยู่แล้ว (ไม่เกี่ยวกับฝั่งเทส)
-- สิทธิ์เหมือน QA/RCT: Dashboard, Reports, Visit, Statistics (ไม่มี Settings)
--
-- วิธีใช้:
--   1. ใน SSMS เลือก Database เป็น DB ฝั่งตัวเต็ม (ที่ใช้งานอยู่)
--   2. รันทั้งไฟล์
-- ============================================================

PRINT 'Database: ' + DB_NAME();
PRINT '';

-- สร้าง Role Emp ถ้ายังไม่มี
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRole] WHERE SR_Code = 'Emp')
BEGIN
    INSERT INTO [dbo].[SystemRole] (SR_Code, SR_Name, SR_Active)
    VALUES ('Emp', N'Employees', 1);
    PRINT 'เพิ่ม Role: Emp (Employees) แล้ว';
END
ELSE
    PRINT 'Role Emp มีอยู่แล้ว';

PRINT '';

DECLARE @RoleEmp INT = (SELECT SR_ID FROM [dbo].[SystemRole] WHERE SR_Code = 'Emp');

IF @RoleEmp IS NULL
BEGIN
    PRINT 'ERROR: ไม่พบ Role Emp';
    RETURN;
END

-- สิทธิ์เหมือน QA/RCT: 2000 Dashboard, 1000 Reports, 1100 Visit, 3000 Statistics (Global)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleEmp AND SS_ID = 2000 AND IC_ID IS NULL)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleEmp, 2000, NULL, '', '');
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleEmp AND SS_ID = 1000 AND IC_ID IS NULL)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleEmp, 1000, NULL, '', '');
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleEmp AND SS_ID = 1100 AND IC_ID IS NULL)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleEmp, 1100, NULL, '', '');
IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemRoleSystemScreen] WHERE SR_ID = @RoleEmp AND SS_ID = 3000 AND IC_ID IS NULL)
    INSERT INTO [dbo].[SystemRoleSystemScreen] (SR_ID, SS_ID, IC_ID, SRSS_HiddenFieldIds, SRSS_ReadOnlyFieldIds) VALUES (@RoleEmp, 3000, NULL, '', '');

PRINT 'ตั้งค่าสิทธิ์ Emp (Dashboard, Reports, Visit, Statistics) เสร็จ';
PRINT '';

-- แสดงผล
SELECT SR_ID, SR_Code, SR_Name, SR_Active FROM [dbo].[SystemRole] WHERE SR_Code = 'Emp';
SELECT srss.SR_ID, sr.SR_Code, srss.SS_ID, ss.SS_Name, srss.IC_ID
FROM [dbo].[SystemRoleSystemScreen] srss
INNER JOIN [dbo].[SystemRole] sr ON srss.SR_ID = sr.SR_ID
INNER JOIN [dbo].[SystemScreen] ss ON srss.SS_ID = ss.SS_ID
WHERE sr.SR_Code = 'Emp'
ORDER BY srss.SS_ID;
