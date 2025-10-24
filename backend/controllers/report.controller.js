const ReportService = require("../service/report.service");

/**
 * ดึงข้อมูลรายงาน
 */
exports.getReports = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      companyId: req.query.companyId,
      status: req.query.status,
    };

    const result = await ReportService.getReports(filters);

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลรายงานสำเร็จ",
      data: result.data,
      summary: result.summary,
    });
  } catch (error) {
    console.error("Error in getReports controller:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน",
      error: error.message,
    });
  }
};

/**
 * ส่งออกข้อมูลเป็น Excel
 */
exports.exportExcel = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      companyId: req.query.companyId,
      status: req.query.status,
    };

    const buffer = await ReportService.exportExcel(filters);

    // กำหนด headers สำหรับ download ไฟล์
    const filename = `รายงานยานพาหนะ_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error("Error in exportExcel controller:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งออก Excel",
      error: error.message,
    });
  }
};

/**
 * ส่งออกข้อมูลเป็น PDF
 */
exports.exportPDF = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      companyId: req.query.companyId,
      status: req.query.status,
    };

    const buffer = await ReportService.exportPDF(filters);

    // กำหนด headers สำหรับ download ไฟล์
    const filename = `รายงานยานพาหนะ_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error("Error in exportPDF controller:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งออก PDF",
      error: error.message,
    });
  }
};

/**
 * ดึงข้อมูลสถิติ
 */
exports.getStatistics = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const stats = await ReportService.getStatistics(filters);

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูลสถิติสำเร็จ",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getStatistics controller:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ",
      error: error.message,
    });
  }
};
