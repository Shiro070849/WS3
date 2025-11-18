const sql = require('mssql');
const dbService = require('./db.service');
const { encrypt, decrypt } = require('../utils/encryption');

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
          IC_Remarks,
          IC_LogoPath
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
          IC_Remarks,
          IC_LogoPath
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

      // ดึง IC_ID ของ user ก่อน
      const userQuery = `
        SELECT IC_ID
        FROM [dbo].[SystemUser]
        WHERE SU_ID = @UserId
      `;
      const userResult = await pool.request()
        .input('UserId', sql.Int, userId)
        .query(userQuery);

      if (userResult.recordset.length === 0) {
        throw new Error('User not found');
      }

      const userCompanyId = userResult.recordset[0].IC_ID;
      console.log(`📌 User ${userId} belongs to company IC_ID: ${userCompanyId}`);

      // ถ้าเป็น Super Admin (IC_ID = NULL) ให้เห็นทุกบริษัท
      // ถ้าเป็น Admin ย่อย ให้เห็นเฉพาะบริษัทตัวเอง
      let query;
      let result;

      if (userCompanyId === null || userCompanyId === undefined) {
        // Super Admin (IC_ID = NULL): เห็นทุกบริษัท
        query = `
          SELECT
            IC_ID,
            IC_Code,
            IC_LocalName,
            IC_EnglishName,
            IC_ShortLocalName,
            IC_ShortEnglishName,
            IC_LogoPath
          FROM [dbo].[InternalCompany]
          WHERE IC_IsActive = 1
          ORDER BY IC_Code ASC
        `;
        result = await pool.request().query(query);
        console.log(`✅ Super Admin (IC_ID = NULL): คืนทุกบริษัท (${result.recordset.length} บริษัท)`);
      } else {
        // Admin ย่อย: เห็นเฉพาะบริษัทตัวเอง
        query = `
          SELECT
            IC_ID,
            IC_Code,
            IC_LocalName,
            IC_EnglishName,
            IC_ShortLocalName,
            IC_ShortEnglishName,
            IC_LogoPath
          FROM [dbo].[InternalCompany]
          WHERE IC_ID = @CompanyId AND IC_IsActive = 1
          ORDER BY IC_Code ASC
        `;
        result = await pool.request()
          .input('CompanyId', sql.Int, userCompanyId)
          .query(query);
        console.log(`✅ Admin ย่อย: คืนเฉพาะบริษัท IC_ID = ${userCompanyId}`);
      }

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
          IC_Remarks,
          IC_LogoPath
        )
        VALUES (
          @IC_Code,
          @IC_LocalName,
          @IC_EnglishName,
          @IC_IsActive,
          @IC_Remarks,
          @IC_LogoPath
        );
        SELECT SCOPE_IDENTITY() AS IC_ID;
      `;
      const result = await pool.request()
        .input('IC_Code', sql.NVarChar, data.code)
        .input('IC_LocalName', sql.NVarChar, data.localName)
        .input('IC_EnglishName', sql.NVarChar, data.englishName || null)
        .input('IC_IsActive', sql.Bit, data.isActive !== undefined ? data.isActive : 1)
        .input('IC_Remarks', sql.NVarChar, data.remarks || null)
        .input('IC_LogoPath', sql.NVarChar, data.logoPath || null)
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
          IC_Remarks = @IC_Remarks,
          IC_LogoPath = @IC_LogoPath
        WHERE IC_ID = @IC_ID
      `;
      await pool.request()
        .input('IC_ID', sql.Int, id)
        .input('IC_Code', sql.NVarChar, data.code)
        .input('IC_LocalName', sql.NVarChar, data.localName)
        .input('IC_EnglishName', sql.NVarChar, data.englishName || null)
        .input('IC_IsActive', sql.Bit, data.isActive)
        .input('IC_Remarks', sql.NVarChar, data.remarks || null)
        .input('IC_LogoPath', sql.NVarChar, data.logoPath || null)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  // อัพเดต Logo Path ของบริษัท
  async updateCompanyLogo(id, logoPath) {
    try {
      const pool = await dbService.connect();
      const query = `
        UPDATE [dbo].[InternalCompany]
        SET IC_LogoPath = @IC_LogoPath
        WHERE IC_ID = @IC_ID
      `;
      await pool.request()
        .input('IC_ID', sql.Int, id)
        .input('IC_LogoPath', sql.NVarChar, logoPath)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error updating company logo:', error);
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

  // ดึงรายการ User ทั้งหมด (พร้อมชื่อบริษัทและ Role)
  async getAllUsers() {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT
          SU.SU_ID,
          SU.SU_Code,
          SU.SU_Name1,
          SU.SU_Name2,
          SU.SU_Email,
          SU.SU_Username,
          SU.SU_Active,
          SU.SU_LogOn,
          SU.SU_PinCode,
          SU.SU_Remarks,
          SU.IC_ID,
          SU.SR_ID,
          IC.IC_LocalName AS CompanyName,
          SR.SR_Name,
          SR.SR_Code
        FROM [dbo].[SystemUser] SU
        LEFT JOIN [dbo].[InternalCompany] IC ON SU.IC_ID = IC.IC_ID
        LEFT JOIN [dbo].[SystemRole] SR ON SU.SR_ID = SR.SR_ID
        ORDER BY SU.SU_Code ASC
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
          SU_Remarks,
          IC_ID,
          SR_ID,
          SU_LogOn
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
          @SU_Remarks,
          @IC_ID,
          @SR_ID,
          GETDATE()
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
        .input('IC_ID', sql.Int, data.companyId)
        .input('SR_ID', sql.Int, data.roleId || null)
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
          SU_Remarks = @SU_Remarks,
          IC_ID = @IC_ID,
          SR_ID = @SR_ID
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
        .input('IC_ID', sql.Int, data.companyId)
        .input('SR_ID', sql.Int, data.roleId || null)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // รีเซ็ตรหัสผ่าน (พร้อม validation และ audit log)
  async resetPassword(id, newPassword, adminId, adminIP) {
    try {
      const pool = await dbService.connect();

      // 1. ตรวจสอบว่า user มีอยู่จริงหรือไม่
      const userQuery = `
        SELECT SU_ID, SU_Username, SU_Name1, IC_ID
        FROM [dbo].[SystemUser]
        WHERE SU_ID = @SU_ID
      `;
      const userResult = await pool.request()
        .input('SU_ID', sql.Int, id)
        .query(userQuery);

      if (userResult.recordset.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.recordset[0];
      console.log(`🔐 Resetting password for user: ${user.SU_Username} (SU_ID: ${id})`);

      // 2. Validate password (8+ chars, A-Z, a-z, 0-9)
      if (!newPassword || newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      if (!/[A-Z]/.test(newPassword)) {
        throw new Error('Password must contain at least one uppercase letter (A-Z)');
      }
      if (!/[a-z]/.test(newPassword)) {
        throw new Error('Password must contain at least one lowercase letter (a-z)');
      }
      if (!/[0-9]/.test(newPassword)) {
        throw new Error('Password must contain at least one number (0-9)');
      }
      if (newPassword.length > 50) {
        throw new Error('Password cannot exceed 50 characters');
      }

      // 3. Update password
      const updateQuery = `
        UPDATE [dbo].[SystemUser]
        SET SU_Password = @SU_Password
        WHERE SU_ID = @SU_ID
      `;
      await pool.request()
        .input('SU_ID', sql.Int, id)
        .input('SU_Password', sql.NVarChar(50), newPassword)
        .query(updateQuery);

      console.log(`✅ Password updated for SU_ID: ${id}`);

      // 4. Log to ConnectionHistory (Audit Log)
      const logQuery = `
        INSERT INTO [dbo].[ConnectionHistory] (
          SU_ID, CH_RecordedOn, CH_IPAddress, CH_EventType
        ) VALUES (
          @SU_ID, GETDATE(), @CH_IPAddress, @CH_EventType
        )
      `;
      await pool.request()
        .input('SU_ID', sql.Int, id)
        .input('CH_IPAddress', sql.NVarChar(15), adminIP || 'Unknown')
        .input('CH_EventType', sql.NVarChar(50), `PasswordChanged_By_Admin_${adminId}`)
        .query(logQuery);

      console.log(`📝 Audit log created: PasswordChanged for SU_ID ${id} by Admin ${adminId}`);

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

  // Validate Hierarchy Rules
  async validateDepartmentHierarchy(type, parentId, pool) {
    // Rule 1: office type must have a parent
    if (type === 'office' && !parentId) {
      throw new Error('สำนัก (office) จำเป็นต้องอยู่ภายใต้สาขา (branch)');
    }

    // Rule 2: If parent is specified, validate parent type based on child type
    if (parentId) {
      const parentQuery = `SELECT ID_Type FROM [dbo].[InternalDepartment] WHERE ID_ID = @ParentId`;
      const parentResult = await pool.request()
        .input('ParentId', sql.Int, parentId)
        .query(parentQuery);

      if (parentResult.recordset.length === 0) {
        throw new Error('Parent department not found');
      }

      const parentType = parentResult.recordset[0].ID_Type;

      // Validate based on child type
      if (type === 'branch') {
        // branch can only have parent of type 'branch'
        if (parentType !== 'branch') {
          throw new Error('สาขา (branch) สามารถอยู่ภายใต้สาขาอื่นเท่านั้น');
        }
      } else if (type === 'office') {
        // office must have parent of type 'branch'
        if (parentType !== 'branch') {
          throw new Error('สำนัก (office) ต้องอยู่ภายใต้สาขา (branch) เท่านั้น');
        }
      } else if (type === 'department') {
        // department can have parent of type 'branch' or 'office'
        if (parentType !== 'branch' && parentType !== 'office') {
          throw new Error('แผนก (department) สามารถอยู่ภายใต้สาขา (branch) หรือสำนัก (office) เท่านั้น');
        }
      }
    }

    return true;
  }

  // สร้างแผนกใหม่
  async createDepartment(data) {
    try {
      const pool = await dbService.connect();

      // Validate hierarchy rules
      await this.validateDepartmentHierarchy(data.type || 'department', data.parentId || null, pool);

      const query = `
        INSERT INTO [dbo].[InternalDepartment] (
          ID_Code,
          ID_LocalName,
          ID_EnglishName,
          ID_Type,
          Parent_ID_ID,
          ID_IsActive,
          ID_Remarks
        )
        VALUES (
          @ID_Code,
          @ID_LocalName,
          @ID_EnglishName,
          @ID_Type,
          @Parent_ID_ID,
          @ID_IsActive,
          @ID_Remarks
        );
        SELECT SCOPE_IDENTITY() AS ID_ID;
      `;
      const result = await pool.request()
        .input('ID_Code', sql.NVarChar, data.code)
        .input('ID_LocalName', sql.NVarChar, data.localName)
        .input('ID_EnglishName', sql.NVarChar, data.englishName || null)
        .input('ID_Type', sql.NVarChar, data.type || 'department')
        .input('Parent_ID_ID', sql.Int, data.parentId || null)
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

      // Validate hierarchy rules
      await this.validateDepartmentHierarchy(data.type || 'department', data.parentId || null, pool);

      const query = `
        UPDATE [dbo].[InternalDepartment]
        SET
          ID_Code = @ID_Code,
          ID_LocalName = @ID_LocalName,
          ID_EnglishName = @ID_EnglishName,
          ID_Type = @ID_Type,
          Parent_ID_ID = @Parent_ID_ID,
          ID_IsActive = @ID_IsActive,
          ID_Remarks = @ID_Remarks
        WHERE ID_ID = @ID_ID
      `;
      await pool.request()
        .input('ID_ID', sql.Int, id)
        .input('ID_Code', sql.NVarChar, data.code)
        .input('ID_LocalName', sql.NVarChar, data.localName)
        .input('ID_EnglishName', sql.NVarChar, data.englishName || null)
        .input('ID_Type', sql.NVarChar, data.type || 'department')
        .input('Parent_ID_ID', sql.Int, data.parentId || null)
        .input('ID_IsActive', sql.Bit, data.isActive)
        .input('ID_Remarks', sql.NVarChar, data.remarks || null)
        .query(query);
      return { success: true };
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  // เชื่อมแผนกกับบริษัท (Insert Junction Table)
  async linkDepartmentToCompany(departmentId, companyId) {
    try {
      const pool = await dbService.connect();

      // ตรวจสอบว่ามีการเชื่อมอยู่แล้วหรือไม่
      const checkQuery = `
        SELECT ICD_ID
        FROM [dbo].[InternalCompanyDepartment]
        WHERE IC_ID = @IC_ID AND ID_ID = @ID_ID
      `;
      const checkResult = await pool.request()
        .input('IC_ID', sql.Int, companyId)
        .input('ID_ID', sql.Int, departmentId)
        .query(checkQuery);

      if (checkResult.recordset.length > 0) {
        console.log('⚠️ Department already linked to company');
        return { success: true, alreadyExists: true };
      }

      // สร้างการเชื่อม
      const insertQuery = `
        INSERT INTO [dbo].[InternalCompanyDepartment] (
          IC_ID,
          ID_ID,
          ICD_IsActive
        )
        VALUES (
          @IC_ID,
          @ID_ID,
          1
        );
        SELECT SCOPE_IDENTITY() AS ICD_ID;
      `;
      const result = await pool.request()
        .input('IC_ID', sql.Int, companyId)
        .input('ID_ID', sql.Int, departmentId)
        .query(insertQuery);

      return { success: true, id: result.recordset[0].ICD_ID };
    } catch (error) {
      console.error('Error linking department to company:', error);
      throw error;
    }
  }

  // ย้ายแผนกไปอยู่ภายใต้ Parent อื่น
  async moveDepartment(id, newParentId) {
    try {
      const pool = await dbService.connect();

      // ตรวจสอบว่าไม่ใช่ Circular Reference (ไม่ให้ย้ายไปเป็นลูกของตัวเอง)
      if (id === newParentId) {
        throw new Error('Cannot move department to itself');
      }

      // ดึงข้อมูลแผนกที่จะย้าย เพื่อตรวจสอบ Type
      const deptQuery = `SELECT ID_Type FROM [dbo].[InternalDepartment] WHERE ID_ID = @ID`;
      const deptResult = await pool.request()
        .input('ID', sql.Int, id)
        .query(deptQuery);

      if (deptResult.recordset.length === 0) {
        throw new Error('Department not found');
      }

      const deptType = deptResult.recordset[0].ID_Type;

      // Validate hierarchy rules before moving
      await this.validateDepartmentHierarchy(deptType, newParentId, pool);

      // Update Parent_ID_ID
      const query = `
        UPDATE [dbo].[InternalDepartment]
        SET Parent_ID_ID = @Parent_ID_ID
        WHERE ID_ID = @ID_ID
      `;
      await pool.request()
        .input('ID_ID', sql.Int, id)
        .input('Parent_ID_ID', sql.Int, newParentId)
        .query(query);

      return { success: true };
    } catch (error) {
      console.error('Error moving department:', error);
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

  // ==================== COMPANY DEPARTMENTS (JUNCTION TABLE) ====================

  // ดึงความสัมพันธ์บริษัท-แผนก (InternalCompanyDepartment)
  async getCompanyDepartments() {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT
          ICD_ID,
          IC_ID,
          ID_ID,
          ICD_IsActive
        FROM [dbo].[InternalCompanyDepartment]
        ORDER BY IC_ID, ID_ID
      `;
      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting company-department relations:', error);
      throw error;
    }
  }

  // ดึงรายการแผนกของบริษัท (Flat List)
  async getDepartmentTree(companyId) {
    try {
      const pool = await dbService.connect();

      // Query แบบธรรมดา ส่งกลับเป็น Flat List
      const query = `
        SELECT
          d.ID_ID,
          d.ID_Code,
          d.ID_LocalName,
          d.ID_EnglishName,
          d.ID_Type,
          d.Parent_ID_ID,
          d.ID_IsActive,
          d.ID_Remarks
        FROM [dbo].[InternalDepartment] d
        INNER JOIN [dbo].[InternalCompanyDepartment] cd ON d.ID_ID = cd.ID_ID
        WHERE cd.IC_ID = @CompanyId
          AND cd.ICD_IsActive = 1
          AND d.ID_IsActive = 1
        ORDER BY d.ID_Code;
      `;

      const result = await pool.request()
        .input('CompanyId', sql.Int, companyId)
        .query(query);

      // แปลง Flat List เป็น Tree Structure
      return this.buildTree(result.recordset);
    } catch (error) {
      console.error('Error getting department list:', error);
      throw error;
    }
  }

  // Helper Function: แปลง Flat List เป็น Tree Structure
  buildTree(flatList) {
    const map = {};
    const tree = [];

    // สร้าง map สำหรับ lookup
    flatList.forEach(item => {
      map[item.ID_ID] = { ...item, children: [] };
    });

    // สร้าง tree โดยเชื่อม parent-child
    flatList.forEach(item => {
      if (item.Parent_ID_ID === null) {
        // Root level
        tree.push(map[item.ID_ID]);
      } else {
        // Child level
        const parent = map[item.Parent_ID_ID];
        if (parent) {
          parent.children.push(map[item.ID_ID]);
        }
      }
    });

    return tree;
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

      // 2. ดึง SystemSettings (รองรับทั้ง Company-specific และ Global)
      const settingsQuery = `
        SELECT SS_Key, SS_Value, IC_ID
        FROM [dbo].[SystemSettings]
        WHERE SS_Category = 'general'
          AND (IC_ID = @IC_ID OR IC_ID IS NULL)
      `;
      const settingsResult = await pool.request()
        .input('IC_ID', sql.Int, companyId)
        .query(settingsQuery);

      // แปลง array เป็น object โดยให้ Company-specific override Global
      const settings = {};
      const companySettings = {};
      const globalSettings = {};

      settingsResult.recordset.forEach(row => {
        const key = row.SS_Key.replace('general.', ''); // ลบ 'general.' prefix
        if (row.IC_ID === companyId) {
          // Company-specific settings
          companySettings[key] = row.SS_Value;
        } else if (row.IC_ID === null) {
          // Global settings
          globalSettings[key] = row.SS_Value;
        }
      });

      // Merge: Company-specific override Global
      Object.assign(settings, globalSettings, companySettings);

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

        // MERGE (INSERT or UPDATE) สำหรับบริษัทเฉพาะ
        const mergeQuery = `
          MERGE [dbo].[SystemSettings] AS target
          USING (SELECT @SS_Key AS SS_Key, @IC_ID AS IC_ID) AS source
          ON target.SS_Key = source.SS_Key AND target.IC_ID = source.IC_ID
          WHEN MATCHED THEN
            UPDATE SET
              SS_Value = @SS_Value,
              SS_UpdatedAt = GETDATE(),
              SS_UpdatedBy = @SS_UpdatedBy
          WHEN NOT MATCHED THEN
            INSERT (SS_Key, SS_Value, SS_Type, SS_Category, SS_UpdatedBy, IC_ID)
            VALUES (@SS_Key, @SS_Value, 'text', 'general', @SS_UpdatedBy, @IC_ID);
        `;

        await pool.request()
          .input('SS_Key', sql.NVarChar, key)
          .input('SS_Value', sql.NVarChar, value)
          .input('SS_UpdatedBy', sql.Int, userId)
          .input('IC_ID', sql.Int, companyId)
          .query(mergeQuery);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating general settings:', error);
      throw error;
    }
  }

  // ==================== APPEARANCE SETTINGS ====================

  // Default Appearance Settings
  getDefaultAppearanceSettings() {
    return {
      logo_url: '',
      favicon_url: '',
      primary_color: '#0090D3',
      secondary_color: '#6B7280',
      accent_color: '#10B981',
      background_color: '#FFFFFF',
      text_color: '#1A202C'
    };
  }

  // ดึง Appearance Settings
  async getAppearanceSettings(userId, companyId) {
    try {
      const pool = await dbService.connect();

      console.log(`[GET] Fetching appearance settings - userId: ${userId}, companyId: ${companyId}`);

      // 1. ตรวจสอบว่ามีข้อมูลหรือยัง
      const checkQuery = `
        SELECT COUNT(*) as count
        FROM [dbo].[SystemSettings]
        WHERE IC_ID = @IC_ID AND SS_Category = 'appearance'
      `;
      const checkResult = await pool.request()
        .input('IC_ID', sql.Int, companyId)
        .query(checkQuery);

      const hasData = checkResult.recordset[0].count > 0;

      // 2. ถ้าไม่มีข้อมูล -> สร้างข้อมูล Default ให้ทันที
      if (!hasData) {
        console.log(`[AUTO-CREATE] Creating default appearance settings for IC_ID: ${companyId}`);
        await this.createDefaultAppearanceSettings(userId, companyId);
      }

      // 3. ดึง SystemSettings (รองรับทั้ง Company-specific และ Global)
      const settingsQuery = `
        SELECT SS_Key, SS_Value, IC_ID
        FROM [dbo].[SystemSettings]
        WHERE SS_Category = 'appearance'
          AND (IC_ID = @IC_ID OR IC_ID IS NULL)
      `;
      const settingsResult = await pool.request()
        .input('IC_ID', sql.Int, companyId)
        .query(settingsQuery);

      // แปลง array เป็น object โดยให้ Company-specific override Global
      const settings = {};
      const companySettings = {};
      const globalSettings = {};

      settingsResult.recordset.forEach(row => {
        const key = row.SS_Key;
        if (row.IC_ID === companyId) {
          companySettings[key] = row.SS_Value;
        } else if (row.IC_ID === null) {
          globalSettings[key] = row.SS_Value;
        }
      });

      // Merge: Company-specific override Global
      Object.assign(settings, globalSettings, companySettings);

      // Apply defaults
      const defaults = this.getDefaultAppearanceSettings();
      return {
        logo_url: settings.logo_url || defaults.logo_url,
        favicon_url: settings.favicon_url || defaults.favicon_url,
        primary_color: settings.primary_color || defaults.primary_color,
        secondary_color: settings.secondary_color || defaults.secondary_color,
        accent_color: settings.accent_color || defaults.accent_color,
        background_color: settings.background_color || defaults.background_color,
        text_color: settings.text_color || defaults.text_color
      };
    } catch (error) {
      console.error('Error getting appearance settings:', error);
      throw error;
    }
  }

  // สร้างข้อมูล Appearance Settings เริ่มต้นสำหรับบริษัท
  async createDefaultAppearanceSettings(userId, companyId) {
    try {
      const defaults = this.getDefaultAppearanceSettings();
      console.log(`[AUTO-CREATE] Inserting default values for IC_ID: ${companyId}`);

      await this.updateAppearanceSettings(userId, companyId, defaults);

      console.log(`[SUCCESS] Default appearance settings created for IC_ID: ${companyId}`);
      return { success: true };
    } catch (error) {
      console.error('Error creating default appearance settings:', error);
      throw error;
    }
  }

  // บันทึก Appearance Settings
  async updateAppearanceSettings(userId, companyId, data) {
    try {
      const pool = await dbService.connect();

      console.log(`[PUT] Updating appearance settings - userId: ${userId}, companyId: ${companyId}`);

      // Update/Insert SystemSettings (7 ฟิลด์)
      const settingsFields = [
        'logo_url', 'favicon_url', 'primary_color', 'secondary_color',
        'accent_color', 'background_color', 'text_color'
      ];

      // สร้าง VALUES สำหรับ MERGE แบบ Batch
      const valuesClauses = settingsFields.map((field, index) => {
        const value = data[field] !== undefined ? String(data[field]) : '';
        return `(@Key${index}, @Value${index})`;
      }).join(',\n        ');

      // MERGE Query แบบ Batch (1 Query สำหรับ 7 ฟิลด์)
      const mergeQuery = `
        MERGE [dbo].[SystemSettings] AS target
        USING (
          VALUES
            ${valuesClauses}
        ) AS source (SS_Key, SS_Value)
        ON target.SS_Key = source.SS_Key AND target.IC_ID = @IC_ID
        WHEN MATCHED THEN
          UPDATE SET
            SS_Value = source.SS_Value,
            SS_UpdatedAt = GETDATE(),
            SS_UpdatedBy = @SS_UpdatedBy
        WHEN NOT MATCHED THEN
          INSERT (SS_Key, SS_Value, SS_Type, SS_Category, SS_UpdatedBy, IC_ID)
          VALUES (source.SS_Key, source.SS_Value, 'text', 'appearance', @SS_UpdatedBy, @IC_ID);
      `;

      // สร้าง Request พร้อม Parameters
      const request = pool.request()
        .input('IC_ID', sql.Int, companyId)
        .input('SS_UpdatedBy', sql.Int, userId);

      // เพิ่ม Parameters สำหรับแต่ละฟิลด์
      settingsFields.forEach((field, index) => {
        const value = data[field] !== undefined ? String(data[field]) : '';
        request.input(`Key${index}`, sql.NVarChar, field);
        request.input(`Value${index}`, sql.NVarChar, value);
      });

      await request.query(mergeQuery);

      // อัพเดท IC_LogoPath ใน InternalCompany table ถ้ามีการเปลี่ยน logo_url
      if (data.logo_url !== undefined && data.logo_url !== null && data.logo_url !== '') {
        const updateLogoQuery = `
          UPDATE [dbo].[InternalCompany]
          SET IC_LogoPath = @IC_LogoPath
          WHERE IC_ID = @IC_ID
        `;
        await pool.request()
          .input('IC_ID', sql.Int, companyId)
          .input('IC_LogoPath', sql.NVarChar, data.logo_url)
          .query(updateLogoQuery);

        console.log(`[SUCCESS] IC_LogoPath updated for IC_ID: ${companyId} -> ${data.logo_url}`);
      }

      console.log(`[SUCCESS] Appearance settings updated for IC_ID: ${companyId}`);

      return { success: true };
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      throw error;
    }
  }

  // ==================== SECURITY SETTINGS ====================

  getDefaultSecuritySettings() {
    return {
      sessionTimeout: '1440',
      minPasswordLength: '8',
      requireSpecialChar: 'false',
      requireNumber: 'false',
      requireUppercase: 'false',
      passwordExpiry: 'false',
      passwordExpiryDays: '90',
      inactivityTimeout: '15',
      twoFactorAuth: 'false',
      maxLoginAttempts: '5'
    };
  }

  async getSecuritySettings(userId, companyId) {
    try {
      const pool = await dbService.connect();

      console.log(`[GET] Fetching security settings - userId: ${userId}, companyId: ${companyId}`);

      const settingsQuery = `
        SELECT SS_Key, SS_Value, IC_ID
        FROM [dbo].[SystemSettings]
        WHERE SS_Category = 'security'
          AND (IC_ID = @IC_ID OR IC_ID IS NULL)
      `;
      const settingsResult = await pool.request()
        .input('IC_ID', sql.Int, companyId)
        .query(settingsQuery);

      const settings = {};
      const companySettings = {};
      const globalSettings = {};

      settingsResult.recordset.forEach(row => {
        const key = row.SS_Key;
        if (row.IC_ID === companyId) {
          companySettings[key] = row.SS_Value;
        } else if (row.IC_ID === null) {
          globalSettings[key] = row.SS_Value;
        }
      });

      Object.assign(settings, globalSettings, companySettings);

      const defaults = this.getDefaultSecuritySettings();
      const finalSettings = { ...defaults, ...settings };

      console.log(`[SUCCESS] Security settings fetched for IC_ID: ${companyId}`);

      return finalSettings;
    } catch (error) {
      console.error('Error getting security settings:', error);
      throw error;
    }
  }

  async updateSecuritySettings(userId, companyId, data) {
    try {
      const pool = await dbService.connect();

      console.log(`[PUT] Updating security settings - userId: ${userId}, companyId: ${companyId}`);

      const settingsFields = [
        'sessionTimeout', 'minPasswordLength', 'requireSpecialChar', 'requireNumber',
        'requireUppercase', 'passwordExpiry', 'passwordExpiryDays', 'inactivityTimeout',
        'twoFactorAuth', 'maxLoginAttempts'
      ];

      for (const field of settingsFields) {
        const key = field;
        const value = data[field] !== undefined ? String(data[field]) : '';

        const mergeQuery = `
          MERGE [dbo].[SystemSettings] AS target
          USING (SELECT @SS_Key AS SS_Key, @IC_ID AS IC_ID) AS source
          ON target.SS_Key = source.SS_Key AND target.IC_ID = source.IC_ID
          WHEN MATCHED THEN
            UPDATE SET
              SS_Value = @SS_Value,
              SS_UpdatedAt = GETDATE(),
              SS_UpdatedBy = @SS_UpdatedBy
          WHEN NOT MATCHED THEN
            INSERT (SS_Key, SS_Value, SS_Type, SS_Category, SS_UpdatedBy, IC_ID)
            VALUES (@SS_Key, @SS_Value, 'text', 'security', @SS_UpdatedBy, @IC_ID);
        `;

        await pool.request()
          .input('SS_Key', sql.NVarChar, key)
          .input('SS_Value', sql.NVarChar, value)
          .input('SS_UpdatedBy', sql.Int, userId)
          .input('IC_ID', sql.Int, companyId)
          .query(mergeQuery);
      }

      console.log(`[SUCCESS] Security settings updated for IC_ID: ${companyId}`);

      return { success: true };
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  // ==================== EMAIL SETTINGS ====================

  getDefaultEmailSettings() {
    return {
      smtpHost: '',
      smtpPort: '587',
      smtpSecure: 'false',
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: ''
    };
  }

  async getEmailSettings(userId, companyId) {
    try {
      const pool = await dbService.connect();

      console.log(`[GET] Fetching email settings - userId: ${userId}, companyId: ${companyId}`);

      const settingsQuery = `
        SELECT SS_Key, SS_Value, IC_ID
        FROM [dbo].[SystemSettings]
        WHERE SS_Category = 'email'
          AND (IC_ID = @IC_ID OR IC_ID IS NULL)
      `;
      const settingsResult = await pool.request()
        .input('IC_ID', sql.Int, companyId)
        .query(settingsQuery);

      const settings = {};
      const companySettings = {};
      const globalSettings = {};

      settingsResult.recordset.forEach(row => {
        const key = row.SS_Key;
        let value = row.SS_Value;

        // Don't send encrypted password to frontend for security reasons
        if (key === 'smtpPassword' && value) {
          value = ''; // Return empty string instead of decrypted password
        }

        if (row.IC_ID === companyId) {
          companySettings[key] = value;
        } else if (row.IC_ID === null) {
          globalSettings[key] = value;
        }
      });

      Object.assign(settings, globalSettings, companySettings);

      const defaults = this.getDefaultEmailSettings();
      const finalSettings = { ...defaults, ...settings };

      console.log(`[SUCCESS] Email settings fetched for IC_ID: ${companyId}`);

      return finalSettings;
    } catch (error) {
      console.error('Error getting email settings:', error);
      throw error;
    }
  }

  async updateEmailSettings(userId, companyId, data) {
    try {
      const pool = await dbService.connect();

      console.log(`[PUT] Updating email settings - userId: ${userId}, companyId: ${companyId}`);

      const settingsFields = [
        'smtpHost', 'smtpPort', 'smtpSecure', 'smtpUsername',
        'smtpPassword', 'fromEmail', 'fromName'
      ];

      for (const field of settingsFields) {
        const key = field;
        let value = data[field] !== undefined ? String(data[field]) : '';

        // Encrypt password before saving
        if (key === 'smtpPassword' && value) {
          try {
            value = encrypt(value);
          } catch (error) {
            console.error('Error encrypting password:', error);
            throw new Error('Failed to encrypt password');
          }
        }

        const mergeQuery = `
          MERGE [dbo].[SystemSettings] AS target
          USING (SELECT @SS_Key AS SS_Key, @IC_ID AS IC_ID) AS source
          ON target.SS_Key = source.SS_Key AND target.IC_ID = source.IC_ID
          WHEN MATCHED THEN
            UPDATE SET
              SS_Value = @SS_Value,
              SS_UpdatedAt = GETDATE(),
              SS_UpdatedBy = @SS_UpdatedBy
          WHEN NOT MATCHED THEN
            INSERT (SS_Key, SS_Value, SS_Type, SS_Category, SS_UpdatedBy, IC_ID)
            VALUES (@SS_Key, @SS_Value, 'text', 'email', @SS_UpdatedBy, @IC_ID);
        `;

        await pool.request()
          .input('SS_Key', sql.NVarChar, key)
          .input('SS_Value', sql.NVarChar, value)
          .input('SS_UpdatedBy', sql.Int, userId)
          .input('IC_ID', sql.Int, companyId)
          .query(mergeQuery);
      }

      console.log(`[SUCCESS] Email settings updated for IC_ID: ${companyId}`);

      return { success: true };
    } catch (error) {
      console.error('Error updating email settings:', error);
      throw error;
    }
  }

  async testEmailConnection(companyId, testEmail) {
    try {
      const EmailSender = require('../utils/emailSender');

      console.log(`[TEST] Testing email connection for IC_ID: ${companyId}`);

      // Get SMTP config from database
      const result = await this.getEmailSettings(0, companyId);
      if (!result.success) {
        throw new Error('Failed to get email settings');
      }

      const smtpConfig = result.data;

      // Validate config
      if (!smtpConfig.smtpHost || !smtpConfig.smtpUsername || !smtpConfig.smtpPassword) {
        throw new Error('Email configuration is incomplete. Please configure SMTP settings first.');
      }

      console.log(`[TEST] Sending test email to: ${testEmail}`);

      // Send test email using EmailSender utility
      const sendResult = await EmailSender.sendTestEmail(smtpConfig, testEmail);

      console.log(`[SUCCESS] Test email sent successfully`);

      return sendResult;
    } catch (error) {
      console.error('[ERROR] Test email failed:', error);
      throw new Error(`Failed to send test email: ${error.message}`);
    }
  }

  // ==================== NOTIFICATION SETTINGS ====================

  getDefaultNotificationSettings() {
    return {
      emailNotification: 'true',
      browserNotification: 'true',
      smsNotification: 'false',
      notificationDelay: '30',
      notifyCheckIn: 'true',
      notifyCheckOut: 'true',
      notifyNewUser: 'true',
      notifySystemError: 'true',
      notifyDailyReport: 'false'
    };
  }

  async getNotificationSettings(userId, companyId) {
    try {
      const pool = await dbService.connect();

      console.log(`[GET] Fetching notification settings - userId: ${userId}, companyId: ${companyId}`);

      const settingsQuery = `
        SELECT SS_Key, SS_Value, IC_ID
        FROM [dbo].[SystemSettings]
        WHERE SS_Category = 'notification'
          AND (IC_ID = @IC_ID OR IC_ID IS NULL)
      `;
      const settingsResult = await pool.request()
        .input('IC_ID', sql.Int, companyId)
        .query(settingsQuery);

      const settings = {};
      const companySettings = {};
      const globalSettings = {};

      settingsResult.recordset.forEach(row => {
        const key = row.SS_Key;
        if (row.IC_ID === companyId) {
          companySettings[key] = row.SS_Value;
        } else if (row.IC_ID === null) {
          globalSettings[key] = row.SS_Value;
        }
      });

      Object.assign(settings, globalSettings, companySettings);

      const defaults = this.getDefaultNotificationSettings();
      const finalSettings = { ...defaults, ...settings };

      console.log(`[SUCCESS] Notification settings fetched for IC_ID: ${companyId}`);

      return finalSettings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }

  async updateNotificationSettings(userId, companyId, data) {
    try {
      const pool = await dbService.connect();

      console.log(`[PUT] Updating notification settings - userId: ${userId}, companyId: ${companyId}`);

      const settingsFields = [
        'emailNotification', 'browserNotification', 'smsNotification', 'notificationDelay',
        'notifyCheckIn', 'notifyCheckOut', 'notifyNewUser', 'notifySystemError', 'notifyDailyReport'
      ];

      for (const field of settingsFields) {
        const key = field;
        const value = data[field] !== undefined ? String(data[field]) : '';

        const mergeQuery = `
          MERGE [dbo].[SystemSettings] AS target
          USING (SELECT @SS_Key AS SS_Key, @IC_ID AS IC_ID) AS source
          ON target.SS_Key = source.SS_Key AND target.IC_ID = source.IC_ID
          WHEN MATCHED THEN
            UPDATE SET
              SS_Value = @SS_Value,
              SS_UpdatedAt = GETDATE(),
              SS_UpdatedBy = @SS_UpdatedBy
          WHEN NOT MATCHED THEN
            INSERT (SS_Key, SS_Value, SS_Type, SS_Category, SS_UpdatedBy, IC_ID)
            VALUES (@SS_Key, @SS_Value, 'text', 'notification', @SS_UpdatedBy, @IC_ID);
        `;

        await pool.request()
          .input('SS_Key', sql.NVarChar, key)
          .input('SS_Value', sql.NVarChar, value)
          .input('SS_UpdatedBy', sql.Int, userId)
          .input('IC_ID', sql.Int, companyId)
          .query(mergeQuery);
      }

      console.log(`[SUCCESS] Notification settings updated for IC_ID: ${companyId}`);

      return { success: true };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // ดึงรายการ Roles (สำหรับ dropdown)
  async getRoles() {
    try {
      const pool = await dbService.connect();

      const query = `
        SELECT SR_ID, SR_Code, SR_Name, SR_Description
        FROM [dbo].[SystemRole]
        WHERE SR_Active = 1
        ORDER BY SR_Name
      `;

      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting roles:', error);
      throw error;
    }
  }
}

module.exports = new SettingsService();
