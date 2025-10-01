const config = require("../config/Mssql.config");
const sql = require("mssql");

async function Getlist_Customer() {
  try {

    // ดึงข้อมูลลูกค้าจากตาราง Customer จริง (กรองข้อมูลทดสอบที่ขึ้นต้น S ออก)
    const Query = `
      SELECT 
      [Cust_ID],
      [Cust_Code],
      [CustName],
      [Account_No],
      [CGroup_ID],
      [Is_Active],
      [Cust_Address],
      [Cust_Tel],
      [Cust_Fax],
      [Cust_Email],
      [Cust_Attn]
      FROM [Customer]
      WHERE [Is_Active] = 1
        AND [Cust_Code] NOT LIKE 'S%'
      ORDER BY [CustName] ASC
    `;

    let pool = await sql.connect(config.sql);
    const eventsList = await pool.request().query(Query);

    console.log("Customer query executed, found:", eventsList.recordset.length, "customers (excluding S test data)");
    
    return eventsList.recordset.length > 0 ? eventsList.recordset : [];
  } catch (error) {
    console.error("Error in database query:", error.message);
    throw error;
  }
}

async function Get_Customer(CustName) {
  try {
    if (!CustName) {
      return []; // Return empty array if CustName is empty
    }

    // ค้นหาลูกค้าจากตาราง Customer จริง (กรองข้อมูลทดสอบที่ขึ้นต้น S ออก)
    const Query = `
      SELECT 
      [Cust_ID],
      [Cust_Code],
      [CustName],
      [Account_No],
      [CGroup_ID],
      [Is_Active],
      [Cust_Address],
      [Cust_Tel],
      [Cust_Fax],
      [Cust_Email],
      [Cust_Attn]
      FROM [Customer]
      WHERE [CustName] LIKE @CustName
        AND [Is_Active] = 1
        AND [Cust_Code] NOT LIKE 'S%'
      ORDER BY [CustName] ASC
    `;

    console.log("Executing customer search query for:", CustName);

    let pool = await sql.connect(config.sql);
    const eventsList = await pool.request()
      .input("CustName", sql.NVarChar, `%${CustName}%`)
      .query(Query);

    console.log("Customer search result:", eventsList.recordset.length, "customers found");
    
    return eventsList.recordset.length > 0 ? eventsList.recordset : [];
  } catch (error) {
    console.error("Error in customer search query:", error.message);
    throw error;
  }
}

async function Create_NewCustomer(customerData) {
  try {
    // 🎯 เซ็ตเป็น C100001 ทุกคนเลย (Dummy Code สำหรับลูกค้าใหม่)
    const dummyCustomerCode = "C100001";
    
    console.log("Creating new customer with dummy code:", dummyCustomerCode);

    let pool = await sql.connect(config.sql);

    // ✅ ตรวจสอบเฉพาะชื่อลูกค้าซ้ำเท่านั้น (ไม่เช็ค Code)
    const checkDuplicateNameQuery = `
      SELECT [Cust_ID] 
      FROM [Customer] 
      WHERE [CustName] = @CustomerName
    `;

    const duplicateNameResult = await pool.request()
      .input("CustomerName", sql.NVarChar, customerData.customerName)
      .query(checkDuplicateNameQuery);

    if (duplicateNameResult.recordset.length > 0) {
      throw new Error(`Customer name "${customerData.customerName}" already exists in Customer table`);
    }

    // 🚀 บันทึกข้อมูลลูกค้าใหม่ด้วย Dummy Code (อนุญาต Code ซ้ำ)
    const insertQuery = `
      INSERT INTO [Customer] (
        [Cust_Code], 
        [CustName], 
        [Account_No], 
        [CGroup_ID], 
        [Is_Active]
      ) 
      VALUES (
        @CustomerCode, 
        @CustomerName, 
        NULL, 
        4, 
        1
      )
    `;

    const result = await pool.request()
      .input("CustomerCode", sql.NVarChar, dummyCustomerCode)
      .input("CustomerName", sql.NVarChar, customerData.customerName)
      .query(insertQuery);

    // ✅ ตรวจสอบว่าบันทึกสำเร็จหรือไม่
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      // ดึงข้อมูลลูกค้าที่เพิ่งสร้างมาคืน (อาจมีหลายคนที่ Code เดียวกัน)
      const getNewCustomerQuery = `
        SELECT TOP 1
          [Cust_ID],
          [Cust_Code],
          [CustName],
          [Account_No],
          [CGroup_ID],
          [Is_Active]
        FROM [Customer]
        WHERE [Cust_Code] = @CustomerCode 
          AND [CustName] = @CustomerName
        ORDER BY [Cust_ID] DESC
      `;

      const newCustomerResult = await pool.request()
        .input("CustomerCode", sql.NVarChar, dummyCustomerCode)
        .input("CustomerName", sql.NVarChar, customerData.customerName)
        .query(getNewCustomerQuery);

      console.log("New customer created successfully with dummy code (duplicate allowed):", dummyCustomerCode);
      
      return [{
        ...newCustomerResult.recordset[0],
        customerCode: dummyCustomerCode,
        success: true,
        message: `เพิ่มลูกค้าใหม่สำเร็จ (รหัสชั่วคราว: ${dummyCustomerCode})`
      }];
    } else {
      throw new Error('Failed to insert customer data');
    }

  } catch (error) {
    console.error("Error in create new customer:", error.message);
    throw error;
  }
}

