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
      request.input('WI_CardID', sql.NVarChar, data.cardId || null);
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
      // ใช้เวลาปัจจุบันจาก Server เสมอ เพื่อให้เวลาเข้า (WI_RecordedOn) ตรงกับข้อมูลจริงใน DB
      // และไม่ขึ้นกับ timezone/clock ของอุปกรณ์ที่ส่งข้อมูลมา
      request.input('WI_RecordedOn', sql.DateTime, new Date());
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
          su.SU_Code as SystemUserCode,
          wo.WO_ID,
          wo.WO_RecordedOn,
          wo.WO_RecordedOn as CheckOutTime
        FROM [dbo].[WayIn] wi
        LEFT JOIN [dbo].[SystemUser] su ON wi.SU_ID = su.SU_ID
        LEFT JOIN [dbo].[WayOut] wo ON wi.WI_ID = wo.WI_ID
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
        ORDER BY wi.WI_RecordedOn ASC
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
          wo.WO_RecordedOn as CheckOutTime,
          ic.IC_LogoPath,
          ic.IC_LocalName,
          ic.IC_EnglishName,
          vt.VT_LocalName,
          vt.VT_EnglishName
        FROM [dbo].[WayIn] wi
        LEFT JOIN [dbo].[SystemUser] su ON wi.SU_ID = su.SU_ID
        LEFT JOIN [dbo].[WayOut] wo ON wi.WI_ID = wo.WI_ID
        LEFT JOIN [dbo].[InternalCompany] ic ON wi.IC_ID = ic.IC_ID
        LEFT JOIN [dbo].[VisitType] vt ON wi.VT_ID = vt.VT_ID
        ORDER BY wi.WI_RecordedOn ASC
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

  // ค้นหาด้วย Barcode (สำหรับรีปริ้น)
  async searchByBarcode(barcode) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        SELECT
          wi.*,
          su.SU_Name1 as SystemUserName,
          su.SU_Code as SystemUserCode,
          wo.WO_ID,
          wo.WO_RecordedOn as CheckOutTime,
          ic.IC_LogoPath,
          ic.IC_LocalName,
          ic.IC_EnglishName,
          vt.VT_LocalName,
          vt.VT_EnglishName
        FROM [dbo].[WayIn] wi
        LEFT JOIN [dbo].[SystemUser] su ON wi.SU_ID = su.SU_ID
        LEFT JOIN [dbo].[WayOut] wo ON wi.WI_ID = wo.WI_ID
        LEFT JOIN [dbo].[InternalCompany] ic ON wi.IC_ID = ic.IC_ID
        LEFT JOIN [dbo].[VisitType] vt ON wi.VT_ID = vt.VT_ID
        WHERE wi.WI_Barcode = @Barcode
      `;

      request.input('Barcode', sql.NVarChar, barcode);
      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error searching by barcode:', error);
      throw error;
    }
  }

  // อัพเดทข้อมูล WayIn (สำหรับรีปริ้น)
  async updateWayIn(id, data) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      // อ่านข้อมูลเดิมก่อน เพื่อไม่ให้ overwrite ค่าที่เป็น null/undefined
      const existingData = await this.getWayInById(id);
      if (!existingData) {
        throw new Error('WayIn record not found');
      }

      // Helper function: ใช้ค่าใหม่ถ้ามี ไม่เช่นนั้นใช้ค่าเดิม
      const getValue = (newValue, oldValue) => {
        // ถ้า newValue เป็น undefined หรือ null ให้ใช้ oldValue
        if (newValue === undefined || newValue === null) {
          return oldValue;
        }
        return newValue;
      };

      const query = `
        UPDATE [dbo].[WayIn]
        SET
          [WI_FullName] = @WI_FullName,
          [WI_CardID] = @WI_CardID,
          [WI_Gender] = @WI_Gender,
          [WI_Address] = @WI_Address,
          [WI_LicensePlate] = @WI_LicensePlate,
          [WI_LicenseProvince] = @WI_LicenseProvince,
          [WI_VehicleType] = @WI_VehicleType,
          [VT_ID] = @VT_ID,
          [WI_InternalDivision] = @WI_InternalDivision,
          [WI_Follower] = @WI_Follower,
          [WI_Remarks] = @WI_Remarks,
          [WI_FromCompany] = @WI_FromCompany,
          [WI_ContactName] = @WI_ContactName,
          [WI_ReprintOn] = CASE WHEN @ShouldUpdateReprintOn = 1 THEN GETDATE() ELSE [WI_ReprintOn] END
        WHERE [WI_ID] = @WI_ID;

        SELECT
          wi.*,
          su.SU_Name1 as SystemUserName,
          su.SU_Code as SystemUserCode,
          wo.WO_ID,
          wo.WO_RecordedOn,
          wo.WO_RecordedOn as CheckOutTime
        FROM [dbo].[WayIn] wi
        LEFT JOIN [dbo].[SystemUser] su ON wi.SU_ID = su.SU_ID
        LEFT JOIN [dbo].[WayOut] wo ON wi.WI_ID = wo.WI_ID
        WHERE wi.WI_ID = @WI_ID
      `;

      request.input('WI_ID', sql.Int, id);
      request.input('WI_FullName', sql.NVarChar, getValue(data.fullName, existingData.WI_FullName));
      request.input('WI_CardID', sql.NVarChar, getValue(data.cardId, existingData.WI_CardID));
      request.input('WI_Gender', sql.NVarChar, getValue(data.gender, existingData.WI_Gender));
      request.input('WI_Address', sql.NVarChar, getValue(data.address, existingData.WI_Address));
      request.input('WI_LicensePlate', sql.NVarChar, getValue(data.licensePlate, existingData.WI_LicensePlate));
      request.input('WI_LicenseProvince', sql.NVarChar, getValue(data.licenseProvince, existingData.WI_LicenseProvince));
      request.input('WI_VehicleType', sql.NVarChar, getValue(data.vehicleType, existingData.WI_VehicleType));
      request.input('VT_ID', sql.Int, getValue(data.visitTypeId, existingData.VT_ID));
      request.input('WI_InternalDivision', sql.NVarChar, getValue(data.internalDivision, existingData.WI_InternalDivision));
      request.input('WI_Follower', sql.Int, getValue(data.follower, existingData.WI_Follower));
      request.input('WI_Remarks', sql.NVarChar, getValue(data.remarks, existingData.WI_Remarks));
      request.input('WI_FromCompany', sql.NVarChar, getValue(data.fromCompany, existingData.WI_FromCompany));
      request.input('WI_ContactName', sql.NVarChar, getValue(data.contactName, existingData.WI_ContactName));
      // WI_ReprintOn:
      // - ถ้ามีการขออัพเดท (data.reprintOn มีค่า) ให้ใช้ GETDATE() ของ SQL Server โดยตรง
      //   เพื่อให้ได้เวลาปัจจุบันตาม timezone ของ SQL Server (ควรเป็นเวลาไทย)
      //   และสามารถบันทึกทับค่าเดิมได้
      // - ถ้าไม่มีการขออัพเดท ให้ใช้ค่าเดิมจาก DB
      const shouldUpdateReprintOn = data.reprintOn ? 1 : 0;
      request.input('ShouldUpdateReprintOn', sql.Bit, shouldUpdateReprintOn);
      
      if (shouldUpdateReprintOn) {
        console.log('[WAYIN SERVICE] Updating WI_ReprintOn with SQL Server GETDATE():', {
          previous: existingData.WI_ReprintOn,
          willUse: 'GETDATE() from SQL Server (current server time)'
        });
      }

      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error updating WayIn:', error);
      throw error;
    }
  }

  // ดึงรายการ VisitType (สำหรับ dropdown)
  async getVisitTypes() {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        SELECT VT_ID, VT_LocalName, VT_EnglishName
        FROM [dbo].[VisitType]
        WHERE VT_IsActive = 1
        ORDER BY VT_LocalName
      `;

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting visit types:', error);
      throw error;
    }
  }

  // ดึงข้อมูลทั้งหมด (สำหรับรีปริ้น)
  async getAllWayIn(limit = 1000) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        SELECT TOP (@Limit)
          wi.*,
          su.SU_Name1 as SystemUserName,
          su.SU_Code as SystemUserCode,
          wo.WO_ID,
          wo.WO_RecordedOn as CheckOutTime,
          ic.IC_LogoPath,
          ic.IC_LocalName,
          ic.IC_EnglishName,
          vt.VT_LocalName,
          vt.VT_EnglishName
        FROM [dbo].[WayIn] wi
        LEFT JOIN [dbo].[SystemUser] su ON wi.SU_ID = su.SU_ID
        LEFT JOIN [dbo].[WayOut] wo ON wi.WI_ID = wo.WI_ID
        LEFT JOIN [dbo].[InternalCompany] ic ON wi.IC_ID = ic.IC_ID
        LEFT JOIN [dbo].[VisitType] vt ON wi.VT_ID = vt.VT_ID
        ORDER BY wi.WI_RecordedOn ASC
      `;

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
