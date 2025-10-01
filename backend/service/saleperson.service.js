const config = require("../config/Mssql.config");
const sql = require("mssql");

async function Getlist_SalesPerson() {
  try {
    const Query = `
      SELECT SalePerson_ID, SalePersonName, Sale_Phone, Sale_Email, 
             Sale_Signature_URL, Sale_Signature_Image, Sale_Signature_ContentType,
             IsActive
      FROM SalePerson
      ORDER BY IsActive DESC, SalePerson_ID
    `;

    let pool = await sql.connect(config.sql);
    const eventsList = await pool.request().query(Query);

    // แปลง binary เป็น base64
    const result = eventsList.recordset.map(person => {
      let signatureBase64 = null;
      if (person.Sale_Signature_Image) {
        signatureBase64 = person.Sale_Signature_Image.toString('base64');
      }
      
      return {
        ...person,
        Sale_Signature_Base64: signatureBase64
      };
    });

    return result.length > 0 ? result : [];
  } catch (error) {
    console.error("Error in database query:", error.message);
    throw error;
  }
}

// Login Authentication
async function authenticateUser(su_code, su_password) {
  try {
    const Query = `
      SELECT su_id, su_code, su_firstName_en, su_lastName_th, su_role 
      FROM systemUser 
      WHERE su_code = @su_code AND su_Password = @su_password
    `;
    
    let pool = await sql.connect(config.sql);
    const result = await pool.request()
      .input('su_code', sql.VarChar, su_code)
      .input('su_password', sql.VarChar, su_password)
      .query(Query);
    
    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error("Error in authentication query:", error.message);
    throw error;
  }
}

async function updateUserLoginHistory(su_id, su_code) {
  try {
    const Query = `
      UPDATE systemUser 
      SET 
        create_by = @su_code,
        create_date = GETDATE(),
        update_by = @su_code,
        update_date = GETDATE()
      WHERE su_id = @su_id
    `;
    
    let pool = await sql.connect(config.sql);
    await pool.request()
      .input('su_id', sql.Int, su_id)
      .input('su_code', sql.VarChar, su_code)
      .query(Query);
    
    return true;
  } catch (error) {
    console.error("Error updating user login history:", error.message);
    throw error;
  }
}

async function addSalePerson(salePersonData) {
  try {
    const Query = `
      INSERT INTO SalePerson (SalePerson_ID, SalePersonName, Sale_Phone, Sale_Email, Sale_Signature_URL)
      VALUES (@salePersonId, @salePersonName, @salePhone, @saleEmail, @signatureUrl)
    `;
    
    let pool = await sql.connect(config.sql);
    await pool.request()
      .input('salePersonId', sql.Int, salePersonData.salePersonId)
      .input('salePersonName', sql.VarChar, salePersonData.salePersonName)
      .input('salePhone', sql.VarChar, salePersonData.salePhone)
      .input('saleEmail', sql.VarChar, salePersonData.saleEmail)
      .input('signatureUrl', sql.VarChar, salePersonData.signatureUrl)
      .query(Query);
    
    return true;
  } catch (error) {
    console.error("Error adding saleperson:", error.message);
    throw error;
  }
}

async function updateSignature(salePersonId, imageBuffer, contentType) {
  try {
    const Query = `
      UPDATE SalePerson 
      SET Sale_Signature_Image = @imageData,
          Sale_Signature_ContentType = @contentType
      WHERE SalePerson_ID = @salePersonId
    `;
    
    let pool = await sql.connect(config.sql);
    await pool.request()
      .input('salePersonId', sql.Int, salePersonId)
      .input('imageData', sql.VarBinary, imageBuffer)
      .input('contentType', sql.VarChar, contentType)
      .query(Query);
    
    return { message: "Signature updated successfully" };
  } catch (error) {
    throw error;
  }
}

async function getSignatureById(salePersonId) {
  try {
    const Query = `
      SELECT SalePerson_ID, SalePersonName, Sale_Signature_Image, Sale_Signature_ContentType
      FROM SalePerson 
      WHERE SalePerson_ID = @salePersonId
    `;
    
    let pool = await sql.connect(config.sql);
    const result = await pool.request()
      .input('salePersonId', sql.Int, salePersonId)
      .query(Query);

    return result.recordset[0] || null;
  } catch (error) {
    throw error;
  }
}

