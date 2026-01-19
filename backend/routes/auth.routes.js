const authController = require('../controllers/auth.controller');

module.exports = (app) => {
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.get('/api/auth/permissions', authController.getUserPermissions);
  app.get('/api/auth/me', authController.getMe);
};
