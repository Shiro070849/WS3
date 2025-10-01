const OrderService = require("../service/orders.service");
const EmailService = require("../service/EmailService");
const EmailFoodService = require("../service/EmailFoodService");

const mapRequestDataToQuotationFormat = async (requestData, req) => {
  try {
    console.log("=== mapRequestDataToQuotationFormat Called ===");
    console.log("Input requestData:", JSON.stringify(requestData, null, 2));
    
    let sourceData = requestData;
    
    if (requestData.Order) {
      sourceData = requestData.Order;
    }

    // เช็คประเภทสินค้าจาก URL
    const isFoodProduct = sourceData.productType === 'food';
    console.log("=== Product Type Detection ===");
    console.log("URL:", req ? req.originalUrl : 'No req object');
    console.log("Is Food Product:", isFoodProduct);

    const salesNumber = sourceData.salesNumber || 
                       sourceData.orderNumber || 
                       sourceData.SO_NUMBER || 
                       await EmailService.generateQuotationNumber();

    const customerName = sourceData.customerName || 
                        sourceData.customer_name || 
                        "ชื่อลูกค้า";

    const customerId = sourceData.customerId || 
                      sourceData.customer_id || 
                      "";

    const customerType = sourceData.customerType || 
                        sourceData.customer_type || 
                        "ลูกค้าทั่วไป";

    const employeeName = sourceData.employeeName || 
                        sourceData.employee_name || 
                        sourceData.salesperson ||
                        sourceData.salesPersonName ||
                        sourceData.staffName ||
                        sourceData.salesName ||
                        "";

    const employeeTel = sourceData.employeeTel || 
                       sourceData.employee_tel || 
                       "";

    const date = sourceData.date || 
                sourceData.order_date || 
                sourceData.selectDate ||
                new Date().toISOString();

    console.log("=== Extracted Employee Information ===");
    console.log("Employee Name extracted:", employeeName);
    console.log("Employee Tel:", employeeTel);

    // ข้อมูลที่อยู่ลูกค้า
    const customerAddress = sourceData.customerAddress || "";
    const customerTel = sourceData.customerTel || "";
    const customerFax = sourceData.customerFax || "";
    const customerEmail = sourceData.customerEmail || "";
    const customerContact = sourceData.customerContact || "";
    const employeeEmail = sourceData.employeeEmail || sourceData.employee_email || sourceData.salesEmail || "";

    console.log("=== Extracted Customer Address Information ===");
    console.log("Customer Address:", customerAddress);
    console.log("Customer Tel:", customerTel);
    console.log("Customer Email:", customerEmail);
    console.log("Customer Fax:", customerFax);
    console.log("Customer Contact:", customerContact);

    // กำหนดฟิลด์ตามประเภทสินค้า
    let additionalInfo = {};
    
    if (isFoodProduct) {
        // Food Product - ใช้ remarkInfo เท่านั้น
        additionalInfo = {
            remarkInfo: sourceData.remarkInfo || ""
        };
        console.log("=== Food Product Fields ===");
        console.log("Remark Info:", additionalInfo.remarkInfo);
    } else {
        // Mechanical Product - ใช้ครบทุกฟิลด์
        additionalInfo = {
            detailInfo: sourceData.detailInfo || "",
            shippingInfo: sourceData.shippingInfo || "",
            locationInfo: sourceData.locationInfo || ""
        };
        console.log("=== Mechanical Product Fields ===");
        console.log("Detail Info:", additionalInfo.detailInfo);
        console.log("Shipping Info:", additionalInfo.shippingInfo);
        console.log("Location Info:", additionalInfo.locationInfo);
    }

    // ฟิลด์ร่วม
      const projectInfo = sourceData.projectInfo || "";
      const paymentTerm = sourceData.paymentTerm || "";
      const validityInfo = sourceData.validityInfo || "";
      const deliveryInfo = sourceData.deliveryInfo || "";
      const additionalDetail = sourceData.additionalDetail || "";
      const includeVAT = sourceData.includeVAT || false; // เพิ่มบรรทัดนี้

    console.log("=== Extracted Common Information ===");
    console.log("Project Info:", projectInfo);
    console.log("Validity Info:", validityInfo);
    console.log("Delivery Info:", deliveryInfo);
    
    let products = [];
    
    if (sourceData.products && Array.isArray(sourceData.products)) {
      products = sourceData.products;
    } else if (sourceData.orderItems && Array.isArray(sourceData.orderItems)) {
      products = sourceData.orderItems.map(item => ({
        id: item.productCode || item.product_code || item.id || "",
        name: item.productName || item.product_name || item.name || "",
        price: parseFloat(item.price || item.unit_price || 0),
        quantity: parseInt(item.quantity || item.qty || 1),
        discount: parseFloat(item.discount || 0)
      }));
    } else if (sourceData.items && Array.isArray(sourceData.items)) {
      products = sourceData.items.map(item => ({
        id: item.productCode || item.product_code || item.id || "",
        name: item.productName || item.product_name || item.name || "",
        price: parseFloat(item.price || item.unit_price || 0),
        quantity: parseInt(item.quantity || item.qty || 1),
        discount: parseFloat(item.discount || 0)
      }));
    }

    const discount = sourceData.discount || 0;
    const note = sourceData.note || sourceData.remarks || "";

    const mappedResult = {
      salesNumber: salesNumber,
      customerName: customerName,
      customerId: customerId,
      customerType: customerType,
      
      // ข้อมูลที่อยู่ลูกค้า
      customerAddress: customerAddress,
      customerTel: customerTel,
      customerFax: customerFax,
      customerEmail: customerEmail,
      customerContact: customerContact,
      
      employeeName: employeeName,
      employeeTel: employeeTel,
      employeeEmail: employeeEmail,

      date: date,
      products: products,
      discount: discount,
      note: note,
      salePersonId: null,
      salePersonSignatureUrl: null,
      
      // ฟิลด์ร่วม
      projectInfo: projectInfo,
      validityInfo: validityInfo,
      deliveryInfo: deliveryInfo,
      paymentTerm: paymentTerm,
      additionalDetail: additionalDetail,
      
      // ฟิลด์ตามประเภทสินค้า (Food หรือ Mechanical)
      ...additionalInfo,
      
      // VAT flag (Food Product เท่านั้น)
      includeVAT: isFoodProduct ? includeVAT : false,
      
      // เพิ่มประเภทสินค้าเพื่อใช้ใน CreateOrder
      productType: isFoodProduct ? 'food' : 'mechanical'
    };

    console.log("=== Mapped Result Summary ===");
    console.log("Product Type:", mappedResult.productType);
    console.log("Employee Name to lookup:", mappedResult.employeeName);
    console.log("Products count:", mappedResult.products.length);
    console.log("Additional Info Keys:", Object.keys(additionalInfo));

    return mappedResult;

  } catch (error) {
    console.error("Error mapping data:", error.message);
    throw new Error("Failed to map request data: " + error.message);
  }
};

