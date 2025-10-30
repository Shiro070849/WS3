const sql = require('mssql');
const dbService = require('./db.service');

class SettingsService {
  // ==================== COMPANIES ====================

  // ดึงรายการบริษัททั้งหมด
  async getAllCompanies() {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT
          IC_ID,
          IC_Code,
          IC_LocalName,
          IC_EnglishName,
          IC_IsActive,
          IC_Remarks
        FROM [dbo].[InternalCompany]
        ORDER BY IC_Code ASC
      `;
      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting all companies:', error);
      throw error;
    }
  }

  // ดึงข้อมูลบริษัทตาม ID
  async getCompanyById(id) {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT
          IC_ID,
          IC_Code,
          IC_LocalName,
          IC_EnglishName,
          IC_IsActive,
          IC_Remarks
        FROM [dbo].[InternalCompany]
        WHERE IC_ID = @IC_ID
      `;
      const result = await pool.request()
        .input('IC_ID', sql.Int, id)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error getting company by ID:', error);
      throw error;
    }
  }

  // ดึงรายการบริษัทที่ user มีสิทธิ์เข้าถึง (สำหรับ Admin ให้เห็นทุกบริษัท)
  async getUserAccessibleCompanies(userId) {
    try {
      const pool = await dbService.connect();

      // TODO: ในอนาคตเช็คว่า user เป็น Admin หรือไม่
      // ตอนนี้ให้แสดงทุกบริษัทสำหรับทุก user (Admin mode)
      const query = `
        SELECT
          IC_ID,
          IC_Code,
          IC_LocalName,
          IC_EnglishName,
          IC_ShortLocalName,
          IC_ShortEnglishName
        FROM [dbo].[InternalCompany]
        WHERE IC_IsActive = 1
        ORDER BY IC_Code ASC
      `;
      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting user accessible companies:', error);
      throw error;
    }
  }

  // สร้างบริษัทใหม่
  async createCompany(data) {
    try {
      const pool = await dbService.connect();
      const query = `
        INSERT INTO [dbo].[InternalCompany] (
          IC_Code,
          IC_LocalName,
          IC_EnglishName,
          IC_IsActive,
          IC_Remarks
        )
        VALUES (
          @IC_Code,
          @IC_LocalName,
          @IC_EnglishName,
          @IC_IsActive,
          @IC_Remarks
        );
        SELECT SCOPE_IDENTITY() AS IC_ID;
      `;
      const result = await pool.request()
        .input('IC_Code', sql.NVarChar, data.code)
        .input('IC_LocalName', sql.NVarChar, data.localName)
        .input('IC_EnglishName', sql.NVarChar, data.englishName || null)
        .input('IC_IsActive', sql.Bit, data.isActive !== undefined ? data.isActive : 1)
        .input('IC_Remarks', sql.NVarChar, data.remarks || null)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  // แก้ไขข้อมูลบริษัท
  async updateCompany(id, data) {
    try {
      const pool = await dbService.connect();
      const query = `
        UPDATE [dbo].[InternalCompany]
        SET
          IC_Code = @IC_Code,
          IC_LocalName = @IC_LocalName,
          IC_EnglishName = @IC_EnglishName,
          IC_IsActive = @IC_IsActive,
          IC_Remarks = @IC_Remarks
        WHERE IC_ID = @IC_ID
      `;
      await pool.request()
        .input('IC_ID', sql.Int, id)
        .input('IC_Code', sql.NVarChar, data.code)
        .input('IC_LocalName', sql.NVarChar, data.localName)
        .input('IC_EnglishName', sql.NVarChar, data.englishName || null)
        .input('IC_IsActive', sql.Bit, data.isActive)
        .input('IC_Remarks', sql.NVarChar, data.remarks || null)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  // ลบบริษัท (Soft Delete)
  async deleteCompany(id) {
    try {
      const pool = await dbService.connect();
      const query = `
        UPDATE [dbo].[InternalCompany]
        SET IC_IsActive = 0
        WHERE IC_ID = @IC_ID
      `;
      await pool.request()
        .input('IC_ID', sql.Int, id)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  // ==================== USERS ====================

  // ดึงรายการ User ทั้งหมด
  async getAllUsers() {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT
          SU_ID,
          SU_Code,
          SU_Name1,
          SU_Name2,
          SU_Email,
          SU_Username,
          SU_Active,
          SU_LogOn,
          SU_PinCode,
          SU_Remarks
        FROM [dbo].[SystemUser]
        ORDER BY SU_Code ASC
      `;
      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // ดึงข้อมูล User ตาม ID
  async getUserById(id) {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT
          SU_ID,
          SU_Code,
          SU_Name1,
          SU_Name2,
          SU_Email,
          SU_Username,
          SU_Active,
          SU_LogOn,
          SU_PinCode,
          SU_Remarks
        FROM [dbo].[SystemUser]
        WHERE SU_ID = @SU_ID
      `;
      const result = await pool.request()
        .input('SU_ID', sql.Int, id)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // สร้าง User ใหม่
  async createUser(data) {
    try {
      const pool = await dbService.connect();
      const query = `
        INSERT INTO [dbo].[SystemUser] (
          SU_Code,
          SU_Name1,
          SU_Name2,
          SU_Email,
          SU_Username,
          SU_Password,
          SU_Active,
          SU_PinCode,
          SU_Remarks
        )
        VALUES (
          @SU_Code,
          @SU_Name1,
          @SU_Name2,
          @SU_Email,
          @SU_Username,
          @SU_Password,
          @SU_Active,
          @SU_PinCode,
          @SU_Remarks
        );
        SELECT SCOPE_IDENTITY() AS SU_ID;
      `;
      const result = await pool.request()
        .input('SU_Code', sql.NVarChar, data.code)
        .input('SU_Name1', sql.NVarChar, data.name1)
        .input('SU_Name2', sql.NVarChar, data.name2 || null)
        .input('SU_Email', sql.NVarChar, data.email || null)
        .input('SU_Username', sql.NVarChar, data.username)
        .input('SU_Password', sql.NVarChar, data.password)
        .input('SU_Active', sql.Bit, data.active !== undefined ? data.active : 1)
        .input('SU_PinCode', sql.NVarChar, data.pinCode || null)
        .input('SU_Remarks', sql.NVarChar, data.remarks || null)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // แก้ไขข้อมูล User
  async updateUser(id, data) {
    try {
      const pool = await dbService.connect();
      const query = `
        UPDATE [dbo].[SystemUser]
        SET
          SU_Code = @SU_Code,
          SU_Name1 = @SU_Name1,
          SU_Name2 = @SU_Name2,
          SU_Email = @SU_Email,
          SU_Username = @SU_Username,
          SU_Active = @SU_Active,
          SU_PinCode = @SU_PinCode,
          SU_Remarks = @SU_Remarks
        WHERE SU_ID = @SU_ID
      `;
      await pool.request()
        .input('SU_ID', sql.Int, id)
        .input('SU_Code', sql.NVarChar, data.code)
        .input('SU_Name1', sql.NVarChar, data.name1)
        .input('SU_Name2', sql.NVarChar, data.name2 || null)
        .input('SU_Email', sql.NVarChar, data.email || null)
        .input('SU_Username', sql.NVarChar, data.username)
        .input('SU_Active', sql.Bit, data.active)
        .input('SU_PinCode', sql.NVarChar, data.pinCode || null)
        .input('SU_Remarks', sql.NVarChar, data.remarks || null)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // รีเซ็ตรหัสผ่าน
  async resetPassword(id, newPassword) {
    try {
      const pool = await dbService.connect();
      const query = `
        UPDATE [dbo].[SystemUser]
        SET SU_Password = @SU_Password
        WHERE SU_ID = @SU_ID
      `;
      await pool.request()
        .input('SU_ID', sql.Int, id)
        .input('SU_Password', sql.NVarChar, newPassword)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // ลบ User (Soft Delete)
  async deleteUser(id) {
    try {
      const pool = await dbService.connect();
      const query = `
        UPDATE [dbo].[SystemUser]
        SET SU_Active = 0
        WHERE SU_ID = @SU_ID
      `;
      await pool.request()
        .input('SU_ID', sql.Int, id)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // ==================== DEPARTMENTS ====================

  // ดึงรายการแผนกทั้งหมด
  async getAllDepartments() {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT
          ID_ID,
          ID_Code,
          ID_LocalName,
          ID_EnglishName,
          ID_IsActive,
          ID_Remarks
        FROM [dbo].[InternalDepartment]
        ORDER BY ID_Code ASC
      `;
      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting all departments:', error);
      throw error;
    }
  }

  // ดึงข้อมูลแผนกตาม ID
  async getDepartmentById(id) {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT
          ID_ID,
          ID_Code,
          ID_LocalName,
          ID_EnglishName,
          ID_IsActive,
          ID_Remarks
        FROM [dbo].[InternalDepartment]
        WHERE ID_ID = @ID_ID
      `;
      const result = await pool.request()
        .input('ID_ID', sql.Int, id)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error getting department by ID:', error);
      throw error;
    }
  }

  // สร้างแผนกใหม่
  async createDepartment(data) {
    try {
      const pool = await dbService.connect();
      const query = `
        INSERT INTO [dbo].[InternalDepartment] (
          ID_Code,
          ID_LocalName,
          ID_EnglishName,
          ID_IsActive,
          ID_Remarks
        )
        VALUES (
          @ID_Code,
          @ID_LocalName,
          @ID_EnglishName,
          @ID_IsActive,
          @ID_Remarks
        );
        SELECT SCOPE_IDENTITY() AS ID_ID;
      `;
      const result = await pool.request()
        .input('ID_Code', sql.NVarChar, data.code)
        .input('ID_LocalName', sql.NVarChar, data.localName)
        .input('ID_EnglishName', sql.NVarChar, data.englishName || null)
        .input('ID_IsActive', sql.Bit, data.isActive !== undefined ? data.isActive : 1)
        .input('ID_Remarks', sql.NVarChar, data.remarks || null)
        .query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  // แก้ไขข้อมูลแผนก
  async updateDepartment(id, data) {
    try {
      const pool = await dbService.connect();
      const query = `
        UPDATE [dbo].[InternalDepartment]
        SET
          ID_Code = @ID_Code,
          ID_LocalName = @ID_LocalName,
          ID_EnglishName = @ID_EnglishName,
          ID_IsActive = @ID_IsActive,
          ID_Remarks = @ID_Remarks
        WHERE ID_ID = @ID_ID
      `;
      await pool.request()
        .input('ID_ID', sql.Int, id)
        .input('ID_Code', sql.NVarChar, data.code)
        .input('ID_LocalName', sql.NVarChar, data.localName)
        .input('ID_EnglishName', sql.NVarChar, data.englishName || null)
        .input('ID_IsActive', sql.Bit, data.isActive)
        .input('ID_Remarks', sql.NVarChar, data.remarks || null)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  // ลบแผนก (Soft Delete)
  async deleteDepartment(id) {
    try {
      const pool = await dbService.connect();
      const query = `
        UPDATE [dbo].[InternalDepartment]
        SET ID_IsActive = 0
        WHERE ID_ID = @ID_ID
      `;
      await pool.request()
        .input('ID_ID', sql.Int, id)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }

  // ==================== GENERAL SETTINGS ====================

  // Default values สำหรับ General Settings
  getDefaultGeneralSettings() {
    return {
      email: 'info@ruxchai.co.th',
      support_email: 'support@ruxchai.co.th',
      phone: '0855499392',
      website_url: '',
      language: 'th',
      timezone: 'Asia/Bangkok',
      date_format: 'DD/MM/YYYY',
      time_format: 'HH:mm'
    };
  }

  // ดึง General Settings (Company + SystemSettings)
  async getGeneralSettings(userId, companyId) {
    try {
      const pool = await dbService.connect();

      console.log(`🔍 getGeneralSettings - userId: ${userId}, companyId: ${companyId}`);

      // 1. ดึงข้อมูล Company ตาม companyId ที่ส่งมา
      const companyQuery = `
        SELECT
          IC.IC_ID,
          IC.IC_ShortLocalName,
          IC.IC_ShortEnglishName,
          IC.IC_LocalName,
          IC.IC_EnglishName
        FROM [dbo].[InternalCompany] IC
        WHERE IC.IC_ID = @IC_ID AND IC.IC_IsActive = 1
      `;
      const companyResult = await pool.request()
        .input('IC_ID', sql.Int, companyId)
        .query(companyQuery);

      const company = companyResult.recordset[0];

      if (!company) {
        throw new Error(`Company not found for ID: ${companyId}`);
      }

      console.log(`✅ Company found:`, company.IC_LocalName);

      // 2. ดึง SystemSettings
      const settingsQuery = `
        SELECT SS_Key, SS_Value
        FROM [dbo].[SystemSettings]
        WHERE SS_Category = 'general'
      `;
      const settingsResult = await pool.request().query(settingsQuery);

      // แปลง array เป็น object
      const settings = {};
      settingsResult.recordset.forEach(row => {
        const key = row.SS_Key.replace('general.', ''); // ลบ 'general.' prefix
        settings[key] = row.SS_Value;
      });

      // 3. รวมข้อมูล + ใช้ default ถ้าไม่มี
      const defaults = this.getDefaultGeneralSettings();
      return {
        system_name_th: company.IC_ShortLocalName || '',
        system_name_en: company.IC_ShortEnglishName || '',
        company_name_th: company.IC_LocalName || '',
        company_name_en: company.IC_EnglishName || '',
        email: settings.email || defaults.email,
        support_email: settings.support_email || defaults.support_email,
        phone: settings.phone || defaults.phone,
        website_url: settings.website_url || defaults.website_url,
        language: settings.language || defaults.language,
        timezone: settings.timezone || defaults.timezone,
        date_format: settings.date_format || defaults.date_format,
        time_format: settings.time_format || defaults.time_format
      };
    } catch (error) {
      console.error('Error getting general settings:', error);
      throw error;
    }
  }

  // บันทึก General Settings
  async updateGeneralSettings(userId, companyId, data) {
    try {
      const pool = await dbService.connect();

      console.log(`💾 updateGeneralSettings - userId: ${userId}, companyId: ${companyId}`);

      // 1. Update Company info (ชื่อระบบ + ชื่อบริษัท) ตาม companyId ที่ส่งมา
      const updateCompanyQuery = `
        UPDATE [dbo].[InternalCompany]
        SET
          IC_ShortLocalName = @IC_ShortLocalName,
          IC_ShortEnglishName = @IC_ShortEnglishName,
          IC_LocalName = @IC_LocalName,
          IC_EnglishName = @IC_EnglishName
        WHERE IC_ID = @IC_ID
      `;
      await pool.request()
        .input('IC_ID', sql.Int, companyId)
        .input('IC_ShortLocalName', sql.NVarChar, data.system_name_th)
        .input('IC_ShortEnglishName', sql.NVarChar, data.system_name_en)
        .input('IC_LocalName', sql.NVarChar, data.company_name_th)
        .input('IC_EnglishName', sql.NVarChar, data.company_name_en)
        .query(updateCompanyQuery);

      console.log(`✅ Company updated for IC_ID: ${companyId}`);

      // 2. Update/Insert SystemSettings (8 ฟิลด์)
      const settingsFields = [
        'email', 'support_email', 'phone', 'website_url',
        'language', 'timezone', 'date_format', 'time_format'
      ];

      for (const field of settingsFields) {
        const key = `${field}`; // ไม่ต้องใส่ prefix 'general.' เพราะมี SS_Category แล้ว
        const value = data[field] || '';

        // MERGE (INSERT or UPDATE)
        const mergeQuery = `
          MERGE [dbo].[SystemSettings] AS target
          USING (SELECT @SS_Key AS SS_Key) AS source
          ON target.SS_Key = source.SS_Key
          WHEN MATCHED THEN
            UPDATE SET
              SS_Value = @SS_Value,
              SS_UpdatedAt = GETDATE(),
              SS_UpdatedBy = @SS_UpdatedBy
          WHEN NOT MATCHED THEN
            INSERT (SS_Key, SS_Value, SS_Type, SS_Category, SS_UpdatedBy)
            VALUES (@SS_Key, @SS_Value, 'text', 'general', @SS_UpdatedBy);
        `;

        await pool.request()
          .input('SS_Key', sql.NVarChar, key)
          .input('SS_Value', sql.NVarChar, value)
          .input('SS_UpdatedBy', sql.Int, userId)
          .query(mergeQuery);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating general settings:', error);
      throw error;
    }
  }
}

module.exports = new SettingsService();
