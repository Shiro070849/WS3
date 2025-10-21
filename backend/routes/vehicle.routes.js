const vehicleController = require('../controllers/vehicle.controller');

module.exports = (app) => {
  // ดึงรายการรถทั้งหมด พร้อมกรอง
  app.get('/api/vehicles', vehicleController.getAllVehicles);

  // ดึงข้อมูลรถตาม ID
  app.get('/api/vehicles/:id', vehicleController.getVehicleById);

  // สร้างรายการรถเข้าใหม่
  app.post('/api/vehicles', vehicleController.createVehicle);

  // แก้ไขข้อมูลรถ
  app.put('/api/vehicles/:id', vehicleController.updateVehicle);

  // ลบรายการรถ
  app.delete('/api/vehicles/:id', vehicleController.deleteVehicle);

  // บันทึกรถออก (Checkout)
  app.post('/api/vehicles/:id/checkout', vehicleController.checkoutVehicle);
};