async function GetNextCustomerCode() {
  try {
    // 🔧 แก้ไข: ดูเฉพาะลูกค้าใหม่ที่มีชื่อใน field New_Customer
    const Query = `
      SELECT TOP 1 [Customer_Code]
      FROM [Sale_Order] 
      WHERE [Customer_Code] LIKE 'C1%' 
        AND [Customer_Code] IS NOT NULL
        AND [New_Customer] IS NOT NULL
        AND LEN(LTRIM(RTRIM([New_Customer]))) > 0
      ORDER BY [Customer_Code] DESC
    `;

    let pool = await sql.connect(config.sql);
    const eventsList = await pool.request().query(Query);
    
    let nextCustomerCode = "C100001"; // รหัสเริ่มต้นสำหรับลูกค้าใหม่
    
    if (eventsList.recordset.length > 0) {
      const lastCode = eventsList.recordset[0].Customer_Code;
      // ตัดเอาตัวเลขท้าย เพิ่ม 1
      const lastNumber = parseInt(lastCode.substring(1)) + 1;
      nextCustomerCode = "C" + lastNumber.toString().padStart(6, '0');
    }

    console.log("Next Customer Code (New Customer only):", nextCustomerCode);

    return { nextCode: nextCustomerCode };

  } catch (error) {
    console.error("Error in get next customer code:", error.message);
    throw error;
  }
}

async function Update_Customer(customerData) {
  try {
    const { 
      Cust_ID, Cust_Code, CustName, Account_No, CGroup_ID, Is_Active,
      Cust_Address, Cust_Tel, Cust_Fax, Cust_Email, Cust_Attn 
    } = customerData;

    // ตรวจสอบว่าลูกค้าอยู่หรือไม่
    const checkQuery = `
      SELECT [Cust_ID] FROM [Customer] WHERE [Cust_ID] = @CustID
    `;

    let pool = await sql.connect(config.sql);
    
    const checkResult = await pool.request()
      .input("CustID", sql.Int, Cust_ID)
      .query(checkQuery);

    if (checkResult.recordset.length === 0) {
      throw new Error('Customer not found');
    }

    // อัปเดตข้อมูลลูกค้าในตาราง Customer
    const updateQuery = `
      UPDATE [Customer] 
        SET 
          [CustName] = @CustName,
          [Account_No] = @AccountNo,
          [CGroup_ID] = @CGroupID,
          [Is_Active] = @IsActive,
          [Cust_Address] = @CustAddress,
          [Cust_Tel] = @CustTel,
          [Cust_Fax] = @CustFax,
          [Cust_Email] = @CustEmail,
          [Cust_Attn] = @CustAttn
        WHERE [Cust_ID] = @CustID
    `;

    const result = await pool.request()
  .input("CustID", sql.Int, Cust_ID)
  .input("CustName", sql.NVarChar, CustName)
  .input("AccountNo", sql.NVarChar, Account_No)
  .input("CGroupID", sql.Int, CGroup_ID)
  .input("IsActive", sql.Bit, Is_Active)
  .input("CustAddress", sql.NVarChar, Cust_Address || null)
  .input("CustTel", sql.NVarChar, Cust_Tel || null)
  .input("CustFax", sql.NVarChar, Cust_Fax || null)
  .input("CustEmail", sql.NVarChar, Cust_Email || null)
  .input("CustAttn", sql.NVarChar, Cust_Attn || null)
  .query(updateQuery);

    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      // ดึงข้อมูลลูกค้าที่อัปเดตแล้ว
      const getUpdatedQuery = `
      SELECT 
        [Cust_ID],
        [Cust_Code],
        [CustName],
        [Account_No],
        [CGroup_ID],
        [Is_Active],
        [Cust_Address],
        [Cust_Tel],
        [Cust_Fax],
        [Cust_Email],
        [Cust_Attn]
      FROM [Customer]
      WHERE [Cust_ID] = @CustID
      `;

      const updatedResult = await pool.request()
        .input("CustID", sql.Int, Cust_ID)
        .query(getUpdatedQuery);

      console.log("Customer updated successfully:", Cust_Code);
      
      return updatedResult.recordset[0];
    } else {
      throw new Error('Failed to update customer data');
    }

  } catch (error) {
    console.error("Error in update customer:", error.message);
    throw error;
  }
}

