const config = require("../config/Mssql.config");
const sql = require("mssql");

// ฟังก์ชันค้นหาพนักงานจากชื่อ
async function GetSalePersonByName(salespersonName) {
    console.log("=== GetSalePersonByName Called ===");
    console.log("Looking for salesperson:", salespersonName);
    
    if (!salespersonName || salespersonName.trim() === '') {
        console.log("ERROR: Empty salesperson name provided");
        return {
            success: false,
            message: "ไม่ได้ระบุชื่อพนักงาน",
            salePersonId: null,
            salePersonName: null
        };
    }
    
    const pool = await sql.connect(config.sql);
    
    try {
        // ค้นหาแบบ exact match ก่อน (เฉพาะ active users)
        console.log("=== Searching for exact match ===");
        let query = `SELECT SalePerson_ID, SalePersonName, Sale_Phone, Sale_Email, Sale_Signature_URL, Sale_Signature_Image, Sale_Signature_ContentType FROM SalePerson WHERE SalePersonName = @Name AND IsActive = 1`;
        let request = new sql.Request(pool);
        request.input('Name', sql.NVarChar, salespersonName.trim());
        
        let result = await request.query(query);
        console.log("Exact match results:", result.recordset.length);
        
        // ถ้าไม่เจอ ลองค้นหาแบบ LIKE (เฉพาะ active users)
        if (result.recordset.length === 0) {
            console.log("=== Searching with LIKE pattern ===");
            query = `SELECT SalePerson_ID, SalePersonName, Sale_Phone, Sale_Email, Sale_Signature_URL, Sale_Signature_Image, Sale_Signature_ContentType FROM SalePerson WHERE SalePersonName LIKE @Pattern AND IsActive = 1`;
            request = new sql.Request(pool);
            request.input('Pattern', sql.NVarChar, `%${salespersonName.trim()}%`);
            
            result = await request.query(query);
            console.log("LIKE pattern results:", result.recordset.length);
        }
        
        if (result.recordset.length > 0) {
            const foundPerson = result.recordset[0];
            console.log("=== SALESPERSON FOUND ===");
            console.log("ID:", foundPerson.SalePerson_ID);
            console.log("Name:", foundPerson.SalePersonName);
            console.log("Phone:", foundPerson.Sale_Phone);
            
            // แปลง binary เป็น base64
            let signatureBase64 = null;
            if (foundPerson.Sale_Signature_Image) {
                signatureBase64 = foundPerson.Sale_Signature_Image.toString('base64');
            }
            
            return {
                success: true,
                salePersonId: foundPerson.SalePerson_ID,
                salePersonName: foundPerson.SalePersonName,
                salePersonPhone: foundPerson.Sale_Phone,
                salePersonEmail: foundPerson.Sale_Email,
                salePersonSignatureUrl: foundPerson.Sale_Signature_URL, // fallback
                salePersonSignatureBase64: signatureBase64, // ใหม่
                salePersonSignatureContentType: foundPerson.Sale_Signature_ContentType,
                message: `พบพนักงาน: ${foundPerson.SalePersonName}`
            };

        } else {
            console.log("=== SALESPERSON NOT FOUND ===");
            console.log("Searched name:", salespersonName);
            
            // แสดงรายชื่อพนักงาน active เท่านั้น
            const allQuery = `SELECT SalePerson_ID, SalePersonName FROM SalePerson WHERE IsActive = 1 ORDER BY SalePerson_ID`;
            const allRequest = new sql.Request(pool);
            const allResult = await allRequest.query(allQuery);
            
            console.log("=== Available Active Salespersons ===");
            allResult.recordset.forEach((person, index) => {
                console.log(`${index + 1}. ID: ${person.SalePerson_ID} | Name: "${person.SalePersonName}"`);
            });
            
            return {
                success: false,
                message: `ไม่พบพนักงานชื่อ "${salespersonName}" ในระบบ`,
                salePersonId: null,
                salePersonName: null,
                availableNames: allResult.recordset.map(p => p.SalePersonName)
            };
        }
        
    } catch (error) {
        console.log("ERROR in GetSalePersonByName:", error.message);
        return {
            success: false,
            message: `เกิดข้อผิดพลาดในการค้นหาพนักงาน: ${error.message}`,
            salePersonId: null,
            salePersonName: null
        };
    } finally {
        pool.close();
    }
}

