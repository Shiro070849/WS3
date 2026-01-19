import apiClient from './api';

/**
 * Permission Service (Frontend)
 * 
 * Service สำหรับจัดการ Permission ต่างๆ
 * เรียก API จาก Backend เพื่อดึงข้อมูลสิทธิ์
 */
class PermissionService {
  /**
   * ดึงข้อมูล Permission ของ User
   * @param {number} userId - SU_ID
   * @returns {Promise<object>} Object ที่มี accessibleScreens, roleId, roleCode, isSuperAdmin
   */
  async getUserPermissions(userId) {
    try {
      const response = await apiClient.get('/auth/permissions', {
        params: { userId }
      });

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch permissions');
    } catch (error) {
      console.error('[PERMISSION SERVICE] Error fetching permissions:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูล User Profile พร้อม Permissions
   * @param {number} userId - SU_ID
   * @returns {Promise<object>} Object ที่มี user data + permissions
   */
  async getUserProfile(userId) {
    try {
      const response = await apiClient.get('/auth/me', {
        params: { userId }
      });

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch user profile');
    } catch (error) {
      console.error('[PERMISSION SERVICE] Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่า User เข้าถึง Screen ได้หรือไม่
   * @param {number[]} accessibleScreens - Array ของ SS_ID ที่ user เข้าถึงได้
   * @param {number} screenId - SS_ID ที่ต้องการตรวจสอบ
   * @returns {boolean} true ถ้าเข้าถึงได้
   */
  hasScreenAccess(accessibleScreens, screenId) {
    if (!accessibleScreens || !Array.isArray(accessibleScreens)) {
      return false;
    }
    return accessibleScreens.includes(screenId);
  }
}

export default new PermissionService();

