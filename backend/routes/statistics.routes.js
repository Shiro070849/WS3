const statisticsController = require('../controllers/statistics.controller');

module.exports = (app) => {
  // ดึงสถิติภาพรวม
  app.get('/api/statistics/overview', statisticsController.getOverview);

  // ดึงข้อมูลประเภทรถ
  app.get('/api/statistics/vehicle-types', statisticsController.getVehicleTypes);

  // ดึงข้อมูลช่วงเวลาเร่งด่วน
  app.get('/api/statistics/peak-hours', statisticsController.getPeakHours);

  // ดึงข้อมูลบริษัทที่ใช้บริการมากที่สุด
  app.get('/api/statistics/top-companies', statisticsController.getTopCompanies);

  // ดึงข้อมูลแนวโน้มการเข้า-ออก
  app.get('/api/statistics/traffic-trend', statisticsController.getTrafficTrend);

  // ดึงสถิติเพิ่มเติม
  app.get('/api/statistics/additional', statisticsController.getAdditionalStats);
};
