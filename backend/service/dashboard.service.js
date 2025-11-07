const sql = require('mssql');
const dbService = require('./db.service');

class DashboardService {
  // ดึงสถิติรวมของวันนี้
  async getTodayStats(companyId = null, dateFrom = null, dateTo = null) {
    try {
      const pool = await dbService.connect();

      // กำหนด date range
      // หมายเหตุ: Date จะใช้ timezone ของ server (local time)
      // Frontend ส่งมาเป็น YYYY-MM-DD ซึ่งจะถูกแปลงเป็น local midnight
      let startOfDay, endOfDay;
      if (dateFrom && dateTo) {
        startOfDay = new Date(dateFrom);
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
      } else {
        const today = new Date();
        startOfDay = new Date(today.setHours(0, 0, 0, 0));
        endOfDay = new Date(today.setHours(23, 59, 59, 999));
      }

      // นับจำนวนรถเข้าวันนี้
      const wayInRequest = pool.request();
      wayInRequest.input('StartDate', sql.DateTime, startOfDay);
      wayInRequest.input('EndDate', sql.DateTime, endOfDay);

      let wayInQuery = `
        SELECT COUNT(*) as count
        FROM [dbo].[WayIn]
        WHERE WI_RecordedOn >= @StartDate
          AND WI_RecordedOn <= @EndDate`;

      if (companyId) {
        wayInRequest.input('CompanyId', sql.Int, parseInt(companyId));
        wayInQuery += ' AND IC_ID = @CompanyId';
      }

      const wayInResult = await wayInRequest.query(wayInQuery);

      // นับจำนวนรถออกวันนี้
      const wayOutRequest = pool.request();
      wayOutRequest.input('StartDate', sql.DateTime, startOfDay);
      wayOutRequest.input('EndDate', sql.DateTime, endOfDay);

      let wayOutQuery = `
        SELECT COUNT(*) as count
        FROM [dbo].[WayOut] WO
        INNER JOIN [dbo].[WayIn] WI ON WO.WI_ID = WI.WI_ID
        WHERE WO.WO_RecordedOn >= @StartDate
          AND WO.WO_RecordedOn <= @EndDate`;

      if (companyId) {
        wayOutRequest.input('CompanyId', sql.Int, parseInt(companyId));
        wayOutQuery += ' AND WI.IC_ID = @CompanyId';
      }

      const wayOutResult = await wayOutRequest.query(wayOutQuery);

      // นับจำนวนรถที่ยังไม่ออก
      const pendingRequest = pool.request();

      let pendingQuery = `
        SELECT COUNT(*) as count
        FROM [dbo].[WayIn]
        WHERE WI_ID NOT IN (SELECT WI_ID FROM [dbo].[WayOut] WHERE WI_ID IS NOT NULL)`;

      if (companyId) {
        pendingRequest.input('CompanyId', sql.Int, parseInt(companyId));
        pendingQuery += ' AND IC_ID = @CompanyId';
      }

      const pendingResult = await pendingRequest.query(pendingQuery);

      // นับจำนวนบริษัทที่ใช้งาน
      const companiesResult = companyId
        ? { recordset: [{ count: 1 }] }
        : await pool.request().query(`
            SELECT COUNT(DISTINCT IC_ID) as count
            FROM [dbo].[InternalCompany]
            WHERE IC_IsActive = 1
          `);

      console.log(`📊 Dashboard Stats for Company ${companyId || 'ALL'}`);

      return {
        wayInToday: wayInResult.recordset[0].count,
        wayOutToday: wayOutResult.recordset[0].count,
        pendingVehicles: pendingResult.recordset[0].count,
        activeCompanies: companiesResult.recordset[0].count,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  // ดึงรายการเข้า-ออกล่าสุด
  async getRecentActivities(limit = 10, companyId = null, dateFrom = null, dateTo = null, search = null) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      // สร้าง WHERE conditions
      const conditions = [];

      // กรอง company
      if (companyId) {
        conditions.push('WI.IC_ID = @CompanyId');
        request.input('CompanyId', sql.Int, parseInt(companyId));
      }

      // กรอง date range
      if (dateFrom && dateTo) {
        const startOfDay = new Date(dateFrom);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        conditions.push('WI.WI_RecordedOn >= @StartDate');
        conditions.push('WI.WI_RecordedOn <= @EndDate');
        request.input('StartDate', sql.DateTime, startOfDay);
        request.input('EndDate', sql.DateTime, endOfDay);
      }

      // กรอง search
      if (search) {
        conditions.push('(WI.WI_LicensePlate LIKE @Search OR WI.WI_FullName LIKE @Search)');
        request.input('Search', sql.NVarChar, `%${search}%`);
      }

      // รวม WHERE clause
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // กำหนด limit
      request.input('Limit', sql.Int, limit);

      const result = await request.query(`
        SELECT TOP (@Limit)
          WI.WI_ID,
          WI.WI_RecordedOn as WI_DateTimeIn,
          WI.WI_LicensePlate,
          WI.WI_VehicleType,
          IC.IC_LocalName as CompanyName,
          WO.WO_RecordedOn as WO_DateTimeOut,
          CASE
            WHEN WO.WO_ID IS NULL THEN N'เข้า'
            ELSE N'ออก'
          END as Status
        FROM [dbo].[WayIn] WI
        LEFT JOIN [dbo].[InternalCompany] IC ON WI.IC_ID = IC.IC_ID
        LEFT JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
        ${whereClause}
        ORDER BY WI.WI_RecordedOn DESC
      `);

      console.log(`📋 Recent Activities for Company ${companyId || 'ALL'}: ${result.recordset.length} records`);

      return result.recordset;
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw error;
    }
  }

  // ดึงข้อมูลบริษัทที่ใช้บริการมากที่สุด
  async getTopCompanies(limit = 5) {
    try {
      const pool = await dbService.connect();
      const request = pool.request();

      request.input('Limit', sql.Int, limit);

      const result = await request.query(`
        SELECT TOP (@Limit)
          IC.IC_LocalName as CompanyName,
          COUNT(WI.WI_ID) as TotalVisits
        FROM [dbo].[WayIn] WI
        INNER JOIN [dbo].[InternalCompany] IC ON WI.IC_ID = IC.IC_ID
        GROUP BY IC.IC_LocalName
        ORDER BY COUNT(WI.WI_ID) DESC
      `);

      return result.recordset;
    } catch (error) {
      console.error('Error getting top companies:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();
