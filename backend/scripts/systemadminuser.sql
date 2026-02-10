-- สคริปต์สร้าง/อัปเดต User sysadmin (Super Admin ทุกบริษัท)
-- วิธีใช้:
--   1) เลือก Database ให้ถูกใน SSMS
--   2) รันไฟล์นี้ทั้งไฟล์

DECLARE @ExistingId INT;

SELECT TOP 1 @ExistingId = SU_ID
FROM [dbo].[SystemUser]
WHERE SU_ID = 7777 OR SU_Username = 'sysadmin';

IF @ExistingId IS NULL
BEGIN
    PRINT 'สร้าง User sysadmin (SU_ID = 7777) ใหม่';

    SET IDENTITY_INSERT [dbo].[SystemUser] ON;

    INSERT INTO [dbo].[SystemUser] (
        SU_ID,
        SU_Code,
        SU_Name1,
        SU_Name2,
        SU_Email,
        SU_Username,
        SU_Password,
        SU_Remarks,
        SU_Active,
        SU_LogOn,
        SU_PinCode,
        User_Location,
        IC_ID,
        SR_ID
    )
    VALUES (
        7777,               -- SU_ID
        '7777',             -- SU_Code
        N'Systemadmin',     -- SU_Name1
        N'Systemadmin',     -- SU_Name2
        NULL,               -- SU_Email
        'sysadmin',         -- SU_Username
        'simpleadmin',      -- SU_Password
        N'Super Admin',     -- SU_Remarks
        1,                  -- SU_Active
        0,                  -- SU_LogOn
        NULL,               -- SU_PinCode
        NULL,               -- User_Location
        NULL,               -- IC_ID = NULL → Super Admin (ทุกบริษัท)
        1                   -- SR_ID = 1
    );

    SET IDENTITY_INSERT [dbo].[SystemUser] OFF;
END
ELSE
BEGIN
    PRINT 'พบ User sysadmin อยู่แล้ว → อัปเดตข้อมูล (ใช้ SU_ID เดิม: ' + CAST(@ExistingId AS VARCHAR(10)) + ')';

    UPDATE [dbo].[SystemUser]
    SET
        SU_Code       = '7777',
        SU_Name1      = N'Systemadmin',
        SU_Name2      = N'Systemadmin',
        SU_Email      = NULL,
        SU_Username   = 'sysadmin',
        SU_Password   = 'simpleadmin',
        SU_Remarks    = N'Super Admin',
        SU_Active     = 1,
        SU_LogOn      = 0,
        SU_PinCode    = NULL,
        User_Location = NULL,
        IC_ID         = NULL,   -- Super Admin
        SR_ID         = 1
    WHERE SU_ID = @ExistingId;
END;

PRINT 'เสร็จสิ้นการตั้งค่า user sysadmin';