const SalePersonService = require("../service/saleperson.service");

exports.Getlist_SalesPerson = async (req, res) => {
  try {
    let result_data = await SalePersonService.Getlist_SalesPerson();

    if (result_data.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No data found",
        error: "No matching Saleperson found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Saleperson Search successfully",
      data: result_data,
    });
  } catch (error) {
    console.error("Error fetching Saleperson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Saleperson",
      error: error.message,
    });
  }
};

// Login Function - อัพเดต systemUser audit fields
exports.login = async (req, res) => {
  try {
    const { su_code, su_password } = req.body;

    // Validation
    if (!su_code || !su_password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน",
        error: "Username and password are required"
      });
    }

    // Authenticate user
    const user = await SalePersonService.authenticateUser(su_code, su_password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง",
        error: "Invalid credentials"
      });
    }

    // อัพเดต Login History ใน systemUser
    await SalePersonService.updateUserLoginHistory(user.su_id, user.su_code);

    // Login successful
    res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      data: {
        su_id: user.su_id,
        su_code: user.su_code,
        name: `${user.su_firstName_en} ${user.su_lastName_th}`,
        su_role: user.su_role,
        loginTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      error: error.message,
    });
  }
};

exports.addSalePerson = async (req, res) => {
  try {
    const { salePersonId, salePersonName, salePhone, saleEmail, signatureUrl } = req.body;

    // Validation - เพิ่ม signatureUrl (optional)
    if (!salePersonId || !salePersonName || !salePhone) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
        error: "salePersonId, salePersonName, salePhone are required"
      });
    }

    const result = await SalePersonService.addSalePerson({
      salePersonId,
      salePersonName,
      salePhone,
      saleEmail: saleEmail || null,
      signatureUrl: signatureUrl || null
    });

    res.status(201).json({
      success: true,
      message: "เพิ่มพนักงานขายสำเร็จ",
      data: result
    });

  } catch (error) {
    console.error("Error adding saleperson:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มพนักงานขาย",
      error: error.message,
    });
  }
};

exports.uploadSignature = async (req, res) => {
  try {
    const { salePersonId } = req.body;
    const file = req.file;

    if (!salePersonId || !file) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ salePersonId และไฟล์รูป"
      });
    }

    const result = await SalePersonService.updateSignature(
      salePersonId, 
      file.buffer, 
      file.mimetype
    );

    res.json({ 
      success: true, 
      message: "อัปโหลด signature สำเร็จ",
      data: result 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.getSignature = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await SalePersonService.getSignatureById(id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.importExcel = async (req, res) => {
  try {
    // รับข้อมูลจาก JSON body แทน file
    const excelData = req.body;

    if (!excelData || !Array.isArray(excelData)) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ถูกต้อง",
        error: "Invalid data format"
      });
    }

    console.log("=== Excel Import Started ===");
    console.log("Data received:", excelData.length, "records");

    if (excelData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่มีข้อมูลสำหรับ Import",
        error: "Empty data"
      });
    }

    // เรียก service เพื่อ import ข้อมูล
    const result = await SalePersonService.importSalePersonsFromExcel(excelData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          total: result.data.total,
          success: result.data.success.length,
          failed: result.data.failed.length,
          successList: result.data.success,
          failedList: result.data.failed
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }

  } catch (error) {
    console.error("Error in importExcel controller:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการ Import Excel",
      error: error.message,
    });
  }
};

exports.addSalePersonAutoId = async (req, res) => {
  try {
    const { salePersonName, salePhone, saleEmail, signatureUrl } = req.body;

    // Validation
    if (!salePersonName || !salePhone) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อและเบอร์โทรศัพท์",
        error: "salePersonName and salePhone are required"
      });
    }

    // เตรียมข้อมูลสำหรับ service
    const salePersonData = {
      salePersonName: salePersonName.trim(),
      salePhone: salePhone.trim(),
      saleEmail: saleEmail ? saleEmail.trim() : null,
      signatureUrl: signatureUrl ? signatureUrl.trim() : null,
      isActive: true
    };

    const result = await SalePersonService.addSalePersonWithAutoId(salePersonData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }

  } catch (error) {
    console.error("Error in addSalePersonAutoId controller:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มพนักงานขาย",
      error: error.message,
    });
  }
};

exports.updateSalePersonStatus = async (req, res) => {
  try {
    const { salePersonId, isActive } = req.body;

    // Validation
    if (!salePersonId) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรหัสพนักงาน",
        error: "salePersonId is required"
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุสถานะที่ถูกต้อง",
        error: "isActive must be boolean"
      });
    }

    const result = await SalePersonService.updateSalePersonStatus(salePersonId, isActive);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        salePersonId: salePersonId,
        isActive: isActive,
        affectedRows: result.affectedRows
      }
    });

  } catch (error) {
    console.error("Error updating sale person status:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดทสถานะ",
      error: error.message,
    });
  }
};

exports.downloadTemplate = async (req, res) => {
  try {
    console.log("=== Download Template Called ===");
    console.log("Request method:", req.method);
    console.log("Request path:", req.path);
    
    const XLSX = require('xlsx');

    // สร้างข้อมูลตัวอย่างสำหรับ template (ลบ Sale_Signature_URL ออก)
    const templateData = [
      {
        SalePersonName: "สมชาย ใจดี",
        Sale_Phone: "081-234-5678",
        Sale_Email: "somchai@company.com",
        IsActive: 1
      },
      {
        SalePersonName: "สมหญิง รักงาน",
        Sale_Phone: "089-876-5432", 
        Sale_Email: "somying@company.com",
        IsActive: 1
      }
    ];

    console.log("Template columns:", Object.keys(templateData[0]));

    // สร้าง workbook และ worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // กำหนดความกว้างของคอลัมน์ (ลดจำนวนคอลัมน์ลง)
    ws['!cols'] = [
      { width: 25 }, // SalePersonName
      { width: 15 }, // Sale_Phone
      { width: 30 }, // Sale_Email
      { width: 30 }  // IsActive
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'SalePerson_Template');

    // สร้างไฟล์ Excel buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    console.log("Excel buffer created, size:", buffer.length);

    // ส่งไฟล์ให้ download
    res.setHeader('Content-Disposition', 'attachment; filename=SalePerson_Template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    res.send(buffer);
    
    console.log("Template download completed successfully");

  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้าง Template",
      error: error.message
    });
  }
};

// เพิ่มใน saleperson.controller.js

exports.updateSalePerson = async (req, res) => {
  try {
    const { 
      salePersonId, 
      salePersonName, 
      salePhone, 
      saleEmail, 
      signatureImage, 
      signatureContentType 
    } = req.body;

    // Validation
    if (!salePersonId || !salePersonName || !salePhone) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
        error: "salePersonId, salePersonName, salePhone are required"
      });
    }

    // เตรียมข้อมูลสำหรับ service
    const updateData = {
      salePersonId: parseInt(salePersonId),
      salePersonName: salePersonName.trim(),
      salePhone: salePhone.trim(),
      saleEmail: saleEmail ? saleEmail.trim() : null,
      signatureImage: signatureImage || null,
      signatureContentType: signatureContentType || null
    };

    console.log('Updating sale person:', updateData.salePersonId);

    const result = await SalePersonService.updateSalePerson(updateData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }

  } catch (error) {
    console.error("Error updating sale person:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดตข้อมูลพนักงานขาย",
      error: error.message,
    });
  }
};