const dbService = require('./db.service');

class DashboardService {
  // ดึงสถิติรวมของวันนี้
  async getTodayStats() {
    try {
      const pool = await dbService.connect();
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // นับจำนวนรถเข้าวันนี้
      const wayInResult = await pool.request()
        .query(`
          SELECT COUNT(*) as count
          FROM [dbo].[WayIn]
          WHERE WI_RecordedOn >= '${startOfDay.toISOString()}'
            AND WI_RecordedOn <= '${endOfDay.toISOString()}'
        `);

      // นับจำนวนรถออกวันนี้
      const wayOutResult = await pool.request()
        .query(`
          SELECT COUNT(*) as count
          FROM [dbo].[WayOut]
          WHERE WO_RecordedOn >= '${startOfDay.toISOString()}'
            AND WO_RecordedOn <= '${endOfDay.toISOString()}'
        `);

      // นับจำนวนรถที่ยังไม่ออก (WayIn ที่ไม่มี WayOut)
      const pendingResult = await pool.request()
        .query(`
          SELECT COUNT(*) as count
          FROM [dbo].[WayIn]
          WHERE WI_ID NOT IN (SELECT WI_ID FROM [dbo].[WayOut] WHERE WI_ID IS NOT NULL)
        `);

      // นับจำนวนบริษัทที่ใช้งาน
      const companiesResult = await pool.request()
        .query(`
          SELECT COUNT(DISTINCT IC_ID) as count
          FROM [dbo].[InternalCompany]
          WHERE IC_IsActive = 1
        `);

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
  async getRecentActivities(limit = 10) {
    try {
      const pool = await dbService.connect();

      const result = await pool.request()
        .query(`
          SELECT TOP ${limit}
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
          ORDER BY WI.WI_RecordedOn DESC
        `);

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

      const result = await pool.request()
        .query(`
          SELECT TOP ${limit}
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