async function CreateOrder(OrderData) {
    console.log("=== CreateOrder Service Called ===");
    console.log("OrderData received:", JSON.stringify(OrderData, null, 2));
    
    // Database connection
    const pool = await sql.connect(config.sql);
    const transaction = new sql.Transaction(pool);

    try {
        // Enhanced data validation
        console.log("=== Starting Enhanced Validation ===");
        console.log("SO_NUMBER:", OrderData.SO_NUMBER);
        console.log("SO_SaleID:", OrderData.SO_SaleID);
        console.log("Salesperson Name (if sent):", OrderData.SalespersonName);
        console.log("orderItems count:", OrderData.orderItems ? OrderData.orderItems.length : 0);
        console.log("SO_AmountBeforeVat:", OrderData.SO_AmountBeforeVat);
        console.log("SO_VAT:", OrderData.SO_VAT);
        console.log("SO_TotalAmount:", OrderData.SO_TotalAmount);
        
        // Basic validation
        if (!OrderData || !OrderData.SO_NUMBER || !OrderData.orderItems || !Array.isArray(OrderData.orderItems)) {
            console.log("VALIDATION FAILED: Basic validation failed!");
            throw new Error('Invalid Order data - missing SO_NUMBER or orderItems');
        }

        // VAT and Amount validation
        if (OrderData.SO_AmountBeforeVat === undefined || OrderData.SO_VAT === undefined || OrderData.SO_TotalAmount === undefined) {
            console.log("VALIDATION FAILED: VAT/Amount validation failed!");
            throw new Error('Invalid Order data - missing calculated amounts (VAT/Total)');
        }

        if (OrderData.orderItems.length === 0) {
            console.log("VALIDATION FAILED: Empty orderItems!");
            throw new Error('Order must contain at least one item');
        }

        // **NEW: Salesperson Validation**
        let validatedSaleID = null;
        if (OrderData.SO_SaleID) {
            console.log("=== Salesperson Validation ===");
            const salespersonQuery = `SELECT SalePerson_ID, SalePersonName FROM SalePerson WHERE SalePerson_ID = @SalePerson_ID`;
            const salespersonRequest = new sql.Request(pool);
            salespersonRequest.input('SalePerson_ID', sql.Int, OrderData.SO_SaleID);
            
            const salespersonResult = await salespersonRequest.query(salespersonQuery);
            
            if (salespersonResult.recordset.length === 0) {
                console.log(`SALESPERSON VALIDATION FAILED: SalePerson_ID ${OrderData.SO_SaleID} not found!`);
                throw new Error(`Salesperson with ID ${OrderData.SO_SaleID} not found in database`);
            }
            
            validatedSaleID = salespersonResult.recordset[0].SalePerson_ID;
            const foundSalespersonName = salespersonResult.recordset[0].SalePersonName;
            
            console.log(`SALESPERSON VALIDATION SUCCESS:`);
            console.log(`   Database SalePerson_ID: ${validatedSaleID}`);
            console.log(`   Database SalePersonName: ${foundSalespersonName}`);
            console.log(`   Frontend sent SaleID: ${OrderData.SO_SaleID}`);
            console.log(`   Frontend sent Name: ${OrderData.SalespersonName || 'Not provided'}`);
            
            // Warning if names don't match
            if (OrderData.SalespersonName && OrderData.SalespersonName !== foundSalespersonName) {
                console.log(`⚠️  WARNING: Frontend name "${OrderData.SalespersonName}" doesn't match database name "${foundSalespersonName}"`);
            }
        } else {
            console.log("SALESPERSON INFO: No SO_SaleID provided, will be set to NULL");
        }

        console.log("VALIDATION SUCCESS: Enhanced validation passed - starting transaction...");
        await transaction.begin();

        // Insert Sale_Order header with enhanced logging
        console.log("=== Preparing Order Insert ===");
        const orderQuery = `INSERT INTO Sale_Order 
        (SO_NUMBER, Document_Ref, SO_Date, Customer_Code, Payment_TermID, SO_SaleID, SO_Remark, SO_AmountBeforeVat, SO_VAT, SO_TotalAmount, CreateBy, CreateDate, UpdateBy, UpdateDate, New_Customer)
        OUTPUT INSERTED.SO_ID
        VALUES (@SO_NUMBER, @Document_Ref, @SO_Date, @Customer_Code, @Payment_TermID, @SO_SaleID, @SO_Remark, @SO_AmountBeforeVat, @SO_VAT, @SO_TotalAmount, @CreateBy, @CreateDate, @UpdateBy, @UpdateDate, @New_Customer)`;
        
        const orderRequest = new sql.Request(transaction);
        
        // Input parameters with null handling
        orderRequest.input('SO_NUMBER', sql.VarChar(50), OrderData.SO_NUMBER);
        orderRequest.input('Document_Ref', sql.VarChar(100), OrderData.Document_Ref || OrderData.SO_NUMBER);
        orderRequest.input('SO_Date', sql.DateTime, OrderData.SO_Date || new Date());
        orderRequest.input('Customer_Code', sql.VarChar(50), OrderData.Customer_Code || 'C999999');
        orderRequest.input('Payment_TermID', sql.Int, OrderData.Payment_TermID || null);
        
        // **ENHANCED: Use validated SaleID**
        orderRequest.input('SO_SaleID', sql.Int, validatedSaleID);
        console.log(`SALESPERSON INSERT: Using validated SO_SaleID = ${validatedSaleID}`);
        
        orderRequest.input('SO_Remark', sql.VarChar(sql.MAX), OrderData.SO_Remark || '');
        
        // Enhanced VAT and Amount handling
        orderRequest.input('SO_AmountBeforeVat', sql.Decimal(18, 2), parseFloat(OrderData.SO_AmountBeforeVat) || 0);
        orderRequest.input('SO_VAT', sql.Decimal(18, 2), parseFloat(OrderData.SO_VAT) || 0);
        orderRequest.input('SO_TotalAmount', sql.Decimal(18, 2), parseFloat(OrderData.SO_TotalAmount) || 0);
        
        orderRequest.input('CreateBy', sql.Int, OrderData.CreateBy || null);
        orderRequest.input('CreateDate', sql.DateTime, OrderData.CreateDate || new Date());
        orderRequest.input('UpdateBy', sql.Int, OrderData.UpdateBy || null);
        orderRequest.input('UpdateDate', sql.DateTime, OrderData.UpdateDate || null);
        orderRequest.input('New_Customer', sql.NVarChar(100), OrderData.New_Customer || null);

        console.log("=== Order Insert Parameters ===");
        console.log("SO_SaleID:", validatedSaleID);
        console.log("SO_AmountBeforeVat:", parseFloat(OrderData.SO_AmountBeforeVat) || 0);
        console.log("SO_VAT:", parseFloat(OrderData.SO_VAT) || 0);
        console.log("SO_TotalAmount:", parseFloat(OrderData.SO_TotalAmount) || 0);

        console.log("Executing order insert...");
        const orderResult = await orderRequest.query(orderQuery);
        const SO_ID = orderResult.recordset[0].SO_ID;
        console.log("ORDER INSERT SUCCESS: Order inserted successfully, SO_ID:", SO_ID);

        // **NEW: Verify inserted salesperson data**
        console.log("=== Verifying Inserted Data ===");
        const verifyQuery = `
            SELECT so.SO_ID, so.SO_SaleID, sp.SalePersonName 
            FROM Sale_Order so 
            LEFT JOIN SalePerson sp ON so.SO_SaleID = sp.SalePerson_ID 
            WHERE so.SO_ID = @SO_ID
        `;
        const verifyRequest = new sql.Request(transaction);
        verifyRequest.input('SO_ID', sql.Int, SO_ID);
        const verifyResult = await verifyRequest.query(verifyQuery);
        
        if (verifyResult.recordset.length > 0) {
            const insertedData = verifyResult.recordset[0];
            console.log(`VERIFICATION SUCCESS:`);
            console.log(`   Inserted SO_SaleID: ${insertedData.SO_SaleID}`);
            console.log(`   Inserted SalePersonName: ${insertedData.SalePersonName || 'NULL'}`);
        }

        // Insert order items with enhanced validation and logging
        console.log("=== Starting Items Insert ===");
        console.log("Processing", OrderData.orderItems.length, "items...");
        
        for (let i = 0; i < OrderData.orderItems.length; i++) {
            const item = OrderData.orderItems[i];
            console.log(`\n--- Processing Item ${i + 1}/${OrderData.orderItems.length} ---`);
            console.log("Item data:", JSON.stringify(item, null, 2));
            
            // Item validation
            if (!item.I_ID) {
                throw new Error(`Item ${i + 1}: Missing product ID (I_ID)`);
            }
            
            if (!item.I_Qty || item.I_Qty <= 0) {
                throw new Error(`Item ${i + 1}: Invalid quantity (${item.I_Qty})`);
            }
            
            if (!item.I_Price || item.I_Price <= 0) {
                throw new Error(`Item ${i + 1}: Invalid price (${item.I_Price})`);
            }
            
            // Product code lookup in Items table with better error handling
            const lookupQuery = `SELECT I_ItemID FROM Items WHERE I_ItemNo = @I_ItemNo`;
            const lookupRequest = new sql.Request(transaction);
            lookupRequest.input('I_ItemNo', sql.VarChar, item.I_ID);
            
            console.log(`PRODUCT LOOKUP: Looking up I_ItemID for product code: "${item.I_ID}"`);
            const lookupResult = await lookupRequest.query(lookupQuery);
            
            if (lookupResult.recordset.length === 0) {
                console.log(`PRODUCT LOOKUP FAILED: Product code "${item.I_ID}" not found in Items table`);
                throw new Error(`Product code '${item.I_ID}' not found in Items table. Please check the product code.`);
            }
            
            const actualItemId = lookupResult.recordset[0].I_ItemID;
            console.log(`PRODUCT LOOKUP SUCCESS: Found I_ItemID: ${actualItemId} for product code: "${item.I_ID}"`);
            
            // Calculate item totals for logging
            const itemSubtotal = parseFloat(item.I_Price) * parseFloat(item.I_Qty);
            const itemDiscount = parseFloat(item.I_Discount) || 0;
            const itemTotal = itemSubtotal - itemDiscount;
            
            console.log(`ITEM CALCULATIONS:`);
            console.log(`   Subtotal: ${item.I_Price} × ${item.I_Qty} = ${itemSubtotal}`);
            console.log(`   Discount: ${itemDiscount}`);
            console.log(`   Item Total: ${itemTotal}`);
            
            // Insert SaleOrder_Item record
            const itemQuery = `INSERT INTO SaleOrder_Item 
                (SO_ID, I_ID, I_Qty, I_Price, I_Discount, CreateBy, CreateDate, UpdateBy, UpdateDate)
                VALUES (@SO_ID, @I_ID, @I_Qty, @I_Price, @I_Discount, @CreateBy, @CreateDate, @UpdateBy, @UpdateDate)`;

            const itemRequest = new sql.Request(transaction);
            itemRequest.input('SO_ID', sql.Int, SO_ID);
            itemRequest.input('I_ID', sql.Int, actualItemId);
            itemRequest.input('I_Qty', sql.Decimal(18, 2), parseFloat(item.I_Qty));
            itemRequest.input('I_Price', sql.Decimal(18, 2), parseFloat(item.I_Price));
            itemRequest.input('I_Discount', sql.Decimal(18, 2), parseFloat(item.I_Discount) || 0);
            itemRequest.input('CreateBy', sql.Int, item.CreateBy || null);
            itemRequest.input('CreateDate', sql.DateTime, item.CreateDate || new Date());
            itemRequest.input('UpdateBy', sql.Int, item.UpdateBy || null);
            itemRequest.input('UpdateDate', sql.DateTime, item.UpdateDate || null);

            console.log(`ITEM INSERT: Executing item ${i + 1} insert...`);
            await itemRequest.query(itemQuery);
            console.log(`ITEM INSERT SUCCESS: Item ${i + 1} inserted successfully`);
        }

        // Commit transaction with success summary
        console.log("\n=== Transaction Summary ===");
        console.log("ORDER SUCCESS: Order Header inserted with SO_ID:", SO_ID);
        console.log("SALESPERSON SUCCESS: SO_SaleID set to:", validatedSaleID);
        console.log("ITEMS SUCCESS: All", OrderData.orderItems.length, "items inserted successfully");
        console.log("TOTAL AMOUNT:", parseFloat(OrderData.SO_TotalAmount));
        console.log("Committing transaction...");
        
        await transaction.commit();
        console.log("TRANSACTION SUCCESS: Transaction committed successfully");
        
        return { 
            success: true, 
            message: "Order and items created successfully", 
            orderId: SO_ID,
            salespersonId: validatedSaleID,
            itemCount: OrderData.orderItems.length,
            totalAmount: parseFloat(OrderData.SO_TotalAmount)
        };
        
    } catch (error) {
        // Enhanced error handling with rollback
        console.log("\n=== ERROR OCCURRED ===");
        console.log("ERROR MESSAGE:", error.message);
        console.log("ERROR STACK:", error.stack);
        
        try {
            console.log("ROLLBACK: Rolling back transaction...");
            await transaction.rollback();
            console.log("ROLLBACK SUCCESS: Transaction rolled back successfully");
        } catch (rollbackError) {
            console.log("ROLLBACK FAILED:", rollbackError.message);
        }
        
        // Return structured error response
        return { 
            success: false, 
            message: error.message || 'An unexpected error occurred',
            error: {
                type: error.name || 'UnknownError',
                details: error.message,
                timestamp: new Date().toISOString()
            }
        };
        
    } finally {
        // Always close connection
        try {
            console.log("DATABASE: Closing database connection...");
            pool.close();
            console.log("DATABASE SUCCESS: Database connection closed");
        } catch (closeError) {
            console.log("DATABASE ERROR: Error closing connection:", closeError.message);
        }
    }
}

