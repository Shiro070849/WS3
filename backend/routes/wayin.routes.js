const wayInController = require('../controllers/wayin.controller');
const { checkScreenPermission } = require('../middleware/permission');
const { SYSTEM_SCREENS } = require('../constants/screens');

module.exports = (app) => {
  // ดึงรายการการเข้าทั้งหมด (รองรับ pagination) - ต้องอยู่ก่อน routes ที่มี :id
  app.get('/api/wayin', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), wayInController.getAll);

  // สร้างข้อมูลการเข้า
  app.post('/api/wayin', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), wayInController.create);

  // ดึงรายการ VisitType (สำหรับ dropdown)
  app.get('/api/wayin/visit-types', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), wayInController.getVisitTypes);

  // ค้นหาด้วย Barcode (สำหรับรีปริ้น) - ใช้ REPRINT screen
  app.get('/api/wayin/barcode/:barcode', checkScreenPermission(SYSTEM_SCREENS.REPRINT), wayInController.searchByBarcode);

  // ดึงรายการผู้เข้าที่ยังไม่ออก (Active Visitors)
  app.get('/api/visitors/active', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), wayInController.getActiveVisitors);

  // ดึงข้อมูลการเข้าตาม ID
  app.get('/api/wayin/:id', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), wayInController.getById);

  // อัพเดทข้อมูล WayIn (สำหรับรีปริ้น) - ใช้ REPRINT screen
  app.put('/api/wayin/:id', checkScreenPermission(SYSTEM_SCREENS.REPRINT), wayInController.update);
};
