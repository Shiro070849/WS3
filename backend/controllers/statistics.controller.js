const statisticsService = require('../service/statistics.service');

class StatisticsController {
  // Helper function: ดึง IC_ID จาก userId
  async getUserCompanyId(userId) {
    if (!userId) return null;
    const pool = await require('../service/db.service').connect();
    const userQuery = `SELECT IC_ID FROM [dbo].[SystemUser] WHERE SU_ID = @UserId`;
    const userResult = await pool.request()
      .input('UserId', require('mssql').Int, parseInt(userId))
      .query(userQuery);
    return userResult.recordset[0]?.IC_ID || null;
  }

  // Helper function: กำหนด companyId สุดท้าย
  getFinalCompanyId(userCompanyId, filterCompanyId) {
    if (userCompanyId === null || userCompanyId === undefined) {
      // Super Admin: ใช้ filterCompanyId ที่เลือก
      return filterCompanyId;
    } else {
      // Company Admin: บังคับใช้ IC_ID ของตัวเอง
      return userCompanyId;
    }
  }

  // ดึงสถิติภาพรวม
  async getOverview(req, res) {
    try {
      const { period, userId, companyId, vehicleType } = req.query;
      const userCompanyId = await this.getUserCompanyId(userId);
      const finalCompanyId = this.getFinalCompanyId(userCompanyId, companyId ? parseInt(companyId) : null);

      const overview = await statisticsService.getOverviewStats(period || 'week', finalCompanyId, vehicleType || null);

      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      console.error('Error in getOverview:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching overview statistics',
        error: error.message,
      });
    }
  }

  // ดึงข้อมูลประเภทรถ
  async getVehicleTypes(req, res) {
    try {
      const { period, userId, companyId, vehicleType } = req.query;
      const userCompanyId = await this.getUserCompanyId(userId);
      const finalCompanyId = this.getFinalCompanyId(userCompanyId, companyId ? parseInt(companyId) : null);

      const vehicleTypes = await statisticsService.getVehicleTypeStats(period || 'week', finalCompanyId, vehicleType || null);

      res.status(200).json({
        success: true,
        data: vehicleTypes,
      });
    } catch (error) {
      console.error('Error in getVehicleTypes:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vehicle type statistics',
        error: error.message,
      });
    }
  }

  // ดึงข้อมูลช่วงเวลาเร่งด่วน
  async getPeakHours(req, res) {
    try {
      const { period, userId, companyId, vehicleType } = req.query;
      const userCompanyId = await this.getUserCompanyId(userId);
      const finalCompanyId = this.getFinalCompanyId(userCompanyId, companyId ? parseInt(companyId) : null);

      const peakHours = await statisticsService.getPeakHoursStats(period || 'week', finalCompanyId, vehicleType || null);

      res.status(200).json({
        success: true,
        data: peakHours,
      });
    } catch (error) {
      console.error('Error in getPeakHours:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching peak hours statistics',
        error: error.message,
      });
    }
  }

  // ดึงข้อมูลบริษัทยอดนิยม
  async getTopCompanies(req, res) {
    try {
      const { period, limit, userId, companyId, vehicleType } = req.query;
      const userCompanyId = await this.getUserCompanyId(userId);
      const finalCompanyId = this.getFinalCompanyId(userCompanyId, companyId ? parseInt(companyId) : null);

      const topCompanies = await statisticsService.getTopCompaniesStats(
        period || 'week',
        parseInt(limit) || 5,
        finalCompanyId,
        vehicleType || null
      );

      res.status(200).json({
        success: true,
        data: topCompanies,
      });
    } catch (error) {
      console.error('Error in getTopCompanies:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching top companies statistics',
        error: error.message,
      });
    }
  }

  // ดึงข้อมูลแนวโน้มการเข้า-ออก
  async getTrafficTrend(req, res) {
    try {
      const { period, userId, companyId, vehicleType } = req.query;
      const userCompanyId = await this.getUserCompanyId(userId);
      const finalCompanyId = this.getFinalCompanyId(userCompanyId, companyId ? parseInt(companyId) : null);

      const trend = await statisticsService.getTrafficTrendStats(period || 'week', finalCompanyId, vehicleType || null);

      res.status(200).json({
        success: true,
        data: trend,
      });
    } catch (error) {
      console.error('Error in getTrafficTrend:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching traffic trend statistics',
        error: error.message,
      });
    }
  }

  // ดึงสถิติเพิ่มเติม
  async getAdditionalStats(req, res) {
    try {
      const { period, userId, companyId, vehicleType } = req.query;
      const userCompanyId = await this.getUserCompanyId(userId);
      const finalCompanyId = this.getFinalCompanyId(userCompanyId, companyId ? parseInt(companyId) : null);

      const additional = await statisticsService.getAdditionalStats(period || 'week', finalCompanyId, vehicleType || null);

      res.status(200).json({
        success: true,
        data: additional,
      });
    } catch (error) {
      console.error('Error in getAdditionalStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching additional statistics',
        error: error.message,
      });
    }
  }
}

module.exports = new StatisticsController();
