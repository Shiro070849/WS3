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
}

module.exports = new SettingsService();
