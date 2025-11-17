const sql = require('mssql');
const dbService = require('./db.service');

class VehicleTypeService {
  /**
   * ดึงรายการประเภทรถทั้งหมด
   * @param {Boolean} activeOnly - ดึงเฉพาะที่เปิดใช้งาน (default: true)
   */
  async getAllVehicleTypes(activeOnly = true) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      let query = `
        SELECT
          [VType_ID],
          [VType_LocalName],
          [VType_EnglishName],
          [VType_Description],
          [VType_IsActive],
          [VType_Order],
          [VType_CreatedOn],
          [VType_UpdatedOn]
        FROM [dbo].[VehicleType]
      `;

      if (activeOnly) {
        query += ' WHERE [VType_IsActive] = 1';
      }

      query += ' ORDER BY [VType_Order], [VType_LocalName]';

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting all vehicle types:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลประเภทรถตาม ID
   */
  async getVehicleTypeById(id) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        SELECT
          [VType_ID],
          [VType_LocalName],
          [VType_EnglishName],
          [VType_Description],
          [VType_IsActive],
          [VType_Order],
          [VType_CreatedOn],
          [VType_UpdatedOn]
        FROM [dbo].[VehicleType]
        WHERE [VType_ID] = @VType_ID
      `;

      request.input('VType_ID', sql.Int, id);
      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error getting vehicle type by ID:', error);
      throw error;
    }
  }

  /**
   * สร้างประเภทรถใหม่
   */
  async createVehicleType(data) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        INSERT INTO [dbo].[VehicleType] (
          [VType_LocalName],
          [VType_EnglishName],
          [VType_Description],
          [VType_IsActive],
          [VType_Order],
          [VType_CreatedOn]
        )
        VALUES (
          @VType_LocalName,
          @VType_EnglishName,
          @VType_Description,
          @VType_IsActive,
          @VType_Order,
          @VType_CreatedOn
        );
        SELECT SCOPE_IDENTITY() AS VType_ID;
      `;

      request.input('VType_LocalName', sql.NVarChar, data.localName);
      request.input('VType_EnglishName', sql.NVarChar, data.englishName || null);
      request.input('VType_Description', sql.NVarChar, data.description || null);
      request.input('VType_IsActive', sql.Bit, data.isActive !== undefined ? data.isActive : true);
      request.input('VType_Order', sql.Int, data.order || 0);
      request.input('VType_CreatedOn', sql.DateTime, new Date());

      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating vehicle type:', error);
      throw error;
    }
  }

  /**
   * แก้ไขข้อมูลประเภทรถ
   */
  async updateVehicleType(id, data) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        UPDATE [dbo].[VehicleType]
        SET
          [VType_LocalName] = @VType_LocalName,
          [VType_EnglishName] = @VType_EnglishName,
          [VType_Description] = @VType_Description,
          [VType_IsActive] = @VType_IsActive,
          [VType_Order] = @VType_Order,
          [VType_UpdatedOn] = @VType_UpdatedOn
        WHERE [VType_ID] = @VType_ID
      `;

      request.input('VType_ID', sql.Int, id);
      request.input('VType_LocalName', sql.NVarChar, data.localName);
      request.input('VType_EnglishName', sql.NVarChar, data.englishName || null);
      request.input('VType_Description', sql.NVarChar, data.description || null);
      request.input('VType_IsActive', sql.Bit, data.isActive !== undefined ? data.isActive : true);
      request.input('VType_Order', sql.Int, data.order || 0);
      request.input('VType_UpdatedOn', sql.DateTime, new Date());

      await request.query(query);
      return { success: true, message: 'Vehicle type updated successfully' };
    } catch (error) {
      console.error('Error updating vehicle type:', error);
      throw error;
    }
  }

  /**
   * ลบประเภทรถ (Soft Delete)
   */
  async deleteVehicleType(id) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      // ตรวจสอบว่ามีการใช้งานอยู่หรือไม่
      const checkQuery = `
        SELECT COUNT(*) as UsageCount
        FROM [dbo].[WayIn]
        WHERE [VType_ID] = @VType_ID
      `;
      request.input('VType_ID', sql.Int, id);
      const checkResult = await request.query(checkQuery);

      if (checkResult.recordset[0].UsageCount > 0) {
        // ถ้ามีการใช้งาน ให้ Soft Delete (เปลี่ยนสถานะเป็นไม่ใช้งาน)
        const softDeleteQuery = `
          UPDATE [dbo].[VehicleType]
          SET [VType_IsActive] = 0,
              [VType_UpdatedOn] = @VType_UpdatedOn
          WHERE [VType_ID] = @VType_ID
        `;
        const softDeleteRequest = pool.request();
        softDeleteRequest.input('VType_ID', sql.Int, id);
        softDeleteRequest.input('VType_UpdatedOn', sql.DateTime, new Date());
        await softDeleteRequest.query(softDeleteQuery);

        return {
          success: true,
          message: 'Vehicle type deactivated (used in records)',
          type: 'soft_delete'
        };
      } else {
        // ถ้าไม่มีการใช้งาน ลบได้เลย
        const hardDeleteQuery = `
          DELETE FROM [dbo].[VehicleType]
          WHERE [VType_ID] = @VType_ID
        `;
        const hardDeleteRequest = pool.request();
        hardDeleteRequest.input('VType_ID', sql.Int, id);
        await hardDeleteRequest.query(hardDeleteQuery);

        return {
          success: true,
          message: 'Vehicle type deleted successfully',
          type: 'hard_delete'
        };
      }
    } catch (error) {
      console.error('Error deleting vehicle type:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่าชื่อประเภทรถซ้ำหรือไม่
   */
  async checkDuplicateName(localName, excludeId = null) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      let query = `
        SELECT COUNT(*) as Count
        FROM [dbo].[VehicleType]
        WHERE [VType_LocalName] = @VType_LocalName
      `;

      if (excludeId) {
        query += ' AND [VType_ID] != @ExcludeId';
        request.input('ExcludeId', sql.Int, excludeId);
      }

      request.input('VType_LocalName', sql.NVarChar, localName);
      const result = await request.query(query);

      return result.recordset[0].Count > 0;
    } catch (error) {
      console.error('Error checking duplicate name:', error);
      throw error;
    }
  }
}

module.exports = new VehicleTypeService();
