const CustomerService = require("../service/customer.service");

exports.Getlist_Customer = async (req, res) => {
  try {

    let result_data = await CustomerService.Getlist_Customer();

    if (result_data.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No data found",
        error: "No matching customers found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer Search successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch items",
      error: error.message,
    });
  }
};

exports.Get_Customer = async (req, res) => {
    try {

      let userData = req.body.cust_id;

      let result_data = await CustomerService.Get_Customer(userData);

      if (result_data.length === 0) {
        return res.status(500).json({
          success: false,
          message: "No data found",
          error: "No matching customers found",
        });
      }
    
      res.status(200).json({
        success: true,
        message: "Items fetched successfully",
        data: result_data,
      });
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch items",
        error: error.message,
      });
    }
  };

exports.Create_NewCustomer = async (req, res) => {
  try {

    let customerData = req.body;

    let result_data = await CustomerService.Create_NewCustomer(customerData);

    res.status(200).json({
      success: true,
      message: "New customer created successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

exports.GetNextCustomerCode = async (req, res) => {
  try {

    let result_data = await CustomerService.GetNextCustomerCode();

    res.status(200).json({
      success: true,
      message: "Next customer code generated successfully",
      nextCode: result_data.nextCode,
    });
  } catch (error) {
    console.error("Error generating next customer code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate next customer code",
      error: error.message,
    });
  }
};

// เพิ่ม function ใหม่สำหรับ UPDATE
exports.Update_Customer = async (req, res) => {
  try {
    let customerData = req.body;
    
    // ตรวจสอบว่ามี Cust_ID หรือไม่
    if (!customerData.Cust_ID) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
        error: "Missing Cust_ID",
      });
    }

    let result_data = await CustomerService.Update_Customer(customerData);
    
    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
};

exports.MoveNewCustomerToCustomer = async (req, res) => {
  try {
    const { soId } = req.body;
    
    // ตรวจสอบ parameter
    if (!soId) {
      return res.status(400).json({
        success: false,
        message: "SO_ID is required",
        error: "Missing SO_ID parameter",
      });
    }

    console.log("Moving new customer to customer table for SO_ID:", soId);

    const result = await CustomerService.MoveNewCustomerToCustomerTable(soId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });

  } catch (error) {
    console.error("Error moving new customer to customer table:", error);
    
    // แยกประเภท error
    let statusCode = 500;
    let errorMessage = error.message;
    
    if (error.message.includes('not found') || 
        error.message.includes('is empty')) {
      statusCode = 404;
    } else if (error.message.includes('already exists')) {
      statusCode = 409; // Conflict
    }

    res.status(statusCode).json({
      success: false,
      message: "Failed to move new customer to customer table",
      error: errorMessage,
    });
  }
};

// ✅ เพิ่มฟังก์ชันใหม่สำหรับ Import Excel
exports.Import_Customers = async (req, res) => {
  try {
    console.log("=== Import_Customers API Called ===");
    console.log("Request body:", req.body);
    
    const { customers } = req.body;
    
    // ตรวจสอบข้อมูล
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบข้อมูลลูกค้าสำหรับ Import",
        error: "Missing or empty customers array",
      });
    }
    
    // ตรวจสอบข้อมูลแต่ละรายการ
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      if (!customer.Cust_Code || !customer.CustName) {
        return res.status(400).json({
          success: false,
          message: `ข้อมูลไม่ครบถ้วนในรายการที่ ${i + 1}: ต้องมี Cust_Code และ CustName`,
          error: "Missing required fields",
        });
      }
    }
    
    console.log(`Attempting to import ${customers.length} customers`);
    
    // เรียก Service
    const result = await CustomerService.Import_Customers(customers);
    
    console.log("Import_Customers success:", result);
    
    res.status(200).json({
      success: true,
      message: `Import ลูกค้าสำเร็จ ${result.imported} รายการ`,
      data: result,
    });
    
  } catch (error) {
    console.error("Error importing customers:", error);
    
    // จัดการ error types
    let statusCode = 500;
    let errorMessage = error.message;
    
    if (error.message.includes('duplicate') || 
        error.message.includes('UNIQUE') || 
        error.message.includes('PRIMARY KEY')) {
      statusCode = 409; // Conflict
      errorMessage = 'พบรหัสลูกค้าซ้ำในระบบ';
    } else if (error.message.includes('validation')) {
      statusCode = 400; // Bad Request
      errorMessage = 'ข้อมูลไม่ถูกต้องตามรูปแบบที่กำหนด';
    } else if (error.message.includes('FOREIGN KEY')) {
      statusCode = 400;
      errorMessage = 'ข้อมูล CGroup_ID ไม่ถูกต้อง';
    }
    
    res.status(statusCode).json({
      success: false,
      message: "Failed to import customers",
      error: errorMessage,
    });
  }
};

