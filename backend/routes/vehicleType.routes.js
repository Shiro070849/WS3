const vehicleTypeController = require('../controllers/vehicleType.controller');

module.exports = (app) => {
  // GET /api/vehicle-types - ดึงรายการประเภทรถทั้งหมด
  app.get('/api/vehicle-types', vehicleTypeController.getAll);

  // GET /api/vehicle-types/:id - ดึงข้อมูลประเภทรถตาม ID
  app.get('/api/vehicle-types/:id', vehicleTypeController.getById);

  // POST /api/vehicle-types - สร้างประเภทรถใหม่
  app.post('/api/vehicle-types', vehicleTypeController.create);

  // PUT /api/vehicle-types/:id - แก้ไขข้อมูลประเภทรถ
  app.put('/api/vehicle-types/:id', vehicleTypeController.update);

  // DELETE /api/vehicle-types/:id - ลบประเภทรถ
  app.delete('/api/vehicle-types/:id', vehicleTypeController.delete);
};
