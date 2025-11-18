/**
 * System Role Constants
 *
 * ค่าคงที่สำหรับระบุ Role ใน SystemRole table
 * ใช้แทนการ hardcode ตัวเลขโดยตรงในโค้ด
 */

const SYSTEM_ROLES = {
  ADMINISTRATOR: 1,  // ADM - Administrator (ผู้ดูแลระบบของบริษัท)
  SGS: 2,            // SGS - Security Guard (Supervisor)
  SGU: 3,            // SGU - Security Guard (User)
  // เพิ่ม roles อื่นๆ ตามต้องการ
};

/**
 * ดึงชื่อ Role จาก ID
 * @param {number} roleId - SR_ID
 * @returns {string} ชื่อ Role
 */
const getRoleName = (roleId) => {
  const roleMap = {
    [SYSTEM_ROLES.ADMINISTRATOR]: 'Administrator',
    [SYSTEM_ROLES.SGS]: 'Security Guard (Supervisor)',
    [SYSTEM_ROLES.SGU]: 'Security Guard (User)',
  };
  return roleMap[roleId] || 'Unknown';
};

/**
 * ตรวจสอบว่าเป็น Administrator หรือไม่
 * @param {number} roleId - SR_ID
 * @returns {boolean}
 */
const isAdministrator = (roleId) => {
  return roleId === SYSTEM_ROLES.ADMINISTRATOR;
};

module.exports = {
  SYSTEM_ROLES,
  getRoleName,
  isAdministrator
};