async function updateSalePersonStatus(salePersonId, isActive) {
  try {
    const Query = `
      UPDATE SalePerson 
      SET IsActive = @isActive 
      WHERE SalePerson_ID = @salePersonId
    `;
    
    let pool = await sql.connect(config.sql);
    const result = await pool.request()
      .input('salePersonId', sql.Int, salePersonId)
      .input('isActive', sql.Bit, isActive)
      .query(Query);
    
    return { 
      success: true, 
      message: isActive ? 'เปิดใช้งานสำเร็จ' : 'ปิดใช้งานสำเร็จ',
      affectedRows: result.rowsAffected[0]
    };
  } catch (error) {
    console.error("Error updating SalePerson status:", error.message);
    throw error;
  }
}

async function getNextSalePersonId() {
  try {
    const query = `
      SELECT ISNULL(MAX(SalePerson_ID), 0) + 1 as NextID
      FROM SalePerson 
      WHERE SalePerson_ID < 900
    `;
    
    let pool = await sql.connect(config.sql);
    const result = await pool.request().query(query);
    
    return result.recordset[0].NextID;
  } catch (error) {
    console.error("Error getting next SalePerson ID:", error.message);
    throw error;
  }
}

async function addSalePersonWithAutoId(salePersonData) {
  try {
    // หา ID ใหม่
    const nextId = await getNextSalePersonId();
    
    const Query = `
      INSERT INTO SalePerson (
        SalePerson_ID, SalePersonName, Sale_Phone, Sale_Email, 
        Sale_Signature_URL, Sale_Signature_Image, Sale_Signature_ContentType, IsActive
      )
      VALUES (
        @salePersonId, @salePersonName, @salePhone, @saleEmail, 
        @signatureUrl, @signatureImage, @signatureContentType, @isActive
      )
    `;
    
    let pool = await sql.connect(config.sql);
    const request = pool.request()
      .input('salePersonId', sql.Int, nextId)
      .input('salePersonName', sql.NVarChar, salePersonData.salePersonName)
      .input('salePhone', sql.VarChar, salePersonData.salePhone)
      .input('saleEmail', sql.VarChar, salePersonData.saleEmail || null)
      .input('signatureUrl', sql.VarChar, salePersonData.signatureUrl || null)
      .input('signatureImage', sql.VarBinary, salePersonData.signatureImage || null)
      .input('signatureContentType', sql.VarChar, salePersonData.signatureContentType || null)
      .input('isActive', sql.Bit, salePersonData.isActive !== false ? 1 : 0);
    
    await request.query(Query);
    
    return {
      success: true,
      message: "เพิ่มพนักงานขายสำเร็จ",
      data: {
        salePersonId: nextId,
        salePersonName: salePersonData.salePersonName
      }
    };
  } catch (error) {
    console.error("Error adding saleperson with auto ID:", error.message);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มพนักงานขาย",
      error: error.message
    };
  }
}

async function importSalePersonsFromExcel(excelData) {
  try {
    console.log("=== Import SalePersons from Excel ===");
    console.log("Data received:", excelData.length, "records");
    
    const results = {
      success: [],
      failed: [],
      total: excelData.length
    };

    let pool = await sql.connect(config.sql);

    for (let i = 0; i < excelData.length; i++) {
      const person = excelData[i];
      
      try {
        // Validation
        if (!person.SalePersonName || !person.Sale_Phone) {
          results.failed.push({
            row: i + 1,
            data: person,
            error: "ชื่อและเบอร์โทรเป็นข้อมูลที่จำเป็น"
          });
          continue;
        }

        // หา ID ใหม่
        const nextId = await getNextSalePersonId();
        
        const insertQuery = `
          INSERT INTO SalePerson (
            SalePerson_ID, SalePersonName, Sale_Phone, Sale_Email, 
            Sale_Signature_URL, IsActive
          )
          VALUES (
            @salePersonId, @salePersonName, @salePhone, @saleEmail, 
            @signatureUrl, @isActive
          )
        `;
        
        const request = pool.request()
          .input('salePersonId', sql.Int, nextId)
          .input('salePersonName', sql.NVarChar, person.SalePersonName.trim())
          .input('salePhone', sql.VarChar, person.Sale_Phone.toString().trim())
          .input('saleEmail', sql.VarChar, person.Sale_Email || null)
          .input('signatureUrl', sql.VarChar, person.Sale_Signature_URL || null)
          .input('isActive', sql.Bit, person.IsActive !== false ? 1 : 0);
        
        await request.query(insertQuery);
        
        results.success.push({
          row: i + 1,
          salePersonId: nextId,
          salePersonName: person.SalePersonName
        });
        
        console.log(`Row ${i + 1}: Success - ID ${nextId}`);
        
      } catch (rowError) {
        console.error(`Row ${i + 1} error:`, rowError.message);
        results.failed.push({
          row: i + 1,
          data: person,
          error: rowError.message
        });
      }
    }

    return {
      success: true,
      message: `Import เสร็จสิ้น: สำเร็จ ${results.success.length} รายการ, ล้มเหลว ${results.failed.length} รายการ`,
      data: results
    };

  } catch (error) {
    console.error("Error importing sale persons:", error.message);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการ Import",
      error: error.message
    };
  }
}