// ฟังก์ชันสร้าง Response ตามสถานการณ์
const generateResponse = (res, emailResult, orderResult, quotationNumber, attachedFilesCount) => {
  console.log("=== Generating Response ===");
  console.log("Email Result:", emailResult);
  console.log("Order Result:", orderResult);
  console.log("Quotation Number:", quotationNumber);
  console.log("Attached Files Count:", attachedFilesCount);

  // กรณี Email สำเร็จ และ Database สำเร็จ
  if (emailResult && emailResult.success && orderResult && orderResult.success) {
    return res.status(200).json({
      success: true,
      message: "Order created and email sent successfully",
      data: {
        emailSent: true,
        databaseSaved: true,
        quotationNumber: quotationNumber,
        orderId: orderResult.orderId,
        attachedFilesCount: attachedFilesCount
      },
      details: {
        email: emailResult,
        database: orderResult
      },
      timestamp: new Date().toISOString()
    });
  }

  // กรณี Email สำเร็จ แต่ Database ล้มเหลว
  if (emailResult && emailResult.success && (!orderResult || !orderResult.success)) {
    return res.status(207).json({ // Multi-Status
      success: false,
      message: "Email sent successfully but failed to save to database",
      data: {
        emailSent: true,
        databaseSaved: false,
        quotationNumber: quotationNumber,
        attachedFilesCount: attachedFilesCount
      },
      error: {
        type: "DATABASE_ERROR",
        message: orderResult ? orderResult.message : "Database operation failed"
      },
      details: {
        email: emailResult,
        database: orderResult
      },
      timestamp: new Date().toISOString()
    });
  }

  // กรณี Email ล้มเหลว
  return res.status(500).json({
    success: false,
    message: "Failed to send email notification",
    data: {
      emailSent: false,
      databaseSaved: false,
      quotationNumber: null,
      attachedFilesCount: attachedFilesCount
    },
    error: {
      type: "EMAIL_ERROR",
      message: emailResult ? emailResult.message : "Email service unavailable"
    },
    details: {
      email: emailResult,
      database: null
    },
    timestamp: new Date().toISOString()
  });
};

