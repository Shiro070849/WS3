const config = require("../config/Mssql.config");
const sql = require("mssql");

async function Getlist_Items() {
  try {
    const Query = `
      SELECT I_ItemID, I_ItemNo, I_ItemDescriptionEN, I_ItemDescriptionTH, U_DescriptionEN, IG_Description, Pricelist, IT.Is_Active
      FROM Items AS IT
      LEFT JOIN Unit AS U ON IT.I_UID = U.U_ID
      LEFT JOIN Item_Group AS IG ON IT.IG_ID = IG.IG_ID
    `;

    let pool = await sql.connect(config.sql);
    const eventsList = await pool.request().query(Query);

    if (eventsList.recordset.length > 0) {
      return eventsList.recordset;
    } else {
      console.log("No data found");
      return [];
    }
  } catch (error) {
    console.error("Error in database query:", error.message);
    throw error;
  }
}

async function Getlist_ItemsById(I_ItemID) {
  try {
    var Query =
      "SELECT I_ItemID, I_ItemNo, I_ItemDescriptionEN, I_ItemDescriptionTH, U_DescriptionEN, IG_Description, Pricelist, IT.Is_Active " +
      "FROM Items as IT " +
      "LEFT JOIN Unit as U ON IT.I_UID = U.U_ID " +
      "LEFT JOIN Item_Group as IG ON IT.IG_ID = IG.IG_ID " +
      "WHERE I_ItemID = @I_ItemID";

    let pool = await sql.connect(config.sql);
    const result = await pool
      .request()
      .input("I_ItemID", sql.Int, I_ItemID)
      .query(Query);

    return result.recordset;
  } catch (error) {
    console.log(error.message);
  }
}

async function UpdateItemPrice(I_ItemID, newPrice) {
  try {
    const Query = `
      UPDATE Items 
      SET Pricelist = @Pricelist, I_UpdateDate = GETDATE()
      WHERE I_ItemID = @I_ItemID
    `;

    let pool = await sql.connect(config.sql);
    const result = await pool
      .request()
      .input("I_ItemID", sql.Int, I_ItemID)
      .input("Pricelist", sql.Decimal(18, 2), newPrice)
      .query(Query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Price updated successfully" };
    } else {
      throw new Error("ไม่พบสินค้าที่ต้องการอัพเดท");
    }
  } catch (error) {
    console.error("Error updating item price:", error.message);
    throw error;
  }
}

