const statisticsController = require('../controllers/statistics.controller');

module.exports = (app) => {
  // ดึงสถิติภาพรวม
  app.get('/api/statistics/overview', (req, res) => statisticsController.getOverview(req, res));

  // ดึงข้อมูลประเภทรถ
  app.get('/api/statistics/vehicle-types', (req, res) => statisticsController.getVehicleTypes(req, res));

  // ดึงข้อมูลช่วงเวลาเร่งด่วน
  app.get('/api/statistics/peak-hours', (req, res) => statisticsController.getPeakHours(req, res));

  // ดึงข้อมูลบริษัทที่ใช้บริการมากที่สุด
  app.get('/api/statistics/top-companies', (req, res) => statisticsController.getTopCompanies(req, res));

  // ดึงข้อมูลแนวโน้มการเข้า-ออก
  app.get('/api/statistics/traffic-trend', (req, res) => statisticsController.getTrafficTrend(req, res));

  // ดึงสถิติเพิ่มเติม
  app.get('/api/statistics/additional', (req, res) => statisticsController.getAdditionalStats(req, res));
};
