const sql = require("mssql");
const config = require("../config/Mssql.config");
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

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

      // สร้าง workbook และ worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('รายงานยานพาหนะ');

      // กำหนด columns
      worksheet.columns = [
        { header: '#', key: 'no', width: 8 },
        { header: 'ทะเบียนรถ', key: 'licensePlate', width: 15 },
        { header: 'จังหวัด', key: 'province', width: 15 },
        { header: 'ประเภทรถ', key: 'vehicleType', width: 15 },
        { header: 'คนขับ', key: 'driver', width: 20 },
        { header: 'บริษัท', key: 'company', width: 25 },
        { header: 'เวลาเข้า', key: 'timeIn', width: 20 },
        { header: 'เวลาออก', key: 'timeOut', width: 20 },
        { header: 'ระยะเวลา', key: 'duration', width: 15 },
        { header: 'สถานะ', key: 'status', width: 10 },
      ];

      // จัดรูปแบบ header
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0090D3' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // เพิ่มข้อมูล
      data.forEach((item, index) => {
        worksheet.addRow({
          no: index + 1,
          licensePlate: item.WI_LicensePlate,
          province: item.WI_LicenseProvince,
          vehicleType: item.WI_VehicleType,
          driver: item.DriverName,
          company: item.CompanyName,
          timeIn: item.TimeIn ? new Date(item.TimeIn).toLocaleString('th-TH') : '-',
          timeOut: item.TimeOut ? new Date(item.TimeOut).toLocaleString('th-TH') : '-',
          duration: item.Duration || '-',
          status: item.Status,
        });
      });

      // สร้าง buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
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
      const { data, summary } = await this.getReports(filters);

      return new Promise((resolve, reject) => {
        try {
          // สร้าง PDF document
          const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 50
          });

          // ลงทะเบียนฟอนต์ภาษาไทย
          doc.registerFont('Prompt', 'C:/Windows/Fonts/Prompt-Regular.ttf');
          doc.registerFont('Prompt-Bold', 'C:/Windows/Fonts/Prompt-Bold.ttf');

          // เก็บ buffer
          const chunks = [];
          doc.on('data', (chunk) => chunks.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          // Header
          doc.font('Prompt-Bold')
             .fontSize(18)
             .text('รายงานยานพาหนะ', { align: 'center' })
             .moveDown();

          // Summary
          doc.font('Prompt')
             .fontSize(12)
             .text(`ทั้งหมด: ${summary.total} | รถเข้า: ${summary.in} | รถออก: ${summary.out} | ค้างอยู่: ${summary.pending}`)
             .moveDown();

          // Table Header - ปรับ column widths ใหม่ให้เหมาะสม
          const startY = doc.y;
          const colWidths = [25, 60, 50, 85, 70, 110, 85, 85, 60, 40]; // รวม 670
          const headers = ['#', 'ทะเบียน', 'จังหวัด', 'ประเภท', 'คนขับ', 'บริษัท', 'เวลาเข้า', 'เวลาออก', 'ระยะเวลา', 'สถานะ'];

          let xPos = 50;
          doc.font('Prompt-Bold').fontSize(9); // ลดขนาดฟอนต์ header

          headers.forEach((header, i) => {
            doc.text(header, xPos, startY, {
              width: colWidths[i],
              align: 'left',
              lineBreak: false // ป้องกันขึ้นบรรทัดใหม่
            });
            xPos += colWidths[i];
          });

          doc.moveDown(0.5);
          let yPos = doc.y;

          // Table Data
          data.forEach((item, index) => {
            // ตรวจสอบว่าใกล้หมดหน้าหรือยัง
            if (yPos > 480) {
              doc.addPage();
              yPos = 50;

              // พิมพ์ header ซ้ำในหน้าใหม่
              xPos = 50;
              doc.font('Prompt-Bold').fontSize(9);
              headers.forEach((header, i) => {
                doc.text(header, xPos, yPos, {
                  width: colWidths[i],
                  align: 'left',
                  lineBreak: false
                });
                xPos += colWidths[i];
              });
              yPos += 20;
            }

            xPos = 50;

            // จัดรูปแบบวันที่ให้สั้นลง
            const formatDate = (dateStr) => {
              if (!dateStr) return '-';
              const date = new Date(dateStr);
              return date.toLocaleString('th-TH', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });
            };

            const row = [
              String(index + 1),
              item.WI_LicensePlate || '-',
              item.WI_LicenseProvince || '-',
              item.WI_VehicleType || '-',
              item.DriverName || '-',
              item.CompanyName || '-',
              formatDate(item.TimeIn),
              formatDate(item.TimeOut),
              item.Duration || '-',
              item.Status || '-'
            ];

            doc.font('Prompt').fontSize(7.5); // ลดขนาดฟอนต์ข้อมูล

            const rowHeight = 15; // ความสูงของแต่ละแถว

            row.forEach((text, i) => {
              doc.text(text, xPos, yPos, {
                width: colWidths[i],
                align: 'left',
                lineBreak: false, // ป้องกันขึ้นบรรทัดใหม่
                ellipsis: true // ถ้ายาวเกินให้ใส่ ...
              });
              xPos += colWidths[i];
            });

            yPos += rowHeight;
          });

          // Footer
          doc.font('Prompt')
             .fontSize(8)
             .text(`สร้างเมื่อ: ${new Date().toLocaleString('th-TH')}`, 50, doc.page.height - 50, {
               align: 'center'
             });

          doc.end();
        } catch (error) {
          reject(error);
        }
      });
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