async function BulkUpdateCenterPrices(priceData) {
  try {
    let pool = await sql.connect(config.sql);
    let successful = 0;
    let failed = 0;
    let details = [];

    for (const item of priceData) {
      try {
        // **ขั้นตอนที่ 1: ดึงราคาเก่าและ I_ItemID**
        const selectQuery = `
          SELECT I_ItemID, Pricelist as CurrentPrice 
          FROM Items 
          WHERE I_ItemNo = @I_ItemNo
        `;

        const selectResult = await pool
          .request()
          .input("I_ItemNo", sql.VarChar(50), item.itemNo)
          .query(selectQuery);

        if (selectResult.recordset.length === 0) {
          failed++;
          details.push({
            itemNo: item.itemNo,
            status: 'failed',
            error: 'ไม่พบรหัสสินค้า'
          });
          continue;
        }

        const currentItem = selectResult.recordset[0];
        const oldPrice = currentItem.CurrentPrice;
        const itemId = currentItem.I_ItemID;

        // **ขั้นตอนที่ 2: ตรวจสอบและจัดการราคาใหม่**
        let newPrice = null;
        let actionType = '';

        if (item.newPrice === null || item.newPrice === undefined || 
            item.newPrice === '' || item.newPrice.toString().trim() === '') {
          // กรณีเซลล์ว่าง = ลบราคา (เซ็ต NULL)
          newPrice = null;
          actionType = 'cleared';
        } else {
          // กรณีมีค่า = อัปเดตราคา
          const parsedPrice = parseFloat(item.newPrice);
          if (!isNaN(parsedPrice) && parsedPrice >= 0) {
            newPrice = parsedPrice;
            actionType = 'updated';
          } else {
            failed++;
            details.push({
              itemNo: item.itemNo,
              status: 'failed',
              error: 'ราคาไม่ถูกต้อง ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0'
            });
            continue;
          }
        }

        // **ขั้นตอนที่ 3: บันทึกประวัติราคา**
        const historyQuery = `
          INSERT INTO ItemPriceHistory 
          (I_ItemID, OldPrice, NewPrice, ChangeDate, ChangedBy)
          VALUES (@I_ItemID, @OldPrice, @NewPrice, GETDATE(), @ChangedBy)
        `;

        await pool
          .request()
          .input("I_ItemID", sql.Int, itemId)
          .input("OldPrice", sql.Decimal(18, 2), oldPrice)
          .input("NewPrice", sql.Decimal(18, 2), newPrice)
          .input("ChangedBy", sql.VarChar(50), "Import ราคากลาง")
          .query(historyQuery);

        // **ขั้นตอนที่ 4: อัปเดตราคาใหม่**
        const updateQuery = `
          UPDATE Items 
          SET Pricelist = @Pricelist, I_UpdateDate = GETDATE()
          WHERE I_ItemID = @I_ItemID
        `;

        const updateResult = await pool
          .request()
          .input("I_ItemID", sql.Int, itemId)
          .input("Pricelist", sql.Decimal(18, 2), newPrice)
          .query(updateQuery);

        if (updateResult.rowsAffected[0] > 0) {
          successful++;
          details.push({
            itemNo: item.itemNo,
            status: 'success',
            action: actionType,
            newPrice: newPrice,
            oldPrice: oldPrice,
            message: actionType === 'cleared' ? 'ลบราคาแล้ว (เซ็ต NULL)' : `อัปเดตราคาเป็น ${newPrice?.toLocaleString()} บาท`
          });
        } else {
          failed++;
          details.push({
            itemNo: item.itemNo,
            status: 'failed',
            error: 'ไม่สามารถอัปเดตได้'
          });
        }

      } catch (itemError) {
        failed++;
        details.push({
          itemNo: item.itemNo,
          status: 'failed',
          error: itemError.message
        });
      }
    }

    return { 
      successful, 
      failed, 
      details,
      summary: {
        total: priceData.length,
        updated: details.filter(d => d.action === 'updated').length,
        cleared: details.filter(d => d.action === 'cleared').length,
        failed: failed
      }
    };
  } catch (error) {
    console.error("Error in bulk update:", error.message);
    throw error;
  }
}

// เพิ่มฟังก์ชันนี้ใน items.service.js
async function GetPaymentTerms() {
  try {
    const Query = `
      SELECT CT_ID, CreditTerm_Name
      FROM Credit_Term
      ORDER BY CT_ID
    `;

    let pool = await sql.connect(config.sql);
    const result = await pool.request().query(Query);

    if (result.recordset.length > 0) {
      return result.recordset;
    } else {
      console.log("No payment terms found");
      return [];
    }
  } catch (error) {
    console.error("Error in GetPaymentTerms:", error.message);
    throw error;
  }
}

