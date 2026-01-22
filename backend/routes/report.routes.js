const controller = require("../controllers/report.controller");
const { checkScreenPermission } = require('../middleware/permission');
const { SYSTEM_SCREENS } = require('../constants/screens');

module.exports = (app) => {
  // ดึงข้อมูลรายงาน - ใช้ REPORTS (1000) แทน DATA_DAILY
  app.get("/api/reports", checkScreenPermission(SYSTEM_SCREENS.REPORTS), controller.getReports);

  // ส่งออก Excel - ใช้ REPORTS (1000) แทน DATA_DAILY
  app.get("/api/reports/export/excel", checkScreenPermission(SYSTEM_SCREENS.REPORTS), controller.exportExcel);

  // ส่งออก PDF - ใช้ REPORTS (1000) แทน DATA_DAILY
  app.get("/api/reports/export/pdf", checkScreenPermission(SYSTEM_SCREENS.REPORTS), controller.exportPDF);

  // ดึงสถิติ - ใช้ STATISTICS (3000) เพราะเป็นหน้าสถิติ
  app.get("/api/reports/statistics", checkScreenPermission(SYSTEM_SCREENS.STATISTICS), controller.getStatistics);
};
