const wayInController = require('../controllers/wayin.controller');

module.exports = (app) => {
  // ดึงรายการการเข้าทั้งหมด (รองรับ pagination) - ต้องอยู่ก่อน routes ที่มี :id
  app.get('/api/wayin', wayInController.getAll);

  // สร้างข้อมูลการเข้า
  app.post('/api/wayin', wayInController.create);

  // ดึงรายการ VisitType (สำหรับ dropdown)
  app.get('/api/wayin/visit-types', wayInController.getVisitTypes);

  // ค้นหาด้วย Barcode (สำหรับรีปริ้น)
  app.get('/api/wayin/barcode/:barcode', wayInController.searchByBarcode);

  // ดึงรายการผู้เข้าที่ยังไม่ออก (Active Visitors)
  app.get('/api/visitors/active', wayInController.getActiveVisitors);

  // ดึงข้อมูลการเข้าตาม ID
  app.get('/api/wayin/:id', wayInController.getById);

  // อัพเดทข้อมูล WayIn (สำหรับรีปริ้น)
  app.put('/api/wayin/:id', wayInController.update);
};
