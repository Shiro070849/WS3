const DashboardService = require("../service/dashboard.service");
const CustomerService = require("../service/customer.service");
const ItemService = require("../service/items.service");
const SalePersonService = require("../service/saleperson.service");
const OrderService = require("../service/orders.service");

exports.getDashboardStats = async (req, res) => {
  try {
    let result_data = await DashboardService.getDashboardStats();

    res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const { period } = req.query;
    let result_data = await DashboardService.getRevenueChart(period);

    res.status(200).json({
      success: true,
      message: "Revenue chart data fetched successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error fetching revenue chart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue chart data",
      error: error.message,
    });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const { limit } = req.query;
    let result_data = await DashboardService.getRecentActivities(limit);

    res.status(200).json({
      success: true,
      message: "Recent activities fetched successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activities",
      error: error.message,
    });
  }                           
};

exports.getSaleOrders = async (req, res) => {
  try {
    const { limit, status } = req.query;
    let result_data = await DashboardService.getSaleOrders(limit, status);

    res.status(200).json({
      success: true,
      message: "Sale orders fetched successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error fetching sale orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sale orders",
      error: error.message,
    });
  }
};

exports.getOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;
    let result_data = await DashboardService.getOrderItems(orderId);

    res.status(200).json({
      success: true,
      message: "Order items fetched successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error fetching order items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order items",
      error: error.message,
    });
  }
};

// Combined Dashboard API - รวม 9 APIs เป็น 1 endpoint
exports.getAllDashboardData = async (req, res) => {
  try {
    console.log("=== getAllDashboardData API Called ===");
    
    // เรียก Services ทั้งหมดแบบ Promise.allSettled
    const [
      dashboardStatsResult,
      revenueChartResult,
      activitiesResult,
      saleOrdersResult,
      customersResult,
      saleOrdersForEditResult,
      itemsResult,
      paymentTermsResult,
      salePersonsResult
    ] = await Promise.allSettled([
      DashboardService.getDashboardStats(),
      DashboardService.getRevenueChart('7d'),
      DashboardService.getRecentActivities(10),
      DashboardService.getSaleOrders(10, null),
      CustomerService.Getlist_Customer(),
      OrderService.GetSaleOrdersList({page: 1, limit: 50, search: ''}),
      ItemService.Getlist_Items(),
      ItemService.GetPaymentTerms(),
      SalePersonService.Getlist_SalesPerson()
    ]);

    // Helper function เพื่อ extract ข้อมูลจาก Promise results
    const extractData = (result) => {
      if (result.status === 'fulfilled') {
        return result.value?.data || result.value || null;
      }
      return null;
    };

    const extractError = (result) => {
      if (result.status === 'rejected') {
        return result.reason?.message || 'Unknown error';
      }
      return null;
    };

    // สร้าง response structure
    const response = {
      success: true,
      message: "Combined dashboard data fetched successfully",
      data: {
        dashboardStats: extractData(dashboardStatsResult),
        revenueChart: extractData(revenueChartResult),
        recentActivities: extractData(activitiesResult),
        saleOrders: extractData(saleOrdersResult),
        customers: extractData(customersResult),
        saleOrdersForEdit: extractData(saleOrdersForEditResult),
        products: extractData(itemsResult),
        paymentTerms: extractData(paymentTermsResult),
        salePersons: extractData(salePersonsResult)
      },
      errors: {
        dashboardStats: extractError(dashboardStatsResult),
        revenueChart: extractError(revenueChartResult),
        recentActivities: extractError(activitiesResult),
        saleOrders: extractError(saleOrdersResult),
        customers: extractError(customersResult),
        saleOrdersForEdit: extractError(saleOrdersForEditResult),
        products: extractError(itemsResult),
        paymentTerms: extractError(paymentTermsResult),
        salePersons: extractError(salePersonsResult)
      },
      summary: {
        totalAPIs: 9,
        successful: [dashboardStatsResult, revenueChartResult, activitiesResult, saleOrdersResult, customersResult, saleOrdersForEditResult, itemsResult, paymentTermsResult, salePersonsResult].filter(r => r.status === 'fulfilled').length,
        failed: [dashboardStatsResult, revenueChartResult, activitiesResult, saleOrdersResult, customersResult, saleOrdersForEditResult, itemsResult, paymentTermsResult, salePersonsResult].filter(r => r.status === 'rejected').length
      },
      timestamp: new Date().toISOString()
    };

    console.log(`Combined API completed: ${response.summary.successful}/${response.summary.totalAPIs} successful`);
    
    res.status(200).json(response);

  } catch (error) {
    console.error("Error in getAllDashboardData:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch combined dashboard data",
      error: error.message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};