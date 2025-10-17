const sql = require('mssql');
const dbService = require('./db.service');

class WayInService {
  // สร้างข้อมูลการเข้า
  async createWayIn(data) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        INSERT INTO [dbo].[WayIn] (
          [WI_Barcode],
          [WI_CardID],
          [WI_FullName],
          [WI_Gender],
          [WI_Address],
          [WI_LicensePlate],
          [WI_LicenseProvince],
          [WI_VehicleType],
          [WI_InternalDivision],
          [WI_Follower],
          [WI_Remarks],
          [SU_ID],
          [WI_RecordedOn],
          [IC_ID],
          [ID_ID],
          [VT_ID],
          [WI_FromCompany],
          [WI_Images],
          [WI_ContactName],
          [SU_IDInternal],
          [SU_IDInternalRecordedOn],
          [SU_IDInternal_Remark],
          [QDevice]
        )
        VALUES (
          @WI_Barcode,
          @WI_CardID,
          @WI_FullName,
          @WI_Gender,
          @WI_Address,
          @WI_LicensePlate,
          @WI_LicenseProvince,
          @WI_VehicleType,
          @WI_InternalDivision,
          @WI_Follower,
          @WI_Remarks,
          @SU_ID,
          @WI_RecordedOn,
          @IC_ID,
          @ID_ID,
          @VT_ID,
          @WI_FromCompany,
          @WI_Images,
          @WI_ContactName,
          @SU_IDInternal,
          @SU_IDInternalRecordedOn,
          @SU_IDInternal_Remark,
          @QDevice
        );
        SELECT SCOPE_IDENTITY() AS WI_ID;
      `;

      // เพิ่ม parameters
      request.input('WI_Barcode', sql.NVarChar, data.barcode || null);
      request.input('WI_CardID', sql.Int, data.cardId !== undefined ? data.cardId : null);
      request.input('WI_FullName', sql.NVarChar, data.fullName || null);
      request.input('WI_Gender', sql.NVarChar, data.gender || null);
      request.input('WI_Address', sql.NVarChar, data.address || null);
      request.input('WI_LicensePlate', sql.NVarChar, data.licensePlate || null);
      request.input('WI_LicenseProvince', sql.NVarChar, data.licenseProvince || null);
      request.input('WI_VehicleType', sql.NVarChar, data.vehicleType || null);
      request.input('WI_InternalDivision', sql.NVarChar, data.internalDivision || null);
      request.input('WI_Follower', sql.Int, data.follower !== undefined ? data.follower : null);
      request.input('WI_Remarks', sql.NVarChar, data.remarks || null);
      request.input('SU_ID', sql.Int, data.systemUserId);
      request.input('WI_RecordedOn', sql.DateTime, data.recordedOn || new Date());
      request.input('IC_ID', sql.Int, data.icId !== undefined ? data.icId : null);
      request.input('ID_ID', sql.Int, data.idId !== undefined ? data.idId : null);
      request.input('VT_ID', sql.Int, data.vtId !== undefined ? data.vtId : null);
      request.input('WI_FromCompany', sql.NVarChar, data.fromCompany || null);
      request.input('WI_Images', sql.NVarChar, data.images || null);
      request.input('WI_ContactName', sql.NVarChar, data.contactName || null);
      request.input('SU_IDInternal', sql.Int, data.suIdInternal !== undefined ? data.suIdInternal : null);
      request.input('SU_IDInternalRecordedOn', sql.DateTime, data.suIdInternalRecordedOn || null);
      request.input('SU_IDInternal_Remark', sql.NVarChar, data.suIdInternalRemark || null);
      request.input('QDevice', sql.NVarChar, data.device || null);

      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating WayIn:', error);
      throw error;
    }
  }

  // ดึงข้อมูลการเข้าตาม ID
  async getWayInById(id) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        SELECT
          wi.*,
          su.SU_Name1 as SystemUserName,
          su.SU_Code as SystemUserCode
        FROM [dbo].[WayIn] wi
        LEFT JOIN [dbo].[SystemUser] su ON wi.SU_ID = su.SU_ID
        WHERE wi.WI_ID = @WI_ID
      `;

      request.input('WI_ID', sql.Int, id);
      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error getting WayIn:', error);
      throw error;
    }
  }

  // ดึงรายการผู้ที่เข้ามาทั้งหมด (ยังไม่ออก)
  async getActiveVisitors() {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        SELECT
          wi.*,
          su.SU_Name1 as SystemUserName,
          su.SU_Code as SystemUserCode
        FROM [dbo].[WayIn] wi
        LEFT JOIN [dbo].[SystemUser] su ON wi.SU_ID = su.SU_ID
        LEFT JOIN [dbo].[WayOut] wo ON wi.WI_ID = wo.WI_ID
        WHERE wo.WO_ID IS NULL
        ORDER BY wi.WI_RecordedOn DESC
      `;

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting active visitors:', error);
      throw error;
    }
  }

  // ดึงรายการการเข้าทั้งหมด (พร้อม pagination)
  async getAllWayIn(page = 1, limit = 50) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const offset = (page - 1) * limit;

      const query = `
        SELECT
          wi.*,
          su.SU_Name1 as SystemUserName,
          su.SU_Code as SystemUserCode,
          wo.WO_ID,
          wo.WO_RecordedOn as CheckOutTime
        FROM [dbo].[WayIn] wi
        LEFT JOIN [dbo].[SystemUser] su ON wi.SU_ID = su.SU_ID
        LEFT JOIN [dbo].[WayOut] wo ON wi.WI_ID = wo.WI_ID
        ORDER BY wi.WI_RecordedOn DESC
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY
      `;

      request.input('Offset', sql.Int, offset);
      request.input('Limit', sql.Int, limit);

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting all WayIn:', error);
      throw error;
    }
  }
}

module.exports = new WayInService();
