const sql = require('mssql');
const dbService = require('./db.service');
const settingsService = require('./settings.service');

class VehicleService {
  /**
   * ดึงรายการรถทั้งหมด พร้อม JOIN ข้อมูลที่เกี่ยวข้อง
   * @param {Object} filters - กรองข้อมูล (status, search, dateFrom, dateTo, companyId, userCompanyId)
   * @param {Number} page - หน้าที่ต้องการ
   * @param {Number} limit - จำนวนรายการต่อหน้า
   */
  async getAllVehicles(filters = {}, page = 1, limit = 50) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const offset = (page - 1) * limit;

      // ดึง Company IDs ที่ User เห็นได้ (จาก SystemUserCompany)
      let accessibleCompanyIds = null;
      if (filters.userId) {
        accessibleCompanyIds = await settingsService.getUserAccessibleCompanyIds(filters.userId);
      }

      console.log(`🚗 [VEHICLE SERVICE] Input: userId=${filters.userId}, companyId=${filters.companyId}, accessibleCompanyIds=${accessibleCompanyIds === null ? 'null (Super Admin)' : `[${accessibleCompanyIds.join(', ')}]`}`);

      // กำหนด companyId สุดท้าย (ตาม role)
      let finalCompanyIds = null;
      if (accessibleCompanyIds === null) {
        // Super Admin: ใช้ filterCompanyId ที่เลือก (ถ้ามี) หรือ null (เห็นทุก Company)
        if (filters.companyId) {
          finalCompanyIds = [parseInt(filters.companyId)];
          console.log(`🚗 [SUPER ADMIN] Vehicle filter by companyId: ${filters.companyId}`);
        } else {
          finalCompanyIds = null; // เห็นทุก Company
          console.log(`🚗 [SUPER ADMIN] Vehicle filter: ALL companies`);
        }
      } else {
        // User ปกติ: ใช้ Company IDs จาก SystemUserCompany
        // ถ้ามี filterCompanyId และอยู่ใน accessibleCompanyIds → ใช้ filterCompanyId
        // ถ้าไม่มี filterCompanyId → ใช้ accessibleCompanyIds ทั้งหมด
        const requestedCompanyId = filters.companyId ? parseInt(filters.companyId) : null;
        console.log(`🚗 [USER] Requested companyId: ${requestedCompanyId}, Accessible: [${accessibleCompanyIds.join(', ')}]`);
        
        if (requestedCompanyId && accessibleCompanyIds.includes(requestedCompanyId)) {
          finalCompanyIds = [requestedCompanyId];
          console.log(`🚗 [USER] Vehicle filter by selected companyId: ${requestedCompanyId}`);
        } else {
          finalCompanyIds = accessibleCompanyIds;
          if (requestedCompanyId) {
            console.log(`⚠️ [USER] Requested companyId ${requestedCompanyId} not in accessible list, using all accessible companies`);
          } else {
            console.log(`🚗 [USER] Vehicle filter by accessible companies: [${accessibleCompanyIds.join(', ')}]`);
          }
        }
      }

      // Base query
      let whereConditions = [];

      // Filter by status (all/in/out/pending)
      if (filters.status) {
        if (filters.status === 'pending') {
          whereConditions.push('WO.WO_ID IS NULL');
        } else if (filters.status === 'in') {
          whereConditions.push('WO.WO_ID IS NULL');
        } else if (filters.status === 'out') {
          whereConditions.push('WO.WO_ID IS NOT NULL');
        }
      }

      // Filter by search (license plate, barcode, full name, WI_Sequence)
      if (filters.search) {
        whereConditions.push(
          "(WI.WI_LicensePlate LIKE @Search OR WI.WI_Barcode LIKE @Search OR WI.WI_FullName LIKE @Search OR CAST(WI.WI_Sequence AS NVARCHAR) LIKE @Search)"
        );
        request.input('Search', sql.NVarChar, `%${filters.search}%`);
      }

