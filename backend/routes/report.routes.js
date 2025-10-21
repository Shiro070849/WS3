const controller = require("../controllers/report.controller");

module.exports = (app) => {
  // ดึงข้อมูลรายงาน
  app.get("/api/reports", controller.getReports);

  // ส่งออก Excel
  app.get("/api/reports/export/excel", controller.exportExcel);

  // ส่งออก PDF
  app.get("/api/reports/export/pdf", controller.exportPDF);

  // ดึงสถิติ
  app.get("/api/reports/statistics", controller.getStatistics);
};