async function MoveNewCustomerToCustomerTable(soId) {
  try {
    console.log("Starting move new customer to customer table for SO_ID:", soId);

    let pool = await sql.connect(config.sql);
    
    // 1. ดึงข้อมูลจาก Sale_Order ที่มี New_Customer
    const getSaleOrderQuery = `
      SELECT 
        [SO_ID],
        [Customer_Code],
        [New_Customer]
      FROM [Sale_Order]
      WHERE [SO_ID] = @SoId
        AND [New_Customer] IS NOT NULL
        AND LEN(LTRIM(RTRIM([New_Customer]))) > 0
    `;

    const saleOrderResult = await pool.request()
      .input("SoId", sql.Int, soId)
      .query(getSaleOrderQuery);

    if (saleOrderResult.recordset.length === 0) {
      throw new Error('Sale Order not found or New_Customer is empty');
    }

    const saleOrderData = saleOrderResult.recordset[0];
    const newCustomerName = saleOrderData.New_Customer.trim();
    
    // 🎯 ใช้ C100001 เสมอ (อนุญาตให้ซ้ำ)
    const customerCode = "C100001";

    console.log("Found Sale Order data:", {
      customerCode: customerCode,
      newCustomerName: newCustomerName
    });

    // 2. ✅ ตรวจสอบเฉพาะชื่อลูกค้าซ้ำ (ไม่เช็ค Code)
    const checkDuplicateNameQuery = `
      SELECT [Cust_ID] 
      FROM [Customer] 
      WHERE [CustName] = @CustomerName
    `;

    const duplicateNameResult = await pool.request()
      .input("CustomerName", sql.NVarChar, newCustomerName)
      .query(checkDuplicateNameQuery);

    if (duplicateNameResult.recordset.length > 0) {
      throw new Error(`Customer name "${newCustomerName}" already exists in Customer table`);
    }

    // 3. 🚀 Insert ข้อมูลลงตาราง Customer ด้วย C100001 (อนุญาต Code ซ้ำ)
    const insertCustomerQuery = `
      INSERT INTO [Customer] (
        [Cust_Code], 
        [CustName], 
        [Account_No], 
        [CGroup_ID], 
        [Is_Active]
      ) 
      VALUES (
        @CustomerCode, 
        @CustomerName, 
        NULL, 
        4, 
        1
      )
    `;

    const insertResult = await pool.request()
      .input("CustomerCode", sql.NVarChar, customerCode)
      .input("CustomerName", sql.NVarChar, newCustomerName)
      .query(insertCustomerQuery);

    if (!insertResult.rowsAffected || insertResult.rowsAffected[0] === 0) {
      throw new Error('Failed to insert customer data');
    }

    console.log("Customer inserted successfully with C100001 (duplicate allowed):", customerCode);

    // 4. ✅ Update Sale_Order เซ็ต New_Customer เป็น NULL (คง Customer_Code เดิม)
    const updateSaleOrderQuery = `
      UPDATE [Sale_Order] 
      SET [New_Customer] = NULL,
          [UpdateDate] = GETDATE()
      WHERE [SO_ID] = @SoId
    `;

    const updateResult = await pool.request()
      .input("SoId", sql.Int, soId)
      .query(updateSaleOrderQuery);

    if (!updateResult.rowsAffected || updateResult.rowsAffected[0] === 0) {
      throw new Error('Failed to update Sale_Order');
    }

    console.log("Sale_Order updated successfully, New_Customer set to NULL");

    // 5. ดึงข้อมูลลูกค้าที่เพิ่งสร้างมาคืน
    const getNewCustomerQuery = `
      SELECT TOP 1
        [Cust_ID],
        [Cust_Code],
        [CustName],
        [Account_No],
        [CGroup_ID],
        [Is_Active]
      FROM [Customer]
      WHERE [Cust_Code] = @CustomerCode 
        AND [CustName] = @CustomerName
      ORDER BY [Cust_ID] DESC
    `;

    const newCustomerResult = await pool.request()
      .input("CustomerCode", sql.NVarChar, customerCode)
      .input("CustomerName", sql.NVarChar, newCustomerName)
      .query(getNewCustomerQuery);

    const result = {
      success: true,
      message: `ย้ายลูกค้า "${newCustomerName}" เป็นลูกค้าเก่าสำเร็จ (รหัส: ${customerCode})`,
      data: {
        customer: newCustomerResult.recordset[0],
        originalSoId: soId,
        customerCode: customerCode,
        customerName: newCustomerName
      }
    };

    console.log("Move new customer completed successfully:", result);
    
    return result;

  } catch (error) {
    console.error("Error in move new customer to customer table:", error.message);
    throw error;
  }
}