exports.GetCustomerAddress = async (req, res) => {
  try {
    const { custId } = req.body;

    if (!custId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
        error: "Missing custId parameter",
      });
    }

    console.log("Getting customer address for Cust_ID:", custId);

    const result = await CustomerService.GetCustomerAddress(custId);

    res.status(200).json({
      success: true,
      message: "Customer address fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error("Error getting customer address:", error);

    let statusCode = 500;
    let errorMessage = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'ไม่พบข้อมูลลูกค้า';
    }

    res.status(statusCode).json({
      success: false,
      message: "Failed to get customer address",
      error: errorMessage,
    });
  }
};

// อัพเดทข้อมูลที่อยู่ลูกค้า
exports.UpdateCustomerAddress = async (req, res) => {
  try {
    const { custId, addressData } = req.body;

    if (!custId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
        error: "Missing custId parameter",
      });
    }

    if (!addressData) {
      return res.status(400).json({
        success: false,
        message: "Address data is required",
        error: "Missing addressData parameter",
      });
    }

    console.log("Updating customer address for Cust_ID:", custId);

    const result = await CustomerService.UpdateCustomerAddress(custId, addressData);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });

  } catch (error) {
    console.error("Error updating customer address:", error);

    let statusCode = 500;
    let errorMessage = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'ไม่พบข้อมูลลูกค้าหรือลูกค้าไม่ได้ใช้งาน';
    } else if (error.message.includes('validation')) {
      statusCode = 400;
      errorMessage = 'ข้อมูลที่อยู่ไม่ถูกต้อง';
    }

    res.status(statusCode).json({
      success: false,
      message: "Failed to update customer address",
      error: errorMessage,
    });
  }
};

// Controller สำหรับดึง Template ที่อยู่ลูกค้า
exports.GetCustomerAddressTemplate = async (req, res) => {
  try {
    console.log("Getting customer address template...");

    const customers = await CustomerService.GetCustomerAddressTemplate();

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลลูกค้าในระบบ",
        error: "No active customers found",
      });
    }

    // เตรียมข้อมูลสำหรับ Excel
    const excelData = customers.map(customer => ({
      Cust_Code: customer.Cust_Code,
      CustName: customer.CustName,
      Cust_Address: customer.Cust_Address || '',
      Cust_Tel: customer.Cust_Tel || '',
      Cust_Fax: customer.Cust_Fax || '',
      Cust_Email: customer.Cust_Email || '',
      Cust_Attn: customer.Cust_Attn || ''
    }));

    console.log(`Address template generated with ${excelData.length} customers`);

    res.status(200).json({
      success: true,
      message: "ดึงข้อมูล Template ที่อยู่ลูกค้าสำเร็จ",
      data: excelData,
      total: excelData.length
    });

  } catch (error) {
    console.error("Error getting customer address template:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงข้อมูล Template ที่อยู่ลูกค้าได้",
      error: error.message,
    });
  }
};

// Controller สำหรับ Bulk Update ที่อยู่ลูกค้า
exports.BulkUpdateCustomerAddress = async (req, res) => {
  try {
    console.log("=== Bulk Update Customer Address API Called ===");
    console.log("Request body:", req.body);

    const { addressUpdates } = req.body;

    // ตรวจสอบข้อมูล
    if (!addressUpdates || !Array.isArray(addressUpdates) || addressUpdates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบข้อมูลที่อยู่สำหรับ Update",
        error: "Missing or empty addressUpdates array",
      });
    }

    // ตรวจสอบข้อมูลแต่ละรายการ
    for (let i = 0; i < addressUpdates.length; i++) {
      const update = addressUpdates[i];
      if (!update.Cust_Code) {
        return res.status(400).json({
          success: false,
          message: `ข้อมูลไม่ครบถ้วนในรายการที่ ${i + 1}: ต้องมี Cust_Code`,
          error: "Missing Cust_Code",
        });
      }
    }

    console.log(`Attempting to update address for ${addressUpdates.length} customers`);

    // เรียก Service
    const result = await CustomerService.BulkUpdateCustomerAddress(addressUpdates);

    console.log("Bulk address update success:", result);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });

  } catch (error) {
    console.error("Error bulk updating customer addresses:", error);

    let statusCode = 500;
    let errorMessage = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'ไม่พบข้อมูลลูกค้าบางรายการในระบบ';
    } else if (error.message.includes('validation')) {
      statusCode = 400;
      errorMessage = 'ข้อมูลที่อยู่ไม่ถูกต้อง';
    }

    res.status(statusCode).json({
      success: false,
      message: "Failed to bulk update customer addresses",
      error: errorMessage,
    });
  }
};