const sql = require('mssql');
const dbService = require('./db.service');

class AuthService {
  async login(username, password, ipAddress) {
    try {
      const pool = await dbService.connect();

      const query = `
        SELECT
          su.SU_ID, su.SU_Code, su.SU_Name1, su.SU_Name2, su.SU_Email,
          su.SU_Username, su.SU_Password, su.SU_Active, su.IC_ID, su.SR_ID,
          sr.SR_Code, sr.SR_Name
        FROM [dbo].[SystemUser] su
        LEFT JOIN [dbo].[SystemRole] sr ON su.SR_ID = sr.SR_ID
        WHERE su.SU_Username = @Username AND su.SU_Active = 1
      `;

      const result = await pool.request()
        .input('Username', sql.NVarChar, username)
        .query(query);

      if (result.recordset.length === 0) {
        throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }

      const user = result.recordset.find(u => u.SU_Password === password);

      if (!user) {
        throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }

      await pool.request()
        .input('UserId', sql.Int, user.SU_ID)
        .query('UPDATE [dbo].[SystemUser] SET SU_LogOn = 1 WHERE SU_ID = @UserId');

      await pool.request()
        .input('UserId', sql.Int, user.SU_ID)
        .input('EventType', sql.NVarChar, 'Login')
        .input('IPAddress', sql.NVarChar, ipAddress)
        .query(`
          INSERT INTO [dbo].[ConnectionHistory] (SU_ID, CH_EventType, CH_IPAddress, CH_RecordedOn)
          VALUES (@UserId, @EventType, @IPAddress, GETDATE())
        `);

      const { SU_Password, ...userWithoutPassword } = user;

      // IC_ID = NULL หมายถึง Super Admin (ไม่ต้อง fallback)
      // ส่ง IC_ID กลับไปตามที่เป็นในฐานข้อมูล (รวมถึง NULL)
      console.log(`[AUTH] User ${userWithoutPassword.SU_Username} logged in with IC_ID: ${userWithoutPassword.IC_ID === null ? 'NULL (Super Admin)' : userWithoutPassword.IC_ID}`);

      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  async logout(userId, ipAddress) {
    try {
      const pool = await dbService.connect();

      await pool.request()
        .input('UserId', sql.Int, userId)
        .query('UPDATE [dbo].[SystemUser] SET SU_LogOn = 0 WHERE SU_ID = @UserId');

      await pool.request()
        .input('UserId', sql.Int, userId)
        .input('EventType', sql.NVarChar, 'Logout')
        .input('IPAddress', sql.NVarChar, ipAddress)
        .query(`
          INSERT INTO [dbo].[ConnectionHistory] (SU_ID, CH_EventType, CH_IPAddress, CH_RecordedOn)
          VALUES (@UserId, @EventType, @IPAddress, GETDATE())
        `);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * ดึงข้อมูล User ตาม ID
   * @param {number} userId - SU_ID
   * @returns {Promise<object>} User data (ไม่มี password)
   */
  async getUserById(userId) {
    try {
      const pool = await dbService.connect();

      const query = `
        SELECT
          su.SU_ID, su.SU_Code, su.SU_Name1, su.SU_Name2, su.SU_Email,
          su.SU_Username, su.SU_Active, su.IC_ID, su.SR_ID,
          sr.SR_Code, sr.SR_Name
        FROM [dbo].[SystemUser] su
        LEFT JOIN [dbo].[SystemRole] sr ON su.SR_ID = sr.SR_ID
        WHERE su.SU_ID = @UserId AND su.SU_Active = 1
      `;

      const result = await pool.request()
        .input('UserId', sql.Int, userId)
        .query(query);

      if (result.recordset.length === 0) {
        throw new Error('User not found or inactive');
      }

      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