// ✅ แก้ไขฟังก์ชันนี้ใน customer.service.js
async function Import_Customers(customers) {
  try {
    console.log("=== Import_Customers Service Called ===");
    console.log(`Importing ${customers.length} customers`);

    let pool = await sql.connect(config.sql);
    
    // ✅ กรองเฉพาะลูกค้าที่ไม่ใช่ C100001 ไปตรวจสอบ Duplicate
    const customersToCheck = customers.filter(customer => customer.Cust_Code !== 'C100001');
    const c100001Customers = customers.filter(customer => customer.Cust_Code === 'C100001');
    
    console.log(`C100001 customers (allow duplicates): ${c100001Customers.length}`);
    console.log(`Other customers to check duplicates: ${customersToCheck.length}`);
    
    // ✅ ตรวจสอบ Duplicate เฉพาะรหัสที่ไม่ใช่ C100001
    if (customersToCheck.length > 0) {
      const existingCodesQuery = `
        SELECT [Cust_Code] 
        FROM [Customer] 
        WHERE [Cust_Code] IN (${customersToCheck.map((_, i) => `@Code${i}`).join(', ')})
      `;

      const checkRequest = pool.request();
      customersToCheck.forEach((customer, index) => {
        checkRequest.input(`Code${index}`, sql.NVarChar, customer.Cust_Code);
      });

      const existingCodes = await checkRequest.query(existingCodesQuery);
      
      if (existingCodes.recordset.length > 0) {
        const duplicateCodes = existingCodes.recordset.map(r => r.Cust_Code);
        throw new Error(`พบรหัสลูกค้าซ้ำในระบบ (ยกเว้น C100001): ${duplicateCodes.join(', ')}`);
      }
    }

    // ✅ ตรวจสอบชื่อลูกค้าซ้ำ (ทุกคน รวม C100001)
    const existingNamesQuery = `
      SELECT [CustName] 
      FROM [Customer] 
      WHERE [CustName] IN (${customers.map((_, i) => `@Name${i}`).join(', ')})
    `;

    const checkNameRequest = pool.request();
    customers.forEach((customer, index) => {
      checkNameRequest.input(`Name${index}`, sql.NVarChar, customer.CustName);
    });

    const existingNames = await checkNameRequest.query(existingNamesQuery);
    
    if (existingNames.recordset.length > 0) {
      const duplicateNames = existingNames.recordset.map(r => r.CustName);
      throw new Error(`พบชื่อลูกค้าซ้ำในระบบ: ${duplicateNames.join(', ')}`);
    }

    console.log("Validation passed, proceeding with bulk insert...");

    // ✅ Insert ข้อมูลทั้งหมด (รวม C100001 ที่ซ้ำได้)
    const insertPromises = customers.map((customer, index) => {
      const insertQuery = `
        INSERT INTO [Customer] (
          [Cust_Code], 
          [CustName], 
          [Account_No], 
          [CGroup_ID], 
          [Is_Active]
        ) 
        VALUES (
          @Cust_Code, 
          @CustName, 
          @Account_No, 
          @CGroup_ID, 
          @Is_Active
        )
      `;

      const request = pool.request();
      request.input('Cust_Code', sql.NVarChar, customer.Cust_Code);
      request.input('CustName', sql.NVarChar, customer.CustName);
      request.input('Account_No', sql.NVarChar, customer.Account_No || null);
      request.input('CGroup_ID', sql.Int, customer.CGroup_ID || 1);
      request.input('Is_Active', sql.Int, customer.Is_Active || 1);

      return request.query(insertQuery);
    });

    // รอให้ insert ทั้งหมดเสร็จ
    const insertResults = await Promise.all(insertPromises);
    
    console.log(`Successfully imported ${customers.length} customers`);

    // ตรวจสอบผลลัพธ์
    const totalInserted = insertResults.reduce((total, result) => {
      return total + (result.rowsAffected ? result.rowsAffected[0] : 0);
    }, 0);

    if (totalInserted !== customers.length) {
      console.warn(`Warning: Expected ${customers.length} inserts, but got ${totalInserted}`);
    }

    // ✅ แสดงข้อมูลการ Import
    const summary = {
      imported: totalInserted,
      total: customers.length,
      c100001Count: c100001Customers.length,
      otherCodesCount: customersToCheck.length,
      success: true,
      message: `Import สำเร็จ ${totalInserted} รายการ (C100001: ${c100001Customers.length} รายการ, รหัสอื่น: ${customersToCheck.length} รายการ)`
    };

    console.log("Import summary:", summary);
    return summary;

  } catch (error) {
    console.error("Import failed:", error);
    
    // จัดการ SQL Error Types
    if (error.message.includes('duplicate') || 
        error.message.includes('UNIQUE') || 
        error.message.includes('PRIMARY KEY')) {
      throw new Error('พบข้อมูลซ้ำในระบบ (ตรวจสอบรหัสลูกค้าหรือชื่อลูกค้า)');
    } else if (error.message.includes('FOREIGN KEY')) {
      throw new Error('ข้อมูล CGroup_ID ไม่ถูกต้อง');
    } else if (error.message.includes('CHECK constraint')) {
      throw new Error('ข้อมูล Is_Active ต้องเป็น 0 หรือ 1');
    }
    
    throw error;
  }
}

