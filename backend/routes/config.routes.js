const configController = require('../controllers/config.controller');

module.exports = (app) => {
  // ==================== CONFIG API ====================

  // ดึง Server Configuration (BASE_URL, Version, etc.)
  app.get('/api/config', configController.getConfig);
};
