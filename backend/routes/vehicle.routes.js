const vehicleController = require('../controllers/vehicle.controller');
const { checkScreenPermission } = require('../middleware/permission');
const { SYSTEM_SCREENS } = require('../constants/screens');

module.exports = (app) => {
  // ดึงรายการรถทั้งหมด พร้อมกรอง - ใช้ VISIT (1100)
  app.get('/api/vehicles', checkScreenPermission(SYSTEM_SCREENS.VISIT), vehicleController.getAllVehicles);

  // ดึงข้อมูลรถตาม ID - ใช้ VISIT (1100)
  app.get('/api/vehicles/:id', checkScreenPermission(SYSTEM_SCREENS.VISIT), vehicleController.getVehicleById);

  // สร้างรายการรถเข้าใหม่ - ใช้ VISIT (1100)
  app.post('/api/vehicles', checkScreenPermission(SYSTEM_SCREENS.VISIT), vehicleController.createVehicle);

  // แก้ไขข้อมูลรถ - ใช้ VISIT (1100)
  app.put('/api/vehicles/:id', checkScreenPermission(SYSTEM_SCREENS.VISIT), vehicleController.updateVehicle);

  // ลบรายการรถ - ใช้ VISIT (1100)
  app.delete('/api/vehicles/:id', checkScreenPermission(SYSTEM_SCREENS.VISIT), vehicleController.deleteVehicle);

  // บันทึกรถออก (Checkout) - ใช้ VISIT (1100)
  app.post('/api/vehicles/:id/checkout', checkScreenPermission(SYSTEM_SCREENS.VISIT), vehicleController.checkoutVehicle);
};