      // Filter by date range
      // หมายเหตุ: Date จะใช้ timezone ของ server (local time)
      // Frontend ส่งมาเป็น YYYY-MM-DD ซึ่งจะถูกแปลงเป็น local midnight
      if (filters.dateFrom) {
        const startOfDay = new Date(filters.dateFrom);
        startOfDay.setHours(0, 0, 0, 0);
        whereConditions.push('WI.WI_RecordedOn >= @DateFrom');
        request.input('DateFrom', sql.DateTime, startOfDay);
      }
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        whereConditions.push('WI.WI_RecordedOn <= @DateTo');
        request.input('DateTo', sql.DateTime, endOfDay);
      }

      // Filter by company (ใช้ IN แทน = เพื่อรองรับหลาย Company)
      if (finalCompanyIds && finalCompanyIds.length > 0) {
        // สร้าง IN clause สำหรับหลาย Company IDs
        const placeholders = finalCompanyIds.map((_, index) => `@CompanyId${index}`).join(', ');
        whereConditions.push(`WI.IC_ID IN (${placeholders})`);
        finalCompanyIds.forEach((companyId, index) => {
          request.input(`CompanyId${index}`, sql.Int, companyId);
        });
      }

      // Filter by vehicle type
      if (filters.vehicleType) {
        whereConditions.push('WI.WI_VehicleType = @VehicleType');
        request.input('VehicleType', sql.NVarChar, filters.vehicleType);
      }

      const whereClause = whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      const query = `
        SELECT
          WI.WI_ID,
          WI.WI_Sequence,
          WI.WI_Barcode,
          WI.WI_LicensePlate,
          WI.WI_LicenseProvince,
          WI.WI_VehicleType,
          WI.WI_FullName,
          WI.WI_CardID,
          WI.WI_Gender,
          WI.WI_Address,
          WI.WI_Follower,
          WI.WI_Remarks,
          WI.WI_RecordedOn,
          WI.WI_ReprintOn,
          WI.WI_FromCompany,
          WI.WI_ContactName,
          WI.WI_InternalDivision,
          WI.IC_ID,
          WI.VT_ID,
          IC.IC_LocalName,
          IC.IC_EnglishName,
          IC.IC_LogoPath,
          IC.IC_LocalName as CompanyName,
          ID.ID_LocalName as DepartmentName,
          VT.VT_LocalName,
          VT.VT_EnglishName,
          VT.VT_LocalName as VisitTypeName,
          SU.SU_Name1 as RecordedByUserName,
          SU.User_Location,
          WO.WO_ID,
          WO.WO_RecordedOn,
          WO.WO_Remarks as WO_Remarks,
          CASE
            WHEN WO.WO_ID IS NULL THEN N'เข้า'
            ELSE N'ออก'
          END as Status,
          CASE
            WHEN WO.WO_ID IS NOT NULL THEN
              DATEDIFF(MINUTE, WI.WI_RecordedOn, WO.WO_RecordedOn)
            ELSE NULL
          END as DurationMinutes
        FROM [dbo].[WayIn] WI
        LEFT JOIN [dbo].[InternalCompany] IC ON WI.IC_ID = IC.IC_ID
        LEFT JOIN [dbo].[InternalDepartment] ID ON WI.ID_ID = ID.ID_ID
        LEFT JOIN [dbo].[VisitType] VT ON WI.VT_ID = VT.VT_ID
        LEFT JOIN [dbo].[SystemUser] SU ON WI.SU_ID = SU.SU_ID
        LEFT JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
        ${whereClause}
        ORDER BY WI.WI_RecordedOn ASC
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY
      `;

      request.input('Offset', sql.Int, offset);
      request.input('Limit', sql.Int, limit);

      const result = await request.query(query);

      // Count total records (ใช้ whereConditions เดียวกัน)
      const countWhereConditions = [];
      const countRequest = pool.request();

      // Filter by status
      if (filters.status) {
        if (filters.status === 'pending') {
          countWhereConditions.push('WO.WO_ID IS NULL');
        } else if (filters.status === 'in') {
          countWhereConditions.push('WO.WO_ID IS NULL');
        } else if (filters.status === 'out') {
          countWhereConditions.push('WO.WO_ID IS NOT NULL');
        }
      }

      // Filter by search
      if (filters.search) {
        countWhereConditions.push(
          "(WI.WI_LicensePlate LIKE @SearchCount OR WI.WI_Barcode LIKE @SearchCount OR WI.WI_FullName LIKE @SearchCount OR CAST(WI.WI_Sequence AS NVARCHAR) LIKE @SearchCount)"
        );
        countRequest.input('SearchCount', sql.NVarChar, `%${filters.search}%`);
      }

      // Filter by date range
      if (filters.dateFrom) {
        const startOfDay = new Date(filters.dateFrom);
        startOfDay.setHours(0, 0, 0, 0);
        countWhereConditions.push('WI.WI_RecordedOn >= @DateFromCount');
        countRequest.input('DateFromCount', sql.DateTime, startOfDay);
      }
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        countWhereConditions.push('WI.WI_RecordedOn <= @DateToCount');
        countRequest.input('DateToCount', sql.DateTime, endOfDay);
      }

      // Filter by company (ใช้ IN แทน =)
      if (finalCompanyIds && finalCompanyIds.length > 0) {
        const placeholders = finalCompanyIds.map((_, index) => `@CompanyIdCount${index}`).join(', ');
        countWhereConditions.push(`WI.IC_ID IN (${placeholders})`);
        finalCompanyIds.forEach((companyId, index) => {
          countRequest.input(`CompanyIdCount${index}`, sql.Int, companyId);
        });
      }

      // Filter by vehicle type
      if (filters.vehicleType) {
        countWhereConditions.push('WI.WI_VehicleType = @VehicleTypeCount');
        countRequest.input('VehicleTypeCount', sql.NVarChar, filters.vehicleType);
      }

      const countWhereClause = countWhereConditions.length > 0
        ? 'WHERE ' + countWhereConditions.join(' AND ')
        : '';

      const countQuery = `
        SELECT COUNT(*) as Total
        FROM [dbo].[WayIn] WI
        LEFT JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
        ${countWhereClause}
      `;
      if (filters.vehicleType) {
        countRequest.input('VehicleType', sql.NVarChar, filters.vehicleType);
      }

      const countResult = await countRequest.query(countQuery);
      const total = countResult.recordset[0].Total;

      return {
        data: result.recordset,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting all vehicles:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลรถตาม ID
   */
  async getVehicleById(id) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        SELECT
          WI.*,
          IC.IC_LocalName as CompanyName,
          ID.ID_LocalName as DepartmentName,
          VT.VT_LocalName as VisitTypeName,
          SU.SU_Name1 as RecordedByUserName,
          WO.WO_ID,
          WO.WO_RecordedOn,
          WO.WO_Remarks as WO_Remarks,
          WO.SU_ID as WO_SU_ID,
          SU2.SU_Name1 as WO_RecordedByUserName
        FROM [dbo].[WayIn] WI
        LEFT JOIN [dbo].[InternalCompany] IC ON WI.IC_ID = IC.IC_ID
        LEFT JOIN [dbo].[InternalDepartment] ID ON WI.ID_ID = ID.ID_ID
        LEFT JOIN [dbo].[VisitType] VT ON WI.VT_ID = VT.VT_ID
        LEFT JOIN [dbo].[SystemUser] SU ON WI.SU_ID = SU.SU_ID
        LEFT JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
        LEFT JOIN [dbo].[SystemUser] SU2 ON WO.SU_ID = SU2.SU_ID
        WHERE WI.WI_ID = @WI_ID
      `;

      request.input('WI_ID', sql.Int, id);
      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      throw error;
    }
  }

  /**
   * สร้างรายการรถเข้าใหม่ (WayIn)
   */
  async createVehicle(data) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        INSERT INTO [dbo].[WayIn] (
          [WI_LicensePlate],
          [WI_LicenseProvince],
          [WI_VehicleType],
          [WI_FullName],
          [WI_Gender],
          [WI_Address],
          [WI_Follower],
          [WI_Remarks],
          [SU_ID],
          [WI_RecordedOn],
          [IC_ID],
          [ID_ID],
          [VT_ID],
          [WI_FromCompany],
          [WI_ContactName]
        )
        VALUES (
          @WI_LicensePlate,
          @WI_LicenseProvince,
          @WI_VehicleType,
          @WI_FullName,
          @WI_Gender,
          @WI_Address,
          @WI_Follower,
          @WI_Remarks,
          @SU_ID,
          @WI_RecordedOn,
          @IC_ID,
          @ID_ID,
          @VT_ID,
          @WI_FromCompany,
          @WI_ContactName
        );
        SELECT SCOPE_IDENTITY() AS WI_ID;
      `;

      request.input('WI_LicensePlate', sql.NVarChar, data.licensePlate);
      request.input('WI_LicenseProvince', sql.NVarChar, data.licenseProvince || null);
      request.input('WI_VehicleType', sql.NVarChar, data.vehicleType || null);
      request.input('WI_FullName', sql.NVarChar, data.fullName || null);
      request.input('WI_Gender', sql.NVarChar, data.gender || null);
      request.input('WI_Address', sql.NVarChar, data.address || null);
      request.input('WI_Follower', sql.Int, data.follower || 0);
      request.input('WI_Remarks', sql.NVarChar, data.remarks || null);
      request.input('SU_ID', sql.Int, data.systemUserId || 1); // Default user ID
      request.input('WI_RecordedOn', sql.DateTime, data.recordedOn || new Date());
      request.input('IC_ID', sql.Int, data.companyId || null);
      request.input('ID_ID', sql.Int, data.departmentId || null);
      request.input('VT_ID', sql.Int, data.visitTypeId || null);
      request.input('WI_FromCompany', sql.NVarChar, data.fromCompany || null);
      request.input('WI_ContactName', sql.NVarChar, data.contactName || null);

      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  /**
   * แก้ไขข้อมูลรถเข้า (WayIn)
   */
  async updateVehicle(id, data) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      const query = `
        UPDATE [dbo].[WayIn]
        SET
          [WI_LicensePlate] = @WI_LicensePlate,
          [WI_LicenseProvince] = @WI_LicenseProvince,
          [WI_VehicleType] = @WI_VehicleType,
          [WI_FullName] = @WI_FullName,
          [WI_Gender] = @WI_Gender,
          [WI_Address] = @WI_Address,
          [WI_Follower] = @WI_Follower,
          [WI_Remarks] = @WI_Remarks,
          [IC_ID] = @IC_ID,
          [ID_ID] = @ID_ID,
          [VT_ID] = @VT_ID,
          [WI_FromCompany] = @WI_FromCompany,
          [WI_ContactName] = @WI_ContactName
        WHERE [WI_ID] = @WI_ID
      `;

      request.input('WI_ID', sql.Int, id);
      request.input('WI_LicensePlate', sql.NVarChar, data.licensePlate);
      request.input('WI_LicenseProvince', sql.NVarChar, data.licenseProvince || null);
      request.input('WI_VehicleType', sql.NVarChar, data.vehicleType || null);
      request.input('WI_FullName', sql.NVarChar, data.fullName || null);
      request.input('WI_Gender', sql.NVarChar, data.gender || null);
      request.input('WI_Address', sql.NVarChar, data.address || null);
      request.input('WI_Follower', sql.Int, data.follower || 0);
      request.input('WI_Remarks', sql.NVarChar, data.remarks || null);
      request.input('IC_ID', sql.Int, data.companyId || null);
      request.input('ID_ID', sql.Int, data.departmentId || null);
      request.input('VT_ID', sql.Int, data.visitTypeId || null);
      request.input('WI_FromCompany', sql.NVarChar, data.fromCompany || null);
      request.input('WI_ContactName', sql.NVarChar, data.contactName || null);

      await request.query(query);
      return { success: true, message: 'Vehicle updated successfully' };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  /**
   * ลบรายการรถ (WayIn) - ต้องลบ WayOut ก่อน
   */
  async deleteVehicle(id) {
    try {
      const pool = await dbService.connect();

      // ลบ WayOut ก่อน (ถ้ามี)
      const deleteWayOutQuery = `
        DELETE FROM [dbo].[WayOut]
        WHERE [WI_ID] = @WI_ID
      `;
      const deleteWayOutRequest = pool.request();
      deleteWayOutRequest.input('WI_ID', sql.Int, id);
      await deleteWayOutRequest.query(deleteWayOutQuery);

      // ลบ WayIn
      const deleteWayInQuery = `
        DELETE FROM [dbo].[WayIn]
        WHERE [WI_ID] = @WI_ID
      `;
      const deleteWayInRequest = pool.request();
      deleteWayInRequest.input('WI_ID', sql.Int, id);
      await deleteWayInRequest.query(deleteWayInQuery);

      return { success: true, message: 'Vehicle deleted successfully' };
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  /**
   * บันทึกรถออก (WayOut)
   */
  async checkoutVehicle(wayInId, data) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      // ตรวจสอบว่ายังไม่มี WayOut
      const checkQuery = `
        SELECT WO.WO_ID
        FROM [dbo].[WayOut] WO
        WHERE WO.WI_ID = @WI_ID
      `;
      request.input('WI_ID', sql.Int, wayInId);
      const checkResult = await request.query(checkQuery);

      if (checkResult.recordset.length > 0) {
        throw new Error('รถคันนี้ออกไปแล้ว');
      }

      // สร้าง WayOut
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
      insertRequest.input('WI_ID', sql.Int, wayInId);
      insertRequest.input('SU_ID', sql.Int, data.systemUserId || 1);
      insertRequest.input('WO_RecordedOn', sql.DateTime, data.recordedOn || new Date());
      insertRequest.input('WO_Remarks', sql.NVarChar, data.remarks || null);

      const result = await insertRequest.query(insertQuery);
      return result.recordset[0];
    } catch (error) {
      console.error('Error checking out vehicle:', error);
      throw error;
    }
  }
}

module.exports = new VehicleService();
