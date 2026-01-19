const vehicleController = require('../controllers/vehicle.controller');
const { checkScreenPermission } = require('../middleware/permission');
const { SYSTEM_SCREENS } = require('../constants/screens');

module.exports = (app) => {
  // ดึงรายการรถทั้งหมด พร้อมกรอง
  app.get('/api/vehicles', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), vehicleController.getAllVehicles);

  // ดึงข้อมูลรถตาม ID
  app.get('/api/vehicles/:id', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), vehicleController.getVehicleById);

  // สร้างรายการรถเข้าใหม่
  app.post('/api/vehicles', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), vehicleController.createVehicle);

  // แก้ไขข้อมูลรถ
  app.put('/api/vehicles/:id', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), vehicleController.updateVehicle);

  // ลบรายการรถ
  app.delete('/api/vehicles/:id', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), vehicleController.deleteVehicle);

  // บันทึกรถออก (Checkout)
  app.post('/api/vehicles/:id/checkout', checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), vehicleController.checkoutVehicle);
};
