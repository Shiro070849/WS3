const authService = require('../service/auth.service');
const permissionService = require('../service/permission.service');

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอก Username และ Password'
        });
      }

      const user = await authService.login(username, password, ipAddress);

      res.status(200).json({
        success: true,
        message: 'Login สำเร็จ',
        data: user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async logout(req, res) {
    try {
      const { userId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ User ID'
        });
      }

      await authService.logout(userId, ipAddress);

      res.status(200).json({
        success: true,
        message: 'Logout สำเร็จ'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * ดึงข้อมูล Permission ของ User
   * GET /api/auth/permissions?userId=123
   */
  async getUserPermissions(req, res) {
    try {
      const userId = req.query.userId || req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      const permissions = await permissionService.getUserPermissions(parseInt(userId));

      res.status(200).json({
        success: true,
        message: 'Get permissions successfully',
        data: permissions
      });
    } catch (error) {
      console.error('Error in getUserPermissions:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user permissions'
      });
    }
  }

  /**
   * ดึงข้อมูล User Profile พร้อม Permissions
   * GET /api/auth/me?userId=123
   * 
   * Production Tip: รวม User Data + Permissions ใน API เดียวเพื่อลด Network Round-trip
   */
  async getMe(req, res) {
    try {
      const userId = req.query.userId || req.headers['x-user-id'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      // ดึง User Data จาก authService
      const userData = await authService.getUserById(parseInt(userId));

      // ดึง Permissions จาก permissionService
      const permissions = await permissionService.getUserPermissions(parseInt(userId));

      // รวมข้อมูลเข้าด้วยกัน
      const profile = {
        ...userData,
        permissions: permissions
      };

      res.status(200).json({
        success: true,
        message: 'Get user profile successfully',
        data: profile
      });
    } catch (error) {
      console.error('Error in getMe:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user profile'
      });
    }
  }
}

module.exports = new AuthController();