async function GetAllOrders(options = {}) {
    console.log("=== GetAllOrders Service Called ===");
    console.log("Options received:", JSON.stringify(options, null, 2));
    
    // Database connection
    const pool = await sql.connect(config.sql);

    try {
        // Default options with enhanced pagination
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 50;
        const offset = (page - 1) * limit;
        
        console.log("=== Pagination Settings ===");
        console.log("Page:", page);
        console.log("Limit:", limit);
        console.log("Offset:", offset);

        // Enhanced query with proper JOIN and ordering - เพิ่ม CreateBy ในการแสดงผล
        const ordersQuery = `
            SELECT 
                so.[SO_ID],
                so.[SO_NUMBER],
                so.[Document_Ref],
                so.[SO_Date],
                so.[Customer_Code],
                so.[Payment_TermID],
                so.[SO_SaleID],
                sp.[SalePersonName],
                sp.[Sale_Phone],
                so.[SO_Remark],
                so.[SO_AmountBeforeVat],
                so.[SO_VAT],
                so.[SO_TotalAmount],
                so.[CreateBy],
                so.[CreateDate],
                so.[UpdateBy],
                so.[UpdateDate]
            FROM [MGS_SaleOnline].[dbo].[Sale_Order] so
            LEFT JOIN [MGS_SaleOnline].[dbo].[SalePerson] sp 
                ON so.[SO_SaleID] = sp.[SalePerson_ID]
            ORDER BY so.[CreateDate] DESC
            OFFSET @Offset ROWS
            FETCH NEXT @Limit ROWS ONLY
        `;

        // Count query for total records - เพิ่ม CreateBy
        const countQuery = `
            SELECT COUNT(*) as TotalCount
            FROM [MGS_SaleOnline].[dbo].[Sale_Order] so
            LEFT JOIN [MGS_SaleOnline].[dbo].[SalePerson] sp 
                ON so.[SO_SaleID] = sp.[SalePerson_ID]
        `;

        console.log("=== Executing Orders Query ===");
        
        // Execute main query
        const ordersRequest = new sql.Request(pool);
        ordersRequest.input('Offset', sql.Int, offset);
        ordersRequest.input('Limit', sql.Int, limit);
        
        const ordersResult = await ordersRequest.query(ordersQuery);
        console.log("ORDERS QUERY SUCCESS: Retrieved", ordersResult.recordset.length, "orders");

        // Execute count query
        console.log("=== Executing Count Query ===");
        const countRequest = new sql.Request(pool);
        const countResult = await countRequest.query(countQuery);
        const totalCount = countResult.recordset[0].TotalCount;
        console.log("COUNT QUERY SUCCESS: Total orders count:", totalCount);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        console.log("=== Pagination Summary ===");
        console.log("Total Records:", totalCount);
        console.log("Total Pages:", totalPages);
        console.log("Current Page:", page);
        console.log("Has Next Page:", hasNextPage);
        console.log("Has Previous Page:", hasPrevPage);

        // Format the response data - เพิ่ม CreateBy และ UpdateBy ในการแสดงผล
        const formattedOrders = ordersResult.recordset.map(order => ({
            orderId: order.SO_ID,
            orderNumber: order.SO_NUMBER,
            documentRef: order.Document_Ref,
            orderDate: order.SO_Date,
            customerCode: order.Customer_Code,
            paymentTermId: order.Payment_TermID,
            salesperson: {
                id: order.SO_SaleID,
                name: order.SalePersonName || 'ไม่ระบุ',
                phone: order.Sale_Phone || 'ไม่ระบุ'
            },
            remark: order.SO_Remark || '',
            amounts: {
                beforeVat: parseFloat(order.SO_AmountBeforeVat) || 0,
                vat: parseFloat(order.SO_VAT) || 0,
                total: parseFloat(order.SO_TotalAmount) || 0
            },
            auditInfo: {
                createBy: order.CreateBy,
                createDate: order.CreateDate,
                updateBy: order.UpdateBy,
                updateDate: order.UpdateDate
            }
        }));

        console.log("DATA FORMATTING SUCCESS: Formatted", formattedOrders.length, "orders");

        return {
            success: true,
            message: "Orders retrieved successfully",
            data: {
                orders: formattedOrders,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalRecords: totalCount,
                    recordsPerPage: limit,
                    hasNextPage: hasNextPage,
                    hasPrevPage: hasPrevPage,
                    recordsOnPage: formattedOrders.length
                }
            },
            summary: {
                totalOrders: totalCount,
                currentPageOrders: formattedOrders.length,
                queryTime: new Date().toISOString()
            }
        };

    } catch (error) {
        console.log("\n=== ERROR OCCURRED ===");
        console.log("ERROR MESSAGE:", error.message);
        console.log("ERROR STACK:", error.stack);

        return {
            success: false,
            message: error.message || 'An unexpected error occurred while retrieving orders',
            error: {
                type: error.name || 'UnknownError',
                details: error.message,
                timestamp: new Date().toISOString()
            },
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
            }
        };

    } finally {
        // Always close connection
        try {
            console.log("DATABASE: Closing database connection...");
            pool.close();
            console.log("DATABASE SUCCESS: Database connection closed");
        } catch (closeError) {
            console.log("DATABASE ERROR: Error closing connection:", closeError.message);
        }
    }
}

