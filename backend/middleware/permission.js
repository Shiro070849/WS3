const permissionService = require('../service/permission.service');

/**
 * Middleware สำหรับตรวจสอบ Screen Permission
 * ใช้กับ API endpoints ที่ต้องการตรวจสอบสิทธิ์
 * 
 * @param {number} requiredScreenId - SS_ID ที่ต้องการเข้าถึง
 * @returns {Function} Express middleware function
 */
function checkScreenPermission(requiredScreenId) {
  return async (req, res, next) => {
    try {
      // รับ userId จาก query parameter, header, หรือ req.user (ถ้ามี middleware getUserCompanyInfo มาก่อน)
      let userId = req.user?.userId || req.query.userId || req.headers['x-user-id'];

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

      // ตรวจสอบว่า user เข้าถึง Screen ได้หรือไม่
      const hasAccess = await permissionService.hasScreenAccess(userIdInt, requiredScreenId);

      if (!hasAccess) {
        console.log(`[PERMISSION DENIED] User ${userIdInt} tried to access Screen ${requiredScreenId}`);
        return res.status(403).json({
          success: false,
          message: 'คุณไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้'
        });
      }

      console.log(`[PERMISSION GRANTED] User ${userIdInt} accessing Screen ${requiredScreenId}`);
      next();
    } catch (error) {
      console.error('Error in checkScreenPermission middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
}

module.exports = {
  checkScreenPermission
};

