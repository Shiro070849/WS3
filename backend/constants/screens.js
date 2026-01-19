/**
 * System Screen Constants
 *
 * ค่าคงที่สำหรับระบุ Screen ID (SS_ID) ใน SystemScreen table
 * ใช้แทนการ hardcode ตัวเลขโดยตรงในโค้ด
 */

const SYSTEM_SCREENS = {
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
 * ดึงชื่อ Screen จาก ID
 * @param {number} screenId - SS_ID
 * @returns {string} ชื่อ Screen
 */
const getScreenName = (screenId) => {
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

module.exports = {
  SYSTEM_SCREENS,
  getScreenName
};

