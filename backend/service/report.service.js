const sql = require("mssql");
const config = require("../config/Mssql.config");

class ReportService {
  /**
   * ดึงข้อมูลรายงานทั้งหมด พร้อม filter
   */
  static async getReports(filters = {}) {
    try {
      const pool = await sql.connect(config.sql);

      let query = `
        SELECT
          WI.WI_ID,
          WI.WI_LicensePlate,
          WI.WI_LicenseProvince,
          WI.WI_VehicleType,
          WI.WI_FullName AS DriverName,
          WI.WI_RecordedOn AS TimeIn,
          WO.WO_RecordedOn AS TimeOut,
          IC.IC_LocalName AS CompanyName,
          CASE
            WHEN WO.WO_ID IS NULL THEN N'เข้า'
            ELSE N'ออก'
          END AS Status,
          CASE
            WHEN WO.WO_RecordedOn IS NOT NULL THEN
              CONCAT(
                DATEDIFF(HOUR, WI.WI_RecordedOn, WO.WO_RecordedOn), N' ชม. ',
                DATEDIFF(MINUTE, WI.WI_RecordedOn, WO.WO_RecordedOn) % 60, N' นาที'
              )
            ELSE NULL
          END AS Duration
        FROM WayIn WI
        LEFT JOIN WayOut WO ON WI.WI_ID = WO.WI_ID
        LEFT JOIN InternalCompany IC ON WI.IC_ID = IC.IC_ID
        WHERE 1=1
      `;

      // Apply filters
      if (filters.startDate) {
        query += ` AND CAST(WI.WI_RecordedOn AS DATE) >= '${filters.startDate}'`;
      }

      if (filters.endDate) {
        query += ` AND CAST(WI.WI_RecordedOn AS DATE) <= '${filters.endDate}'`;
      }

      if (filters.companyId) {
        query += ` AND WI.IC_ID = ${filters.companyId}`;
      }

      if (filters.status === 'in') {
        query += ` AND WO.WO_ID IS NULL`;
      } else if (filters.status === 'out') {
        query += ` AND WO.WO_ID IS NOT NULL`;
      }

      query += ` ORDER BY WI.WI_RecordedOn DESC`;

      const result = await pool.request().query(query);

      // คำนวณสรุป
      const summary = {
        total: result.recordset.length,
        in: result.recordset.filter(r => r.Status === 'เข้า').length,
        out: result.recordset.filter(r => r.Status === 'ออก').length,
        pending: result.recordset.filter(r => r.Status === 'เข้า').length,
      };

      return {
        data: result.recordset,
        summary: summary,
      };
    } catch (error) {
      console.error("Error in getReports:", error);
      throw error;
    }
  }

  /**
   * ส่งออกข้อมูลเป็น Excel (จะใช้ library exceljs)
   */
  static async exportExcel(filters = {}) {
    try {
      const { data } = await this.getReports(filters);

      // TODO: Implement Excel export using exceljs
      // สำหรับตอนนี้ return data ไปก่อน
      // ในอนาคตจะใช้ exceljs สร้างไฟล์ Excel จริงๆ

      return {
        success: true,
        message: 'Excel export prepared',
        data: data,
      };
    } catch (error) {
      console.error("Error in exportExcel:", error);
      throw error;
    }
  }

  /**
   * ส่งออกข้อมูลเป็น PDF (จะใช้ library pdfkit)
   */
  static async exportPDF(filters = {}) {
    try {
      const { data } = await this.getReports(filters);

      // TODO: Implement PDF export using pdfkit
      // สำหรับตอนนี้ return data ไปก่อน

      return {
        success: true,
        message: 'PDF export prepared',
        data: data,
      };
    } catch (error) {
      console.error("Error in exportPDF:", error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลสถิติรายงาน
   */
  static async getStatistics(filters = {}) {
    try {
      const pool = await sql.connect(config);

      let query = `
        SELECT
          COUNT(*) AS TotalVehicles,
          COUNT(CASE WHEN WO.WO_ID IS NULL THEN 1 END) AS VehiclesIn,
          COUNT(CASE WHEN WO.WO_ID IS NOT NULL THEN 1 END) AS VehiclesOut,
          COUNT(DISTINCT WI.IC_ID) AS TotalCompanies,
          COUNT(DISTINCT WI.WI_VehicleType) AS TotalVehicleTypes
        FROM WayIn WI
        LEFT JOIN WayOut WO ON WI.WI_ID = WO.WI_ID
        WHERE 1=1
      `;

      if (filters.startDate) {
        query += ` AND CAST(WI.WI_RecordedOn AS DATE) >= '${filters.startDate}'`;
      }

      if (filters.endDate) {
        query += ` AND CAST(WI.WI_RecordedOn AS DATE) <= '${filters.endDate}'`;
      }

      const result = await pool.request().query(query);
      return result.recordset[0];
    } catch (error) {
      console.error("Error in getStatistics:", error);
      throw error;
    }
  }
}

module.exports = ReportService;
