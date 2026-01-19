const dashboardController = require('../controllers/dashboard.controller');
const { checkScreenPermission } = require('../middleware/permission');
const { SYSTEM_SCREENS } = require('../constants/screens');

module.exports = (app) => {
  // ดึงสถิติรวมของ Dashboard
  app.get('/api/dashboard/stats', checkScreenPermission(SYSTEM_SCREENS.DASHBOARD), dashboardController.getStats);

  // ดึงรายการกิจกรรมล่าสุด
  app.get('/api/dashboard/activities', checkScreenPermission(SYSTEM_SCREENS.DASHBOARD), dashboardController.getRecentActivities);

  // ดึงบริษัทที่ใช้บริการมากที่สุด
  app.get('/api/dashboard/companies', checkScreenPermission(SYSTEM_SCREENS.DASHBOARD), dashboardController.getTopCompanies);
};
