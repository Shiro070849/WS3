module.exports = (app) => {
    let Customer = require("../controllers/customer.controller");
  
    app.post("/customer/Getlist_Customer", Customer.Getlist_Customer);
    app.post("/customer/Get_Customer", Customer.Get_Customer);
    app.post("/customer/Create_NewCustomer", Customer.Create_NewCustomer);
    app.get("/customer/GetNextCustomerCode", Customer.GetNextCustomerCode);
    app.post("/customer/Update_Customer", Customer.Update_Customer);
    
    // เพิ่ม Route ใหม่สำหรับย้ายลูกค้าใหม่ไปเป็นลูกค้าเก่า
    app.post("/customer/MoveNewCustomerToCustomer", Customer.MoveNewCustomerToCustomer);

    app.post("/customer/Import_Customers", Customer.Import_Customers);
    app.post("/customer/GetCustomerAddress", Customer.GetCustomerAddress);
    app.post("/customer/UpdateCustomerAddress", Customer.UpdateCustomerAddress);
    app.get("/customer/GetCustomerAddressTemplate", Customer.GetCustomerAddressTemplate);
    app.post("/customer/BulkUpdateCustomerAddress", Customer.BulkUpdateCustomerAddress);
};