async function BulkUpdatePaymentTerms(paymentTermsData) {
  try {
    let pool = await sql.connect(config.sql);
    let successful = 0;
    let failed = 0;
    let details = [];

    for (const item of paymentTermsData) {
      try {
        // ขั้นตอนที่ 1: ดึงชื่อเงื่อนไขเก่า
        const selectQuery = `
          SELECT CT_ID, CreditTerm_Name as CurrentName 
          FROM Credit_Term 
          WHERE CT_ID = @CT_ID
        `;

        const selectResult = await pool
          .request()
          .input("CT_ID", sql.Int, item.termId)
          .query(selectQuery);

        if (selectResult.recordset.length === 0) {
          failed++;
          details.push({
            termId: item.termId,
            status: 'failed',
            error: 'ไม่พบรหัสเงื่อนไข'
          });
          continue;
        }

        const currentTerm = selectResult.recordset[0];
        const oldName = currentTerm.CurrentName;

        // ขั้นตอนที่ 2: บันทึกประวัติ Payment Terms
        const historyQuery = `
          INSERT INTO PaymentTermHistory 
          (CT_ID, OldTermName, NewTermName, ChangeDate, ChangedBy)
          VALUES (@CT_ID, @OldTermName, @NewTermName, GETDATE(), @ChangedBy)
        `;

        await pool
          .request()
          .input("CT_ID", sql.Int, item.termId)
          .input("OldTermName", sql.NVarChar(255), oldName)
          .input("NewTermName", sql.NVarChar(255), item.newName)
          .input("ChangedBy", sql.VarChar(50), "Import เงื่อนไขการชำระเงิน")
          .query(historyQuery);

        // ขั้นตอนที่ 3: อัปเดตชื่อเงื่อนไขใหม่
        const updateQuery = `
          UPDATE Credit_Term 
          SET CreditTerm_Name = @CreditTerm_Name
          WHERE CT_ID = @CT_ID
        `;

        const updateResult = await pool
          .request()
          .input("CT_ID", sql.Int, item.termId)
          .input("CreditTerm_Name", sql.NVarChar(255), item.newName)
          .query(updateQuery);

        if (updateResult.rowsAffected[0] > 0) {
          successful++;
          details.push({
            termId: item.termId,
            status: 'success',
            newName: item.newName,
            oldName: oldName
          });
        } else {
          failed++;
          details.push({
            termId: item.termId,
            status: 'failed',
            error: 'ไม่สามารถอัปเดตได้'
          });
        }
      } catch (itemError) {
        failed++;
        details.push({
          termId: item.termId,
          status: 'failed',
          error: itemError.message
        });
      }
    }

    return { successful, failed, details };
  } catch (error) {
    console.error("Error in bulk update payment terms:", error.message);
    throw error;
  }
}

async function BulkImportFoodItems(data) {
  try {
    let pool = await sql.connect(config.sql);
    let successful = 0;
    let failed = 0;
    let details = [];

    for (const item of data) {
      try {
        // เตรียมข้อมูลสำหรับ INSERT
        const lotCode = item.LOT ? item.LOT.toString().trim() : null;
        const itemCode = item['Item code'] ? item['Item code'].toString().trim() : null;
        const description = item.Description ? item.Description.toString().trim() : '';
        const brand = item.Brand ? item.Brand.toString().trim() : '';
        const wh = item.WH ? item.WH.toString().trim() : '';
        const size = item.Size ? item.Size.toString().trim() : '';
        const packing = item.Packing ? item.Packing.toString().trim() : '';

        // ตรวจสอบข้อมูลบังคับ
        if (!lotCode || !itemCode) {
          failed++;
          details.push({
            lotCode: lotCode || 'ไม่ระบุ',
            itemCode: itemCode || 'ไม่ระบุ',
            status: 'failed',
            error: 'ข้อมูลไม่ครบ: LOT หรือ Item code ว่างเปล่า'
          });
          continue;
        }

        // INSERT ข้อมูลเข้า Items table
        const insertQuery = `
          INSERT INTO Items 
          (LOT_Code, I_ItemNo, I_ItemDescriptionEN, I_ItemDescriptionTH, 
           I_UID, WH, Description, Size, Packing, 
           I_CreateDate, I_UpdateDate, Is_Active)
          VALUES 
          (@LOT_Code, @I_ItemNo, @I_ItemDescriptionEN, @I_ItemDescriptionTH,
           @I_UID, @WH, @Description, @Size, @Packing,
           GETDATE(), GETDATE(), 1)
        `;

        const result = await pool
          .request()
          .input("LOT_Code", sql.VarChar(50), lotCode)
          .input("I_ItemNo", sql.VarChar(50), itemCode)
          .input("I_ItemDescriptionEN", sql.VarChar(500), brand)
          .input("I_ItemDescriptionTH", sql.VarChar(500), brand)
          .input("I_UID", sql.Int, 2) // ใช้ Kg (U_ID = 2) สำหรับทุกรายการ
          .input("WH", sql.VarChar(50), wh)
          .input("Description", sql.VarChar(sql.MAX), description)
          .input("Size", sql.VarChar(200), size)
          .input("Packing", sql.VarChar(sql.MAX), packing)
          .query(insertQuery);

        if (result.rowsAffected[0] > 0) {
          successful++;
          details.push({
            lotCode: lotCode,
            itemCode: itemCode,
            status: 'success',
            message: 'เพิ่มข้อมูลสำเร็จ'
          });
        } else {
          failed++;
          details.push({
            lotCode: lotCode,
            itemCode: itemCode,
            status: 'failed',
            error: 'ไม่สามารถเพิ่มข้อมูลได้'
          });
        }

      } catch (itemError) {
        failed++;
        
        // จัดการ error แต่ละประเภท
        let errorMessage = itemError.message;
        
        if (itemError.number === 2627) {
          // Primary key violation (LOT_Code ซ้ำ)
          errorMessage = `LOT "${item.LOT}" มีในระบบแล้ว`;
        } else if (itemError.number === 547) {
          // Foreign key violation
          errorMessage = 'ข้อมูล Unit ไม่ถูกต้อง';
        }

        details.push({
          lotCode: item.LOT || 'ไม่ระบุ',
          itemCode: item['Item code'] || 'ไม่ระบุ',
          status: 'failed',
          error: errorMessage
        });
      }
    }

    return { 
      successful, 
      failed, 
      details,
      summary: {
        total: data.length,
        successful: successful,
        failed: failed
      }
    };

  } catch (error) {
    console.error("Error in BulkImportFoodItems:", error.message);
    throw error;
  }
}

