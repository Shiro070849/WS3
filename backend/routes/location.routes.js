const locationController = require('../controllers/location.controller');
const { checkScreenPermission } = require('../middleware/permission');
const { SYSTEM_SCREENS } = require('../constants/screens');

/**
 * Location Management Routes
 * Base path: /api/locations
 */

module.exports = (app) => {
  // GET /api/locations/active - ดึง locations ที่ active (สำหรับ dropdown)
  app.get('/api/locations/active', locationController.getActiveLocations);

  // GET /api/locations - ดึงรายการ locations ทั้งหมด (with pagination)
  app.get('/api/locations', locationController.getAllLocations);

  // GET /api/locations/:id - ดึง location ตาม ID
  app.get('/api/locations/:id', locationController.getLocationById);

  // POST /api/locations - สร้าง location ใหม่
  app.post('/api/locations', locationController.createLocation);

  // PUT /api/locations/:id - แก้ไข location
  app.put('/api/locations/:id', locationController.updateLocation);

  // DELETE /api/locations/:id - ลบ location (soft delete)
  app.delete('/api/locations/:id', locationController.deleteLocation);
};
