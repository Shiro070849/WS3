-- ตรวจสอบ Permissions ของ Roles: HRU, RCT, QA
USE [SmartSecurity];
GO

-- Query 1: ดู Permissions ของแต่ละ Role
SELECT 
    SR.SR_Code, 
    SR.SR_Name, 
    SRSS.SS_ID, 
    SS.SS_Name,
    SS.SS_RelativePath
FROM [dbo].[SystemRoleSystemScreen] SRSS
INNER JOIN [dbo].[SystemRole] SR ON SRSS.SR_ID = SR.SR_ID
INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
WHERE SR.SR_Code IN ('HRU', 'RCT', 'QA')
ORDER BY SR.SR_Code, SRSS.SS_ID;

-- Query 2: ดู Users ที่มี Roles เหล่านี้ (เพื่อดูว่าใช้กับบริษัทไหน)
SELECT 
    SU.SU_ID,
    SU.SU_Code,
    SU.SU_Name1,
    SU.IC_ID,
    IC.IC_Code,
    IC.IC_LocalName,
    SR.SR_Code,
    SR.SR_Name
FROM [dbo].[SystemUser] SU
INNER JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
WHERE SR.SR_Code IN ('HRU', 'RCT', 'QA')
ORDER BY SR.SR_Code, SU.IC_ID;

