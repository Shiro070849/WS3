const wayOutController = require('../controllers/wayout.controller');

module.exports = (app) => {
  // สร้างข้อมูลการออก
  app.post('/api/wayout', wayOutController.create);

  // ดึงข้อมูลการออกตาม WayOut ID
  app.get('/api/wayout/:id', wayOutController.getById);

  // ดึงข้อมูลการออกตาม WayIn ID
  app.get('/api/wayout/wayin/:wayInId', wayOutController.getByWayInId);

  // ดึงรายการการออกทั้งหมด (รองรับ pagination)
  app.get('/api/wayout', wayOutController.getAll);
};