// เพิ่มใน saleperson.service.js

async function updateSalePerson(updateData) {
  try {
    console.log("=== Update SalePerson ===");
    console.log("Data:", updateData);

    // ตรวจสอบว่าพนักงานมีอยู่จริง
    const checkQuery = `
      SELECT SalePerson_ID, SalePersonName 
      FROM SalePerson 
      WHERE SalePerson_ID = @salePersonId
    `;

    let pool = await sql.connect(config.sql);
    const checkResult = await pool.request()
      .input('salePersonId', sql.Int, updateData.salePersonId)
      .query(checkQuery);

    if (checkResult.recordset.length === 0) {
      return {
        success: false,
        message: "ไม่พบข้อมูลพนักงานที่ต้องการแก้ไข",
        error: "SalePerson not found"
      };
    }

    // สร้าง query และ parameters แบบ dynamic
    let updateFields = [];
    let queryParams = [];

    // ข้อมูลพื้นฐานที่ต้องอัพเดตเสมอ
    updateFields.push("SalePersonName = @salePersonName");
    updateFields.push("Sale_Phone = @salePhone");
    updateFields.push("Sale_Email = @saleEmail");

    queryParams.push(
      { name: 'salePersonName', type: sql.NVarChar, value: updateData.salePersonName },
      { name: 'salePhone', type: sql.VarChar, value: updateData.salePhone },
      { name: 'saleEmail', type: sql.VarChar, value: updateData.saleEmail }
    );

    // ถ้ามีรูปลายเซ็นใหม่
    if (updateData.signatureImage && updateData.signatureContentType) {
      updateFields.push("Sale_Signature_Image = @signatureImage");
      updateFields.push("Sale_Signature_ContentType = @signatureContentType");
      
      // แปลง base64 เป็น buffer
      const imageBuffer = Buffer.from(updateData.signatureImage, 'base64');
      
      queryParams.push(
        { name: 'signatureImage', type: sql.VarBinary, value: imageBuffer },
        { name: 'signatureContentType', type: sql.VarChar, value: updateData.signatureContentType }
      );
    }

    // สร้าง UPDATE query
    const updateQuery = `
      UPDATE SalePerson 
      SET ${updateFields.join(', ')}
      WHERE SalePerson_ID = @salePersonId
    `;

    // Execute query
    const request = pool.request();
    
    // เพิ่ม parameters
    queryParams.forEach(param => {
      request.input(param.name, param.type, param.value);
    });
    request.input('salePersonId', sql.Int, updateData.salePersonId);

    const result = await request.query(updateQuery);

    console.log("Update result:", result.rowsAffected);

    return {
      success: true,
      message: "อัพเดตข้อมูลพนักงานขายสำเร็จ",
      data: {
        salePersonId: updateData.salePersonId,
        salePersonName: updateData.salePersonName,
        affectedRows: result.rowsAffected[0],
        hasNewSignature: !!(updateData.signatureImage && updateData.signatureContentType)
      }
    };

  } catch (error) {
    console.error("Error updating sale person:", error.message);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพเดตข้อมูล",
      error: error.message
    };
  }
}

// แก้ไข module.exports เพิ่ม function ใหม่
module.exports = {
  Getlist_SalesPerson,
  authenticateUser,
  updateUserLoginHistory,
  addSalePerson,
  addSalePersonWithAutoId,
  getNextSalePersonId,
  importSalePersonsFromExcel,
  updateSignature,
  getSignatureById,
  updateSalePersonStatus,
  updateSalePerson  // เพิ่มบรรทัดนี้
};