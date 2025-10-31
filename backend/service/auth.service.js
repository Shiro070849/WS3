const sql = require('mssql');
const dbService = require('./db.service');

class AuthService {
  async login(username, password, ipAddress) {
    try {
      const pool = await dbService.connect();

      const query = `
        SELECT SU_ID, SU_Code, SU_Name1, SU_Name2, SU_Email, SU_Username, SU_Password, SU_Active, IC_ID
        FROM [dbo].[SystemUser]
        WHERE SU_Username = @Username AND SU_Active = 1
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

      // Fallback: ถ้า user ไม่มี IC_ID ให้เป็นบริษัทหลัก (IC_ID = 1)
      if (!userWithoutPassword.IC_ID) {
        console.warn(`⚠️ User ${userWithoutPassword.SU_Username} has no IC_ID, setting default to 1`);
        userWithoutPassword.IC_ID = 1;
      }

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
}

module.exports = new AuthService();
