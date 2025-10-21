const dashboardService = require('../service/dashboard.service');

class DashboardController {
  // ดึงสถิติของ Dashboard
  async getStats(req, res) {
    try {
      const stats = await dashboardService.getTodayStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard statistics',
        error: error.message,
      });
    }
  }

  // ดึงรายการกิจกรรมล่าสุด
  async getRecentActivities(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities = await dashboardService.getRecentActivities(limit);

      res.status(200).json({
        success: true,
        count: activities.length,
        data: activities,
      });
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching recent activities',
        error: error.message,
      });
    }
  }

  // ดึงข้อมูลบริษัทยอดนิยม
  async getTopCompanies(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const companies = await dashboardService.getTopCompanies(limit);

      res.status(200).json({
        success: true,
        count: companies.length,
        data: companies,
      });
    } catch (error) {
      console.error('Error in getTopCompanies:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching top companies',
        error: error.message,
      });
    }
  }
}

module.exports = new DashboardController();
