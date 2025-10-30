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
      const userId = req.user?.SU_ID || 1103; // Hardcoded to sysadmin (SA001) for now
      const companies = await settingsService.getUserAccessibleCompanies(userId);
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

  // ==================== USERS ====================

  async getAllUsers(req, res) {
    try {
      const users = await settingsService.getAllUsers();

      // ไม่ส่ง password กลับไป
      const usersWithoutPassword = users.map(user => {
        const { SU_Password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.status(200).json({
        success: true,
        count: usersWithoutPassword.length,
        data: usersWithoutPassword
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
      const { code, name1, name2, email, username, password, active, pinCode, remarks } = req.body;

      // Validate required fields
      if (!code || !name1 || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Code, Name, Username, and Password are required'
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
        remarks
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
      const { code, name1, name2, email, username, active, pinCode, remarks } = req.body;

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
        remarks
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

      await settingsService.resetPassword(id, password);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      res.status(500).json({
        success: false,
        message: 'Error resetting password',
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
      const departments = await settingsService.getAllDepartments();
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
      const { code, localName, englishName, isActive, remarks } = req.body;

      // Validate required fields
      if (!code || !localName) {
        return res.status(400).json({
          success: false,
          message: 'Code and Local Name are required'
        });
      }

      const result = await settingsService.createDepartment({
        code,
        localName,
        englishName,
        isActive,
        remarks
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
      const { code, localName, englishName, isActive, remarks } = req.body;

      // Validate required fields
      if (!code || !localName) {
        return res.status(400).json({
          success: false,
          message: 'Code and Local Name are required'
        });
      }

      await settingsService.updateDepartment(id, {
        code,
        localName,
        englishName,
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
}

module.exports = new SettingsController();
