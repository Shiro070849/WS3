/**
 * System Screen Constants (Frontend)
 *
 * ค่าคงที่สำหรับระบุ Screen ID (SS_ID) ใน SystemScreen table
 * ต้องตรงกับ backend/constants/screens.js
 */

export const SYSTEM_SCREENS = {
  // Systems
  SYSTEMS: 1,
  
  // Reports
  REPORTS: 1000,
  VISIT: 1100,
  DATA_DAILY: 1101,  // ใช้สำหรับ Vehicle และ Report
  
  // Settings
  SETTINGS: 10000,
  GENERAL: 11000,
  SETUPS: 12000,
  
  // New Screens
  DASHBOARD: 2000,
  STATISTICS: 3000,
  REPRINT: 4000,  // สำหรับ Reprint (RCT, QA)
};

/**
 * Mapping Routes กับ Screen IDs
 * ใช้สำหรับ Route Guard และ Menu Filtering
 */
export const ROUTE_SCREEN_MAP = {
  '/dashboard': SYSTEM_SCREENS.DASHBOARD,
  '/vehicle': SYSTEM_SCREENS.DATA_DAILY,
  '/vehicle/reprint': SYSTEM_SCREENS.REPRINT,
  '/report': SYSTEM_SCREENS.DATA_DAILY,
  '/statistics': SYSTEM_SCREENS.STATISTICS,
  '/settings': SYSTEM_SCREENS.SETTINGS,
};

/**
 * ดึง Screen ID จาก Route Path
 * @param {string} routePath - Route path (เช่น '/dashboard')
 * @returns {number|null} SS_ID หรือ null ถ้าไม่พบ
 */
export const getScreenIdFromRoute = (routePath) => {
  return ROUTE_SCREEN_MAP[routePath] || null;
};

/**
 * ดึงชื่อ Screen จาก ID
 * @param {number} screenId - SS_ID
 * @returns {string} ชื่อ Screen
 */
export const getScreenName = (screenId) => {
  const screenMap = {
    [SYSTEM_SCREENS.SYSTEMS]: 'Systems',
    [SYSTEM_SCREENS.REPORTS]: 'Reports',
    [SYSTEM_SCREENS.VISIT]: 'Visit',
    [SYSTEM_SCREENS.DATA_DAILY]: 'Data Daily',
    [SYSTEM_SCREENS.SETTINGS]: 'Settings',
    [SYSTEM_SCREENS.GENERAL]: 'General',
    [SYSTEM_SCREENS.SETUPS]: 'Setups',
    [SYSTEM_SCREENS.DASHBOARD]: 'Dashboard',
    [SYSTEM_SCREENS.STATISTICS]: 'Statistics',
    [SYSTEM_SCREENS.REPRINT]: 'Reprint',
  };
  return screenMap[screenId] || 'Unknown';
};

