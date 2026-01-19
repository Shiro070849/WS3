const controller = require("../controllers/report.controller");
const { checkScreenPermission } = require('../middleware/permission');
const { SYSTEM_SCREENS } = require('../constants/screens');

module.exports = (app) => {
  // ดึงข้อมูลรายงาน
  app.get("/api/reports", checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), controller.getReports);

  // ส่งออก Excel
  app.get("/api/reports/export/excel", checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), controller.exportExcel);

  // ส่งออก PDF
  app.get("/api/reports/export/pdf", checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), controller.exportPDF);

  // ดึงสถิติ
  app.get("/api/reports/statistics", checkScreenPermission(SYSTEM_SCREENS.DATA_DAILY), controller.getStatistics);
};
