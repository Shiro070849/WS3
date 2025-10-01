const multer = require('multer');

// กำหนดการจัดเก็บไฟล์ในหน่วยความจำ
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 50 * 1024 * 1024, // จำกัดขนาดไฟล์ 50MB
    files: 20 // จำกัดจำนวนไฟล์สูงสุด 20 ไฟล์
  },
  fileFilter: (req, file, cb) => {
    // อนุญาตไฟล์ทุกประเภท (สามารถปรับแต่งได้)
    cb(null, true);
  }
});

module.exports = (app) => {   
  let Order = require("../controllers/orders.controller");    
  
  // ===== Routes สำหรับ Orders เท่านั้น =====
  app.post("/Order/CreateOrder", upload.array('files'), Order.CreateOrder);   
  app.get("/Order/GetAllOrders", Order.GetAllOrders);
  app.get("/Order/GetCustomers", Order.GetCustomers);  
  app.get("/Order/DebugSalesperson", Order.DebugSalesperson);
  app.put("/Order/UpdateSaleOrder/:orderId", Order.UpdateSaleOrder);
  app.get("/api/orders/sale-orders", Order.GetSaleOrdersList);
  app.get("/api/credit-terms", Order.GetCreditTerms);
};