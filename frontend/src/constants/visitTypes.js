// VisitType IDs (ตาม Database)
export const VISIT_TYPE_IDS = {
  CONTACT_COORDINATOR: 18, // ติดต่อประสานงาน
  // เพิ่มอื่นๆตามต้องการในอนาคต
  // SUPPLIER: 39, // อัพพลายเออร์
  // OPERATOR: 19, // Operator
};

// Config สำหรับ Reprint
export const REPRINT_CONFIG = {
  // VT_ID ที่ใช้ QR Code แบบ URL (เข้าเว็บไซต์)
  QR_URL_TYPE_IDS: [
    VISIT_TYPE_IDS.CONTACT_COORDINATOR, // 18
  ],

  // VT_ID ที่แสดง Footer Warning
  SHOW_FOOTER_WARNING_IDS: [
    VISIT_TYPE_IDS.CONTACT_COORDINATOR, // 18
  ],

  // URL Template (อิงจาก VUE_APP_QR_URL จาก .env หรือใช้ค่า default)
  QR_URL_TEMPLATE: process.env.VUE_APP_QR_URL || 'https://smartsecurity.ruxchai.co.th/index.php?param=',

  // Footer Warning Text
  FOOTER_WARNING_TEXT: {
    line1: 'กรุณา Check In กับเจ้าหน้าที่ที่ท่านมาติดต่อ',
    line2: 'ก่อนออกจากบริษัท',
  },
};

// Helper Functions
export const isQRUrlType = (vtId) => {
  return REPRINT_CONFIG.QR_URL_TYPE_IDS.includes(vtId);
};

export const shouldShowFooterWarning = (vtId) => {
  return REPRINT_CONFIG.SHOW_FOOTER_WARNING_IDS.includes(vtId);
};
