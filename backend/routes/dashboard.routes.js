module.exports = (app) => {
  let Dashboard = require("../controllers/dashboard.controller");

  app.get("/api/dashboard/stats", Dashboard.getDashboardStats);
  app.get("/api/dashboard/revenue-chart", Dashboard.getRevenueChart);
  app.get("/api/dashboard/activities", Dashboard.getRecentActivities);
  
  // เพิ่ม routes ใหม่สำหรับ Sale Orders
  app.get("/api/dashboard/orders", Dashboard.getSaleOrders);
  app.get("/api/dashboard/orders/:orderId/items", Dashboard.getOrderItems);
  
  app.get("/api/dashboard/all", Dashboard.getAllDashboardData);
};