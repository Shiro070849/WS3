const settingsController = require('../controllers/settings.controller');

module.exports = (app) => {
  // ==================== COMPANIES ====================

  // ดึงรายการบริษัททั้งหมด
  app.get('/api/settings/companies', settingsController.getAllCompanies);
  // ดึงข้อมูลบริษัทตาม ID
  app.get('/api/settings/companies/:id', settingsController.getCompanyById);
  // สร้างบริษัทใหม่
  app.post('/api/settings/companies', settingsController.createCompany);
  // แก้ไขข้อมูลบริษัท
  app.put('/api/settings/companies/:id', settingsController.updateCompany);
  // ลบบริษัท (Soft Delete)
  app.delete('/api/settings/companies/:id', settingsController.deleteCompany);

  // ==================== USERS ====================

  // ดึงรายการ User ทั้งหมด
  app.get('/api/settings/users', settingsController.getAllUsers);
  // ดึงข้อมูล User ตาม ID
  app.get('/api/settings/users/:id', settingsController.getUserById);
  // สร้าง User ใหม่
  app.post('/api/settings/users', settingsController.createUser);
  // แก้ไขข้อมูล User
  app.put('/api/settings/users/:id', settingsController.updateUser);
  // รีเซ็ตรหัสผ่าน
  app.put('/api/settings/users/:id/reset-password', settingsController.resetPassword);

  // ลบ User (Soft Delete)
  app.delete('/api/settings/users/:id', settingsController.deleteUser);

  // ==================== DEPARTMENTS ====================

  // ดึงรายการแผนกทั้งหมด
  app.get('/api/settings/departments', settingsController.getAllDepartments);
  // ดึงข้อมูลแผนกตาม ID
  app.get('/api/settings/departments/:id', settingsController.getDepartmentById);
  // สร้างแผนกใหม่
  app.post('/api/settings/departments', settingsController.createDepartment);
  // แก้ไขข้อมูลแผนก
  app.put('/api/settings/departments/:id', settingsController.updateDepartment);
  // ลบแผนก (Soft Delete)
  app.delete('/api/settings/departments/:id', settingsController.deleteDepartment);
};
