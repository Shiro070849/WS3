const sql = require('mssql');
const dbService = require('./db.service');
const settingsService = require('./settings.service');

class PermissionService {
  /**
   * ดึง Screen IDs ที่ User เข้าถึงได้
   * @param {number} userId - SU_ID
   * @returns {Promise<number[]>} Array ของ SS_ID ที่ user เข้าถึงได้
   */
  async getUserAccessibleScreens(userId) {
    try {
      const pool = await dbService.connect();

      // 1. ดึงข้อมูล User (SR_ID, IC_ID)
      const userQuery = `
        SELECT SU_ID, SR_ID, IC_ID
        FROM [dbo].[SystemUser]
        WHERE SU_ID = @UserId AND SU_Active = 1
      `;

      const userResult = await pool.request()
        .input('UserId', sql.Int, userId)
        .query(userQuery);

      if (userResult.recordset.length === 0) {
        throw new Error('User not found or inactive');
      }

      const user = userResult.recordset[0];
      const isSuperAdmin = user.IC_ID === null || user.IC_ID === undefined;

      // 2. ถ้าเป็น Super Admin → return ทุก Screen
      if (isSuperAdmin) {
        const allScreensQuery = `
          SELECT SS_ID
          FROM [dbo].[SystemScreen]
          WHERE SS_IsActive = 1
        `;
        const allScreensResult = await pool.request().query(allScreensQuery);
        const allScreenIds = allScreensResult.recordset.map(row => row.SS_ID);
        console.log(`[PERMISSION] Super Admin (User ${userId}): Access to all ${allScreenIds.length} screens`);
        return allScreenIds;
      }

      // 3. ถ้าไม่ใช่ Super Admin → ดึง Screen จาก SystemRoleSystemScreen
      // ดึง Company IDs ที่ User เห็นได้ (จาก SystemUserCompany)
      const accessibleCompanyIds = await settingsService.getUserAccessibleCompanyIds(userId);
      
      if (!accessibleCompanyIds || accessibleCompanyIds.length === 0) {
        console.log(`[PERMISSION] User ${userId}: No accessible companies, returning empty screens`);
        return [];
      }

      // ดึง Permissions ที่:
      // - IC_ID = NULL (Global) → ใช้ได้ทุกบริษัท
      // - IC_ID IN (accessibleCompanyIds) (Company-specific) → ใช้ได้เฉพาะบริษัทที่ User เห็นได้
      const companyIdsPlaceholder = accessibleCompanyIds.map((_, index) => `@CompanyId${index}`).join(', ');
      const permissionQuery = `
        SELECT DISTINCT SRSS.SS_ID
        FROM [dbo].[SystemRoleSystemScreen] SRSS
        INNER JOIN [dbo].[SystemScreen] SS ON SRSS.SS_ID = SS.SS_ID
        WHERE SRSS.SR_ID = @SR_ID
          AND SS.SS_IsActive = 1
          AND (SRSS.IC_ID IS NULL OR SRSS.IC_ID IN (${companyIdsPlaceholder}))
        ORDER BY SRSS.SS_ID
      `;

      const permissionRequest = pool.request()
        .input('SR_ID', sql.Int, user.SR_ID);
      
      accessibleCompanyIds.forEach((companyId, index) => {
        permissionRequest.input(`CompanyId${index}`, sql.Int, companyId);
      });

      const permissionResult = await permissionRequest.query(permissionQuery);

      const accessibleScreenIds = permissionResult.recordset.map(row => row.SS_ID);

      console.log(`[PERMISSION] User ${userId} (SR_ID: ${user.SR_ID}, Companies: [${accessibleCompanyIds.join(', ')}]): Access to ${accessibleScreenIds.length} screens: [${accessibleScreenIds.join(', ')}]`);

      return accessibleScreenIds;
    } catch (error) {
      console.error('Error in getUserAccessibleScreens:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่า User เข้าถึง Screen ได้หรือไม่
   * @param {number} userId - SU_ID
   * @param {number} screenId - SS_ID
   * @returns {Promise<boolean>} true ถ้าเข้าถึงได้, false ถ้าเข้าถึงไม่ได้
   */
  async hasScreenAccess(userId, screenId) {
    try {
      const accessibleScreens = await this.getUserAccessibleScreens(userId);
      return accessibleScreens.includes(screenId);
    } catch (error) {
      console.error('Error in hasScreenAccess:', error);
      return false; // Fail secure: ถ้า error ให้ deny access
    }
  }

  /**
   * ดึงข้อมูล Permission ทั้งหมดของ User (สำหรับ API response)
   * @param {number} userId - SU_ID
   * @returns {Promise<object>} Object ที่มี accessibleScreens, roleId, roleCode, isSuperAdmin
   */
  async getUserPermissions(userId) {
    try {
      const pool = await dbService.connect();

      // 1. ดึงข้อมูล User
      const userQuery = `
        SELECT 
          su.SU_ID, su.SR_ID, su.IC_ID,
          sr.SR_Code, sr.SR_Name
        FROM [dbo].[SystemUser] su
        LEFT JOIN [dbo].[SystemRole] sr ON su.SR_ID = sr.SR_ID
        WHERE su.SU_ID = @UserId AND su.SU_Active = 1
      `;

      const userResult = await pool.request()
        .input('UserId', sql.Int, userId)
        .query(userQuery);

      if (userResult.recordset.length === 0) {
        throw new Error('User not found or inactive');
      }

      const user = userResult.recordset[0];
      const isSuperAdmin = user.IC_ID === null || user.IC_ID === undefined;

      // 2. ดึง Screen ที่เข้าถึงได้
      const accessibleScreens = await this.getUserAccessibleScreens(userId);

      return {
        accessibleScreens,
        roleId: user.SR_ID,
        roleCode: user.SR_Code || null,
        roleName: user.SR_Name || null,
        isSuperAdmin,
        companyId: user.IC_ID
      };
    } catch (error) {
      console.error('Error in getUserPermissions:', error);
      throw error;
    }
  }
}

module.exports = new PermissionService();

