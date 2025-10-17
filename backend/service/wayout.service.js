const sql = require('mssql');
const dbService = require('./db.service');

class WayOutService {
  // สร้างข้อมูลการออก
  async createWayOut(data) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      // ตรวจสอบว่า WI_ID มีอยู่จริงและยังไม่มี WayOut
      const checkQuery = `
        SELECT wi.WI_ID, wo.WO_ID
        FROM [dbo].[WayIn] wi
        LEFT JOIN [dbo].[WayOut] wo ON wi.WI_ID = wo.WI_ID
        WHERE wi.WI_ID = @WI_ID
      `;

      request.input('WI_ID', sql.Int, data.wayInId);
      const checkResult = await request.query(checkQuery);

      if (checkResult.recordset.length === 0) {
        throw new Error('WayIn ID not found');
      }

      if (checkResult.recordset[0].WO_ID) {
        throw new Error('This visitor has already checked out');
      }

      // สร้าง WayOut ใหม่
      const insertQuery = `
        INSERT INTO [dbo].[WayOut] (
          [WI_ID],
          [SU_ID],
          [WO_RecordedOn],
          [WO_Remarks]
        )
        VALUES (
          @WI_ID,
          @SU_ID,
          @WO_RecordedOn,
          @WO_Remarks
        );
        SELECT SCOPE_IDENTITY() AS WO_ID;
      `;

      const insertRequest = pool.request();
      insertRequest.input('WI_ID', sql.Int, data.wayInId);
      insertRequest.input('SU_ID', sql.Int, data.systemUserId);
      insertRequest.input('WO_RecordedOn', sql.DateTime, data.recordedOn || new Date());
      insertRequest.input('WO_Remarks', sql.NVarChar, data.remarks || null);

      const result = await insertRequest.query(insertQuery);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating WayOut:', error);
      throw error;
    }
  }

  // ดึงข้อมูลการออกตาม ID
  async getWayOutById(id) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        SELECT
          wo.*,
          wi.WI_FullName,
          wi.WI_LicensePlate,
          wi.WI_RecordedOn as CheckInTime,
          su.SU_Name1 as SystemUserName,
          su.SU_Code as SystemUserCode
        FROM [dbo].[WayOut] wo
        LEFT JOIN [dbo].[WayIn] wi ON wo.WI_ID = wi.WI_ID
        LEFT JOIN [dbo].[SystemUser] su ON wo.SU_ID = su.SU_ID
        WHERE wo.WO_ID = @WO_ID
      `;

      request.input('WO_ID', sql.Int, id);
      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error getting WayOut:', error);
      throw error;
    }
  }

  // ดึงข้อมูลการออกตาม WayIn ID
  async getWayOutByWayInId(wayInId) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        SELECT
          wo.*,
          su.SU_Name1 as SystemUserName,
          su.SU_Code as SystemUserCode
        FROM [dbo].[WayOut] wo
        LEFT JOIN [dbo].[SystemUser] su ON wo.SU_ID = su.SU_ID
        WHERE wo.WI_ID = @WI_ID
      `;

      request.input('WI_ID', sql.Int, wayInId);
      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error getting WayOut by WayIn ID:', error);
      throw error;
    }
  }

  // ดึงรายการการออกทั้งหมด (พร้อม pagination)
  async getAllWayOut(page = 1, limit = 50) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const offset = (page - 1) * limit;

      const query = `
        SELECT
          wo.*,
          wi.WI_FullName,
          wi.WI_LicensePlate,
          wi.WI_RecordedOn as CheckInTime,
          su.SU_Name1 as SystemUserName,
          su.SU_Code as SystemUserCode
        FROM [dbo].[WayOut] wo
        LEFT JOIN [dbo].[WayIn] wi ON wo.WI_ID = wi.WI_ID
        LEFT JOIN [dbo].[SystemUser] su ON wo.SU_ID = su.SU_ID
        ORDER BY wo.WO_RecordedOn DESC
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY
      `;

      request.input('Offset', sql.Int, offset);
      request.input('Limit', sql.Int, limit);

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting all WayOut:', error);
      throw error;
    }
  }
}

module.exports = new WayOutService();
