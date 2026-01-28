// VisitType IDs (ตาม Database)
export const VISIT_TYPE_IDS = {
  CONTACT_COORDINATOR: 18, // ติดต่อประสานงาน
  SUPPLIER: 39, // อัพพลายเออร์
  DEPOSIT_WITHDRAW: 40, // ฝาก/เบิกสินค้า
  REQUEST_TO_SEE_PRODUCT: 46, // ขอดูสินค้า
  // เพิ่มอื่นๆตามต้องการในอนาคต
  // OPERATOR: 19, // Operator
};

// Config สำหรับ Reprint
export const REPRINT_CONFIG = {
  // VT_ID ที่ใช้ QR Code แบบ URL (เข้าเว็บไซต์)
  QR_URL_TYPE_IDS: [
    VISIT_TYPE_IDS.CONTACT_COORDINATOR, // 18 - ติดต่อประสานงาน
    VISIT_TYPE_IDS.SUPPLIER, // 39 - อัพพลายเออร์
    VISIT_TYPE_IDS.REQUEST_TO_SEE_PRODUCT, // 46 - ขอดูสินค้า
  ],

  // VT_ID ที่แสดง Footer Warning
  SHOW_FOOTER_WARNING_IDS: [
    VISIT_TYPE_IDS.CONTACT_COORDINATOR, // 18
  ],

  // VT_ID ที่แสดง Barcode (เฉพาะ "ฝาก/เบิกสินค้า")
  SHOW_BARCODE_TYPE_IDS: [
    VISIT_TYPE_IDS.DEPOSIT_WITHDRAW, // 40
  ],

  // URL Template - เลือกใช้ตามบริษัทที่ Deploy
  // สำหรับ Ruxchai:
  QR_URL_TEMPLATE: process.env.VUE_APP_QR_URL || 'https://smartsecurity.ruxchai.co.th/index.php?param=',

  // สำหรับ MRG Shrimp:
  // QR_URL_TEMPLATE: process.env.VUE_APP_QR_URL || 'https://smartsecurity.mrgshrimp.com/',

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

export const shouldShowBarcode = (vtId) => {
  return REPRINT_CONFIG.SHOW_BARCODE_TYPE_IDS.includes(vtId);
};
