-- ============================================================
-- สร้าง GuardLocation Table สำหรับจัดการ Location ของยาม
-- ============================================================

PRINT '============================================================';
PRINT ' สร้าง GuardLocation Table';
PRINT '============================================================';

-- ตรวจสอบว่ามี Table อยู่แล้วหรือไม่
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GuardLocation]') AND type in (N'U'))
BEGIN
    PRINT 'Creating GuardLocation table...';

    CREATE TABLE [dbo].[GuardLocation] (
        GL_ID           INT IDENTITY(1,1) PRIMARY KEY,
        GL_Code         NVARCHAR(255) NOT NULL UNIQUE,
        GL_Name         NVARCHAR(100) NOT NULL,
        GL_Description  NVARCHAR(255) NULL,
        GL_Active       BIT NOT NULL DEFAULT 1,
        GL_CreatedAt    DATETIME DEFAULT GETDATE(),
        GL_CreatedBy    INT NULL,
        GL_UpdatedAt    DATETIME NULL,
        GL_UpdatedBy    INT NULL
    );

    -- Indexes
    CREATE INDEX IX_GuardLocation_Active ON [dbo].[GuardLocation](GL_Active);
    CREATE INDEX IX_GuardLocation_Code ON [dbo].[GuardLocation](GL_Code);

    PRINT '✅ GuardLocation table created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ GuardLocation table already exists';
END

PRINT '';
PRINT '============================================================';
PRINT '✅ GuardLocation table created successfully!';
PRINT '   Table is empty - ready for data input via UI';
PRINT '============================================================';
