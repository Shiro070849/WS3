const settingsService = require('../service/settings.service');

class SettingsController {
  // ==================== COMPANIES ====================

  async getAllCompanies(req, res) {
    try {
      const companies = await settingsService.getAllCompanies();
      res.status(200).json({
        success: true,
        count: companies.length,
        data: companies
      });
    } catch (error) {
      console.error('Error in getAllCompanies:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting companies',
        error: error.message
      });
    }
  }

  async getCompanyById(req, res) {
    try {
      const id = req.params.id;
      const company = await settingsService.getCompanyById(id);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      res.status(200).json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Error in getCompanyById:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting company',
        error: error.message
      });
    }
  }

  async getUserAccessibleCompanies(req, res) {
    try {
      // ดึง userId จาก query parameter, header, หรือ req.user
      let userId = req.query.userId || req.headers['x-user-id'] || req.user?.SU_ID;

      // ถ้า userId เป็น array (เกิดจาก query string ซ้ำ) → ใช้ตัวแรก
      if (Array.isArray(userId)) {
        userId = userId[0];
      }

      // ถ้า userId เป็น string "null" หรือ "undefined" → แปลงเป็น null
      if (userId === 'null' || userId === 'undefined' || userId === '') {
        userId = null;
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      // แปลง userId เป็น integer
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid userId format'
        });
      }

      const companies = await settingsService.getUserAccessibleCompanies(userIdInt);
      res.status(200).json({
        success: true,
        count: companies.length,
        data: companies
      });
    } catch (error) {
      console.error('Error in getUserAccessibleCompanies:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting user accessible companies',
        error: error.message
      });
    }
  }

  async createCompany(req, res) {
    try {
      const { code, localName, englishName, isActive, remarks } = req.body;

      // Validate required fields
      if (!code || !localName) {
        return res.status(400).json({
          success: false,
          message: 'Code and Local Name are required'
        });
      }

      const result = await settingsService.createCompany({
        code,
        localName,
        englishName,
        isActive,
        remarks
      });

      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in createCompany:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating company',
        error: error.message
      });
    }
  }

  async updateCompany(req, res) {
    try {
      const id = req.params.id;
      const { code, localName, englishName, isActive, remarks } = req.body;

      // Validate required fields
      if (!code || !localName) {
        return res.status(400).json({
          success: false,
          message: 'Code and Local Name are required'
        });
      }

      await settingsService.updateCompany(id, {
        code,
        localName,
        englishName,
        isActive,
        remarks
      });

      res.status(200).json({
        success: true,
        message: 'Company updated successfully'
      });
    } catch (error) {
      console.error('Error in updateCompany:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating company',
        error: error.message
      });
    }
  }

  async deleteCompany(req, res) {
    try {
      const id = req.params.id;
      await settingsService.deleteCompany(id);

      res.status(200).json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteCompany:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting company',
        error: error.message
      });
    }
  }

  async uploadCompanyLogo(req, res) {
    try {
      const companyId = req.params.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาเลือกไฟล์ logo'
        });
      }

      // สร้าง path สำหรับเก็บในฐานข้อมูล
      const logoPath = `/uploads/logos/${req.file.filename}`;

      // อัพเดต IC_LogoPath ในตาราง InternalCompany
      await settingsService.updateCompanyLogo(companyId, logoPath);

      console.log(`📤 Logo uploaded for company ${companyId}: ${logoPath}`);

      res.status(200).json({
        success: true,
        message: 'อัปโหลด logo สำเร็จ',
        data: {
          filename: req.file.filename,
          logoPath: logoPath,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('Error in uploadCompanyLogo:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัปโหลด logo',
        error: error.message
      });
    }
  }

  async updateCompanySequence(req, res) {
    try {
      const companyId = parseInt(req.params.id);
      const { sequence } = req.body;

      if (sequence === undefined || sequence === null) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุลำดับ (sequence)'
        });
      }

      await settingsService.updateCompanySequence(companyId, parseInt(sequence));

      console.log(`🔢 Company sequence updated for IC_ID ${companyId}: ${sequence}`);

      res.status(200).json({
        success: true,
        message: 'อัพเดทลำดับบริษัทสำเร็จ'
      });
    } catch (error) {
      console.error('Error in updateCompanySequence:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัพเดทลำดับ',
        error: error.message
      });
    }
  }

  async batchUpdateCompanySequences(req, res) {
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุข้อมูลลำดับ (updates)'
        });
      }

      const result = await settingsService.batchUpdateCompanySequences(updates);

      console.log(`🔢 Batch updated ${result.updated} company sequences`);

      res.status(200).json({
        success: true,
        message: 'อัพเดทลำดับบริษัททั้งหมดสำเร็จ',
        data: result
      });
    } catch (error) {
      console.error('Error in batchUpdateCompanySequences:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัพเดทลำดับ',
        error: error.message
      });
    }
  }

  // ==================== USERS ====================

  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15; // เปลี่ยนจาก 25 เป็น 15
      const search = req.query.search || '';
      let companyId = req.query.companyId ? parseInt(req.query.companyId) : null;
      const roleId = req.query.roleId ? parseInt(req.query.roleId) : null;

      // ตรวจสอบว่า User ที่ request เป็น Admin ย่อยหรือไม่
      const userId = req.query.userId || req.headers['x-user-id'] || req.user?.SU_ID;
      if (userId) {
        const userCompanyId = await settingsService.getUserCompanyId(parseInt(userId));
        // ถ้าเป็น Admin ย่อย (IC_ID มีค่า) บังคับกรองเฉพาะบริษัทตัวเอง
        if (userCompanyId !== null && userCompanyId !== undefined) {
          companyId = userCompanyId;
          console.log(`🔒 [Admin ย่อย] User ${userId} บังคับกรองเฉพาะบริษัท IC_ID = ${companyId}`);
        }
      }

      console.log(`📥 GET /api/settings/users - page: ${page}, limit: ${limit}, search: "${search}", companyId: ${companyId}, roleId: ${roleId}`);

      const result = await settingsService.getAllUsers(page, limit, search, companyId, roleId);

      // ไม่ส่ง password กลับไป
      const usersWithoutPassword = result.data.map(user => {
        const { SU_Password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.status(200).json({
        success: true,
        count: usersWithoutPassword.length,
        data: usersWithoutPassword,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting users',
        error: error.message
      });
    }
  }

  async getUserById(req, res) {
    try {
      const id = req.params.id;
      const user = await settingsService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // ไม่ส่ง password กลับไป
      const { SU_Password, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting user',
        error: error.message
      });
    }
  }

  async createUser(req, res) {
    try {
      const { code, name1, name2, email, username, password, active, pinCode, remarks, companyId, roleId } = req.body;

      // Validate required fields
      if (!code || !name1 || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Code, Name, Username, and Password are required'
        });
      }

      // Validate companyId
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      // Validate roleId
      if (!roleId) {
        return res.status(400).json({
          success: false,
          message: 'Role ID is required'
        });
      }

      const result = await settingsService.createUser({
        code,
        name1,
        name2,
        email,
        username,
        password,
        active,
        pinCode,
        remarks,
        companyId,
        roleId
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in createUser:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const id = req.params.id;
      const { code, name1, name2, email, username, active, pinCode, remarks, companyId, roleId } = req.body;

      // Validate required fields
      if (!code || !name1 || !username) {
        return res.status(400).json({
          success: false,
          message: 'Code, Name, and Username are required'
        });
      }

      await settingsService.updateUser(id, {
        code,
        name1,
        name2,
        email,
        username,
        active,
        pinCode,
        remarks,
        companyId,
        roleId
      });

      res.status(200).json({
        success: true,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error in updateUser:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const id = req.params.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }

      // ดึง Admin ID จาก req.user (จะต้องมี middleware ที่ verify token และใส่ user info ลง req.user)
      const adminId = req.user?.SU_ID || 1103; // Fallback to sysadmin

      // ดึง IP Address จาก request
      const adminIP = req.ip || req.connection.remoteAddress || 'Unknown';

      console.log(`🔑 Admin ${adminId} (IP: ${adminIP}) is resetting password for User ${id}`);

      await settingsService.resetPassword(id, password, adminId, adminIP);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error resetting password',
        error: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const id = req.params.id;
      await settingsService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }

  // ==================== DEPARTMENTS ====================

  async getAllDepartments(req, res) {
    try {
      // ตรวจสอบว่า User ที่ request เป็น Admin ย่อยหรือไม่
      const userId = req.query.userId || req.headers['x-user-id'] || req.user?.SU_ID;
      let companyId = null;

      if (userId) {
        const userCompanyId = await settingsService.getUserCompanyId(parseInt(userId));
        // ถ้าเป็น Admin ย่อย (IC_ID มีค่า) บังคับกรองเฉพาะแผนกของบริษัทตัวเอง
        if (userCompanyId !== null && userCompanyId !== undefined) {
          companyId = userCompanyId;
          console.log(`🔒 [Admin ย่อย] User ${userId} บังคับกรองแผนกเฉพาะบริษัท IC_ID = ${companyId}`);
        }
      }

      const departments = await settingsService.getAllDepartments(companyId);
      res.status(200).json({
        success: true,
        count: departments.length,
        data: departments
      });
    } catch (error) {
      console.error('Error in getAllDepartments:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting departments',
        error: error.message
      });
    }
  }

  async getDepartmentById(req, res) {
    try {
      const id = req.params.id;
      const department = await settingsService.getDepartmentById(id);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      res.status(200).json({
        success: true,
        data: department
      });
    } catch (error) {
      console.error('Error in getDepartmentById:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting department',
        error: error.message
      });
    }
  }

  async createDepartment(req, res) {
    try {
      const { code, localName, englishName, type, parentId, isActive, remarks, companyId } = req.body;

      // Validate required fields
      if (!code || !code.trim()) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกรหัสแผนก'
        });
      }

      if (!localName || !localName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกชื่อแผนก (ไทย)'
        });
      }

      // Validate companyId (required for creating department)
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      // Note: Parent is now optional - validation of parent type (if provided) is done in service layer

      const result = await settingsService.createDepartment({
        code,
        localName,
        englishName,
        type,
        parentId,
        isActive,
        remarks,
        companyId
      });

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in createDepartment:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating department',
        error: error.message
      });
    }
  }

  async updateDepartment(req, res) {
    try {
      const id = req.params.id;
      const { code, localName, englishName, type, parentId, isActive, remarks } = req.body;

      // Validate required fields
      if (!code || !code.trim()) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกรหัสแผนก'
        });
      }

      if (!localName || !localName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกชื่อแผนก (ไทย)'
        });
      }

      // Note: Parent is now optional - validation of parent type (if provided) is done in service layer

      await settingsService.updateDepartment(id, {
        code,
        localName,
        englishName,
        type,
        parentId,
        isActive,
        remarks
      });

      res.status(200).json({
        success: true,
        message: 'Department updated successfully'
      });
    } catch (error) {
      console.error('Error in updateDepartment:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating department',
        error: error.message
      });
    }
  }

  async linkDepartmentToCompany(req, res) {
    try {
      const { departmentId, companyId } = req.body;

      // Validate required fields
      if (!departmentId || !companyId) {
        return res.status(400).json({
          success: false,
          message: 'Department ID and Company ID are required'
        });
      }

      const result = await settingsService.linkDepartmentToCompany(departmentId, companyId);

      res.status(201).json({
        success: true,
        message: 'Department linked to company successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in linkDepartmentToCompany:', error);
      res.status(500).json({
        success: false,
        message: 'Error linking department to company',
        error: error.message
      });
    }
  }

  async deleteDepartment(req, res) {
    try {
      const id = req.params.id;
      await settingsService.deleteDepartment(id);

      res.status(200).json({
        success: true,
        message: 'Department deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteDepartment:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting department',
        error: error.message
      });
    }
  }

  // ==================== COMPANY DEPARTMENTS (JUNCTION TABLE) ====================

  async getCompanyDepartments(req, res) {
    try {
      // ตรวจสอบว่า User ที่ request เป็น Admin ย่อยหรือไม่
      const userId = req.query.userId || req.headers['x-user-id'] || req.user?.SU_ID;
      let companyId = null;

      if (userId) {
        const userCompanyId = await settingsService.getUserCompanyId(parseInt(userId));
        // ถ้าเป็น Admin ย่อย (IC_ID มีค่า) บังคับกรองเฉพาะบริษัทตัวเอง
        if (userCompanyId !== null && userCompanyId !== undefined) {
          companyId = userCompanyId;
          console.log(`🔒 [Admin ย่อย] User ${userId} บังคับกรอง CompanyDepartments เฉพาะบริษัท IC_ID = ${companyId}`);
        }
      }

      const companyDepartments = await settingsService.getCompanyDepartments(companyId);
      res.status(200).json({
        success: true,
        count: companyDepartments.length,
        data: companyDepartments
      });
    } catch (error) {
      console.error('Error in getCompanyDepartments:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting company-department relations',
        error: error.message
      });
    }
  }

  // ดึงโครงสร้างแผนกแบบ Tree
  async getDepartmentTree(req, res) {
    try {
      const companyId = parseInt(req.query.companyId);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`📥 GET /api/settings/departments/tree - companyId: ${companyId}`);

      const tree = await settingsService.getDepartmentTree(companyId);

      res.status(200).json({
        success: true,
        data: tree
      });
    } catch (error) {
      console.error('Error in getDepartmentTree:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting department tree',
        error: error.message
      });
    }
  }

  // ย้ายแผนกไปอยู่ภายใต้ Parent อื่น
  async moveDepartment(req, res) {
    try {
      const id = req.params.id;
      const { newParentId } = req.body;

      console.log(`🔀 PUT /api/settings/departments/${id}/move - newParentId: ${newParentId}`);

      await settingsService.moveDepartment(id, newParentId);

      res.status(200).json({
        success: true,
        message: 'ย้ายแผนกสำเร็จ'
      });
    } catch (error) {
      console.error('Error in moveDepartment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error moving department',
        error: error.message
      });
    }
  }

  // ==================== GENERAL SETTINGS ====================

  async getGeneralSettings(req, res) {
    try {
      const userId = req.user?.SU_ID || 1103; // Hardcoded to sysadmin (SA001) for now
      const companyId = parseInt(req.query.companyId); // ดึง companyId จาก query string

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`📥 GET /api/settings/general - userId: ${userId}, companyId: ${companyId}`);

      const settings = await settingsService.getGeneralSettings(userId, companyId);

      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error in getGeneralSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting general settings',
        error: error.message
      });
    }
  }

  async updateGeneralSettings(req, res) {
    try {
      const userId = req.user?.SU_ID || 1103; // Hardcoded to sysadmin (SA001) for now
      const companyId = parseInt(req.query.companyId); // ดึง companyId จาก query string
      const data = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`💾 PUT /api/settings/general - userId: ${userId}, companyId: ${companyId}`);

      await settingsService.updateGeneralSettings(userId, companyId, data);

      res.status(200).json({
        success: true,
        message: 'General settings updated successfully'
      });
    } catch (error) {
      console.error('Error in updateGeneralSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating general settings',
        error: error.message
      });
    }
  }

  // ==================== APPEARANCE SETTINGS ====================

  async getAppearanceSettings(req, res) {
    try {
      const userId = req.user?.SU_ID || 1103; // Hardcoded to sysadmin (SA001) for now
      const companyId = parseInt(req.query.companyId); // ดึง companyId จาก query string

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`📥 GET /api/settings/appearance - userId: ${userId}, companyId: ${companyId}`);

      const settings = await settingsService.getAppearanceSettings(userId, companyId);

      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error in getAppearanceSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting appearance settings',
        error: error.message
      });
    }
  }

  async updateAppearanceSettings(req, res) {
    try {
      const userId = req.user?.SU_ID || 1103; // Hardcoded to sysadmin (SA001) for now
      const companyId = parseInt(req.query.companyId); // ดึง companyId จาก query string
      const data = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`💾 PUT /api/settings/appearance - userId: ${userId}, companyId: ${companyId}`);

      await settingsService.updateAppearanceSettings(userId, companyId, data);

      res.status(200).json({
        success: true,
        message: 'Appearance settings updated successfully'
      });
    } catch (error) {
      console.error('Error in updateAppearanceSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating appearance settings',
        error: error.message
      });
    }
  }

  // อัปโหลดรูปภาพ (Logo, Favicon)
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาเลือกไฟล์'
        });
      }

      const companyId = parseInt(req.query.companyId);
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      // สร้าง URL สำหรับเข้าถึงไฟล์
      const fileUrl = `/uploads/images/${req.file.filename}`;

      console.log(`📤 Image uploaded: ${fileUrl} for company ${companyId}`);

      res.status(200).json({
        success: true,
        message: 'อัปโหลดไฟล์สำเร็จ',
        data: {
          filename: req.file.filename,
          url: fileUrl,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('Error in uploadImage:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัปโหลด',
        error: error.message
      });
    }
  }

  // ==================== SECURITY SETTINGS ====================

  async getSecuritySettings(req, res) {
    try {
      const userId = req.user?.SU_ID || 1103;
      const companyId = parseInt(req.query.companyId);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`📥 GET /api/settings/security - userId: ${userId}, companyId: ${companyId}`);

      const settings = await settingsService.getSecuritySettings(userId, companyId);

      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error in getSecuritySettings:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting security settings',
        error: error.message
      });
    }
  }

  async updateSecuritySettings(req, res) {
    try {
      const userId = req.user?.SU_ID || 1103;
      const companyId = parseInt(req.query.companyId);
      const data = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`📤 PUT /api/settings/security - userId: ${userId}, companyId: ${companyId}`);

      await settingsService.updateSecuritySettings(userId, companyId, data);

      res.status(200).json({
        success: true,
        message: 'Security settings updated successfully'
      });
    } catch (error) {
      console.error('Error in updateSecuritySettings:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating security settings',
        error: error.message
      });
    }
  }

  // ==================== EMAIL SETTINGS ====================

  async getEmailSettings(req, res) {
    try {
      const userId = req.user?.SU_ID || 1103;
      const companyId = parseInt(req.query.companyId);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`📥 GET /api/settings/email - userId: ${userId}, companyId: ${companyId}`);

      const settings = await settingsService.getEmailSettings(userId, companyId);

      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error in getEmailSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting email settings',
        error: error.message
      });
    }
  }

  async updateEmailSettings(req, res) {
    try {
      const userId = req.user?.SU_ID || 1103;
      const companyId = parseInt(req.query.companyId);
      const data = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`📤 PUT /api/settings/email - userId: ${userId}, companyId: ${companyId}`);

      await settingsService.updateEmailSettings(userId, companyId, data);

      res.status(200).json({
        success: true,
        message: 'Email settings updated successfully'
      });
    } catch (error) {
      console.error('Error in updateEmailSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating email settings',
        error: error.message
      });
    }
  }

  async testEmail(req, res) {
    try {
      const { companyId, testEmail } = req.body;

      console.log(`[TEST EMAIL] POST /api/settings/email/test`);
      console.log(`[TEST EMAIL] Company ID: ${companyId}, Test Email: ${testEmail}`);

      const result = await settingsService.testEmailConnection(companyId, testEmail);

      res.status(200).json({
        success: true,
        message: `ส่งอีเมลทดสอบไปที่ ${testEmail} สำเร็จ กรุณาตรวจสอบกล่องจดหมาย`,
        data: result
      });
    } catch (error) {
      console.error('[ERROR] testEmail:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการส่งอีเมลทดสอบ',
        error: error.message
      });
    }
  }

  // ==================== NOTIFICATION SETTINGS ====================

  async getNotificationSettings(req, res) {
    try {
      const userId = req.user?.SU_ID || 1103;
      const companyId = parseInt(req.query.companyId);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`📥 GET /api/settings/notifications - userId: ${userId}, companyId: ${companyId}`);

      const settings = await settingsService.getNotificationSettings(userId, companyId);

      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error in getNotificationSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting notification settings',
        error: error.message
      });
    }
  }

  async updateNotificationSettings(req, res) {
    try {
      const userId = req.user?.SU_ID || 1103;
      const companyId = parseInt(req.query.companyId);
      const data = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ companyId'
        });
      }

      console.log(`📤 PUT /api/settings/notifications - userId: ${userId}, companyId: ${companyId}`);

      await settingsService.updateNotificationSettings(userId, companyId, data);

      res.status(200).json({
        success: true,
        message: 'Notification settings updated successfully'
      });
    } catch (error) {
      console.error('Error in updateNotificationSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating notification settings',
        error: error.message
      });
    }
  }

  // ดึงรายการ Roles
  async getRoles(req, res) {
    try {
      const result = await settingsService.getRoles();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getRoles:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting roles',
        error: error.message
      });
    }
  }

  // ==================== PERMISSIONS ====================

  // ดึงรายการ Screens ทั้งหมด
  async getAllScreens(req, res) {
    try {
      const result = await settingsService.getAllScreens();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getAllScreens:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting screens',
        error: error.message
      });
    }
  }

  // ดึง Permissions ของ Role
  async getRolePermissions(req, res) {
    try {
      const roleId = parseInt(req.params.roleId);
      const userId = req.query.userId || req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      // ดึง IC_ID ของ User
      const userCompanyId = await settingsService.getUserCompanyId(parseInt(userId));

      // Super Admin: companyId = null, Company Admin: companyId = userCompanyId
      const companyId = userCompanyId === null || userCompanyId === undefined ? null : userCompanyId;

      const result = await settingsService.getRolePermissions(roleId, companyId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getRolePermissions:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting role permissions',
        error: error.message
      });
    }
  }

  // เพิ่ม Permission
  async addPermission(req, res) {
    try {
      const { roleId, screenId, companyId } = req.body;
      const userId = req.query.userId || req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      if (!roleId || !screenId) {
        return res.status(400).json({
          success: false,
          message: 'roleId and screenId are required'
        });
      }

      // ดึง IC_ID ของ User
      const userCompanyId = await settingsService.getUserCompanyId(parseInt(userId));

      // Super Admin: companyId = null (Global), Company Admin: companyId = userCompanyId
      const finalCompanyId = userCompanyId === null || userCompanyId === undefined 
        ? (companyId || null) 
        : userCompanyId;

      const result = await settingsService.addPermission(roleId, screenId, finalCompanyId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Error in addPermission:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error adding permission',
        error: error.message
      });
    }
  }

  // ลบ Permission
  async deletePermission(req, res) {
    try {
      const { roleId, screenId } = req.params;
      const userId = req.query.userId || req.headers['x-user-id'];
      const companyId = req.query.companyId ? parseInt(req.query.companyId) : null;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      // ดึง IC_ID ของ User
      const userCompanyId = await settingsService.getUserCompanyId(parseInt(userId));

      // Super Admin: companyId = null (Global), Company Admin: companyId = userCompanyId
      const finalCompanyId = userCompanyId === null || userCompanyId === undefined 
        ? companyId 
        : userCompanyId;

      const result = await settingsService.deletePermission(parseInt(roleId), parseInt(screenId), finalCompanyId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Error in deletePermission:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error deleting permission',
        error: error.message
      });
    }
  }
}

module.exports = new SettingsController();
