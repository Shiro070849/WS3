import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import permissionService from '@/services/permission.service';

/**
 * Permission Store (Pinia)
 * 
 * จัดการ Global State ของ Permissions
 * Cache ใน Memory เท่านั้น (ไม่ใช้ localStorage เพื่อความปลอดภัย)
 */
export const usePermissionStore = defineStore('permission', () => {
  // ==================== STATE ====================
  const accessibleScreens = ref([]); // Array ของ SS_ID ที่ user เข้าถึงได้
  const roleId = ref(null); // SR_ID
  const roleCode = ref(null); // SR_Code
  const roleName = ref(null); // SR_Name
  const isSuperAdmin = ref(false); // true ถ้า IC_ID === null
  const companyId = ref(null); // IC_ID
  const isLoading = ref(false);
  const lastFetched = ref(null); // Timestamp ของการ fetch ล่าสุด
  const silentRefreshInterval = ref(null); // Interval ID สำหรับ Silent Refresh

  // ==================== COMPUTED ====================
  /**
   * ตรวจสอบว่า User เข้าถึง Screen ได้หรือไม่
   * @param {number} screenId - SS_ID
   * @returns {boolean}
   */
  const hasAccess = computed(() => {
    return (screenId) => {
      if (isSuperAdmin.value) {
        return true; // Super Admin เข้าถึงได้ทุก Screen
      }
      if (!accessibleScreens.value || !Array.isArray(accessibleScreens.value)) {
        return false;
      }
      return accessibleScreens.value.includes(screenId);
    };
  });

  /**
   * ตรวจสอบว่า Permissions ถูกโหลดแล้วหรือยัง
   */
  const isLoaded = computed(() => {
    return accessibleScreens.value.length > 0 || isSuperAdmin.value;
  });

  /**
   * ตรวจสอบว่าควร Refresh หรือไม่ (ถ้าเกิน 5 นาที)
   */
  const shouldRefresh = computed(() => {
    if (!lastFetched.value) return true;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000; // 5 นาที
    return lastFetched.value < fiveMinutesAgo;
  });

  // ==================== ACTIONS ====================
  /**
   * โหลด Permissions จาก API
   * @param {number} userId - SU_ID
   * @param {boolean} forceRefresh - บังคับให้ refresh แม้จะ cache อยู่
   */
  const loadPermissions = async (userId, forceRefresh = false) => {
    if (isLoading.value) {
      console.log('[PERMISSION STORE] Already loading permissions, skipping...');
      return;
    }

    // ถ้าไม่ force refresh และมีข้อมูลอยู่แล้ว และยังไม่เกิน 5 นาที → ไม่ต้องโหลดใหม่
    if (!forceRefresh && isLoaded.value && !shouldRefresh.value) {
      console.log('[PERMISSION STORE] Using cached permissions');
      return;
    }

    try {
      isLoading.value = true;
      console.log('[PERMISSION STORE] Loading permissions for user:', userId);

      const permissions = await permissionService.getUserPermissions(userId);

      // อัพเดท State
      accessibleScreens.value = permissions.accessibleScreens || [];
      roleId.value = permissions.roleId;
      roleCode.value = permissions.roleCode;
      roleName.value = permissions.roleName;
      isSuperAdmin.value = permissions.isSuperAdmin || false;
      companyId.value = permissions.companyId;
      lastFetched.value = Date.now();

      console.log('[PERMISSION STORE] Permissions loaded:', {
        accessibleScreens: accessibleScreens.value.length,
        roleCode: roleCode.value,
        isSuperAdmin: isSuperAdmin.value
      });
    } catch (error) {
      console.error('[PERMISSION STORE] Error loading permissions:', error);
      // Clear state on error
      clearPermissions();
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * โหลด User Profile พร้อม Permissions
   * @param {number} userId - SU_ID
   */
  const loadUserProfile = async (userId) => {
    try {
      isLoading.value = true;
      console.log('[PERMISSION STORE] Loading user profile for user:', userId);

      const profile = await permissionService.getUserProfile(userId);

      // อัพเดท State
      accessibleScreens.value = profile.permissions?.accessibleScreens || [];
      roleId.value = profile.permissions?.roleId || profile.roleId;
      roleCode.value = profile.permissions?.roleCode || profile.roleCode;
      roleName.value = profile.permissions?.roleName || profile.roleName;
      isSuperAdmin.value = profile.permissions?.isSuperAdmin || profile.isSuperAdmin || false;
      companyId.value = profile.permissions?.companyId || profile.companyId;
      lastFetched.value = Date.now();

      console.log('[PERMISSION STORE] User profile loaded:', {
        accessibleScreens: accessibleScreens.value.length,
        roleCode: roleCode.value,
        isSuperAdmin: isSuperAdmin.value
      });

      return profile;
    } catch (error) {
      console.error('[PERMISSION STORE] Error loading user profile:', error);
      clearPermissions();
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * ล้าง Permissions (ใช้เมื่อ Logout)
   */
  const clearPermissions = () => {
    accessibleScreens.value = [];
    roleId.value = null;
    roleCode.value = null;
    roleName.value = null;
    isSuperAdmin.value = false;
    companyId.value = null;
    lastFetched.value = null;
    console.log('[PERMISSION STORE] Permissions cleared');
  };

  /**
   * เริ่ม Silent Refresh (ทุก 5-10 นาที)
   * @param {number} userId - SU_ID
   * @param {number} intervalMinutes - ช่วงเวลาเป็นนาที (default: 5)
   */
  const startSilentRefresh = (userId, intervalMinutes = 5) => {
    // หยุด interval เดิมถ้ามี
    stopSilentRefresh();

    const intervalMs = intervalMinutes * 60 * 1000;
    console.log(`[PERMISSION STORE] Starting silent refresh every ${intervalMinutes} minutes`);

    silentRefreshInterval.value = setInterval(async () => {
      try {
        console.log('[PERMISSION STORE] Silent refresh triggered');
        await loadPermissions(userId, true); // Force refresh
      } catch (error) {
        console.error('[PERMISSION STORE] Silent refresh failed:', error);
      }
    }, intervalMs);
  };

  /**
   * หยุด Silent Refresh
   */
  const stopSilentRefresh = () => {
    if (silentRefreshInterval.value) {
      clearInterval(silentRefreshInterval.value);
      silentRefreshInterval.value = null;
      console.log('[PERMISSION STORE] Silent refresh stopped');
    }
  };

  return {
    // State
    accessibleScreens,
    roleId,
    roleCode,
    roleName,
    isSuperAdmin,
    companyId,
    isLoading,
    lastFetched,
    // Computed
    hasAccess,
    isLoaded,
    shouldRefresh,
    // Actions
    loadPermissions,
    loadUserProfile,
    clearPermissions,
    startSilentRefresh,
    stopSilentRefresh
  };
});

