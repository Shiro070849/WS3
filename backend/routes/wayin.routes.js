const wayInController = require('../controllers/wayin.controller');
const { checkScreenPermission } = require('../middleware/permission');
const { SYSTEM_SCREENS } = require('../constants/screens');

module.exports = (app) => {
  // ดึงรายการการเข้าทั้งหมด (รองรับ pagination) - ใช้ VISIT (1100)
  app.get('/api/wayin', checkScreenPermission(SYSTEM_SCREENS.VISIT), wayInController.getAll);

  // สร้างข้อมูลการเข้า - ใช้ VISIT (1100)
  app.post('/api/wayin', checkScreenPermission(SYSTEM_SCREENS.VISIT), wayInController.create);

  // ดึงรายการ VisitType (สำหรับ dropdown) - ใช้ VISIT (1100)
  app.get('/api/wayin/visit-types', checkScreenPermission(SYSTEM_SCREENS.VISIT), wayInController.getVisitTypes);

  // ค้นหาด้วย Barcode (สำหรับรีปริ้น) - ใช้ REPRINT screen
  app.get('/api/wayin/barcode/:barcode', checkScreenPermission(SYSTEM_SCREENS.REPRINT), wayInController.searchByBarcode);

  // ดึงรายการผู้เข้าที่ยังไม่ออก (Active Visitors) - ใช้ VISIT (1100)
  app.get('/api/visitors/active', checkScreenPermission(SYSTEM_SCREENS.VISIT), wayInController.getActiveVisitors);

  // ดึงข้อมูลการเข้าตาม ID - ใช้ VISIT (1100)
  app.get('/api/wayin/:id', checkScreenPermission(SYSTEM_SCREENS.VISIT), wayInController.getById);

  // อัพเดทข้อมูล WayIn (สำหรับรีปริ้น) - ใช้ REPRINT screen
  app.put('/api/wayin/:id', checkScreenPermission(SYSTEM_SCREENS.REPRINT), wayInController.update);
};
