const statisticsController = require('../controllers/statistics.controller');
const { checkScreenPermission } = require('../middleware/permission');
const { SYSTEM_SCREENS } = require('../constants/screens');

module.exports = (app) => {
  // ดึงสถิติภาพรวม
  app.get('/api/statistics/overview', checkScreenPermission(SYSTEM_SCREENS.STATISTICS), (req, res) => statisticsController.getOverview(req, res));

  // ดึงข้อมูลประเภทรถ
  app.get('/api/statistics/vehicle-types', checkScreenPermission(SYSTEM_SCREENS.STATISTICS), (req, res) => statisticsController.getVehicleTypes(req, res));

  // ดึงข้อมูลช่วงเวลาเร่งด่วน
  app.get('/api/statistics/peak-hours', checkScreenPermission(SYSTEM_SCREENS.STATISTICS), (req, res) => statisticsController.getPeakHours(req, res));

  // ดึงข้อมูลบริษัทที่ใช้บริการมากที่สุด
  app.get('/api/statistics/top-companies', checkScreenPermission(SYSTEM_SCREENS.STATISTICS), (req, res) => statisticsController.getTopCompanies(req, res));

  // ดึงข้อมูลแนวโน้มการเข้า-ออก
  app.get('/api/statistics/traffic-trend', checkScreenPermission(SYSTEM_SCREENS.STATISTICS), (req, res) => statisticsController.getTrafficTrend(req, res));

  // ดึงสถิติเพิ่มเติม
  app.get('/api/statistics/additional', checkScreenPermission(SYSTEM_SCREENS.STATISTICS), (req, res) => statisticsController.getAdditionalStats(req, res));

  // ดึงสถิติการเข้าแยกตาม Location
  app.get('/api/statistics/entry-locations', checkScreenPermission(SYSTEM_SCREENS.STATISTICS), (req, res) => statisticsController.getEntryLocations(req, res));
};
