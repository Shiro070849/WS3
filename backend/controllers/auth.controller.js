const authService = require('../service/auth.service');

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
}

module.exports = new AuthController();
