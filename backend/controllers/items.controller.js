const ItemService = require("../service/items.service");
const XLSX = require('xlsx');
const multer = require('multer');

// กำหนด multer สำหรับรับไฟล์ Excel
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('กรุณาอัปโหลดไฟล์ Excel (.xlsx, .xls) เท่านั้น'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // จำกัด 10MB
  }
});

// API สำหรับ Import Food Items จาก Excel
exports.ImportFoodItems = async (req, res) => {
  try {
    console.log("=== ImportFoodItems API Called ===");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "กรุณาเลือกไฟล์ Excel",
        timestamp: new Date().toISOString()
      });
    }

    console.log("File uploaded:", {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Parse ไฟล์ Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const parsedData = XLSX.utils.sheet_to_json(worksheet);

    console.log("Excel parsed successfully, rows:", parsedData.length);

    if (parsedData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบข้อมูลในไฟล์ Excel",
        timestamp: new Date().toISOString()
      });
    }

    // ตรวจสอบ columns ที่จำเป็น
    const requiredColumns = ['LOT', 'Item code', 'Description'];
    const firstRow = parsedData[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: `ไม่พบคอลัมน์ที่จำเป็น: ${missingColumns.join(', ')}`,
        availableColumns: Object.keys(firstRow),
        timestamp: new Date().toISOString()
      });
    }

    // เรียกใช้ service สำหรับ import
    const importResult = await ItemService.BulkImportFoodItems(parsedData);

    console.log(`Import completed: ${importResult.successful} successful, ${importResult.failed} failed`);

    // สร้าง response message ที่ละเอียด
    let message = "Import ข้อมูล Food Items สำเร็จ";
    if (importResult.summary) {
      const { successful, failed } = importResult.summary;
      let details = [];
      
      if (successful > 0) details.push(`เพิ่มข้อมูล ${successful} รายการ`);
      if (failed > 0) details.push(`ล้มเหลว ${failed} รายการ`);
      
      if (details.length > 0) {
        message += ` (${details.join(', ')})`;
      }
    }

    res.status(200).json({
      success: true,
      message: message,
      data: {
        filename: req.file.originalname,
        totalRows: parsedData.length,
        successful: importResult.successful,
        failed: importResult.failed,
        details: importResult.details,
        summary: importResult.summary || {
          total: parsedData.length,
          successful: importResult.successful,
          failed: importResult.failed
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error importing food items:", error);
    
    let errorMessage = "เกิดข้อผิดพลาดในการ Import ข้อมูล Food Items";
    let statusCode = 500;
    
    if (error.message.includes('กรุณาอัปโหลดไฟล์')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      statusCode = 400;
      errorMessage = "ไฟล์มีขนาดใหญ่เกินไป (จำกัด 10MB)";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: {
        type: "IMPORT_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Middleware สำหรับ upload ไฟล์
exports.uploadFoodFileMiddleware = upload.single('foodExcelFile');

exports.Getlist_FoodItems = async (req, res) => {
  try {
    let result_data = await ItemService.Getlist_FoodItems();

    res.status(200).json({
      success: true,
      message: "Food items fetched successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch food items",
      error: error.message,
    });
  }
};

exports.Getlist_GeneralItems = async (req, res) => {
  try {
    let result_data = await ItemService.Getlist_GeneralItems();

    res.status(200).json({
      success: true,
      message: "General items fetched successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error fetching general items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch general items",
      error: error.message,
    });
  }
};

exports.Getlist_Items = async (req, res) => {
  try {
    let result_data = await ItemService.Getlist_Items();

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

exports.Getlist_ItemsById = async (req, res) => {
  try {
    const { I_ItemID } = req.body;
    let result_data = await ItemService.Getlist_ItemsById(I_ItemID);

    res.status(200).json({
      success: true,
      message: "Item retrieved successfully",
      data: result_data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch item",
      error: error.message,
    });
  }
};

exports.AddItem = async (req, res) => {
  try {
    const { SO_ID } = req.body;
    let result_data = await ItemService.AddItem(SO_ID);

    res.status(200).json({
      success: true,
      message: "Item added successfully",
      data: result_data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add item",
      error: error.message,
    });
  }
};

// API สำหรับดาวน์โหลด Template Excel สำหรับราคากลาง
exports.DownloadCenterPriceTemplate = async (req, res) => {
  try {
    console.log("=== DownloadCenterPriceTemplate API Called ===");

    const items = await ItemService.Getlist_Items();
    
    if (!items || items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลสินค้าในระบบ"
      });
    }

    const templateData = items.map(item => ({
      'I_ItemNo': item.I_ItemNo,
      'I_ItemDescriptionEN': item.I_ItemDescriptionEN || '',
      'I_ItemDescriptionTH': item.I_ItemDescriptionTH || '', 
      'Current_Price': item.Pricelist || 0,
      'New_Center_Price': ''
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Center Price Template");

    ws['!cols'] = [
      { width: 15 }, { width: 40 }, { width: 40 }, { width: 15 }, { width: 20 }
    ];

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Center_Price_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    console.log(`Template generated with ${items.length} items`);
    return res.send(excelBuffer);

  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้าง Template",
      error: error.message
    });
  }
};

// API สำหรับ Import ราคากลางจาก Excel - แก้ไขแล้ว
exports.ImportCenterPrice = async (req, res) => {
  try {
    console.log("=== ImportCenterPrice API Called ===");

    const { centerPrices } = req.body;

    if (!centerPrices || !Array.isArray(centerPrices)) {
      return res.status(400).json({
        success: false,
        message: "กรุณาส่งข้อมูลราคากลางในรูปแบบ Array",
        error: {
          type: "VALIDATION_ERROR",
          message: "centerPrices is required and must be an array"
        },
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Processing ${centerPrices.length} items from frontend`);

    if (centerPrices.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่มีข้อมูลราคากลางที่จะอัปเดท",
        error: {
          type: "VALIDATION_ERROR",
          message: "Empty centerPrices array"
        },
        timestamp: new Date().toISOString()
      });
    }

    const validData = [];
    const errors = [];

    for (let i = 0; i < centerPrices.length; i++) {
      const item = centerPrices[i];
      const rowNum = i + 2;

      // ตรวจสอบรหัสสินค้า (บังคับ)
      if (!item.itemNo || item.itemNo.toString().trim() === '') {
        errors.push(`รายการที่ ${rowNum}: ไม่พบรหัสสินค้า`);
        continue;
      }

      // ตรวจสอบราคากลางใหม่ (รองรับเซลล์ว่าง)
      let newPrice = null;
      let isValid = true;

      if (item.newPrice === null || item.newPrice === undefined || 
          item.newPrice === '' || item.newPrice.toString().trim() === '') {
        // กรณีเซลล์ว่าง = ลบราคา
        newPrice = null;
        console.log(`Row ${rowNum}: Will clear price for ${item.itemNo}`);
      } else {
        // กรณีมีค่า = ตรวจสอบว่าเป็นตัวเลขที่ถูกต้องหรือไม่
        const parsedPrice = parseFloat(item.newPrice);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
          errors.push(`รายการที่ ${rowNum}: ราคาไม่ถูกต้อง (${item.newPrice}) ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0`);
          isValid = false;
        } else {
          newPrice = parsedPrice;
          console.log(`Row ${rowNum}: Will update price for ${item.itemNo} to ${newPrice}`);
        }
      }

      if (isValid) {
        validData.push({
          itemNo: item.itemNo.toString().trim(),
          newPrice: newPrice
        });
      }
    }

    console.log(`Validation completed: ${validData.length} valid, ${errors.length} errors`);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "พบข้อผิดพลาดในข้อมูล",
        errors: errors,
        validCount: validData.length,
        error: {
          type: "VALIDATION_ERROR",
          message: `Found ${errors.length} validation errors`
        },
        timestamp: new Date().toISOString()
      });
    }

    if (validData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่มีข้อมูลที่ถูกต้องสำหรับการอัปเดท",
        error: {
          type: "VALIDATION_ERROR",
          message: "No valid data found"
        },
        timestamp: new Date().toISOString()
      });
    }

    const updateResults = await ItemService.BulkUpdateCenterPrices(validData);

    console.log(`Update completed: ${updateResults.successful} successful, ${updateResults.failed} failed`);

    // สร้าง response message ที่ละเอียด
    let message = "Import ราคากลางสำเร็จ";
    if (updateResults.summary) {
      const { updated, cleared, failed } = updateResults.summary;
      let details = [];
      
      if (updated > 0) details.push(`อัปเดต ${updated} รายการ`);
      if (cleared > 0) details.push(`ลบราคา ${cleared} รายการ`);
      if (failed > 0) details.push(`ล้มเหลว ${failed} รายการ`);
      
      if (details.length > 0) {
        message += ` (${details.join(', ')})`;
      }
    }

    res.status(200).json({
      success: true,
      message: message,
      data: {
        totalItems: centerPrices.length,
        successful: updateResults.successful,
        failed: updateResults.failed,
        details: updateResults.details,
        summary: updateResults.summary || {
          total: centerPrices.length,
          updated: 0,
          cleared: 0,
          failed: updateResults.failed
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error importing center prices:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการ Import ราคากลาง",
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

// API สำหรับอัพเดทราคาสินค้าเดี่ยว
exports.UpdateItemPrice = async (req, res) => {
  try {
    const { I_ItemID, newPrice } = req.body;

    if (!I_ItemID) {
      return res.status(400).json({
        success: false,
        message: "I_ItemID is required"
      });
    }

    if (newPrice === undefined || newPrice === null) {
      return res.status(400).json({
        success: false,
        message: "newPrice is required"
      });
    }

    if (newPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "ราคาต้องมากกว่าหรือเท่ากับ 0"
      });
    }

    const result = await ItemService.UpdateItemPrice(I_ItemID, newPrice);

    res.status(200).json({
      success: true,
      message: "อัพเดทราคาสินค้าสำเร็จ",
      data: result
    });

  } catch (error) {
    console.error("Error updating item price:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถอัพเดทราคาสินค้าได้",
      error: error.message
    });
  }
};


exports.GetPaymentTerms = async (req, res) => {
  try {
    let result_data = await ItemService.GetPaymentTerms();

    res.status(200).json({
      success: true,
      message: "Payment terms fetched successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error fetching payment terms:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment terms",
      error: error.message,
    });
  }
};

exports.DownloadPaymentTermsTemplate = async (req, res) => {
  try {
    console.log("=== DownloadPaymentTermsTemplate API Called ===");

    const paymentTerms = await ItemService.GetPaymentTerms();
    
    if (!paymentTerms || paymentTerms.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลเงื่อนไขการชำระเงินในระบบ"
      });
    }

    const templateData = paymentTerms.map(term => ({
      'CT_ID': term.CT_ID,
      'Current_Term_Name': term.CreditTerm_Name || '',
      'New_Term_Name': ''
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payment Terms Template");

    ws['!cols'] = [
      { width: 10 }, // CT_ID
      { width: 40 }, // Current_Term_Name
      { width: 40 }  // New_Term_Name
    ];

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Payment_Terms_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    console.log(`Template generated with ${paymentTerms.length} payment terms`);
    return res.send(excelBuffer);

  } catch (error) {
    console.error("Error generating payment terms template:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้าง Template",
      error: error.message
    });
  }
};

exports.ImportPaymentTerms = async (req, res) => {
  try {
    console.log("=== ImportPaymentTerms API Called ===");

    const { paymentTermsData } = req.body;

    if (!paymentTermsData || !Array.isArray(paymentTermsData)) {
      return res.status(400).json({
        success: false,
        message: "กรุณาส่งข้อมูลเงื่อนไขการชำระเงินในรูปแบบ Array",
        timestamp: new Date().toISOString()
      });
    }

    if (paymentTermsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่มีข้อมูลเงื่อนไขการชำระเงินที่จะอัพเดต",
        timestamp: new Date().toISOString()
      });
    }

    const validData = [];
    const errors = [];

    for (let i = 0; i < paymentTermsData.length; i++) {
      const item = paymentTermsData[i];
      const rowNum = i + 1;

      if (!item.termId || item.termId.toString().trim() === '') {
        errors.push(`รายการที่ ${rowNum}: ไม่พบรหัสเงื่อนไข`);
        continue;
      }

      if (!item.newName || item.newName.toString().trim() === '') {
        errors.push(`รายการที่ ${rowNum}: ไม่พบชื่อเงื่อนไขใหม่`);
        continue;
      }

      const termId = parseInt(item.termId);
      if (isNaN(termId) || termId <= 0) {
        errors.push(`รายการที่ ${rowNum}: รหัสเงื่อนไขไม่ถูกต้อง`);
        continue;
      }

      validData.push({
        termId: termId,
        newName: item.newName.toString().trim()
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "พบข้อผิดพลาดในข้อมูล",
        errors: errors,
        timestamp: new Date().toISOString()
      });
    }

    const updateResults = await ItemService.BulkUpdatePaymentTerms(validData);

    res.status(200).json({
      success: true,
      message: "Import เงื่อนไขการชำระเงินสำเร็จ",
      data: {
        totalItems: paymentTermsData.length,
        successful: updateResults.successful,
        failed: updateResults.failed,
        details: updateResults.details
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error importing payment terms:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการ Import เงื่อนไขการชำระเงิน",
      error: {
        type: "SYSTEM_ERROR",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};