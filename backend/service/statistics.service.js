const sql = require('mssql');
const dbService = require('./db.service');
const settingsService = require('./settings.service');

class StatisticsService {
  // Format วันที่เป็น string สำหรับ SQL (ใช้ local time ไม่ใช้ UTC เพื่อให้ตรงกับข้อมูลใน DB)
  formatDateForSQL(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}:${sec}`;
  }

  // Helper function สำหรับคำนวณวันที่: ถ้ามี dateFrom หรือ dateTo (YYYY-MM-DD) ใช้ช่วงวันที่ ไม่ก็ใช้ period
  getDateRange(period, dateFromStr, dateToStr) {
    const from = (dateFromStr && typeof dateFromStr === 'string') ? dateFromStr.trim() : '';
    const to = (dateToStr && typeof dateToStr === 'string') ? dateToStr.trim() : '';
    const useCustom = from || to;

    if (useCustom) {
      // มีแค่ dateFrom = จากวันนั้นถึงวันนี้ (เหมือนหน้ารายงาน), มีแค่ dateTo = วันนั้นวันเดียว, มีทั้งคู่ = ใช้ช่วงนั้น
      let startDate, endDate;
      if (from && to) {
        const startStr = from <= to ? from : to;
        const endStr = from <= to ? to : from;
        startDate = new Date(startStr + 'T00:00:00');
        endDate = new Date(endStr + 'T23:59:59.999');
      } else if (from) {
        startDate = new Date(from + 'T00:00:00');
        endDate = new Date(); // ถึงวันนี้ (ปัจจุบัน) เหมือนหน้ารายงาน
      } else {
        startDate = new Date(to + 'T00:00:00');
        endDate = new Date(to + 'T23:59:59.999');
      }
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        return { startDate, endDate };
      }
    }

    const now = new Date();
    let startDate, endDate = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = new Date();
        break;
      case 'month':
        // วันที่ 1 ของเดือนนี้ 00:00:00 ถึงเวลาปัจจุบัน (ตามค่าใน DB / WI_RecordedOn)
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date();
        break;
      case 'year':
        // วันที่ 1 มกราคมของปีนี้ 00:00:00 ถึงเวลาปัจจุบัน (ไม่ดึงทั้งปีที่แล้ว)
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        endDate = new Date();
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = new Date();
    }

    return { startDate, endDate };
  }

  // คำนวณ percentage change
  calculateChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  }

  // Helper function: ดึง Company IDs ที่ User เห็นได้
  async getFinalCompanyIds(userId, filterCompanyId) {
    // ดึง Company IDs ที่ User เห็นได้ (จาก SystemUserCompany)
    let accessibleCompanyIds = null;
    if (userId) {
      accessibleCompanyIds = await settingsService.getUserAccessibleCompanyIds(userId);
    }

    // กำหนด companyId สุดท้าย (ตาม role)
    let finalCompanyIds = null;
    if (accessibleCompanyIds === null) {
      // Super Admin: ใช้ filterCompanyId ที่เลือก (ถ้ามี) หรือ null (เห็นทุก Company)
      if (filterCompanyId) {
        finalCompanyIds = [parseInt(filterCompanyId)];
      } else {
        finalCompanyIds = null; // เห็นทุก Company
      }
    } else {
      // User ปกติ: ใช้ Company IDs จาก SystemUserCompany
      // ถ้ามี filterCompanyId และอยู่ใน accessibleCompanyIds → ใช้ filterCompanyId
      // ถ้าไม่มี filterCompanyId → ใช้ accessibleCompanyIds ทั้งหมด
      if (filterCompanyId && accessibleCompanyIds.includes(parseInt(filterCompanyId))) {
        finalCompanyIds = [parseInt(filterCompanyId)];
      } else {
        finalCompanyIds = accessibleCompanyIds;
      }
    }

    return finalCompanyIds;
  }

  // Helper function: สร้าง WHERE clause สำหรับกรอง company และ date range
  // companyIds: Array ของ Company IDs (null = Super Admin เห็นทุก Company)
  buildWhereClause(companyIds, startDate, endDate, vehicleType) {
    const conditions = [];

    if (startDate && endDate) {
      conditions.push(`WI.WI_RecordedOn >= '${this.formatDateForSQL(startDate)}'`);
      conditions.push(`WI.WI_RecordedOn <= '${this.formatDateForSQL(endDate)}'`);
    }

    if (companyIds && companyIds.length > 0) {
      // ใช้ IN สำหรับหลาย Company
      const companyIdsStr = companyIds.map(id => parseInt(id)).join(', ');
      conditions.push(`WI.IC_ID IN (${companyIdsStr})`);
    } else if (companyIds === null) {
      // Super Admin: ไม่ต้อง filter (เห็นทุก Company)
      // ไม่ต้องเพิ่ม condition
    }
    // ถ้า companyIds = [] (empty array) → ไม่เห็น Company ไหนเลย (ไม่ควรเกิด)

    if (vehicleType) {
      conditions.push(`WI.WI_VehicleType = N'${vehicleType}'`);
    }

    return conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  }

  // 1. ดึงสถิติภาพรวม
  async getOverviewStats(period = 'week', userId = null, filterCompanyId = null, vehicleType = null, dateFrom = null, dateTo = null) {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period, dateFrom, dateTo);

      // ดึง Company IDs ที่ User เห็นได้
      const finalCompanyIds = await this.getFinalCompanyIds(userId, filterCompanyId);

      // สร้าง company และ vehicleType filter
      let companyFilter = '';
      if (finalCompanyIds && finalCompanyIds.length > 0) {
        const companyIdsStr = finalCompanyIds.map(id => parseInt(id)).join(', ');
        companyFilter = `AND WI.IC_ID IN (${companyIdsStr})`;
      }
      if (vehicleType) {
        companyFilter += ` AND WI.WI_VehicleType = N'${vehicleType}'`;
      }

      // สถิติช่วงเวลาปัจจุบัน
      const currentStats = await pool.request()
        .query(`
          SELECT
            COUNT(DISTINCT WI.WI_ID) as totalIn,
            COUNT(DISTINCT WO.WO_ID) as totalOut,
            COUNT(DISTINCT CASE WHEN WO.WO_ID IS NULL THEN WI.WI_ID END) as pending
          FROM [dbo].[WayIn] WI
          LEFT JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
          WHERE WI.WI_RecordedOn >= '${this.formatDateForSQL(startDate)}'
            AND WI.WI_RecordedOn <= '${this.formatDateForSQL(endDate)}'
            ${companyFilter}
        `);

      // สถิติช่วงก่อนหน้า (สำหรับคำนวณ trend)
      const previousRange = this.getDateRange(period);
      const diff = endDate - startDate;
      const previousStart = new Date(previousRange.startDate.getTime() - diff);
      const previousEnd = previousRange.startDate;

      const previousStats = await pool.request()
        .query(`
          SELECT
            COUNT(DISTINCT WI.WI_ID) as totalIn,
            COUNT(DISTINCT WO.WO_ID) as totalOut
          FROM [dbo].[WayIn] WI
          LEFT JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
          WHERE WI.WI_RecordedOn >= '${this.formatDateForSQL(previousStart)}'
            AND WI.WI_RecordedOn <= '${this.formatDateForSQL(previousEnd)}'
            ${companyFilter}
        `);

      const current = currentStats.recordset[0];
      const previous = previousStats.recordset[0];

      // คำนวณ utilization
      const utilization = current.totalIn > 0
        ? ((current.totalOut / current.totalIn) * 100).toFixed(1)
        : 0;

      return [
        {
          label: 'รถเข้าทั้งหมด',
          value: current.totalIn.toLocaleString(),
          change: `${this.calculateChange(current.totalIn, previous.totalIn) > 0 ? '+' : ''}${this.calculateChange(current.totalIn, previous.totalIn)}%`,
          trend: this.calculateChange(current.totalIn, previous.totalIn) >= 0 ? 'up' : 'down',
          gradient: 'linear-gradient(135deg, #0090D3, #0B4F6C)',
          icon: '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>'
        },
        {
          label: 'รถออกทั้งหมด',
          value: current.totalOut.toLocaleString(),
          change: `${this.calculateChange(current.totalOut, previous.totalOut) > 0 ? '+' : ''}${this.calculateChange(current.totalOut, previous.totalOut)}%`,
          trend: this.calculateChange(current.totalOut, previous.totalOut) >= 0 ? 'up' : 'down',
          gradient: 'linear-gradient(135deg, #10b981, #059669)',
          icon: '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>'
        },
        {
          label: 'รถค้างในคลัง',
          value: current.pending.toLocaleString(),
          change: current.pending > previous.totalIn - previous.totalOut ? '+' : '-' + Math.abs(this.calculateChange(current.pending, previous.totalIn - previous.totalOut)) + '%',
          trend: current.pending < (previous.totalIn - previous.totalOut) ? 'down' : 'up',
          gradient: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
          icon: '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        },
        {
          label: 'การใช้งานเฉลี่ย',
          value: utilization + '%',
          change: '+5.3%',
          trend: 'up',
          gradient: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
          icon: '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>'
        }
      ];
    } catch (error) {
      console.error('Error getting overview stats:', error);
      throw error;
    }
  }

  // 2. ดึงข้อมูลประเภทรถ
  async getVehicleTypeStats(period = 'week', userId = null, filterCompanyId = null, vehicleType = null, dateFrom = null, dateTo = null) {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period, dateFrom, dateTo);

      // ดึง Company IDs ที่ User เห็นได้
      const finalCompanyIds = await this.getFinalCompanyIds(userId, filterCompanyId);

      // สร้าง company และ vehicleType filter
      let companyFilter = '';
      if (finalCompanyIds && finalCompanyIds.length > 0) {
        const companyIdsStr = finalCompanyIds.map(id => parseInt(id)).join(', ');
        companyFilter = `AND IC_ID IN (${companyIdsStr})`;
      }
      if (vehicleType) {
        companyFilter += ` AND WI_VehicleType = N'${vehicleType}'`;
      }

      const result = await pool.request()
        .query(`
          SELECT
            WI_VehicleType as type,
            COUNT(*) as count
          FROM [dbo].[WayIn]
          WHERE WI_RecordedOn >= '${this.formatDateForSQL(startDate)}'
            AND WI_RecordedOn <= '${this.formatDateForSQL(endDate)}'
            AND WI_VehicleType IS NOT NULL
            ${companyFilter}
          GROUP BY WI_VehicleType
          ORDER BY COUNT(*) DESC
        `);

      const data = result.recordset;
      const maxCount = Math.max(...data.map(d => d.count));

      const colors = [
        'linear-gradient(135deg, #0090D3, #0B4F6C)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #3B82F6, #1E40AF)',
        'linear-gradient(135deg, #0EA5E9, #0284C7)'
      ];

      return data.map((item, index) => ({
        type: item.type || 'ไม่ระบุ',
        count: item.count,
        percentage: Math.round((item.count / maxCount) * 100),
        color: colors[index % colors.length]
      }));
    } catch (error) {
      console.error('Error getting vehicle type stats:', error);
      throw error;
    }
  }

  // 3. ดึงข้อมูลช่วงเวลาเร่งด่วน (ส่ง 24 ชม. เสมอ ชั่วโมงที่ไม่มีข้อมูล = 0 เพื่อให้รู้ว่า "ช่วงไหนมี/ไม่มี" ตอนใช้งานจริง)
  async getPeakHoursStats(period = 'week', userId = null, filterCompanyId = null, vehicleType = null, dateFrom = null, dateTo = null) {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period, dateFrom, dateTo);

      const finalCompanyIds = await this.getFinalCompanyIds(userId, filterCompanyId);

      let companyFilter = '';
      if (finalCompanyIds && finalCompanyIds.length > 0) {
        const companyIdsStr = finalCompanyIds.map(id => parseInt(id)).join(', ');
        companyFilter = `AND IC_ID IN (${companyIdsStr})`;
      }
      if (vehicleType) {
        companyFilter += ` AND WI_VehicleType = N'${vehicleType}'`;
      }

      const result = await pool.request()
        .query(`
          SELECT
            DATEPART(HOUR, WI_RecordedOn) as hour,
            COUNT(*) as [count]
          FROM [dbo].[WayIn]
          WHERE WI_RecordedOn >= '${this.formatDateForSQL(startDate)}'
            AND WI_RecordedOn <= '${this.formatDateForSQL(endDate)}'
            ${companyFilter}
          GROUP BY DATEPART(HOUR, WI_RecordedOn)
        `);

      const byHour = {};
      (result.recordset || []).forEach(d => {
        byHour[d.hour] = d.count;
      });

      const maxCount = Math.max(1, ...Object.values(byHour));

      // ส่ง 24 ชั่วโมงเสมอ (00:00 - 23:00) ชั่วโมงที่ไม่มีข้อมูล = 0
      const out = [];
      for (let h = 0; h < 24; h++) {
        const count = byHour[h] || 0;
        out.push({
          time: `${String(h).padStart(2, '0')}:00`,
          traffic: Math.round((count / maxCount) * 100),
          count
        });
      }
      return out;
    } catch (error) {
      console.error('Error getting peak hours stats:', error);
      throw error;
    }
  }

  // 4. ดึงข้อมูลบริษัทที่ใช้บริการบ่อยที่สุด
  async getTopCompaniesStats(period = 'week', limit = 5, userId = null, filterCompanyId = null, vehicleType = null, dateFrom = null, dateTo = null) {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period, dateFrom, dateTo);

      // ดึง Company IDs ที่ User เห็นได้
      const finalCompanyIds = await this.getFinalCompanyIds(userId, filterCompanyId);

      // สร้าง company และ vehicleType filter
      let companyFilter = '';
      if (finalCompanyIds && finalCompanyIds.length > 0) {
        const companyIdsStr = finalCompanyIds.map(id => parseInt(id)).join(', ');
        companyFilter = `AND WI.IC_ID IN (${companyIdsStr})`;
      }
      if (vehicleType) {
        companyFilter += ` AND WI.WI_VehicleType = N'${vehicleType}'`;
      }

      const result = await pool.request()
        .query(`
          SELECT TOP ${limit}
            IC.IC_LocalName as name,
            COUNT(WI.WI_ID) as count
          FROM [dbo].[WayIn] WI
          INNER JOIN [dbo].[InternalCompany] IC ON WI.IC_ID = IC.IC_ID
          WHERE WI.WI_RecordedOn >= '${this.formatDateForSQL(startDate)}'
            AND WI.WI_RecordedOn <= '${this.formatDateForSQL(endDate)}'
            ${companyFilter}
          GROUP BY IC.IC_LocalName
          ORDER BY COUNT(WI.WI_ID) DESC
        `);

      const data = result.recordset;
      const maxCount = data.length > 0 ? data[0].count : 0;

      return data.map(item => ({
        name: item.name,
        count: item.count,
        percentage: maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0
      }));
    } catch (error) {
      console.error('Error getting top companies stats:', error);
      throw error;
    }
  }

  // 5. ดึงข้อมูลแนวโน้มการเข้า-ออก (สำหรับกราฟ)
  async getTrafficTrendStats(period = 'week', userId = null, filterCompanyId = null, vehicleType = null, dateFrom = null, dateTo = null) {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period, dateFrom, dateTo);

      // ดึง Company IDs ที่ User เห็นได้
      const finalCompanyIds = await this.getFinalCompanyIds(userId, filterCompanyId);

      // สร้าง company และ vehicleType filter
      let companyFilter = '';
      if (finalCompanyIds && finalCompanyIds.length > 0) {
        const companyIdsStr = finalCompanyIds.map(id => parseInt(id)).join(', ');
        companyFilter = `AND WI.IC_ID IN (${companyIdsStr})`;
      }
      if (vehicleType) {
        companyFilter += ` AND WI.WI_VehicleType = N'${vehicleType}'`;
      }

      // ดึงข้อมูลแบ่งตามวัน
      const result = await pool.request()
        .query(`
          SELECT
            CAST(WI.WI_RecordedOn AS DATE) as date,
            COUNT(DISTINCT WI.WI_ID) as entryCount,
            COUNT(DISTINCT WO.WO_ID) as exitCount
          FROM [dbo].[WayIn] WI
          LEFT JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
            AND CAST(WO.WO_RecordedOn AS DATE) = CAST(WI.WI_RecordedOn AS DATE)
          WHERE WI.WI_RecordedOn >= '${this.formatDateForSQL(startDate)}'
            AND WI.WI_RecordedOn <= '${this.formatDateForSQL(endDate)}'
            ${companyFilter}
          GROUP BY CAST(WI.WI_RecordedOn AS DATE)
          ORDER BY CAST(WI.WI_RecordedOn AS DATE)
        `);

      // Format data for Chart.js
      const labels = [];
      const inData = [];
      const outData = [];

      result.recordset.forEach(row => {
        // Format date as Thai short day name or date
        const date = new Date(row.date);
        const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
        const label = thaiDays[date.getDay()] || date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' });

        labels.push(label);
        inData.push(row.entryCount || 0);
        outData.push(row.exitCount || 0);
      });

      return {
        labels,
        in: inData,
        out: outData
      };
    } catch (error) {
      console.error('Error getting traffic trend stats:', error);
      throw error;
    }
  }

  // 6. ดึงสถิติเพิ่มเติม
  async getAdditionalStats(period = 'week', userId = null, filterCompanyId = null, vehicleType = null, dateFrom = null, dateTo = null) {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period, dateFrom, dateTo);

      // ดึง Company IDs ที่ User เห็นได้
      const finalCompanyIds = await this.getFinalCompanyIds(userId, filterCompanyId);

      // สร้าง company และ vehicleType filter
      let companyFilter = '';
      if (finalCompanyIds && finalCompanyIds.length > 0) {
        const companyIdsStr = finalCompanyIds.map(id => parseInt(id)).join(', ');
        companyFilter = `AND WI.IC_ID IN (${companyIdsStr})`;
      }
      if (vehicleType) {
        companyFilter += ` AND WI.WI_VehicleType = N'${vehicleType}'`;
      }

      // คำนวณเวลาเฉลี่ยที่อยู่ในคลัง
      const avgTimeResult = await pool.request()
        .query(`
          SELECT
            AVG(DATEDIFF(MINUTE, WI.WI_RecordedOn, WO.WO_RecordedOn)) as avgMinutes
          FROM [dbo].[WayIn] WI
          INNER JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
          WHERE WI.WI_RecordedOn >= '${this.formatDateForSQL(startDate)}'
            AND WI.WI_RecordedOn <= '${this.formatDateForSQL(endDate)}'
            ${companyFilter}
        `);

      const avgMinutes = avgTimeResult.recordset[0].avgMinutes || 0;
      const avgHours = (avgMinutes / 60).toFixed(1);

      // นับจำนวนบริษัททั้งหมด (ถ้ากรองตาม company จะแสดงจำนวนบริษัทที่ User เห็นได้)
      let companyResult;
      if (finalCompanyIds && finalCompanyIds.length > 0) {
        const companyIdsStr = finalCompanyIds.map(id => parseInt(id)).join(', ');
        companyResult = await pool.request()
          .query(`
            SELECT COUNT(DISTINCT IC_ID) as count
            FROM [dbo].[InternalCompany]
            WHERE IC_IsActive = 1 AND IC_ID IN (${companyIdsStr})
          `);
      } else {
        companyResult = await pool.request()
          .query(`
            SELECT COUNT(DISTINCT IC_ID) as count
            FROM [dbo].[InternalCompany]
            WHERE IC_IsActive = 1
          `);
      }

      // คำนวณประสิทธิภาพ (% ของรถที่ออกเทียบกับรถเข้า)
      const efficiencyResult = await pool.request()
        .query(`
          SELECT
            COUNT(DISTINCT WI.WI_ID) as totalIn,
            COUNT(DISTINCT WO.WO_ID) as totalOut
          FROM [dbo].[WayIn] WI
          LEFT JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
          WHERE WI.WI_RecordedOn >= '${this.formatDateForSQL(startDate)}'
            AND WI.WI_RecordedOn <= '${this.formatDateForSQL(endDate)}'
            ${companyFilter}
        `);

      const { totalIn, totalOut } = efficiencyResult.recordset[0];
      const efficiency = totalIn > 0 ? ((totalOut / totalIn) * 100).toFixed(1) : 0;

      return {
        averageTime: `${avgHours} ชั่วโมง`,
        efficiency: `${efficiency}%`,
        totalCompanies: `${companyResult.recordset[0].count} บริษัท`
      };
    } catch (error) {
      console.error('Error getting additional stats:', error);
      throw error;
    }
  }

  // 7. ดึงสถิติการเข้าแยกตาม Location (ประตู 1, ประตู 2, ฯลฯ)
  async getEntryLocationStats(period = 'week', userId = null, filterCompanyId = null, vehicleType = null, dateFrom = null, dateTo = null) {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period, dateFrom, dateTo);

      // ดึง Company IDs ที่ User เห็นได้
      const finalCompanyIds = await this.getFinalCompanyIds(userId, filterCompanyId);

      // สร้าง company และ vehicleType filter
      let companyFilter = '';
      if (finalCompanyIds && finalCompanyIds.length > 0) {
        const companyIdsStr = finalCompanyIds.map(id => parseInt(id)).join(', ');
        companyFilter = `AND WI.IC_ID IN (${companyIdsStr})`;
      }
      if (vehicleType) {
        companyFilter += ` AND WI.WI_VehicleType = N'${vehicleType}'`;
      }

      // Query: ดึงข้อมูลการเข้าแยกตาม User_Location
      // ใช้ subquery เพื่อนับจำนวนก่อน แล้วค่อย JOIN กับ GuardLocation
      // เพื่อหลีกเลี่ยงปัญหา TEXT data type conversion
      const result = await pool.request()
        .query(`
          WITH LocationCounts AS (
            SELECT
              LTRIM(RTRIM(CAST(SU.User_Location AS VARCHAR(50)))) as UserLocation,
              COUNT(DISTINCT WI.WI_ID) as count
            FROM [dbo].[WayIn] WI
            LEFT JOIN [dbo].[SystemUser] SU ON WI.SU_ID = SU.SU_ID
            WHERE WI.WI_RecordedOn >= '${this.formatDateForSQL(startDate)}'
              AND WI.WI_RecordedOn <= '${this.formatDateForSQL(endDate)}'
              ${companyFilter}
              AND SU.User_Location IS NOT NULL
            GROUP BY LTRIM(RTRIM(CAST(SU.User_Location AS VARCHAR(50))))
          )
          SELECT
            ISNULL(GL.GL_ID, 0) as GL_ID,
            ISNULL(GL.GL_Name, N'Location ' + LC.UserLocation) as locationName,
            LC.count
          FROM LocationCounts LC
          LEFT JOIN [dbo].[GuardLocation] GL ON
            LTRIM(RTRIM(LC.UserLocation)) = CAST(GL.GL_ID AS VARCHAR(50))
          WHERE LC.UserLocation IS NOT NULL AND LC.UserLocation != ''
          ORDER BY LC.count DESC
        `);

      const data = result.recordset;
      const totalCount = data.reduce((sum, item) => sum + item.count, 0);

      // สร้าง color palette
      const colors = [
        'rgba(0, 144, 211, 0.8)',    // Primary blue
        'rgba(16, 185, 129, 0.8)',   // Green
        'rgba(59, 130, 246, 0.8)',   // Light blue
        'rgba(245, 158, 11, 0.8)',   // Orange
        'rgba(14, 165, 233, 0.8)',   // Sky
        'rgba(139, 92, 246, 0.8)',   // Purple
        'rgba(236, 72, 153, 0.8)',   // Pink
        'rgba(251, 146, 60, 0.8)'    // Amber
      ];

      return data.map((item, index) => ({
        locationId: item.GL_ID,
        locationName: item.locationName,
        count: item.count,
        percentage: totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : 0,
        color: colors[index % colors.length]
      }));
    } catch (error) {
      console.error('Error getting entry location stats:', error);
      throw error;
    }
  }
}

module.exports = new StatisticsService();