// เพิ่มหลังจาก function Import_Customers และก่อน module.exports

// ฟังก์ชันดึงข้อมูลที่อยู่ลูกค้า
async function GetCustomerAddress(custId) {
  try {
    console.log("Getting customer address for Cust_ID:", custId);

    const Query = `
      SELECT 
        [Cust_ID],
        [Cust_Code],
        [CustName],
        [Cust_Address],
        [Cust_Tel],
        [Cust_Fax],
        [Cust_Email],
        [Cust_Attn]
      FROM [Customer]
      WHERE [Cust_ID] = @CustId
        AND [Is_Active] = 1
    `;

    let pool = await sql.connect(config.sql);
    const result = await pool.request()
      .input("CustId", sql.Int, custId)
      .query(Query);

    if (result.recordset.length === 0) {
      throw new Error('Customer not found');
    }

    const customerData = result.recordset[0];

    // ตรวจสอบว่าฟิลด์ที่อยู่เป็น NULL หรือ empty
    const addressFields = {
      Cust_Address: customerData.Cust_Address,
      Cust_Tel: customerData.Cust_Tel,
      Cust_Fax: customerData.Cust_Fax,
      Cust_Email: customerData.Cust_Email,
      Cust_Attn: customerData.Cust_Attn
    };

    // เช็คว่าทุกฟิลด์เป็น NULL หรือ empty
    const hasAnyData = Object.values(addressFields).some(value => 
      value !== null && value !== undefined && value.toString().trim() !== ''
    );

    return {
      customerInfo: {
        Cust_ID: customerData.Cust_ID,
        Cust_Code: customerData.Cust_Code,
        CustName: customerData.CustName
      },
      addressData: addressFields,
      hasData: hasAnyData
    };

  } catch (error) {
    console.error("Error in GetCustomerAddress:", error.message);
    throw error;
  }
}