// เพิ่มฟังก์ชันตรวจสอบข้อมูลพนักงานแยกต่างหาก
async function DebugSalespersonData(salePersonId = null) {
    console.log("=== DebugSalespersonData Called ===");
    console.log("Input SalePersonId:", salePersonId);
    
    const pool = await sql.connect(config.sql);
    
    try {
        // Query all salesperson data
        let query = `SELECT SalePerson_ID, SalePersonName, Sale_Phone, CreateDate FROM SalePerson`;
        let params = [];
        
        if (salePersonId) {
            query += ` WHERE SalePerson_ID = @SalePersonId`;
        }
        
        query += ` ORDER BY SalePerson_ID`;
        
        const request = new sql.Request(pool);
        if (salePersonId) {
            request.input('SalePersonId', sql.Int, salePersonId);
        }
        
        const result = await request.query(query);
        
        console.log("=== Salesperson Data ===");
        console.log("Total records found:", result.recordset.length);
        
        result.recordset.forEach((person, index) => {
            console.log(`${index + 1}. ID: ${person.SalePerson_ID} | Name: "${person.SalePersonName}" | Phone: ${person.Sale_Phone || 'NULL'}`);
        });
        
        return {
            success: true,
            data: result.recordset,
            count: result.recordset.length
        };
        
    } catch (error) {
        console.log("ERROR in DebugSalespersonData:", error.message);
        return {
            success: false,
            error: error.message
        };
    } finally {
        pool.close();
    }
}

