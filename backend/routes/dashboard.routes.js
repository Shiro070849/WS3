const dashboardController = require('../controllers/dashboard.controller');

module.exports = (app) => {
  // ดึงสถิติรวมของ Dashboard
  app.get('/api/dashboard/stats', dashboardController.getStats);

  // ดึงรายการกิจกรรมล่าสุด
  app.get('/api/dashboard/activities', dashboardController.getRecentActivities);

  // ดึงบริษัทที่ใช้บริการมากที่สุด
  app.get('/api/dashboard/companies', dashboardController.getTopCompanies);
};
