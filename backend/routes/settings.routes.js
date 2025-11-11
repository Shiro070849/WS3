const settingsController = require('../controllers/settings.controller');
const upload = require('../middleware/upload');
const uploadLogo = require('../middleware/uploadLogo');

module.exports = (app) => {
  // ==================== COMPANIES ====================

  // ดึงรายการบริษัทที่ user มีสิทธิ์เข้าถึง (ต้องอยู่ก่อน /:id)
  app.get('/api/settings/companies/accessible', settingsController.getUserAccessibleCompanies);
  // ดึงรายการบริษัททั้งหมด
  app.get('/api/settings/companies', settingsController.getAllCompanies);
  // ดึงข้อมูลบริษัทตาม ID
  app.get('/api/settings/companies/:id', settingsController.getCompanyById);
  // สร้างบริษัทใหม่
  app.post('/api/settings/companies', settingsController.createCompany);
  // แก้ไขข้อมูลบริษัท
  app.put('/api/settings/companies/:id', settingsController.updateCompany);
  // อัปโหลด logo ของบริษัท
  app.post('/api/settings/companies/:id/logo', uploadLogo.single('logo'), settingsController.uploadCompanyLogo);
  // ลบบริษัท (Soft Delete)
  app.delete('/api/settings/companies/:id', settingsController.deleteCompany);

  // ==================== ROLES ====================

  // ดึงรายการ Roles
  app.get('/api/settings/roles', settingsController.getRoles);

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

  // ==================== GENERAL SETTINGS ====================

  // ดึงข้อมูล General Settings
  app.get('/api/settings/general', settingsController.getGeneralSettings);
  // บันทึก General Settings
  app.put('/api/settings/general', settingsController.updateGeneralSettings);

  // ==================== APPEARANCE SETTINGS ====================

  // ดึงข้อมูล Appearance Settings
  app.get('/api/settings/appearance', settingsController.getAppearanceSettings);
  // บันทึก Appearance Settings
  app.put('/api/settings/appearance', settingsController.updateAppearanceSettings);
  // อัปโหลดรูปภาพ (Logo, Favicon)
  app.post('/api/settings/upload-image', upload.single('image'), settingsController.uploadImage);

  // ==================== SECURITY SETTINGS ====================

  // ดึงข้อมูล Security Settings
  app.get('/api/settings/security', settingsController.getSecuritySettings);
  // บันทึก Security Settings
  app.put('/api/settings/security', settingsController.updateSecuritySettings);

  // ==================== EMAIL SETTINGS ====================

  // ดึงข้อมูล Email Settings
  app.get('/api/settings/email', settingsController.getEmailSettings);
  // บันทึก Email Settings
  app.put('/api/settings/email', settingsController.updateEmailSettings);
  // ทดสอบการส่งอีเมล
  app.post('/api/settings/email/test', settingsController.testEmail);

  // ==================== NOTIFICATION SETTINGS ====================

  // ดึงข้อมูล Notification Settings
  app.get('/api/settings/notifications', settingsController.getNotificationSettings);
  // บันทึก Notification Settings
  app.put('/api/settings/notifications', settingsController.updateNotificationSettings);
};