// ฟังก์ชันอัพเดทข้อมูลที่อยู่ลูกค้า
async function UpdateCustomerAddress(custId, addressData) {
  try {
    console.log("Updating customer address for Cust_ID:", custId);

    // ตรวจสอบว่าลูกค้าอยู่หรือไม่
    const checkQuery = `
      SELECT [Cust_ID], [Cust_Code], [CustName] 
      FROM [Customer] 
      WHERE [Cust_ID] = @CustId AND [Is_Active] = 1
    `;

    let pool = await sql.connect(config.sql);
    const checkResult = await pool.request()
      .input("CustId", sql.Int, custId)
      .query(checkQuery);

    if (checkResult.recordset.length === 0) {
      throw new Error('Customer not found or inactive');
    }

    const customerInfo = checkResult.recordset[0];

    // อัพเดทข้อมูลที่อยู่
    const updateQuery = `
      UPDATE [Customer] 
      SET 
        [Cust_Address] = @CustAddress,
        [Cust_Tel] = @CustTel,
        [Cust_Fax] = @CustFax,
        [Cust_Email] = @CustEmail,
        [Cust_Attn] = @CustAttn
      WHERE [Cust_ID] = @CustId
    `;

    const updateResult = await pool.request()
      .input("CustId", sql.Int, custId)
      .input("CustAddress", sql.NVarChar, addressData.Cust_Address || null)
      .input("CustTel", sql.NVarChar, addressData.Cust_Tel || null)
      .input("CustFax", sql.NVarChar, addressData.Cust_Fax || null)
      .input("CustEmail", sql.NVarChar, addressData.Cust_Email || null)
      .input("CustAttn", sql.NVarChar, addressData.Cust_Attn || null)
      .query(updateQuery);

    if (!updateResult.rowsAffected || updateResult.rowsAffected[0] === 0) {
      throw new Error('Failed to update customer address');
    }

    console.log("Customer address updated successfully for:", customerInfo.Cust_Code);

    return {
      success: true,
      message: `อัพเดทข้อมูลที่อยู่ของ ${customerInfo.CustName} สำเร็จ`,
      data: { customerInfo, addressData }
    };

  } catch (error) {
    console.error("Error in UpdateCustomerAddress:", error.message);
    throw error;
  }
}

// เพิ่มฟังก์ชันนี้ในไฟล์ customer.service.js ก่อน module.exports

async function GetCustomerAddressTemplate() {
  try {
    console.log("Generating customer address template...");

    const Query = `
      SELECT 
        [Cust_Code],
        [CustName],
        [Cust_Address],
        [Cust_Tel],
        [Cust_Fax],
        [Cust_Email],
        [Cust_Attn]
      FROM [Customer]
      WHERE [Is_Active] = 1
        AND [Cust_Code] NOT LIKE 'S%'
      ORDER BY [CustName] ASC
    `;

    let pool = await sql.connect(config.sql);
    const result = await pool.request().query(Query);

    console.log("Address template generated with", result.recordset.length, "customers");
    
    return result.recordset;

  } catch (error) {
    console.error("Error generating address template:", error.message);
    throw error;
  }
}

