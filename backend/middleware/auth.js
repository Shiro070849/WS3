const sql = require('mssql');
const dbService = require('../service/db.service');

/**
 * Middleware สำหรับดึงข้อมูล User และ IC_ID จาก userId
 * ใช้กับทุก API ที่ต้องการกรองข้อมูลตาม Company
 */
async function getUserCompanyInfo(req, res, next) {
  try {
    // รับ userId จาก query parameter หรือ header
    const userId = req.query.userId || req.headers['x-user-id'];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const pool = await dbService.connect();
    const query = `
      SELECT SU_ID, SU_Username, SU_Name1, IC_ID
      FROM [dbo].[SystemUser]
      WHERE SU_ID = @UserId AND SU_Active = 1
    `;

    const result = await pool.request()
      .input('UserId', sql.Int, parseInt(userId))
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const user = result.recordset[0];

    // เก็บข้อมูล user ใน req สำหรับใช้ใน controller/service
    req.user = {
      userId: user.SU_ID,
      username: user.SU_Username,
      name: user.SU_Name1,
      companyId: user.IC_ID, // null สำหรับ Super Admin
      isSuperAdmin: user.IC_ID === null || user.IC_ID === undefined
    };

    console.log(`[AUTH] User: ${user.SU_Username}, IC_ID: ${user.IC_ID === null ? 'NULL (Super Admin)' : user.IC_ID}`);

    next();
  } catch (error) {
    console.error('Error in getUserCompanyInfo middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
}

module.exports = {
  getUserCompanyInfo
};
