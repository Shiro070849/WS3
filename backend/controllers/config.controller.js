class ConfigController {
  /**
   * ดึง Server Configuration สำหรับ Mobile App และ Web
   * GET /api/config
   */
  async getConfig(req, res) {
    try {
      // ดึง protocol (http/https) จาก request
      const protocol = req.protocol; // http หรือ https

      // ดึง host จาก request headers
      const host = req.get('host'); // เช่น 192.168.1.100:3000 หรือ api.yourcompany.com

      // สร้าง BASE_URL
      const baseUrl = `${protocol}://${host}`;

      console.log(`[CONFIG] Client requested config from: ${req.ip}`);
      console.log(`[CONFIG] BASE_URL: ${baseUrl}`);

      // ส่งข้อมูล config กลับไป
      res.status(200).json({
        success: true,
        data: {
          base_url: baseUrl,
          api_version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          uploads_path: '/uploads',
          server_time: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[ERROR] getConfig:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting server configuration',
        error: error.message
      });
    }
  }
}

module.exports = new ConfigController();
