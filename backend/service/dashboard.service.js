const config = require("../config/Mssql.config");
const sql = require("mssql");

// ฟังก์ชันสำหรับดึงสถิติรวม Dashboard
async function getDashboardStats() {
  try {
    const Query = `
      SELECT 
        (SELECT COUNT(*) FROM dbo.Sale_Order) as totalOrders,
        (SELECT SUM(SO_TotalAmount) FROM dbo.Sale_Order) as totalRevenue,
        (SELECT COUNT(*) FROM dbo.Customer) as activeUsers,
        (SELECT COUNT(*) FROM dbo.Items) as totalProducts,
        (SELECT COUNT(*) FROM dbo.Sale_Order WHERE MONTH(CreateDate) = MONTH(GETDATE()) AND YEAR(CreateDate) = YEAR(GETDATE())) as monthlyOrders,
        (SELECT COUNT(*) FROM dbo.Sale_Order WHERE MONTH(CreateDate) = MONTH(DATEADD(MONTH, -1, GETDATE())) AND YEAR(CreateDate) = YEAR(DATEADD(MONTH, -1, GETDATE()))) as lastMonthOrders
    `;

    let pool = await sql.connect(config.sql);
    const result = await pool.request().query(Query);

    if (result.recordset.length > 0) {
      const data = result.recordset[0];
      
      // คำนวณ growth rate
      const orderGrowth = data.lastMonthOrders > 0 
        ? ((data.monthlyOrders - data.lastMonthOrders) / data.lastMonthOrders * 100).toFixed(1)
        : 0;

      return {
        totalOrders: data.totalOrders || 0,
        orderGrowth: parseFloat(orderGrowth),
        totalRevenue: data.totalRevenue || 0,
        revenueGrowth: 8.3, // Mock data - ต้องการคำนวณจริงไหม?
        activeUsers: data.activeUsers || 0,
        userGrowth: 5.2, // Mock data 
        totalProducts: data.totalProducts || 0,
        newProducts: 12 // Mock data
      };
    } else {
      return {
        totalOrders: 0,
        orderGrowth: 0,
        totalRevenue: 0,
        revenueGrowth: 0,
        activeUsers: 0,
        userGrowth: 0,
        totalProducts: 0,
        newProducts: 0
      };
    }
  } catch (error) {
    console.error("Error in getDashboardStats:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับดึงข้อมูลกราฟรายได้
async function getRevenueChart(period = '7d') {
  try {
    let Query;
    
    switch(period) {
      case '7d':
        Query = `
          SELECT 
            CAST(CreateDate as DATE) as date,
            SUM(SO_TotalAmount) as revenue
          FROM dbo.Sale_Order 
          WHERE CreateDate >= DATEADD(DAY, -7, GETDATE())
          GROUP BY CAST(CreateDate as DATE)
          ORDER BY date
        `;
        break;
      case '30d':
        Query = `
          SELECT 
            CAST(CreateDate as DATE) as date,
            SUM(SO_TotalAmount) as revenue
          FROM dbo.Sale_Order 
          WHERE CreateDate >= DATEADD(DAY, -30, GETDATE())
          GROUP BY CAST(CreateDate as DATE)
          ORDER BY date
        `;
        break;
      case '90d':
        Query = `
          SELECT 
            CAST(CreateDate as DATE) as date,
            SUM(SO_TotalAmount) as revenue
          FROM dbo.Sale_Order 
          WHERE CreateDate >= DATEADD(DAY, -90, GETDATE())
          GROUP BY CAST(CreateDate as DATE)
          ORDER BY date
        `;
        break;
      default:
        period = '7d';
        Query = `
          SELECT 
            CAST(CreateDate as DATE) as date,
            SUM(SO_TotalAmount) as revenue
          FROM dbo.Sale_Order 
          WHERE CreateDate >= DATEADD(DAY, -7, GETDATE())
          GROUP BY CAST(CreateDate as DATE)
          ORDER BY date
        `;
    }

    let pool = await sql.connect(config.sql);
    const result = await pool.request().query(Query);

    const chartData = result.recordset.map(row => ({
      date: row.date,
      revenue: row.revenue || 0
    }));

    // คำนวณสถิติ
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const avgRevenue = chartData.length > 0 ? Math.round(totalRevenue / chartData.length) : 0;
    const revenues = chartData.map(item => item.revenue);
    const highestDay = revenues.length > 0 ? Math.max(...revenues) : 0;
    const lowestDay = revenues.length > 0 ? Math.min(...revenues) : 0;

    return {
      period,
      chartData,
      statistics: {
        totalRevenue,
        avgRevenue,
        highestDay,
        lowestDay
      }
    };
  } catch (error) {
    console.error("Error in getRevenueChart:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับดึงกิจกรรมล่าสุด
async function getRecentActivities(limit = 10) {
  try {
    const Query = `
      SELECT TOP (@limit)
        SO.SO_ID,
        C.CustName,
        SO.SO_TotalAmount,
        SO.CreateDate
      FROM dbo.Sale_Order SO
      LEFT JOIN dbo.Customer C ON SO.Customer_Code = C.Cust_Code
      ORDER BY SO.CreateDate DESC
    `;

    let pool = await sql.connect(config.sql);
    const result = await pool
      .request()
      .input("limit", sql.Int, limit)
      .query(Query);

    const activities = result.recordset.map((row, index) => {
      const timeDiff = new Date() - new Date(row.CreateDate);
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      let timeText;
      if (hoursAgo >= 24) {
        timeText = `${Math.floor(hoursAgo / 24)} วันที่แล้ว`;
      } else if (hoursAgo >= 1) {
        timeText = `${hoursAgo} ชั่วโมงที่แล้ว`;
      } else {
        timeText = `${minutesAgo} นาทีที่แล้ว`;
      }

      return {
        id: index + 1,
        icon: 'ORD',
        title: `คำสั่งซื้อ #${row.SO_ID}`,
        subtitle: row.CustName || 'ลูกค้า',
        time: timeText,
        amount: row.SO_TotalAmount
      };
    });

    return {
      activities,
      total: result.recordset.length,
      limit
    };
  } catch (error) {
    console.error("Error in getRecentActivities:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับดึง Sale Orders
async function getSaleOrders(limit = 10, status = null) {
  try {
    const Query = `
      SELECT TOP (@limit)
        SO.SO_ID as orderNumber,
        C.CustName as customerName,
        SO.CreateDate as orderDate,
        SO.SO_TotalAmount as totalAmount
      FROM dbo.Sale_Order SO
      LEFT JOIN dbo.Customer C ON SO.Customer_Code = C.Cust_Code
      ORDER BY SO.CreateDate DESC
    `;

    let pool = await sql.connect(config.sql);
    const request = pool.request().input("limit", sql.Int, parseInt(limit));

    const result = await request.query(Query);

    // แปลงข้อมูลให้เหมาะกับ Frontend
    const orders = result.recordset.map((row, index) => ({
      orderNumber: `#${String(row.orderNumber).padStart(4, '0')}`,
      customerName: row.customerName || 'ไม่ระบุ',
      orderDate: new Date(row.orderDate).toLocaleDateString('th-TH'),
      totalAmount: row.totalAmount || 0,
      status: index % 3 === 0 ? 'เสร็จสิ้น' : index % 2 === 0 ? 'รอดำเนินการ' : 'กำลังดำเนินการ',
      salesPerson: 'ไม่ระบุ'
    }));

    return orders;
  } catch (error) {
    console.error("Error in getSaleOrders:", error.message);
    throw error;
  }
}

// ฟังก์ชันสำหรับดึง Order Items
// แทนที่ function getOrderItems ใน dashboard.service.js

async function getOrderItems(orderId) {
  try {
    // ลองใช้ชื่อคอลัมน์ที่เป็นไปได้ในตาราง Items
    const Query = `
      SELECT 
        SOI.SOI_ID,
        SOI.I_ID,
        COALESCE(I.Item_Name, I.ItemName, I.Name, I.Item_Description, 'ไม่ระบุ') as itemName,
        SOI.I_Qty as quantity,
        SOI.I_Price as unitPrice,
        SOI.I_Discount as discount
      FROM dbo.SaleOrder_Item SOI
      LEFT JOIN dbo.Items I ON SOI.I_ID = I.Item_ID
      WHERE SOI.SO_ID = @orderId
      ORDER BY SOI.SOI_ID
    `;

    let pool = await sql.connect(config.sql);
    const result = await pool
      .request()
      .input("orderId", sql.Int, parseInt(orderId))
      .query(Query);

    return result.recordset.map(row => ({
      id: row.SOI_ID,
      itemId: row.I_ID,
      itemName: row.itemName || `สินค้า ID: ${row.I_ID}`,
      quantity: row.quantity || 0,
      unitPrice: row.unitPrice || 0,
      discount: row.discount || 0,
      amount: (row.quantity || 0) * (row.unitPrice || 0) - (row.discount || 0)
    }));
  } catch (error) {
    console.error("Error in getOrderItems - trying fallback query:", error.message);
    
    // ถ้า error ลอง query แบบง่ายๆ ไม่ JOIN
    try {
      const FallbackQuery = `
        SELECT 
          SOI.SOI_ID,
          SOI.I_ID,
          SOI.I_Qty as quantity,
          SOI.I_Price as unitPrice,
          SOI.I_Discount as discount
        FROM dbo.SaleOrder_Item SOI
        WHERE SOI.SO_ID = @orderId
        ORDER BY SOI.SOI_ID
      `;

      let pool = await sql.connect(config.sql);
      const result = await pool
        .request()
        .input("orderId", sql.Int, parseInt(orderId))
        .query(FallbackQuery);

      return result.recordset.map(row => ({
        id: row.SOI_ID,
        itemId: row.I_ID,
        itemName: `สินค้า ID: ${row.I_ID}`,
        quantity: row.quantity || 0,
        unitPrice: row.unitPrice || 0,
        discount: row.discount || 0,
        amount: (row.quantity || 0) * (row.unitPrice || 0) - (row.discount || 0)
      }));
    } catch (fallbackError) {
      console.error("Error in fallback query:", fallbackError.message);
      throw fallbackError;
    }
  }
}

module.exports = {
  getDashboardStats,
  getRevenueChart,
  getRecentActivities,
  getSaleOrders,
  getOrderItems
};