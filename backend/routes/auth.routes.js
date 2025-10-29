const authController = require('../controllers/auth.controller');

module.exports = (app) => {
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/logout', authController.logout);
};