async function BulkUpdateCustomerAddress(addressUpdates) {
  try {
    console.log("=== Bulk Update Customer Address Called ===");
    console.log(`Updating address for ${addressUpdates.length} customers`);

    let pool = await sql.connect(config.sql);
    
    // เก็บผลลัพธ์การอัพเดต
    const updateResults = [];
    let successCount = 0;
    let failedCount = 0;

    // อัพเดททีละรายการ
    for (let i = 0; i < addressUpdates.length; i++) {
      const { Cust_Code, ...addressData } = addressUpdates[i];
      
      try {
        console.log(`Processing ${i + 1}/${addressUpdates.length}: ${Cust_Code}`);

        // 1. หา Cust_ID จาก Cust_Code
        const findCustomerQuery = `
          SELECT [Cust_ID], [CustName] 
          FROM [Customer] 
          WHERE [Cust_Code] = @CustCode 
            AND [Is_Active] = 1
        `;

        const customerResult = await pool.request()
          .input("CustCode", sql.NVarChar, Cust_Code)
          .query(findCustomerQuery);

        if (customerResult.recordset.length === 0) {
          // Customer not found - Skip
          updateResults.push({
            Cust_Code,
            success: false,
            error: `ไม่พบลูกค้ารหัส ${Cust_Code} ในระบบ`
          });
          failedCount++;
          console.log(`Customer ${Cust_Code} not found - skipping`);
          continue;
        }

        const customer = customerResult.recordset[0];
        const custId = customer.Cust_ID;

        // 2. อัพเดทข้อมูลที่อยู่
        const updateQuery = `
          UPDATE [Customer] 
          SET 
            [Cust_Address] = @CustAddress,
            [Cust_Tel] = @CustTel,
            [Cust_Fax] = @CustFax,
            [Cust_Email] = @CustEmail,
            [Cust_Attn] = @CustAttn
          WHERE [Cust_ID] = @CustId
        `;

        const updateResult = await pool.request()
          .input("CustId", sql.Int, custId)
          .input("CustAddress", sql.NVarChar, addressData.Cust_Address || null)
          .input("CustTel", sql.NVarChar, addressData.Cust_Tel || null)
          .input("CustFax", sql.NVarChar, addressData.Cust_Fax || null)
          .input("CustEmail", sql.NVarChar, addressData.Cust_Email || null)
          .input("CustAttn", sql.NVarChar, addressData.Cust_Attn || null)
          .query(updateQuery);

        if (updateResult.rowsAffected && updateResult.rowsAffected[0] > 0) {
          // Success
          updateResults.push({
            Cust_Code,
            CustName: customer.CustName,
            success: true,
            message: 'อัพเดทสำเร็จ'
          });
          successCount++;
          console.log(`Successfully updated ${Cust_Code}`);
        } else {
          // Failed to update
          updateResults.push({
            Cust_Code,
            success: false,
            error: 'ไม่สามารถอัพเดทข้อมูลได้'
          });
          failedCount++;
          console.log(`Failed to update ${Cust_Code}`);
        }

      } catch (error) {
        // Error processing individual record
        updateResults.push({
          Cust_Code,
          success: false,
          error: `ข้อผิดพลาด: ${error.message}`
        });
        failedCount++;
        console.error(`Error processing ${Cust_Code}:`, error.message);
      }
    }

    // สรุปผลลัพธ์
    const summary = {
      total: addressUpdates.length,
      success: successCount,
      failed: failedCount,
      successRate: ((successCount / addressUpdates.length) * 100).toFixed(1),
      results: updateResults,
      message: `อัพเดทที่อยู่เสร็จสิ้น: สำเร็จ ${successCount} รายการ, ล้มเหลว ${failedCount} รายการ`
    };

    console.log("Bulk address update completed:", summary);
    return summary;

  } catch (error) {
    console.error("Bulk update address failed:", error);
    throw error;
  }
}

// อัพเดต module.exports เพิ่มฟังก์ชันใหม่
module.exports = {
  Getlist_Customer,
  Get_Customer,
  Create_NewCustomer,
  GetNextCustomerCode,
  Update_Customer,
  MoveNewCustomerToCustomerTable,
  Import_Customers,
  GetCustomerAddress,        
  UpdateCustomerAddress,
  GetCustomerAddressTemplate,
  BulkUpdateCustomerAddress
};