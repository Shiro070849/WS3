const settingsController = require('../controllers/settings.controller');
const upload = require('../middleware/upload');
const uploadLogo = require('../middleware/uploadLogo');
const { checkScreenPermission } = require('../middleware/permission');
const { SYSTEM_SCREENS } = require('../constants/screens');

module.exports = (app) => {
  // ==================== COMPANIES ====================

  // ดึงรายการบริษัทที่ user มีสิทธิ์เข้าถึง (ต้องอยู่ก่อน /:id) - ไม่ต้อง check permission เพราะใช้ทุกหน้า
  app.get('/api/settings/companies/accessible', settingsController.getUserAccessibleCompanies);
  // ดึงรายการบริษัททั้งหมด - ต้องมีสิทธิ์ SETTINGS
  app.get('/api/settings/companies', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getAllCompanies);
  // ดึงข้อมูลบริษัทตาม ID - ไม่ต้อง check permission เพราะใช้แสดง logo, ชื่อบริษัท
  app.get('/api/settings/companies/:id', settingsController.getCompanyById);
  // สร้างบริษัทใหม่
  app.post('/api/settings/companies', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.createCompany);
  // แก้ไขข้อมูลบริษัท
  app.put('/api/settings/companies/:id', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.updateCompany);
  // อัปโหลด logo ของบริษัท
  app.post('/api/settings/companies/:id/logo', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), uploadLogo.single('logo'), settingsController.uploadCompanyLogo);
  // อัพเดต Company Sequence (ลำดับการแสดงผล)
  app.patch('/api/settings/companies/:id/sequence', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.updateCompanySequence);
  // อัพเดต Company Sequences แบบ Batch
  app.post('/api/settings/companies/batch-update-sequences', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.batchUpdateCompanySequences);
  // ลบบริษัท (Soft Delete)
  app.delete('/api/settings/companies/:id', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.deleteCompany);

  // ==================== ROLES ====================

  // ดึงรายการ Roles
  app.get('/api/settings/roles', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getRoles);

  // ==================== PERMISSIONS ====================

  // ดึงรายการ Screens ทั้งหมด
  app.get('/api/settings/permissions/screens', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getAllScreens);
  // ดึง Permissions ของ Role
  app.get('/api/settings/permissions/roles/:roleId', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getRolePermissions);
  // เพิ่ม Permission
  app.post('/api/settings/permissions', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.addPermission);
  // ลบ Permission
  app.delete('/api/settings/permissions/:roleId/:screenId', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.deletePermission);

  // ==================== USERS ====================

  // ดึงรายการ User ทั้งหมด
  app.get('/api/settings/users', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getAllUsers);
  // ดึงข้อมูล User ตาม ID
  app.get('/api/settings/users/:id', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getUserById);
  // สร้าง User ใหม่
  app.post('/api/settings/users', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.createUser);
  // แก้ไขข้อมูล User
  app.put('/api/settings/users/:id', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.updateUser);
  // รีเซ็ตรหัสผ่าน
  app.put('/api/settings/users/:id/reset-password', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.resetPassword);

  // ลบ User (Soft Delete)
  app.delete('/api/settings/users/:id', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.deleteUser);

  // ==================== DEPARTMENTS ====================

  // ดึงโครงสร้างแผนกแบบ Tree
  app.get('/api/settings/departments/tree', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getDepartmentTree);
  // ดึงรายการแผนกทั้งหมด
  app.get('/api/settings/departments', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getAllDepartments);
  // ดึงข้อมูลแผนกตาม ID
  app.get('/api/settings/departments/:id', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getDepartmentById);
  // สร้างแผนกใหม่
  app.post('/api/settings/departments', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.createDepartment);
  // แก้ไขข้อมูลแผนก
  app.put('/api/settings/departments/:id', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.updateDepartment);
  // ย้ายแผนกไปอยู่ภายใต้ Parent อื่น
  app.put('/api/settings/departments/:id/move', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.moveDepartment);
  // ลบแผนก (Soft Delete)
  app.delete('/api/settings/departments/:id', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.deleteDepartment);

  // ==================== COMPANY DEPARTMENTS (JUNCTION TABLE) ====================

  // ดึงความสัมพันธ์บริษัท-แผนก (InternalCompanyDepartment)
  app.get('/api/settings/company-departments', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getCompanyDepartments);
  // เชื่อมแผนกกับบริษัท
  app.post('/api/settings/company-departments/link', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.linkDepartmentToCompany);

  // ==================== GENERAL SETTINGS ====================

  // ดึงข้อมูล General Settings
  app.get('/api/settings/general', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getGeneralSettings);
  // บันทึก General Settings
  app.put('/api/settings/general', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.updateGeneralSettings);

  // ==================== APPEARANCE SETTINGS ====================

  // ดึงข้อมูล Appearance Settings - ไม่ต้อง check permission เพราะใช้โหลด theme ทุกหน้า
  app.get('/api/settings/appearance', settingsController.getAppearanceSettings);
  // บันทึก Appearance Settings - ต้องมีสิทธิ์ SETTINGS
  app.put('/api/settings/appearance', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.updateAppearanceSettings);
  // อัปโหลดรูปภาพ (Logo, Favicon)
  app.post('/api/settings/upload-image', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), upload.single('image'), settingsController.uploadImage);

  // ==================== SECURITY SETTINGS ====================

  // ดึงข้อมูล Security Settings
  app.get('/api/settings/security', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getSecuritySettings);
  // บันทึก Security Settings
  app.put('/api/settings/security', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.updateSecuritySettings);

  // ==================== EMAIL SETTINGS ====================

  // ดึงข้อมูล Email Settings
  app.get('/api/settings/email', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getEmailSettings);
  // บันทึก Email Settings
  app.put('/api/settings/email', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.updateEmailSettings);
  // ทดสอบการส่งอีเมล
  app.post('/api/settings/email/test', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.testEmail);

  // ==================== NOTIFICATION SETTINGS ====================

  // ดึงข้อมูล Notification Settings
  app.get('/api/settings/notifications', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.getNotificationSettings);
  // บันทึก Notification Settings
  app.put('/api/settings/notifications', checkScreenPermission(SYSTEM_SCREENS.SETTINGS), settingsController.updateNotificationSettings);
};
