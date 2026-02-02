const sql = require('mssql');
const dbService = require('./db.service');

class LocationService {
  // ==================== LOCATION CRUD ====================

  /**
   * ดึงรายการ Location ทั้งหมด (with pagination & search)
   */
  async getAllLocations(page = 1, limit = 25, search = '') {
    try {
      const pool = await dbService.connect();
      const offset = (page - 1) * limit;

      // สร้าง WHERE condition
      let whereClause = 'WHERE 1=1';
      if (search) {
        whereClause += ` AND (GL_Code LIKE @search OR GL_Name LIKE @search)`;
      }

      // Count query
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM [dbo].[GuardLocation]
        ${whereClause}
      `;

      // Data query
      const dataQuery = `
        SELECT
          GL_ID,
          GL_Code,
          GL_Name,
          GL_Description,
          GL_Active,
          GL_CreatedAt,
          GL_CreatedBy,
          GL_UpdatedAt,
          GL_UpdatedBy
        FROM [dbo].[GuardLocation]
        ${whereClause}
        ORDER BY GL_Code ASC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;

      const countRequest = pool.request();
      const dataRequest = pool.request()
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit);

      if (search) {
        countRequest.input('search', sql.NVarChar, `%${search}%`);
        dataRequest.input('search', sql.NVarChar, `%${search}%`);
      }

      const [countResult, dataResult] = await Promise.all([
        countRequest.query(countQuery),
        dataRequest.query(dataQuery)
      ]);

      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.recordset,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error getting all locations:', error);
      throw error;
    }
  }

  /**
   * ดึงรายการ Location ที่ Active (สำหรับ dropdown)
   */
  async getActiveLocations() {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT
          GL_ID,
          GL_Code,
          GL_Name,
          GL_Description
        FROM [dbo].[GuardLocation]
        WHERE GL_Active = 1
        ORDER BY GL_Code ASC
      `;
      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error getting active locations:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูล Location ตาม ID
   */
  async getLocationById(id) {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT
          GL_ID,
          GL_Code,
          GL_Name,
          GL_Description,
          GL_Active,
          GL_CreatedAt,
          GL_CreatedBy,
          GL_UpdatedAt,
          GL_UpdatedBy
        FROM [dbo].[GuardLocation]
        WHERE GL_ID = @GL_ID
      `;
      const result = await pool.request()
        .input('GL_ID', sql.Int, id)
        .query(query);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0];
    } catch (error) {
      console.error('Error getting location by ID:', error);
      throw error;
    }
  }

  /**
   * สร้าง Location ใหม่
   */
  async createLocation(data, userId) {
    try {
      const pool = await dbService.connect();

      // ตรวจสอบว่า GL_Code ซ้ำหรือไม่
      const checkQuery = `
        SELECT GL_ID FROM [dbo].[GuardLocation]
        WHERE GL_Code = @GL_Code
      `;
      const checkResult = await pool.request()
        .input('GL_Code', sql.NVarChar(255), data.code)
        .query(checkQuery);

      if (checkResult.recordset.length > 0) {
        throw new Error('Location code already exists');
      }

      // Insert
      const insertQuery = `
        INSERT INTO [dbo].[GuardLocation] (
          GL_Code,
          GL_Name,
          GL_Description,
          GL_Active,
          GL_CreatedBy
        )
        VALUES (
          @GL_Code,
          @GL_Name,
          @GL_Description,
          @GL_Active,
          @GL_CreatedBy
        );
        SELECT SCOPE_IDENTITY() AS GL_ID;
      `;

      const result = await pool.request()
        .input('GL_Code', sql.NVarChar(255), data.code)
        .input('GL_Name', sql.NVarChar(100), data.name)
        .input('GL_Description', sql.NVarChar(255), data.description || null)
        .input('GL_Active', sql.Bit, data.active !== undefined ? data.active : 1)
        .input('GL_CreatedBy', sql.Int, userId)
        .query(insertQuery);

      return { GL_ID: result.recordset[0].GL_ID };
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  /**
   * แก้ไขข้อมูล Location
   */
  async updateLocation(id, data, userId) {
    try {
      const pool = await dbService.connect();

      // ตรวจสอบว่า GL_Code ซ้ำหรือไม่ (ยกเว้น ID ตัวเอง)
      const checkQuery = `
        SELECT GL_ID FROM [dbo].[GuardLocation]
        WHERE GL_Code = @GL_Code AND GL_ID != @GL_ID
      `;
      const checkResult = await pool.request()
        .input('GL_Code', sql.NVarChar(255), data.code)
        .input('GL_ID', sql.Int, id)
        .query(checkQuery);

      if (checkResult.recordset.length > 0) {
        throw new Error('Location code already exists');
      }

      // Update
      const updateQuery = `
        UPDATE [dbo].[GuardLocation]
        SET
          GL_Code = @GL_Code,
          GL_Name = @GL_Name,
          GL_Description = @GL_Description,
          GL_Active = @GL_Active,
          GL_UpdatedAt = GETDATE(),
          GL_UpdatedBy = @GL_UpdatedBy
        WHERE GL_ID = @GL_ID
      `;

      await pool.request()
        .input('GL_ID', sql.Int, id)
        .input('GL_Code', sql.NVarChar(255), data.code)
        .input('GL_Name', sql.NVarChar(100), data.name)
        .input('GL_Description', sql.NVarChar(255), data.description || null)
        .input('GL_Active', sql.Bit, data.active)
        .input('GL_UpdatedBy', sql.Int, userId)
        .query(updateQuery);

      return { success: true };
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  /**
   * ลบ Location (soft delete)
   */
  async deleteLocation(id) {
    try {
      const pool = await dbService.connect();

      // ตรวจสอบว่ามี User ใช้ Location นี้อยู่หรือไม่
      const checkUsageQuery = `
        SELECT COUNT(*) AS count
        FROM [dbo].[SystemUser]
        WHERE CAST(User_Location AS NVARCHAR(255)) = (
          SELECT GL_Code FROM [dbo].[GuardLocation] WHERE GL_ID = @GL_ID
        )
        AND SU_Active = 1
      `;

      const usageResult = await pool.request()
        .input('GL_ID', sql.Int, id)
        .query(checkUsageQuery);

      if (usageResult.recordset[0].count > 0) {
        throw new Error('Cannot delete location: currently in use by users');
      }

      // Soft delete
      const deleteQuery = `
        UPDATE [dbo].[GuardLocation]
        SET GL_Active = 0, GL_UpdatedAt = GETDATE()
        WHERE GL_ID = @GL_ID
      `;

      await pool.request()
        .input('GL_ID', sql.Int, id)
        .query(deleteQuery);

      return { success: true };
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่า Location code มีอยู่แล้วหรือไม่
   */
  async checkLocationExists(code) {
    try {
      const pool = await dbService.connect();
      const query = `
        SELECT GL_ID FROM [dbo].[GuardLocation]
        WHERE GL_Code = @GL_Code AND GL_Active = 1
      `;
      const result = await pool.request()
        .input('GL_Code', sql.NVarChar(255), code)
        .query(query);

      return result.recordset.length > 0;
    } catch (error) {
      console.error('Error checking location exists:', error);
      throw error;
    }
  }
}

module.exports = new LocationService();
