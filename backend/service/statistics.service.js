const dbService = require('./db.service');

class StatisticsService {
  // Helper function สำหรับคำนวณวันที่ตาม period
  getDateRange(period) {
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
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
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

  // 1. ดึงสถิติภาพรวม
  async getOverviewStats(period = 'week') {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period);

      // สถิติช่วงเวลาปัจจุบัน
      const currentStats = await pool.request()
        .query(`
          SELECT
            COUNT(DISTINCT WI.WI_ID) as totalIn,
            COUNT(DISTINCT WO.WO_ID) as totalOut,
            COUNT(DISTINCT CASE WHEN WO.WO_ID IS NULL THEN WI.WI_ID END) as pending
          FROM [dbo].[WayIn] WI
          LEFT JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
          WHERE WI.WI_RecordedOn >= '${startDate.toISOString()}'
            AND WI.WI_RecordedOn <= '${endDate.toISOString()}'
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
          WHERE WI.WI_RecordedOn >= '${previousStart.toISOString()}'
            AND WI.WI_RecordedOn <= '${previousEnd.toISOString()}'
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
  async getVehicleTypeStats(period = 'week') {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period);

      const result = await pool.request()
        .query(`
          SELECT
            WI_VehicleType as type,
            COUNT(*) as count
          FROM [dbo].[WayIn]
          WHERE WI_RecordedOn >= '${startDate.toISOString()}'
            AND WI_RecordedOn <= '${endDate.toISOString()}'
            AND WI_VehicleType IS NOT NULL
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

  // 3. ดึงข้อมูลช่วงเวลาเร่งด่วน
  async getPeakHoursStats(period = 'week') {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period);

      const result = await pool.request()
        .query(`
          SELECT
            DATEPART(HOUR, WI_RecordedOn) as hour,
            COUNT(*) as traffic
          FROM [dbo].[WayIn]
          WHERE WI_RecordedOn >= '${startDate.toISOString()}'
            AND WI_RecordedOn <= '${endDate.toISOString()}'
          GROUP BY DATEPART(HOUR, WI_RecordedOn)
          ORDER BY traffic DESC
        `);

      const data = result.recordset;
      const maxTraffic = Math.max(...data.map(d => d.traffic));

      // เลือกแค่ช่วงเวลาที่มีการจราจร Top 6
      return data.slice(0, 6).map(item => ({
        time: `${String(item.hour).padStart(2, '0')}:00`,
        traffic: Math.round((item.traffic / maxTraffic) * 100)
      }));
    } catch (error) {
      console.error('Error getting peak hours stats:', error);
      throw error;
    }
  }

  // 4. ดึงข้อมูลบริษัทที่ใช้บริการบ่อยที่สุด
  async getTopCompaniesStats(period = 'week', limit = 5) {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period);

      const result = await pool.request()
        .query(`
          SELECT TOP ${limit}
            IC.IC_LocalName as name,
            COUNT(WI.WI_ID) as count
          FROM [dbo].[WayIn] WI
          INNER JOIN [dbo].[InternalCompany] IC ON WI.IC_ID = IC.IC_ID
          WHERE WI.WI_RecordedOn >= '${startDate.toISOString()}'
            AND WI.WI_RecordedOn <= '${endDate.toISOString()}'
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
  async getTrafficTrendStats(period = 'week') {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period);

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
          WHERE WI.WI_RecordedOn >= '${startDate.toISOString()}'
            AND WI.WI_RecordedOn <= '${endDate.toISOString()}'
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
  async getAdditionalStats(period = 'week') {
    try {
      const pool = await dbService.connect();
      const { startDate, endDate } = this.getDateRange(period);

      // คำนวณเวลาเฉลี่ยที่อยู่ในคลัง
      const avgTimeResult = await pool.request()
        .query(`
          SELECT
            AVG(DATEDIFF(MINUTE, WI.WI_RecordedOn, WO.WO_RecordedOn)) as avgMinutes
          FROM [dbo].[WayIn] WI
          INNER JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
          WHERE WI.WI_RecordedOn >= '${startDate.toISOString()}'
            AND WI.WI_RecordedOn <= '${endDate.toISOString()}'
        `);

      const avgMinutes = avgTimeResult.recordset[0].avgMinutes || 0;
      const avgHours = (avgMinutes / 60).toFixed(1);

      // นับจำนวนบริษัททั้งหมด
      const companyResult = await pool.request()
        .query(`
          SELECT COUNT(DISTINCT IC_ID) as count
          FROM [dbo].[InternalCompany]
          WHERE IC_IsActive = 1
        `);

      // คำนวณประสิทธิภาพ (% ของรถที่ออกเทียบกับรถเข้า)
      const efficiencyResult = await pool.request()
        .query(`
          SELECT
            COUNT(DISTINCT WI.WI_ID) as totalIn,
            COUNT(DISTINCT WO.WO_ID) as totalOut
          FROM [dbo].[WayIn] WI
          LEFT JOIN [dbo].[WayOut] WO ON WI.WI_ID = WO.WI_ID
          WHERE WI.WI_RecordedOn >= '${startDate.toISOString()}'
            AND WI.WI_RecordedOn <= '${endDate.toISOString()}'
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
}

module.exports = new StatisticsService();