// Main Controller Functions

exports.CreateOrder = async (req, res) => {  
  try {
    console.log("=== CreateOrder API Called ===");
    
    // จัดการข้อมูลจาก FormData
    let requestData = {};
    let uploadedFiles = [];
    
    // ตรวจสอบว่าเป็น FormData หรือ JSON
    if (req.body.orderData) {
      // กรณี FormData - parse JSON string
      try {
        requestData = JSON.parse(req.body.orderData);
        console.log("Parsed FormData - orderData:", JSON.stringify(requestData, null, 2));
      } catch (parseError) {
        console.error("Error parsing orderData JSON:", parseError.message);
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format in orderData",
          error: { type: "PARSE_ERROR", message: parseError.message },
          timestamp: new Date().toISOString()
        });
      }
      
      // จัดการไฟล์ที่อัปโหลด
      if (req.files && req.files.length > 0) {
        uploadedFiles = req.files;
        console.log(`Found ${uploadedFiles.length} uploaded file(s):`);
        uploadedFiles.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.originalname} (${file.size} bytes)`);
        });
      } else {
        console.log("No files uploaded");
      }
      
    } else {
      // กรณี JSON ปกติ
      requestData = req.body;
      console.log("Regular JSON Request body:", JSON.stringify(requestData, null, 2));
    }

    // สร้างตัวแปรเก็บสถานะการทำงาน
    let emailResult = null;
    let orderResult = null;
    let quotationNumber = null;
    let salespersonData = null;

    const mappedData = await mapRequestDataToQuotationFormat(requestData, req);

    // หา signature URL และข้อมูลพนักงานก่อนส่ง Email (ครั้งเดียว)
    if (mappedData.employeeName && mappedData.employeeName.trim() !== '') {
      console.log("=== Looking up Salesperson data ===");
      console.log("Employee name to lookup:", mappedData.employeeName);
      
      const salespersonLookup = await OrderService.GetSalePersonByName(mappedData.employeeName);
      console.log("Salesperson lookup result:", salespersonLookup);
      
      if (salespersonLookup.success) {
       // เก็บข้อมูลพนักงานไว้ใช้ทั้ง Email และ Database
      salespersonData = {
          id: salespersonLookup.salePersonId,
          name: salespersonLookup.salePersonName,
          phone: salespersonLookup.salePersonPhone,
          email: salespersonLookup.salePersonEmail,
          signatureUrl: salespersonLookup.salePersonSignatureUrl,
          signatureBase64: salespersonLookup.salePersonSignatureBase64, // เพิ่ม
          signatureContentType: salespersonLookup.salePersonSignatureContentType // เพิ่ม
      };

      // เพิ่ม signature data ไปใน mappedData สำหรับ Email
      mappedData.salePersonSignatureUrl = salespersonData.signatureUrl; // fallback
      mappedData.salePersonSignatureBase64 = salespersonData.signatureBase64; // ใหม่
      mappedData.salePersonSignatureContentType = salespersonData.signatureContentType; // ใหม่
        
        console.log("SALESPERSON FOUND:");
        console.log("   ID:", salespersonData.id);
        console.log("   Name:", salespersonData.name);
        console.log("   Signature URL:", salespersonData.signatureUrl);
        console.log("   Signature URL added to mappedData for Email");
        
      } else {
        console.log("SALESPERSON NOT FOUND:");
        console.log("   Error:", salespersonLookup.message);
        console.log("   Available names:", salespersonLookup.availableNames);
        
        // ส่ง error กลับไปทันทีถ้าไม่เจอพนักงาน
        return res.status(400).json({
          success: false,
          message: salespersonLookup.message,
          data: {
            emailSent: false,
            databaseSaved: false,
            quotationNumber: null,
            attachedFilesCount: uploadedFiles.length
          },
          error: {
            type: "SALESPERSON_NOT_FOUND",
            details: salespersonLookup.message,
            availableNames: salespersonLookup.availableNames
          },
          timestamp: new Date().toISOString()
        });
      }
    } else {
      console.log("WARNING: No employee name provided from frontend");
      console.log("Proceeding without salesperson data");
    }
    
    // เพิ่มข้อมูลไฟล์แนบไปใน mappedData
    if (uploadedFiles.length > 0) {
      mappedData.attachedFiles = uploadedFiles.map(file => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer
      }));
    }
    
    console.log("Mapped data for SendOrder:", {
      customerName: mappedData.customerName,
      salesNumber: mappedData.salesNumber,
      employeeName: mappedData.employeeName,
      employeeEmail: mappedData.employeeEmail,
      salePersonSignatureUrl: mappedData.salePersonSignatureUrl,
      productCount: mappedData.products ? mappedData.products.length : 0,
      attachedFilesCount: uploadedFiles.length
    });

    // === ขั้นตอนที่ 1: ส่ง Email (ส่งไฟล์แนบไปด้วย) ===
    try {
      // ส่งข้อมูลและไฟล์แนบไปที่ EmailService (มี signature URL แล้ว)
      if (mappedData.productType === 'food') {
          console.log("=== Using EmailFoodService for Food Product ===");
          emailResult = await EmailFoodService.SendOrder(mappedData, null, uploadedFiles);
      } else {
          console.log("=== Using EmailService for Mechanical Product ===");
          emailResult = await EmailService.SendOrder(mappedData, null, uploadedFiles);
      }
      console.log("Email send result:", emailResult);
      
      if (emailResult.success && emailResult.quotationNo) {
        quotationNumber = emailResult.quotationNo;
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      emailResult = {
        success: false,
        message: emailError.message,
        provider: null
      };
    }

    // === ขั้นตอนที่ 2: บันทึก Database (ถ้า Email สำเร็จ) ===
    if (emailResult && emailResult.success) {
      try {
        // ใช้ข้อมูลพนักงานที่หาไว้แล้ว (ไม่ต้องหาซ้ำ)
        let validatedSalePersonId = null;
        let salespersonName = null;
        
        if (salespersonData) {
          validatedSalePersonId = salespersonData.id;
          salespersonName = salespersonData.name;
          
          console.log("=== Using Salesperson data from previous lookup ===");
          console.log("   ID:", validatedSalePersonId);
          console.log("   Name:", salespersonName);
          console.log("   Signature URL:", salespersonData.signatureUrl);
        } else {
          console.log("WARNING: No salesperson data available, setting to NULL");
        }

        // สร้าง Order object
        let Order = {
          SO_NUMBER: quotationNumber || await EmailService.generateQuotationNumber(),
          Document_Ref: quotationNumber || await EmailService.generateQuotationNumber(),
          SO_Date: new Date(requestData.date),
          Customer_Code: requestData.customerId || 'C999999',
          Payment_TermID: null,
          SO_SaleID: validatedSalePersonId,
          SO_Remark: requestData.note || '',
          CreateBy: validatedSalePersonId, 
          CreateDate: new Date(),
          SalespersonName: salespersonName, // เพิ่มชื่อเพื่อ verify
          New_Customer: requestData.customerType === 'ลูกค้าใหม่' ? requestData.customerName : null,
          orderItems: (requestData.products || []).map(product => {
            const price = parseFloat(product.price) || 0;
            const quantity = parseInt(product.quantity) || 1;
            const discount = parseFloat(product.discount) || 0;
            
            const subtotal = price * quantity;
            const discountAmount = subtotal * (discount / 100);
            
            return {
              I_ID: product.id,
              I_Qty: quantity,
              I_Price: price,
              I_Discount: discountAmount,
              CreateBy: validatedSalePersonId,
              CreateDate: new Date(),
              UpdateBy: null,
              UpdateDate: new Date()
            };
          })
        };

        // === คำนวณ VAT และ Total Amount ===
        let totalBeforeVat = 0;
        Order.orderItems.forEach(item => {
          const itemTotal = (item.I_Price * item.I_Qty) - item.I_Discount;
          totalBeforeVat += itemTotal;
        });

        const vatRate = 0.07; // 7% VAT rate
        const vatAmount = totalBeforeVat * vatRate;
        const totalAmount = totalBeforeVat + vatAmount;

        Order.SO_AmountBeforeVat = parseFloat(totalBeforeVat.toFixed(2));
        Order.SO_VAT = parseFloat(vatAmount.toFixed(2));
        Order.SO_TotalAmount = parseFloat(totalAmount.toFixed(2));

        console.log("=== Calculated Amounts ===");
        console.log("Amount Before VAT:", Order.SO_AmountBeforeVat);
        console.log("VAT Amount:", Order.SO_VAT);
        console.log("Total Amount:", Order.SO_TotalAmount);

        console.log("=== Final Order Object ===");
        console.log("SO_SaleID:", Order.SO_SaleID);
        console.log("SalespersonName:", Order.SalespersonName);
        console.log("CreateBy:", Order.CreateBy);
        console.log("Items count:", Order.orderItems.length);
        
        // Validation
        if (Order && Order.SO_NUMBER && Order.orderItems && Order.orderItems.length > 0) {
          console.log("Validation passed, calling OrderService.CreateOrder...");
          
          orderResult = await OrderService.CreateOrder(Order);
          console.log("OrderService result:", orderResult);
          
        } else {
          console.log("Order validation failed - missing required fields");
          orderResult = {
            success: false,
            message: "Invalid order data - missing SO_NUMBER or orderItems"
          };
        }

      } catch (orderError) {
        console.error("Database save failed:", orderError.message);
        orderResult = {
          success: false,
          message: orderError.message
        };
      }
    }

    // === ขั้นตอนที่ 3: Return Response ตามสถานการณ์ ===
    return generateResponse(res, emailResult, orderResult, quotationNumber, uploadedFiles.length);
    
  } catch (error) {
    console.error("Error in CreateOrder:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({ 
      success: false,
      message: "System error occurred", 
      data: {
        emailSent: false,
        databaseSaved: false,
        quotationNumber: null,
        attachedFilesCount: 0
      },
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// API สำหรับดึงข้อมูลสินค้า
exports.GetProducts = async (req, res) => {
  try {
    console.log("=== GetProducts API Called ===");
    console.log("Query parameters:", req.query);

    // Extract search and pagination parameters
    const searchTerm = req.query.search || '';
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    // Validate parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page number must be greater than 0",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid page parameter"
        },
        timestamp: new Date().toISOString()
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid limit parameter"
        },
        timestamp: new Date().toISOString()
      });
    }

    const options = {
      search: searchTerm,
      page: page,
      limit: limit
    };

    console.log("=== Calling OrderService.GetProducts ===");
    console.log("Options:", options);

    // Call service to get products
    const result = await OrderService.GetProducts(options);
    console.log("OrderService GetProducts result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Products retrieved:", result.data.products.length);
      console.log("Total records:", result.data.pagination.totalRecords);
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("GetProducts service failed:", result.message);
      
      return res.status(500).json({
        success: false,
        message: result.message,
        data: {
          products: [],
          pagination: {
            currentPage: 0,
            totalPages: 0,
            totalRecords: 0,
            recordsPerPage: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in GetProducts controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while retrieving products",
      data: {
        products: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalRecords: 0,
          recordsPerPage: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      },
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// API สำหรับดึงข้อมูลลูกค้า
exports.GetCustomers = async (req, res) => {
  try {
    console.log("=== GetCustomers API Called ===");
    console.log("Query parameters:", req.query);

    // Extract search and pagination parameters
    const searchTerm = req.query.search || '';
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    // Validate parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page number must be greater than 0",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid page parameter"
        },
        timestamp: new Date().toISOString()
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid limit parameter"
        },
        timestamp: new Date().toISOString()
      });
    }

    const options = {
      search: searchTerm,
      page: page,
      limit: limit
    };

    console.log("=== Calling OrderService.GetCustomers ===");
    console.log("Options:", options);

    // Call service to get customers
    const result = await OrderService.GetCustomers(options);
    console.log("OrderService GetCustomers result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Customers retrieved:", result.data.customers.length);
      console.log("Total records:", result.data.pagination.totalRecords);
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("GetCustomers service failed:", result.message);
      
      return res.status(500).json({
        success: false,
        message: result.message,
        data: {
          customers: [],
          pagination: {
            currentPage: 0,
            totalPages: 0,
            totalRecords: 0,
            recordsPerPage: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in GetCustomers controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while retrieving customers",
      data: {
        customers: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalRecords: 0,
          recordsPerPage: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      },
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// API สำหรับลบ Order
exports.DeleteOrder = async (req, res) => {
  try {
    console.log("=== DeleteOrder API Called ===");
    
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Missing required parameter: orderId"
        },
        timestamp: new Date().toISOString()
      });
    }

    console.log("Order ID to delete:", orderId);

    // Call service to delete order
    const result = await OrderService.DeleteOrder(orderId);
    console.log("OrderService DeleteOrder result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Order deleted successfully");
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          orderId: orderId,
          deletedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("DeleteOrder service failed:", result.message);
      
      return res.status(404).json({
        success: false,
        message: result.message,
        data: null,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in DeleteOrder controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while deleting order",
      data: null,
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

exports.UpdateSaleOrder = async (req, res) => {
  try {
    console.log("=== UpdateSaleOrder API Called ===");
    console.log("Route params:", req.params);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Extract order ID from URL params
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required in URL parameters",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Missing required parameter: orderId"
        },
        timestamp: new Date().toISOString()
      });
    }

    // Validate orderId is a number
    const numericOrderId = parseInt(orderId);
    if (isNaN(numericOrderId) || numericOrderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order ID must be a valid positive number",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: `Invalid orderId: ${orderId}`
        },
        timestamp: new Date().toISOString()
      });
    }

    // Extract and validate request body
    const updateData = req.body;
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required with update data",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Empty or missing request body"
        },
        timestamp: new Date().toISOString()
      });
    }

    // ✅ UPDATED: Prepare order data for service layer with New_Customer support and flexible amounts
    const orderData = {
      SO_ID: numericOrderId,
      Document_Ref: updateData.Document_Ref || updateData.documentRef,
      SO_Date: updateData.SO_Date || updateData.orderDate,
      Customer_Code: updateData.Customer_Code || updateData.customerCode,
      New_Customer: updateData.New_Customer || updateData.newCustomer,
      Payment_TermID: updateData.Payment_TermID || updateData.paymentTermId || null,
      SO_SaleID: updateData.SO_SaleID || updateData.salespersonId || null,
      SO_Remark: updateData.SO_Remark || updateData.remark || '',
      
      // ✅ แก้ไขให้รองรับหลายรูปแบบ (Database, camelCase, Object)
      SO_AmountBeforeVat: updateData.SO_AmountBeforeVat || updateData.amountBeforeVat || updateData.amounts?.beforeVat,
      SO_VAT: updateData.SO_VAT || updateData.vat || updateData.amounts?.vat,
      SO_TotalAmount: updateData.SO_TotalAmount || updateData.totalAmount || updateData.amounts?.total,
      
      UpdateBy: updateData.UpdateBy || updateData.updatedBy || null
    };

    console.log("=== Processed Order Data ===");
    console.log("SO_ID:", orderData.SO_ID);
    console.log("Document_Ref:", orderData.Document_Ref);
    console.log("Customer_Code:", orderData.Customer_Code);
    console.log("New_Customer:", orderData.New_Customer);
    console.log("SO_SaleID:", orderData.SO_SaleID);
    console.log("SO_TotalAmount:", orderData.SO_TotalAmount); // ✅ ตอนนี้จะมีค่าแล้ว

    // Enhanced customer validation
    const hasCustomerCode = orderData.Customer_Code && orderData.Customer_Code.trim() !== '';
    const hasNewCustomer = orderData.New_Customer && orderData.New_Customer.trim() !== '';
    
    console.log("=== Customer Data Validation ===");
    console.log("Has Customer Code:", hasCustomerCode);
    console.log("Has New Customer:", hasNewCustomer);
    
    // ตรวจสอบว่าต้องมีอย่างใดอย่างหนึ่ง
    if (!hasCustomerCode && !hasNewCustomer) {
      return res.status(400).json({
        success: false,
        message: "Either Customer Code or New Customer name is required",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Must provide either customerCode or newCustomer"
        },
        timestamp: new Date().toISOString()
      });
    }

    // Basic validation for required fields
    if (!orderData.SO_TotalAmount || isNaN(parseFloat(orderData.SO_TotalAmount))) {
      return res.status(400).json({
        success: false,
        message: "Total amount is required and must be a valid number",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid SO_TotalAmount"
        },
        timestamp: new Date().toISOString()
      });
    }

    // Validate amounts if provided
    if (orderData.SO_AmountBeforeVat && isNaN(parseFloat(orderData.SO_AmountBeforeVat))) {
      return res.status(400).json({
        success: false,
        message: "Amount before VAT must be a valid number",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid SO_AmountBeforeVat"
        },
        timestamp: new Date().toISOString()
      });
    }

    if (orderData.SO_VAT && isNaN(parseFloat(orderData.SO_VAT))) {
      return res.status(400).json({
        success: false,
        message: "VAT amount must be a valid number",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid SO_VAT"
        },
        timestamp: new Date().toISOString()
      });
    }

    console.log("=== Calling OrderService.UpdateSaleOrder ===");
    console.log("Sending order data to service...");

    // Call service to update sale order
    const result = await OrderService.UpdateSaleOrder(orderData);
    console.log("OrderService UpdateSaleOrder result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Sale Order updated successfully");
      console.log("Updated Order ID:", result.data.orderId);
      console.log("Updated Customer Code:", result.data.customerCode);
      console.log("Updated New Customer:", result.data.newCustomer);
      console.log("Updated Total Amount:", result.data.amounts.total);
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("UpdateSaleOrder service failed:", result.message);
      
      // Determine appropriate HTTP status code based on error type
      let statusCode = 500;
      if (result.error && result.error.type) {
        switch (result.error.type) {
          case 'VALIDATION_ERROR':
            statusCode = 400;
            break;
          case 'NOT_FOUND_ERROR':
            statusCode = 404;
            break;
          case 'SALESPERSON_NOT_FOUND':
            statusCode = 400;
            break;
          default:
            statusCode = 500;
        }
      }
      
      return res.status(statusCode).json({
        success: false,
        message: result.message,
        data: null,
        error: result.error || {
          type: "SERVICE_ERROR",
          message: result.message
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in UpdateSaleOrder controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while updating sale order",
      data: null,
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// API สำหรับอัพเดท Order Status
exports.UpdateOrderStatus = async (req, res) => {
  try {
    console.log("=== UpdateOrderStatus API Called ===");
    
    const { orderId } = req.params;
    const { status, remarks } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Missing required parameter: orderId"
        },
        timestamp: new Date().toISOString()
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Missing required field: status"
        },
        timestamp: new Date().toISOString()
      });
    }

    const updateData = {
      orderId: orderId,
      status: status,
      remarks: remarks || '',
      updatedBy: req.user?.id || 'system', // หากมี authentication
      updatedAt: new Date()
    };

    console.log("Update data:", updateData);

    // Call service to update order status
    const result = await OrderService.UpdateOrderStatus(updateData);
    console.log("OrderService UpdateOrderStatus result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Order status updated successfully");
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("UpdateOrderStatus service failed:", result.message);
      
      return res.status(404).json({
        success: false,
        message: result.message,
        data: null,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in UpdateOrderStatus controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while updating order status",
      data: null,
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// === ฟังก์ชัน GetAllOrders ===
exports.GetAllOrders = async (req, res) => {
  try {
    console.log("=== GetAllOrders API Called ===");
    console.log("Query parameters:", req.query);

    // Extract pagination parameters from query string
    const options = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 50
    };

    // Validate pagination parameters
    if (options.page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page number must be greater than 0",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid page parameter"
        },
        timestamp: new Date().toISOString()
      });
    }

    if (options.limit < 1 || options.limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
        data: null,
        error: {
          type: "VALIDATION_ERROR", 
          message: "Invalid limit parameter"
        },
        timestamp: new Date().toISOString()
      });
    }

    console.log("=== Calling OrderService.GetAllOrders ===");
    console.log("Options:", options);

    // Call service to get orders
    const result = await OrderService.GetAllOrders(options);
    console.log("OrderService result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Orders retrieved:", result.data.orders.length);
      console.log("Total records:", result.data.pagination.totalRecords);
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        summary: result.summary,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("GetAllOrders service failed:", result.message);
      
      return res.status(500).json({
        success: false,
        message: result.message,
        data: result.data,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in GetAllOrders controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while retrieving orders",
      data: {
        orders: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalRecords: 0,
          recordsPerPage: 0,
          hasNextPage: false,
          hasPrevPage: false,
          recordsOnPage: 0
        }
      },
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Additional function for testing
exports.SendQuotationEmail = async (req, res) => {
  try {
    console.log("=== SendQuotationEmail API Called ===");
    
    const result = await EmailService.SendOrder(req.body);
    
    return res.status(200).json({
      success: true,
      message: "Quotation email sent successfully",
      data: {
        quotationNumber: result.quotationNo,
        emailSent: result.success,
        pdfGenerated: !!result.filename,
        emailProvider: result.provider
      },
      details: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error sending quotation email:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send quotation email",
      data: {
        emailSent: false,
        pdfGenerated: false
      },
      error: {
        type: "EMAIL_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Function to get order status
exports.GetOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Missing required parameter: orderId"
        },
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status retrieved successfully",
      data: {
        orderId: orderId,
        status: "Processing"
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error getting order status:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error retrieving order status",
      data: null,
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }

};

exports.DebugSalesperson = async (req, res) => {
  try {
    console.log("=== DebugSalesperson API Called ===");
    
    const { salePersonId } = req.query;
    const result = await OrderService.DebugSalespersonData(salePersonId);
    
    return res.status(200).json({
      success: true,
      message: "Salesperson data retrieved successfully",
      data: result.data,
      count: result.count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error in DebugSalesperson:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error retrieving salesperson data",
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// API สำหรับดึงสถิติ Dashboard
exports.GetDashboardStats = async (req, res) => {
  try {
    console.log("=== GetDashboardStats API Called ===");

    // Call service to get dashboard statistics
    const result = await OrderService.GetDashboardStats();
    console.log("OrderService GetDashboardStats result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Dashboard stats retrieved successfully");
      console.log("Stats data:", JSON.stringify(result.data, null, 2));
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("GetDashboardStats service failed:", result.message);
      
      return res.status(500).json({
        success: false,
        message: result.message,
        data: null,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in GetDashboardStats controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while retrieving dashboard statistics",
      data: null,
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// API สำหรับดึงข้อมูลกราฟรายได้
exports.GetRevenueChart = async (req, res) => {
  try {
    console.log("=== GetRevenueChart API Called ===");
    console.log("Query parameters:", req.query);

    // Extract period parameter from query string
    const period = req.query.period || '7d';
    
    // Validate period parameter
    const validPeriods = ['7d', '30d', '90d'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period parameter. Valid values: 7d, 30d, 90d",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: `Invalid period: ${period}`
        },
        timestamp: new Date().toISOString()
      });
    }

    console.log("=== Calling OrderService.GetRevenueChart ===");
    console.log("Period:", period);

    // Call service to get revenue chart data
    const result = await OrderService.GetRevenueChart(period);
    console.log("OrderService GetRevenueChart result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Revenue chart data retrieved successfully");
      console.log("Chart data points:", result.data.chartData.length);
      console.log("Total revenue:", result.data.statistics.totalRevenue);
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("GetRevenueChart service failed:", result.message);
      
      return res.status(500).json({
        success: false,
        message: result.message,
        data: null,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in GetRevenueChart controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while retrieving revenue chart data",
      data: null,
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// API สำหรับดึงกิจกรรมล่าสุด
exports.GetRecentActivities = async (req, res) => {
  try {
    console.log("=== GetRecentActivities API Called ===");
    console.log("Query parameters:", req.query);

    // Extract limit parameter from query string
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    // Validate limit parameter
    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 50",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid limit parameter"
        },
        timestamp: new Date().toISOString()
      });
    }

    console.log("=== Calling OrderService.GetRecentActivities ===");
    console.log("Limit:", limit);

    // Call service to get recent activities
    const result = await OrderService.GetRecentActivities(limit);
    console.log("OrderService GetRecentActivities result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Recent activities retrieved successfully");
      console.log("Activities count:", result.data.activities.length);
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("GetRecentActivities service failed:", result.message);
      
      return res.status(500).json({
        success: false,
        message: result.message,
        data: null,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in GetRecentActivities controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while retrieving recent activities",
      data: {
        activities: [],
        totalCount: 0,
        lastUpdated: null
      },
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// API สำหรับดึงรายการ Sale Orders สำหรับ Admin Panel
exports.GetSaleOrdersList = async (req, res) => {
  try {
    console.log("=== GetSaleOrdersList API Called ===");
    console.log("Query parameters:", req.query);

    // Extract pagination parameters
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const search = req.query.search || '';

    // Validate parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page number must be greater than 0",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid page parameter"
        },
        timestamp: new Date().toISOString()
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid limit parameter"
        },
        timestamp: new Date().toISOString()
      });
    }

    const options = {
      page: page,
      limit: limit,
      search: search
    };

    console.log("=== Calling OrderService.GetSaleOrdersList ===");
    console.log("Options:", options);

    // Call service to get sale orders
    const result = await OrderService.GetSaleOrdersList(options);
    console.log("OrderService GetSaleOrdersList result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Sale orders retrieved:", result.data.orders.length);
      console.log("Total records:", result.data.pagination.totalRecords);
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("GetSaleOrdersList service failed:", result.message);
      
      return res.status(500).json({
        success: false,
        message: result.message,
        data: {
          orders: [],
          pagination: {
            currentPage: 0,
            totalPages: 0,
            totalRecords: 0,
            recordsPerPage: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in GetSaleOrdersList controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while retrieving sale orders",
      data: {
        orders: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalRecords: 0,
          recordsPerPage: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      },
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

exports.GetCreditTerms = async (req, res) => {
  try {
    console.log("=== GetCreditTerms API Called ===");

    // Call service to get credit terms
    const result = await OrderService.GetCreditTerms();
    console.log("OrderService GetCreditTerms result:", result.success ? "SUCCESS" : "FAILED");
    
    if (result.success) {
      console.log("Credit terms retrieved:", result.data.length, "records");
      
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.error("GetCreditTerms service failed:", result.message);
      
      return res.status(500).json({
        success: false,
        message: result.message,
        data: [],
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error in GetCreditTerms controller:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "System error occurred while retrieving credit terms",
      data: [],
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};