// เพิ่มฟังก์ชันตรวจสอบข้อมูลที่บันทึกล่าสุด
async function VerifyLatestOrder(orderNumber = null) {
    console.log("=== VerifyLatestOrder Called ===");
    console.log("Order Number to verify:", orderNumber);
    
    const pool = await sql.connect(config.sql);
    
    try {
        let query = `
            SELECT TOP 10
                so.SO_ID,
                so.SO_NUMBER,
                so.SO_SaleID,
                sp.SalePersonName,
                sp.Sale_Phone,
                so.CreateDate
            FROM Sale_Order so
            LEFT JOIN SalePerson sp ON so.SO_SaleID = sp.SalePerson_ID
        `;
        
        const request = new sql.Request(pool);
        
        if (orderNumber) {
            query += ` WHERE so.SO_NUMBER = @OrderNumber`;
            request.input('OrderNumber', sql.VarChar, orderNumber);
        }
        
        query += ` ORDER BY so.CreateDate DESC`;
        
        const result = await request.query(query);
        
        console.log("=== Latest Orders Verification ===");
        console.log("Orders found:", result.recordset.length);
        
        result.recordset.forEach((order, index) => {
            console.log(`${index + 1}. Order: ${order.SO_NUMBER} | SO_SaleID: ${order.SO_SaleID || 'NULL'} | SaleName: "${order.SalePersonName || 'NULL'}" | Date: ${order.CreateDate}`);
        });
        
        return {
            success: true,
            data: result.recordset,
            count: result.recordset.length
        };
        
    } catch (error) {
        console.log("ERROR in VerifyLatestOrder:", error.message);
        return {
            success: false,
            error: error.message
        };
    } finally {
        pool.close();
    }
}
// ฟังก์ชันสำหรับดึงสถิติ Dashboard
async function GetDashboardStats() {
    console.log("=== GetDashboardStats Service Called ===");
    
    const pool = await sql.connect(config.sql);
    
    try {
        // วันที่ปัจจุบันและช่วงเวลาสำหรับคำนวณ Growth
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        console.log("=== Date Ranges ===");
        console.log("Today:", today.toISOString());
        console.log("Last Month:", lastMonth.toISOString());
        console.log("Last Week:", lastWeek.toISOString());

        // 1. Total Orders และ Growth
        const ordersStatsQuery = `
            DECLARE @Today DATETIME = GETDATE()
            DECLARE @LastMonth DATETIME = DATEADD(MONTH, -1, @Today)
            DECLARE @LastWeek DATETIME = DATEADD(DAY, -7, @Today)

            SELECT 
                -- Total Orders
                (SELECT COUNT(*) FROM Sale_Order) as TotalOrders,
                
                -- Orders This Month
                (SELECT COUNT(*) FROM Sale_Order WHERE CreateDate >= @LastMonth) as OrdersThisMonth,
                
                -- Orders Last Month  
                (SELECT COUNT(*) FROM Sale_Order 
                 WHERE CreateDate >= DATEADD(MONTH, -2, @Today) 
                 AND CreateDate < @LastMonth) as OrdersLastMonth,

                -- Total Revenue
                (SELECT ISNULL(SUM(SO_TotalAmount), 0) FROM Sale_Order) as TotalRevenue,
                
                -- Revenue This Month
                (SELECT ISNULL(SUM(SO_TotalAmount), 0) FROM Sale_Order 
                 WHERE CreateDate >= @LastMonth) as RevenueThisMonth,
                
                -- Revenue Last Month
                (SELECT ISNULL(SUM(SO_TotalAmount), 0) FROM Sale_Order 
                 WHERE CreateDate >= DATEADD(MONTH, -2, @Today) 
                 AND CreateDate < @LastMonth) as RevenueLastMonth,

                -- Active Sales People
                (SELECT COUNT(*) FROM SalePerson) as TotalSalesPeople,
                
                -- Active Sales People This Week (who created orders)
                (SELECT COUNT(DISTINCT SO_SaleID) FROM Sale_Order 
                 WHERE SO_SaleID IS NOT NULL AND CreateDate >= @LastWeek) as ActiveSalesThisWeek,
                
                -- Active Sales People Last Week
                (SELECT COUNT(DISTINCT SO_SaleID) FROM Sale_Order 
                 WHERE SO_SaleID IS NOT NULL 
                 AND CreateDate >= DATEADD(DAY, -14, @Today) 
                 AND CreateDate < @LastWeek) as ActiveSalesLastWeek
        `;

        console.log("=== Executing Orders Stats Query ===");
        const statsRequest = new sql.Request(pool);
        const statsResult = await statsRequest.query(ordersStatsQuery);
        const stats = statsResult.recordset[0];

        console.log("Raw Stats:", stats);

        // 2. Total Products
        const productsQuery = `
            SELECT 
                COUNT(*) as TotalProducts,
                (SELECT COUNT(*) FROM Items WHERE CreateDate >= DATEADD(MONTH, -1, GETDATE())) as NewProductsThisMonth
        `;

        console.log("=== Executing Products Query ===");
        const productsRequest = new sql.Request(pool);
        const productsResult = await productsRequest.query(productsQuery);
        const products = productsResult.recordset[0];

        // คำนวณ Growth Rates
        const orderGrowth = stats.OrdersLastMonth > 0 ? 
            ((stats.OrdersThisMonth - stats.OrdersLastMonth) / stats.OrdersLastMonth * 100) : 0;

        const revenueGrowth = stats.RevenueLastMonth > 0 ? 
            ((stats.RevenueThisMonth - stats.RevenueLastMonth) / stats.RevenueLastMonth * 100) : 0;

        const userGrowth = stats.ActiveSalesLastWeek > 0 ? 
            ((stats.ActiveSalesThisWeek - stats.ActiveSalesLastWeek) / stats.ActiveSalesLastWeek * 100) : 0;

        console.log("=== Calculated Growth Rates ===");
        console.log("Order Growth:", orderGrowth.toFixed(1) + "%");
        console.log("Revenue Growth:", revenueGrowth.toFixed(1) + "%");
        console.log("User Growth:", userGrowth.toFixed(1) + "%");

        const dashboardStats = {
            totalOrders: parseInt(stats.TotalOrders) || 0,
            orderGrowth: parseFloat(orderGrowth.toFixed(1)),
            totalRevenue: parseFloat(stats.TotalRevenue) || 0,
            revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
            activeUsers: parseInt(stats.TotalSalesPeople) || 0,
            userGrowth: parseFloat(userGrowth.toFixed(1)),
            totalProducts: parseInt(products.TotalProducts) || 0,
            newProducts: parseInt(products.NewProductsThisMonth) || 0
        };

        console.log("=== Final Dashboard Stats ===");
        console.log(JSON.stringify(dashboardStats, null, 2));

        return {
            success: true,
            message: "Dashboard statistics retrieved successfully",
            data: dashboardStats,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.log("ERROR in GetDashboardStats:", error.message);
        return {
            success: false,
            message: error.message || 'Failed to retrieve dashboard statistics',
            error: {
                type: error.name || 'UnknownError',
                details: error.message,
                timestamp: new Date().toISOString()
            }
        };
    } finally {
        pool.close();
    }
}

// ฟังก์ชันสำหรับดึงข้อมูลกราฟรายได้
async function GetRevenueChart(period = '7d') {
    console.log("=== GetRevenueChart Service Called ===");
    console.log("Period:", period);
    
    const pool = await sql.connect(config.sql);
    
    try {
        let dateRange, groupByFormat, dateFormat;
        
        // กำหนดช่วงวันและรูปแบบการจัดกลุ่ม
        switch (period) {
            case '7d':
                dateRange = 7;
                groupByFormat = "CAST(CreateDate as DATE)";
                dateFormat = "yyyy-MM-dd";
                break;
            case '30d':
                dateRange = 30;
                groupByFormat = "CAST(CreateDate as DATE)";
                dateFormat = "yyyy-MM-dd";
                break;
            case '90d':
                dateRange = 90;
                groupByFormat = "CAST(YEAR(CreateDate) as VARCHAR) + '-W' + CAST(DATEPART(week, CreateDate) as VARCHAR)";
                dateFormat = "week";
                break;
            default:
                dateRange = 7;
                groupByFormat = "CAST(CreateDate as DATE)";
                dateFormat = "yyyy-MM-dd";
        }

        const chartQuery = `
            SELECT 
                ${groupByFormat} as PeriodGroup,
                ISNULL(SUM(SO_TotalAmount), 0) as Revenue,
                COUNT(*) as OrderCount,
                CAST(CreateDate as DATE) as OrderDate
            FROM Sale_Order 
            WHERE CreateDate >= DATEADD(DAY, -${dateRange}, GETDATE())
            GROUP BY ${groupByFormat}, CAST(CreateDate as DATE)
            ORDER BY CAST(CreateDate as DATE) ASC
        `;

        console.log("=== Executing Chart Query ===");
        console.log("Date Range:", dateRange, "days");
        
        const chartRequest = new sql.Request(pool);
        const chartResult = await chartRequest.query(chartQuery);

        console.log("Chart Data Retrieved:", chartResult.recordset.length, "records");

        // แปลงข้อมูลสำหรับกราฟ
        const chartData = chartResult.recordset.map(row => ({
            date: row.OrderDate,
            period: row.PeriodGroup,
            revenue: parseFloat(row.Revenue) || 0,
            orderCount: parseInt(row.OrderCount) || 0
        }));

        // คำนวณสถิติเพิ่มเติม
        const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = chartData.reduce((sum, item) => sum + item.orderCount, 0);
        const averageRevenue = totalRevenue / Math.max(chartData.length, 1);

        console.log("=== Chart Statistics ===");
        console.log("Total Revenue:", totalRevenue);
        console.log("Total Orders:", totalOrders);
        console.log("Average Revenue per Day:", averageRevenue.toFixed(2));

        return {
            success: true,
            message: "Revenue chart data retrieved successfully",
            data: {
                chartData: chartData,
                period: period,
                statistics: {
                    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                    totalOrders: totalOrders,
                    averageRevenuePerDay: parseFloat(averageRevenue.toFixed(2)),
                    dateRange: dateRange
                }
            },
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.log("ERROR in GetRevenueChart:", error.message);
        return {
            success: false,
            message: error.message || 'Failed to retrieve revenue chart data',
            error: {
                type: error.name || 'UnknownError',
                details: error.message,
                timestamp: new Date().toISOString()
            }
        };
    } finally {
        pool.close();
    }
}

// ฟังก์ชันสำหรับดึงกิจกรรมล่าสุด
async function GetRecentActivities(limit = 10) {
    console.log("=== GetRecentActivities Service Called ===");
    console.log("Limit:", limit);
    
    const pool = await sql.connect(config.sql);
    
    try {
        const activitiesQuery = `
            SELECT TOP (@Limit)
                so.SO_ID,
                so.SO_NUMBER,
                so.SO_TotalAmount,
                so.Customer_Code,
                sp.SalePersonName,
                so.CreateDate,
                'order_created' as ActivityType
            FROM Sale_Order so
            LEFT JOIN SalePerson sp ON so.SO_SaleID = sp.SalePerson_ID
            ORDER BY so.CreateDate DESC
        `;

        console.log("=== Executing Activities Query ===");
        
        const activitiesRequest = new sql.Request(pool);
        activitiesRequest.input('Limit', sql.Int, limit);
        
        const activitiesResult = await activitiesRequest.query(activitiesQuery);

        console.log("Activities Retrieved:", activitiesResult.recordset.length, "records");

        // แปลงข้อมูลเป็นรูปแบบที่เหมาะสำหรับ UI
        const activities = activitiesResult.recordset.map((activity, index) => {
            const timeAgo = getTimeAgo(new Date(activity.CreateDate));
            
            return {
                id: activity.SO_ID,
                icon: 'ORDER',
                title: `คำสั่งซื้อ #${activity.SO_NUMBER} เสร็จสิ้น`,
                subtitle: `ลูกค้า: ${activity.Customer_Code} | พนักงาน: ${activity.SalePersonName || 'ไม่ระบุ'}`,
                amount: parseFloat(activity.SO_TotalAmount) || 0,
                time: timeAgo,
                timestamp: activity.CreateDate,
                iconBg: 'bg-blue-100',
                type: activity.ActivityType
            };
        });

        console.log("=== Activities Summary ===");
        console.log("Formatted Activities:", activities.length);
        if (activities.length > 0) {
            console.log("Latest Activity:", activities[0].title, "-", activities[0].time);
        }

        return {
            success: true,
            message: "Recent activities retrieved successfully",
            data: {
                activities: activities,
                totalCount: activities.length,
                lastUpdated: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.log("ERROR in GetRecentActivities:", error.message);
        return {
            success: false,
            message: error.message || 'Failed to retrieve recent activities',
            error: {
                type: error.name || 'UnknownError',
                details: error.message,
                timestamp: new Date().toISOString()
            }
        };
    } finally {
        pool.close();
    }
}

// ฟังก์ชันสำหรับอัพเดท Sale Order 
async function UpdateSaleOrder(orderData) {
    console.log("=== UpdateSaleOrder Service Called ===");
    console.log("OrderData received:", JSON.stringify(orderData, null, 2));
    
    const pool = await sql.connect(config.sql);
    const transaction = new sql.Transaction(pool);

    try {
        // Enhanced data validation
        console.log("=== Starting Enhanced Validation ===");
        console.log("SO_ID:", orderData.SO_ID);
        console.log("SO_NUMBER:", orderData.SO_NUMBER);
        console.log("Document_Ref:", orderData.Document_Ref);
        console.log("SO_Date:", orderData.SO_Date);
        console.log("Customer_Code:", orderData.Customer_Code);
        console.log("New_Customer:", orderData.New_Customer); // เพิ่มใหม่
        console.log("SO_SaleID:", orderData.SO_SaleID);
        console.log("SO_AmountBeforeVat:", orderData.SO_AmountBeforeVat);
        console.log("SO_VAT:", orderData.SO_VAT);
        console.log("SO_TotalAmount:", orderData.SO_TotalAmount);
        
        // Basic validation
        if (!orderData || !orderData.SO_ID) {
            console.log("VALIDATION FAILED: Missing SO_ID!");
            throw new Error('Invalid Order data - missing SO_ID');
        }

        // **NEW: Customer validation logic**
        console.log("=== Customer Validation ===");
        const hasCustomerCode = orderData.Customer_Code && orderData.Customer_Code.trim() !== '';
        const hasNewCustomer = orderData.New_Customer && orderData.New_Customer.trim() !== '';
        
        console.log("Has Customer Code:", hasCustomerCode);
        console.log("Has New Customer:", hasNewCustomer);
        
        // ตรวจสอบว่าต้องมีอย่างใดอย่างหนึ่ง: Customer_Code หรือ New_Customer
        if (!hasCustomerCode && !hasNewCustomer) {
            console.log("CUSTOMER VALIDATION FAILED: Must have either Customer_Code or New_Customer!");
            throw new Error('Order must have either Customer_Code or New_Customer specified');
        }
        
        // ถ้ามีทั้งสองอย่าง ให้แจ้งเตือน
        if (hasCustomerCode && hasNewCustomer) {
            console.log("⚠️  WARNING: Both Customer_Code and New_Customer provided. Customer_Code will take precedence.");
        }
        
        // กำหนดค่าสุดท้ายสำหรับ customer
        const finalCustomerCode = hasCustomerCode ? orderData.Customer_Code : null;
        const finalNewCustomer = orderData.New_Customer || null;
        
        console.log("Final Customer Code:", finalCustomerCode);
        console.log("Final New Customer:", finalNewCustomer);

        // Check if order exists
        console.log("=== Checking Order Existence ===");
        const checkQuery = `SELECT SO_ID, SO_NUMBER FROM Sale_Order WHERE SO_ID = @SO_ID`;
        const checkRequest = new sql.Request(pool);
        checkRequest.input('SO_ID', sql.Int, orderData.SO_ID);
        
        const checkResult = await checkRequest.query(checkQuery);
        
        if (checkResult.recordset.length === 0) {
            console.log(`ORDER NOT FOUND: SO_ID ${orderData.SO_ID} not found!`);
            throw new Error(`Order with ID ${orderData.SO_ID} not found`);
        }
        
        console.log(`ORDER EXISTS: Found order ${checkResult.recordset[0].SO_NUMBER}`);

        // **Salesperson Validation** (ถ้ามีการส่ง SO_SaleID มา)
        let validatedSaleID = null;
        if (orderData.SO_SaleID !== null && orderData.SO_SaleID !== undefined && orderData.SO_SaleID !== '') {
            console.log("=== Salesperson Validation ===");
            const salespersonQuery = `SELECT SalePerson_ID, SalePersonName FROM SalePerson WHERE SalePerson_ID = @SalePerson_ID`;
            const salespersonRequest = new sql.Request(pool);
            salespersonRequest.input('SalePerson_ID', sql.Int, orderData.SO_SaleID);
            
            const salespersonResult = await salespersonRequest.query(salespersonQuery);
            
            if (salespersonResult.recordset.length === 0) {
                console.log(`SALESPERSON VALIDATION FAILED: SalePerson_ID ${orderData.SO_SaleID} not found!`);
                throw new Error(`Salesperson with ID ${orderData.SO_SaleID} not found in database`);
            }
            
            validatedSaleID = salespersonResult.recordset[0].SalePerson_ID;
            const foundSalespersonName = salespersonResult.recordset[0].SalePersonName;
            
            console.log(`SALESPERSON VALIDATION SUCCESS:`);
            console.log(`   Database SalePerson_ID: ${validatedSaleID}`);
            console.log(`   Database SalePersonName: ${foundSalespersonName}`);
        } else {
            console.log("SALESPERSON INFO: SO_SaleID is empty/null, will be set to NULL");
            validatedSaleID = null;
        }

        console.log("VALIDATION SUCCESS: Enhanced validation passed - starting transaction...");
        await transaction.begin();

        // **UPDATED: Update Sale_Order with New_Customer field**
        console.log("=== Preparing Order Update ===");
        const updateQuery = `
            UPDATE Sale_Order 
            SET 
                Document_Ref = @Document_Ref,
                SO_Date = @SO_Date,
                Customer_Code = @Customer_Code,
                New_Customer = @New_Customer,
                Payment_TermID = @Payment_TermID,
                SO_SaleID = @SO_SaleID,
                SO_Remark = @SO_Remark,
                SO_AmountBeforeVat = @SO_AmountBeforeVat,
                SO_VAT = @SO_VAT,
                SO_TotalAmount = @SO_TotalAmount,
                UpdateBy = @UpdateBy,
                UpdateDate = @UpdateDate
            WHERE SO_ID = @SO_ID
        `;
        
        const updateRequest = new sql.Request(transaction);
        
        // Input parameters with null handling
        updateRequest.input('SO_ID', sql.Int, orderData.SO_ID);
        updateRequest.input('Document_Ref', sql.VarChar(100), orderData.Document_Ref || '');
        updateRequest.input('SO_Date', sql.DateTime, orderData.SO_Date ? new Date(orderData.SO_Date) : new Date());
        updateRequest.input('Customer_Code', sql.VarChar(50), finalCustomerCode);
        updateRequest.input('New_Customer', sql.NVarChar(100), finalNewCustomer); // เพิ่มใหม่
        updateRequest.input('Payment_TermID', sql.Int, orderData.Payment_TermID || null);
        
        // **ENHANCED: Use validated SaleID**
        updateRequest.input('SO_SaleID', sql.Int, validatedSaleID);
        console.log(`SALESPERSON UPDATE: Using validated SO_SaleID = ${validatedSaleID}`);
        
        updateRequest.input('SO_Remark', sql.VarChar(sql.MAX), orderData.SO_Remark || '');
        
        // Enhanced VAT and Amount handling
        updateRequest.input('SO_AmountBeforeVat', sql.Decimal(18, 2), parseFloat(orderData.SO_AmountBeforeVat) || 0);
        updateRequest.input('SO_VAT', sql.Decimal(18, 2), parseFloat(orderData.SO_VAT) || 0);
        updateRequest.input('SO_TotalAmount', sql.Decimal(18, 2), parseFloat(orderData.SO_TotalAmount) || 0);
        
        updateRequest.input('UpdateBy', sql.Int, orderData.UpdateBy || null);
        updateRequest.input('UpdateDate', sql.DateTime, new Date());

        console.log("=== Order Update Parameters ===");
        console.log("SO_ID:", orderData.SO_ID);
        console.log("Customer_Code:", finalCustomerCode);
        console.log("New_Customer:", finalNewCustomer);
        console.log("SO_SaleID:", validatedSaleID);
        console.log("SO_AmountBeforeVat:", parseFloat(orderData.SO_AmountBeforeVat) || 0);
        console.log("SO_VAT:", parseFloat(orderData.SO_VAT) || 0);
        console.log("SO_TotalAmount:", parseFloat(orderData.SO_TotalAmount) || 0);

        console.log("Executing order update...");
        const updateResult = await updateRequest.query(updateQuery);
        console.log("ORDER UPDATE SUCCESS: Order updated successfully, affected rows:", updateResult.rowsAffected[0]);

        // **UPDATED: Verify updated data with New_Customer**
        console.log("=== Verifying Updated Data ===");
        const verifyQuery = `
            SELECT 
                so.SO_ID, 
                so.SO_NUMBER,
                so.Document_Ref,
                so.SO_Date,
                so.Customer_Code,
                so.New_Customer,
                so.SO_SaleID, 
                sp.SalePersonName,
                so.SO_Remark,
                so.SO_AmountBeforeVat,
                so.SO_VAT,
                so.SO_TotalAmount,
                so.UpdateDate
            FROM Sale_Order so 
            LEFT JOIN SalePerson sp ON so.SO_SaleID = sp.SalePerson_ID 
            WHERE so.SO_ID = @SO_ID
        `;
        const verifyRequest = new sql.Request(transaction);
        verifyRequest.input('SO_ID', sql.Int, orderData.SO_ID);
        const verifyResult = await verifyRequest.query(verifyQuery);
        
        if (verifyResult.recordset.length > 0) {
            const updatedData = verifyResult.recordset[0];
            console.log(`VERIFICATION SUCCESS:`);
            console.log(`   Updated Customer_Code: ${updatedData.Customer_Code || 'NULL'}`);
            console.log(`   Updated New_Customer: ${updatedData.New_Customer || 'NULL'}`);
            console.log(`   Updated SO_SaleID: ${updatedData.SO_SaleID}`);
            console.log(`   Updated SalePersonName: ${updatedData.SalePersonName || 'NULL'}`);
            console.log(`   Updated SO_TotalAmount: ${updatedData.SO_TotalAmount}`);
            console.log(`   Updated Date: ${updatedData.UpdateDate}`);
        }

        // Commit transaction with success summary
        console.log("\n=== Transaction Summary ===");
        console.log("ORDER UPDATE SUCCESS: Order updated with SO_ID:", orderData.SO_ID);
        console.log("CUSTOMER SUCCESS: Customer_Code:", finalCustomerCode, "| New_Customer:", finalNewCustomer);
        console.log("SALESPERSON SUCCESS: SO_SaleID updated to:", validatedSaleID);
        console.log("TOTAL AMOUNT SUCCESS: Updated to:", parseFloat(orderData.SO_TotalAmount));
        console.log("Committing transaction...");
        
        await transaction.commit();
        console.log("TRANSACTION SUCCESS: Transaction committed successfully");
        
        // **UPDATED: Return updated data with New_Customer**
        const updatedOrderData = verifyResult.recordset[0];
        
        return { 
            success: true, 
            message: "Sale Order updated successfully", 
            data: {
                orderId: updatedOrderData.SO_ID,
                orderNumber: updatedOrderData.SO_NUMBER,
                documentRef: updatedOrderData.Document_Ref,
                orderDate: updatedOrderData.SO_Date,
                customerCode: updatedOrderData.Customer_Code,
                newCustomer: updatedOrderData.New_Customer, // เพิ่มใหม่
                salesperson: {
                    id: updatedOrderData.SO_SaleID,
                    name: updatedOrderData.SalePersonName || 'ไม่ระบุ'
                },
                remark: updatedOrderData.SO_Remark || '',
                amounts: {
                    beforeVat: parseFloat(updatedOrderData.SO_AmountBeforeVat) || 0,
                    vat: parseFloat(updatedOrderData.SO_VAT) || 0,
                    total: parseFloat(updatedOrderData.SO_TotalAmount) || 0
                },
                updatedAt: updatedOrderData.UpdateDate
            }
        };
        
    } catch (error) {
        // Enhanced error handling with rollback
        console.log("\n=== ERROR OCCURRED ===");
        console.log("ERROR MESSAGE:", error.message);
        console.log("ERROR STACK:", error.stack);
        
        try {
            console.log("ROLLBACK: Rolling back transaction...");
            await transaction.rollback();
            console.log("ROLLBACK SUCCESS: Transaction rolled back successfully");
        } catch (rollbackError) {
            console.log("ROLLBACK FAILED:", rollbackError.message);
        }
        
        // Return structured error response
        return { 
            success: false, 
            message: error.message || 'An unexpected error occurred while updating order',
            error: {
                type: error.name || 'UnknownError',
                details: error.message,
                timestamp: new Date().toISOString()
            }
        };
        
    } finally {
        // Always close connection
        try {
            console.log("DATABASE: Closing database connection...");
            pool.close();
            console.log("DATABASE SUCCESS: Database connection closed");
        } catch (closeError) {
            console.log("DATABASE ERROR: Error closing connection:", closeError.message);
        }
    }
}

// ฟังก์ชันสำหรับดึงรายการ Sale Orders สำหรับ Admin Panel
async function GetSaleOrdersList(options = {}) {
    console.log("=== GetSaleOrdersList Service Called ===");
    
    let pool;
    let retryCount = 0;
    const maxRetries = 3;

    // Enhanced Connection with Retry Logic
    while (retryCount < maxRetries) {
        try {
            pool = await sql.connect(config.sql);
            break;
        } catch (error) {
            retryCount++;
            console.log(`Connection attempt ${retryCount} failed:`, error.message);
            
            if (retryCount >= maxRetries) {
                throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${error.message}`);
            }
            
            const waitTime = retryCount * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    try {
        const page = parseInt(options.page) || 1;
        const limit = Math.min(parseInt(options.limit) || 50, 100);
        const search = (options.search || '').trim();
        const offset = (page - 1) * limit;

        // Enhanced WHERE clause with SQL injection protection
        let whereClause = "WHERE 1=1";
        
        if (search && search.length > 0) {
            whereClause += ` AND (
                so.SO_NUMBER LIKE @Search OR 
                so.Customer_Code LIKE @Search OR 
                so.New_Customer LIKE @Search OR 
                sp.SalePersonName LIKE @Search
            )`;
        }

        // Enhanced query with proper indexing hints
        const ordersQuery = `
            SELECT 
                so.[SO_ID],
                so.[SO_NUMBER],
                so.[Document_Ref],
                so.[SO_Date],
                so.[Customer_Code],
                so.[New_Customer],
                so.[Payment_TermID],
                so.[SO_SaleID],
                sp.[SalePersonName],
                sp.[Sale_Phone],
                so.[SO_Remark],
                so.[SO_AmountBeforeVat],
                so.[SO_VAT],
                so.[SO_TotalAmount],
                so.[CreateBy],
                so.[CreateDate],
                so.[UpdateBy],
                so.[UpdateDate]
            FROM [Sale_Order] so WITH (NOLOCK)
            LEFT JOIN [SalePerson] sp WITH (NOLOCK) ON so.[SO_SaleID] = sp.[SalePerson_ID]
            ${whereClause}
            ORDER BY so.[CreateDate] DESC
            OFFSET @Offset ROWS
            FETCH NEXT @Limit ROWS ONLY
        `;

        const countQuery = `
            SELECT COUNT(*) as TotalCount
            FROM [Sale_Order] so WITH (NOLOCK)
            LEFT JOIN [SalePerson] sp WITH (NOLOCK) ON so.[SO_SaleID] = sp.[SalePerson_ID]
            ${whereClause}
        `;
        
        // Execute main query with enhanced error handling
        const ordersRequest = new sql.Request(pool);
        ordersRequest.input('Offset', sql.Int, offset);
        ordersRequest.input('Limit', sql.Int, limit);
        
        if (search) {
            ordersRequest.input('Search', sql.NVarChar, `%${search}%`);
        }
        
        const ordersResult = await ordersRequest.query(ordersQuery);
        console.log("ORDERS QUERY SUCCESS: Retrieved", ordersResult.recordset.length, "orders");

        // Execute count query with separate request instance
        const countRequest = new sql.Request(pool);
        
        if (search) {
            countRequest.input('Search', sql.NVarChar, `%${search}%`);
        }
        
        const countResult = await countRequest.query(countQuery);
        const totalCount = countResult.recordset[0].TotalCount;
        console.log("COUNT QUERY SUCCESS: Total orders count:", totalCount);

        // Enhanced pagination calculations
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        const formattedOrders = ordersResult.recordset.map((order, index) => {
            try {
                return {
                    orderId: order.SO_ID,
                    orderNumber: order.SO_NUMBER || `ORDER-${order.SO_ID}`,
                    customerCode: order.Customer_Code || null,
                    newCustomer: order.New_Customer || null,
                    orderDate: order.SO_Date,
                    documentRef: order.Document_Ref || '',
                    paymentTermId: order.Payment_TermID || null,
                    salespersonId: order.SO_SaleID || null,
                    salesperson: {
                        id: order.SO_SaleID || null,
                        name: order.SalePersonName || 'ไม่ระบุ',
                        phone: order.Sale_Phone || 'ไม่ระบุ'
                    },
                    remark: order.SO_Remark || '',
                    amountBeforeVat: parseFloat(order.SO_AmountBeforeVat) || 0,
                    vat: parseFloat(order.SO_VAT) || 0,
                    totalAmount: parseFloat(order.SO_TotalAmount) || 0,
                    amounts: {
                        beforeVat: parseFloat(order.SO_AmountBeforeVat) || 0,
                        vat: parseFloat(order.SO_VAT) || 0,
                        total: parseFloat(order.SO_TotalAmount) || 0
                    },
                    auditInfo: {
                        createBy: order.CreateBy,
                        createDate: order.CreateDate,
                        updateBy: order.UpdateBy,
                        updateDate: order.UpdateDate
                    }
                };
            } catch (formatError) {
                console.log("Warning: Error formatting order", order.SO_ID, ":", formatError.message);
                return {
                    orderId: order.SO_ID,
                    orderNumber: order.SO_NUMBER || `ORDER-${order.SO_ID}`,
                    customerCode: null,
                    newCustomer: null,
                    orderDate: order.SO_Date,
                    documentRef: '',
                    paymentTermId: null,
                    salespersonId: null,
                    salesperson: { id: null, name: 'ไม่ระบุ', phone: 'ไม่ระบุ' },
                    remark: '',
                    amountBeforeVat: 0,
                    vat: 0,
                    totalAmount: 0,
                    amounts: { beforeVat: 0, vat: 0, total: 0 },
                    auditInfo: { createBy: null, createDate: null, updateBy: null, updateDate: null }
                };
            }
        });

        console.log("DATA FORMATTING SUCCESS: Formatted", formattedOrders.length, "orders");

        return {
            success: true,
            message: "Sale orders retrieved successfully for AdminPanel",
            data: {
                orders: formattedOrders,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalRecords: totalCount,
                    recordsPerPage: limit,
                    hasNextPage: hasNextPage,
                    hasPrevPage: hasPrevPage,
                    recordsOnPage: formattedOrders.length,
                    offset: offset
                }
            }
        };

    } catch (error) {
        console.log("=== ERROR OCCURRED ===");
        console.log("ERROR MESSAGE:", error.message);

        let errorType = 'UnknownError';
        let statusCode = 500;
        
        if (error.message.includes('Connection')) {
            errorType = 'ConnectionError';
            statusCode = 503;
        } else if (error.message.includes('Timeout')) {
            errorType = 'TimeoutError';
            statusCode = 408;
        } else if (error.message.includes('Invalid')) {
            errorType = 'ValidationError';
            statusCode = 400;
        }

        return {
            success: false,
            message: error.message || 'An unexpected error occurred while retrieving sale orders',
            error: {
                type: errorType,
                details: error.message,
                timestamp: new Date().toISOString(),
                connectionRetries: retryCount,
                statusCode: statusCode
            },
            data: {
                orders: [],
                pagination: {
                    currentPage: 0,
                    totalPages: 0,
                    totalRecords: 0,
                    recordsPerPage: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                    recordsOnPage: 0,
                    offset: 0
                }
            }
        };

    } finally {
        // Enhanced connection cleanup with proper error handling
        try {
            if (pool) {
                if (pool.connected) {
                    await pool.close();
                    console.log("DATABASE SUCCESS: Database connection closed");
                }
            }
        } catch (closeError) {
            console.log("DATABASE ERROR: Error during connection cleanup:", closeError.message);
            
            try {
                if (pool && typeof pool.close === 'function') {
                    pool.close();
                }
            } catch (forceCloseError) {
                console.log("DATABASE CRITICAL: Failed to force close connection:", forceCloseError.message);
            }
        }
    }
}

async function GetCreditTerms() {
    console.log("=== GetCreditTerms Service Called ===");
    
    const pool = await sql.connect(config.sql);
    
    try {
        const query = `
            SELECT 
                CT_ID,
                CreditTerm_Name
            FROM Credit_Term
            ORDER BY CT_ID
        `;
        
        console.log("=== Executing Credit Terms Query ===");
        const request = new sql.Request(pool);
        const result = await request.query(query);
        
        console.log("Credit Terms retrieved:", result.recordset.length, "records");
        
        // Log ข้อมูลตัวอย่าง
        if (result.recordset.length > 0) {
            console.log("Sample data:", result.recordset.slice(0, 3));
        }
        
        return {
            success: true,
            message: "Credit terms retrieved successfully",
            data: result.recordset
        };
        
    } catch (error) {
        console.log("ERROR in GetCreditTerms:", error.message);
        return {
            success: false,
            message: error.message || 'Failed to retrieve credit terms',
            error: {
                type: error.name || 'UnknownError',
                details: error.message,
                timestamp: new Date().toISOString()
            }
        };
    } finally {
        try {
            console.log("DATABASE: Closing database connection...");
            pool.close();
            console.log("DATABASE SUCCESS: Database connection closed");
        } catch (closeError) {
            console.log("DATABASE ERROR: Error closing connection:", closeError.message);
        }
    }
}
// ฟังก์ชันช่วยคำนวณเวลาที่ผ่านมา
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds} วินาทีที่แล้ว`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} นาทีที่แล้ว`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ชั่วโมงที่แล้ว`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} วันที่แล้ว`;
    }
}

// =================================================================
// อัพเดท module.exports ให้รวมฟังก์ชันใหม่
// =================================================================



module.exports = {
    CreateOrder,
    GetAllOrders,
    GetSalePersonByName,
    DebugSalespersonData,
    VerifyLatestOrder,
    GetDashboardStats,
    GetRevenueChart,
    GetRecentActivities,
    UpdateSaleOrder,
    GetSaleOrdersList,
    GetCreditTerms   
};