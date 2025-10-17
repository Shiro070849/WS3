const wayInController = require('../controllers/wayin.controller');

module.exports = (app) => {
  // สร้างข้อมูลการเข้า
  app.post('/api/wayin', wayInController.create);

  // ดึงข้อมูลการเข้าตาม ID
  app.get('/api/wayin/:id', wayInController.getById);

  // ดึงรายการผู้เข้าที่ยังไม่ออก (Active Visitors)
  app.get('/api/visitors/active', wayInController.getActiveVisitors);

  // ดึงรายการการเข้าทั้งหมด (รองรับ pagination)
  app.get('/api/wayin', wayInController.getAll);
};
