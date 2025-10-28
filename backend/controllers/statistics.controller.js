const statisticsService = require('../service/statistics.service');

class StatisticsController {
  // ดึงสถิติภาพรวม
  async getOverview(req, res) {
    try {
      const { period } = req.query; // today, week, month, year
      const overview = await statisticsService.getOverviewStats(period || 'week');

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
      const { period } = req.query;
      const vehicleTypes = await statisticsService.getVehicleTypeStats(period || 'week');

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
      const { period } = req.query;
      const peakHours = await statisticsService.getPeakHoursStats(period || 'week');

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
      const { period, limit } = req.query;
      const topCompanies = await statisticsService.getTopCompaniesStats(
        period || 'week',
        parseInt(limit) || 5
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
      const { period } = req.query;
      const trend = await statisticsService.getTrafficTrendStats(period || 'week');

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
      const { period } = req.query;
      const additional = await statisticsService.getAdditionalStats(period || 'week');

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