async function Getlist_FoodItems() {
  try {
    const Query = `
      SELECT I_ItemID, I_ItemNo, LOT_Code, I_ItemDescriptionEN, I_ItemDescriptionTH, 
            U_DescriptionEN, IG_Description, Pricelist, IT.Is_Active,
            IT.Description, IT.Size, IT.Packing
      FROM Items AS IT
      LEFT JOIN Unit AS U ON IT.I_UID = U.U_ID
      LEFT JOIN Item_Group AS IG ON IT.IG_ID = IG.IG_ID
      WHERE LOT_Code IS NOT NULL
      ORDER BY LOT_Code ASC
    `;

    let pool = await sql.connect(config.sql);
    const eventsList = await pool.request().query(Query);

    if (eventsList.recordset.length > 0) {
      return eventsList.recordset;
    } else {
      console.log("No food items found");
      return [];
    }
  } catch (error) {
    console.error("Error in database query:", error.message);
    throw error;
  }
}

async function Getlist_GeneralItems() {
  try {
    const Query = `
      SELECT I_ItemID, I_ItemNo, I_ItemDescriptionEN, I_ItemDescriptionTH, U_DescriptionEN, IG_Description, Pricelist, IT.Is_Active
      FROM Items AS IT
      LEFT JOIN Unit AS U ON IT.I_UID = U.U_ID
      LEFT JOIN Item_Group AS IG ON IT.IG_ID = IG.IG_ID
      WHERE LOT_Code IS NULL
    `;

    let pool = await sql.connect(config.sql);
    const eventsList = await pool.request().query(Query);

    if (eventsList.recordset.length > 0) {
      return eventsList.recordset;
    } else {
      console.log("No general items found");
      return [];
    }
  } catch (error) {
    console.error("Error in database query:", error.message);
    throw error;
  }
}

module.exports = {
  Getlist_Items,
  Getlist_ItemsById,
  UpdateItemPrice,
  BulkUpdateCenterPrices,
  GetPaymentTerms,
  BulkUpdatePaymentTerms,
  BulkImportFoodItems,
  Getlist_FoodItems,
  Getlist_GeneralItems // เพิ่มบรรทัดนี้
};