const config = require("../config/Mssql.config");
const sql = require("mssql");
const nodemailer = require('nodemailer');
const pdf = require('html-pdf');
const fs = require("fs");
const archiver = require('archiver');

// ==================== UTILITY FUNCTIONS ====================

/**
 * แปลงตัวเลขเป็นข้อความภาษาไทย (รองรับทศนิยม บาท/สตางค์)
 */
function numberToThaiText(number) {
    const txtNumArr = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const txtDigitArr = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
    
    if (number === 0) return "ศูนย์บาทถ้วน";
    
    // แยกส่วนจำนวนเต็มและทศนิยม
    const parts = number.toString().split('.');
    const integerPart = parseInt(parts[0]);
    const decimalPart = parts[1] ? parseInt(parts[1].padEnd(2, '0').substr(0, 2)) : 0;
    
    let result = "";
    
    // แปลงส่วนจำนวนเต็ม (บาท)
    if (integerPart > 0) {
        result += convertIntegerToThai(integerPart) + "บาท";
    } else {
        result += "ศูนย์บาท";
    }
    
    // แปลงส่วนทศนิยม (สตางค์)
    if (decimalPart > 0) {
        result += convertIntegerToThai(decimalPart) + "สตางค์";
    } else {
        result += "ถ้วน";
    }
    
    return result;
}

/**
 * แปลงจำนวนเต็มเป็นข้อความภาษาไทย
 */
function convertIntegerToThai(number) {
    const txtNumArr = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const txtDigitArr = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
    
    if (number === 0) return "";
    if (number >= 10000000) {
        // รองรับกว่าล้าน
        const million = Math.floor(number / 1000000);
        const remainder = number % 1000000;
        let result = convertIntegerToThai(million) + "ล้าน";
        if (remainder > 0) {
            result += convertIntegerToThai(remainder);
        }
        return result;
    }
    
    const numberStr = number.toString();
    const len = numberStr.length;
    let result = "";
    
    for (let i = 0; i < len; i++) {
        const digit = parseInt(numberStr.charAt(i));
        const position = len - i - 1;
        
        if (digit !== 0) {
            if (position === 1 && digit === 1) {
                // กรณีหลักสิบและเลข 1 เช่น 15 -> สิบห้า
                result += "สิบ";
            } else if (position === 1 && digit === 2) {
                // กรณี 2 ในหลักสิบ -> ยี่สิบ
                result += "ยี่สิบ";
            } else if (position === 0 && digit === 1 && len > 1) {
                // กรณี หน่วยเลข 1 ที่ไม่ใช่เลขตัวเดียว เช่น 21 -> ยี่สิบเอ็ด
                result += "เอ็ด";
            } else {
                result += txtNumArr[digit] + txtDigitArr[position];
            }
        }
    }
    
    return result;
}

/**
 * สร้างชื่อไฟล์ด้วย timestamp
 */
function generateTimestampFilename(prefix = 'quotation', extension = 'pdf') {
    const now = new Date();
    
    const timestamp = [
        now.getFullYear(),
        (now.getMonth() + 1).toString().padStart(2, '0'),
        now.getDate().toString().padStart(2, '0')
    ].join('-') + '_' + [
        now.getHours().toString().padStart(2, '0'),
        now.getMinutes().toString().padStart(2, '0'),
        now.getSeconds().toString().padStart(2, '0')
    ].join('-');
    
    return `${prefix}_${timestamp}.${extension}`;
}

async function generateQuotationNumber() {
    try {
        const sql = require("mssql");
        const config = require("../config/Mssql.config");
        
        const pool = await sql.connect(config.sql);
        
        // สร้างรูปแบบปีเดือนปัจจุบัน YYMM
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2); // เอา 2 หลักหลัง
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // เดือนปัจจุบัน 01-12
        const currentPrefix = `QTM${year}${month}`; 
        
        console.log(`Current prefix: ${currentPrefix}`);
        
        // Query เลขล่าสุดจาก database ตามรูปแบบปีเดือนปัจจุบัน
        const result = await pool.request()
            .query(`SELECT MAX(SO_NUMBER) as lastNumber FROM Sale_Order 
                    WHERE SO_NUMBER LIKE '${currentPrefix}%'`);
        
        let nextNumber;
        
        if (result.recordset[0].lastNumber) {
            const lastNumber = result.recordset[0].lastNumber;
            console.log("Last SO_NUMBER from database:", lastNumber);
            
            // Extract ตัวเลขจาก QTM25060001 -> 0001
            const numberPart = lastNumber.slice(-4); // เอา 4 หลักสุดท้าย
            const nextNum = parseInt(numberPart) + 1;
            
            // Format กลับเป็น QTM25060002
            nextNumber = currentPrefix + nextNum.toString().padStart(4, '0');
        } else {
            // ถ้าไม่มีข้อมูลในเดือนนี้ เริ่มต้นที่ 0001
            nextNumber = currentPrefix + '0001';
        }
        
        console.log("Generated new SO_NUMBER:", nextNumber);
        pool.close();
        
        return nextNumber;
        
    } catch (error) {
        console.error("Error generating quotation number from DB:", error.message);
        
        // Fallback: ใช้รูปแบบตาม timestamp
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hour = now.getHours().toString().padStart(2, '0');
        const minute = now.getMinutes().toString().padStart(2, '0');
        
        // ใช้วันและเวลาแทนเลข running
        return `QTM${year}${month}${day}${hour}${minute}`;
    }
}

async function convertToNewQuotationFormat(oldNumber) {
    try {
        // ถ้าไม่มีเลขเก่า ให้สร้างใหม่จาก database
        if (!oldNumber) {
            console.log("No old number provided, generating new QTM number from database...");
            return await generateQuotationNumber();
        }
        
        // ถ้ามีเลขเก่าแล้วและเป็นรูปแบบ QTM ให้ใช้เลขเก่า
        if (oldNumber.startsWith('QTM') && oldNumber.length >= 11) {
            console.log("Old number is already in QTM format:", oldNumber);
            return oldNumber;
        }
        
        // ถ้าเป็นรูปแบบอื่น (เช่น DO, หรือรูปแบบเก่า) ให้สร้างใหม่
        console.log("Old number format not supported, generating new QTM number:", oldNumber);
        return await generateQuotationNumber();
        
    } catch (error) {
        console.error("Error in convertToNewQuotationFormat:", error.message);
        
        // Fallback: ใช้เลขเก่าถ้ามี หรือสร้างเลขด้วย timestamp
        if (oldNumber && oldNumber.startsWith('QTM')) {
            return oldNumber;
        }
        
        // สร้างเลขสำรอง
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hour = now.getHours().toString().padStart(2, '0');
        const minute = now.getMinutes().toString().padStart(2, '0');
        
        return `QTM${year}${month}${day}${hour}${minute}`;
    }
}


/**
 * แปลงข้อมูลจาก backend เป็นรูปแบบสำหรับ PDF - แก้ไขการจัดการข้อมูลส่วนลด
 */
async function convertBackendDataToPDFFormat(backendData) {
    if (!backendData) {
        console.warn("Backend data is undefined or null, using default data");
        backendData = {};
    }
    
    // ฟังก์ชันสำหรับแปลงวันที่เป็นรูปแบบ DD.MM.YY
    function formatDateToDDMMYY(dateInput) {
        if (!dateInput) {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2);
            return `${day}.${month}.${year}`;
        }
        
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2);
            return `${day}.${month}.${year}`;
        }
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}.${month}.${year}`;
    }

    // เพิ่ม function ใหม่ตรงนี้
    function convertToShortYear(dateString) {
        // ถ้าเป็นรูปแบบ DD.MM.YYYY → แปลงเป็น DD.MM.YY
        if (dateString && typeof dateString === 'string') {
            const match = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (match) {
                const day = match[1];
                const month = match[2];
                const year = match[3].slice(-2);
                return `${day}.${month}.${year}`;
            }
        }
        return dateString;
    }
    
    // ตรวจสอบและกำหนดค่าเริ่มต้นให้ products
    if (!backendData.products || !Array.isArray(backendData.products) || backendData.products.length === 0) {
        console.warn("No valid products found, using sample product");
        backendData.products = [{
            id: 'SAMPLE-001',
            name: 'Sample Product - No Data Available',
            price: 0,
            quantity: 1,
            discount: 0
        }];
    }
    
    // แปลงข้อมูลสินค้า
    const products = backendData.products.map((product, index) => {
        if (!product) {
            console.warn(`Product at index ${index} is undefined, using default`);
            product = { id: '', name: '', price: 0, quantity: 0, discount: 0 };
        }
        
        const price = parseFloat(product.price) || 0;
        const quantity = parseInt(product.quantity) || 0;
        const discount = parseFloat(product.discount) || 0;
        
        const subtotal = price * quantity;
        const discountAmount = subtotal * (discount / 100);
        const totalAmount = subtotal - discountAmount;
        
        return {
            no: index + 1,
            productCode: product.id || product.code || '',
            description: product.name || product.description || 'ไม่ระบุรายการ',
            quantity: quantity.toString(),
            unitPrice: price.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }),
            discount: discount > 0 ? `${discount}%` : "-",
            amount: totalAmount.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }),
            
            // ข้อมูลเพิ่มเติมสำหรับ Food format
            brand: product.brand || product.I_ItemDescriptionEN || '',
            thaiName: product.thaiName || product.Description || '',
            size: product.size || product.Size || '',
            
            // ข้อมูลสำหรับ Database
            I_ID: product.id || product.code || '',
            I_Qty: quantity,
            I_Price: price,
            I_Discount: discountAmount,
            discountPercent: discount,
            
            // ข้อมูลสำหรับการคำนวณ
            rawSubtotal: subtotal,
            rawDiscountAmount: discountAmount,
            rawFinalAmount: totalAmount
        };
    });
    
    // คำนวณยอดรวม
    const totalSubtotal = products.reduce((sum, product) => sum + product.rawSubtotal, 0);
    const totalProductDiscountAmount = products.reduce((sum, product) => sum + product.rawDiscountAmount, 0);
    const totalAfterProductDiscount = products.reduce((sum, product) => sum + product.rawFinalAmount, 0);
    
    const additionalDiscount = parseFloat(backendData.discount) || 0;
    const totalAfterDiscount = totalAfterProductDiscount - additionalDiscount;
    
    // ✅ คำนวณ VAT
    const vatRate = 0.07; // 7%
    const vatAmount = totalAfterDiscount * vatRate;
    const grandTotal = totalAfterDiscount + vatAmount;
    
    const formattedDate = formatDateToDDMMYY(backendData.date);
    
    return {
        quotationNo: await convertToNewQuotationFormat(backendData.salesNumber),
        customerName: backendData.customerName || "ชื่อลูกค้า",
        customerId: backendData.customerId || "",
        customerType: backendData.customerType || "",
        customerAddress: backendData.customerAddress || "",
        customerTel: backendData.customerTel || "",
        customerFax: backendData.customerFax || "",
        customerEmail: backendData.customerEmail || "",
        customerContact: backendData.customerContact || "",
        employeeName: backendData.employeeName || "พนักงานขาย",
        employeeTel: backendData.employeeTel || "",
        employeeEmail: backendData.employeeEmail || "",
        employeePosition: backendData.employeePosition || "Sales Engineer",
        employeeSignatureUrl: backendData.salePersonSignatureUrl || "",
        salePersonSignatureBase64: backendData.salePersonSignatureBase64 || null,
        salePersonSignatureContentType: backendData.salePersonSignatureContentType || null,

        date: formattedDate,
        ref: backendData.ref || "",
        validity: backendData.validityInfo || "",  
        delivery: backendData.deliveryInfo ? convertToShortYear(backendData.deliveryInfo) : "", 
        discount: additionalDiscount || 0,
        note: backendData.note || "",
        
        projectInfo: backendData.projectInfo || backendData.project || backendData.Project || "",
        detailInfo: backendData.detailInfo || backendData.remarkInfo || "",
        shippingInfo: backendData.shippingInfo || "",
        locationInfo: backendData.locationInfo || "",
        paymentTerm: backendData.paymentTerm || "100% payment after delivery, credit within 30 days.",
        
        products: products,
        summary: {
            subtotal: totalSubtotal.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }),
            productDiscount: totalProductDiscountAmount.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }),
            additionalDiscount: additionalDiscount.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }),
            totalDiscount: (totalProductDiscountAmount + additionalDiscount).toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }),
            afterDiscount: totalAfterDiscount.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }),
            vat: vatAmount.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }),
            grandTotal: grandTotal.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            }),
            grandTotalNumber: grandTotal
        }
    };
}

// ==================== HTML TEMPLATE FUNCTIONS ====================
/**
 * คำนวณจำนวนหน้าจริงจากจำนวนสินค้า
 */
function calculateTotalPages(productCount) {
    if (productCount <= 8) {
        return 1; // หน้าเดียว สำหรับสินค้า ≤8 รายการ
    }
    
    // หน้าแรก: แสดงสินค้าได้ 15 รายการ (เต็มหน้า)
    // หน้าถัดไป: แสดงสินค้าได้ 20 รายการต่อหน้า (ไม่มี header ซ้ำ)
    const firstPageCapacity = 25;
    const otherPageCapacity = 25;
    
    if (productCount <= firstPageCapacity) {
        return 2; // หน้าแรก + หน้าเงื่อนไข
    }
    
    const remainingProducts = productCount - firstPageCapacity;
    const additionalProductPages = Math.ceil(remainingProducts / otherPageCapacity);
    
    return 1 + additionalProductPages + 1; // หน้าแรก + หน้าสินค้าเพิ่ม + หน้าเงื่อนไข
}

/**
 * สร้าง HTML template สำหรับใบเสนอราคา - แบบใหม่ แยกหน้าสินค้าและเงื่อนไข
 */
function createHTMLTemplate(quotationData) {
    // ตรวจสอบและแก้ไขข้อมูล
    if (!quotationData) {
        throw new Error("quotationData is required");
    }
    
    if (!quotationData.products || !Array.isArray(quotationData.products)) {
        console.warn("quotationData.products is undefined or not array, setting empty array");
        quotationData.products = [];
    }
    
    // ถ้าไม่มีสินค้าเลย ให้ใช้ข้อมูลตัวอย่าง
    if (quotationData.products.length === 0) {
        console.warn("No products found, using sample product");
        quotationData.products = [{
            no: 1,
            productCode: 'SAMPLE-001',
            description: 'Sample Product - No Data Available',
            quantity: '1',
            unitPrice: '0.00',
            discount: '-',
            amount: '0.00',
            vat: '7%'
        }];
    }
    
    const totalQuantity = quotationData.products.reduce((sum, product) => 
        sum + parseInt(product.quantity || 0), 0
    );
    
    const productCount = quotationData.products.length;
    const totalPages = calculateTotalPages(productCount);
    
    console.log(`Product count: ${productCount}, Total pages: ${totalPages}`);
    
    // กรณีหน้าเดียว (≤8 สินค้า)
    if (totalPages === 1) {
        console.log("Using single page layout");
        return createSinglePageHTML(quotationData, totalQuantity, 1, 1);
    }
    
    // กรณีหลายหน้า - สร้าง loop
    console.log("Using multi-page layout");
    return createMultiPageHTML(quotationData, totalQuantity, totalPages);
}

/**
 * สร้าง Multi Page HTML - รองรับหลายหน้า
 */
function createMultiPageHTML(quotationData, totalQuantity, totalPages) {
    // แยกสินค้าตามหน้า
    const products = quotationData.products;
    const firstPageCapacity = 25;
    const otherPageCapacity = 25;
    
    let htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ใบเสนอราคา - Quotation</title>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Prompt', 'TH SarabunPSK', Arial, sans-serif; font-size: 9px; line-height: 1.2; color: black; margin: 0; padding: 0; background: white;">`;
    
    let startIndex = 0;
    let currentPage = 1;
    
    // สร้างหน้าสินค้า (loop)
    while (startIndex < products.length) {
        const capacity = currentPage === 1 ? firstPageCapacity : otherPageCapacity;
        const pageProducts = products.slice(startIndex, startIndex + capacity);
        const isLastProductPage = (startIndex + capacity) >= products.length;
        
        htmlContent += `
    <!-- หน้า ${currentPage}: Product Page -->
    <div style="width: 210mm; height: 297mm; margin: 0; background: white; padding: 10mm; box-sizing: border-box; overflow: hidden;">
        ${createHeaderSection(currentPage, totalPages)}
        ${createCompanyInfoSection()}
        ${createCustomerInfoTable(quotationData)}
        ${createProductPageTable(pageProducts, startIndex + 1, isLastProductPage, quotationData, totalQuantity)}
    </div>`;
        
        startIndex += capacity;
        currentPage++;
    }
    
    // หน้าสุดท้าย: Terms & Conditions
    htmlContent += `
    <!-- หน้า ${totalPages}: Terms & Conditions -->
    <div style="width: 210mm; height: 297mm; margin: 0; background: white; padding: 10mm; box-sizing: border-box; overflow: hidden;">
        ${createTermsPageHeader(quotationData, totalPages, totalPages)}
        ${createTransportationSection()}
        ${createBankAccountSection()}
        ${createPaymentTermsSection(quotationData.summary.grandTotal, quotationData.summary.grandTotalNumber, quotationData)}
        ${createThankYouMessage()}
        ${createSignatureSection(quotationData)}
    </div>
    
</body>
</html>`;
    
    return htmlContent;
}

/**
 * สร้างตารางสินค้าสำหรับแต่ละหน้า
 */
function createProductPageTable(products, startIndex, isLastPage, quotationData, totalQuantity) {
    const fontSize = '8px';
    const headerFontSize = '8px';
    const cellPadding = '3px';
    const rowHeight = '22px';
    
    let tableContent = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: ${fontSize}; table-layout: fixed;">
            ${createTableHeader(headerFontSize, cellPadding)}
            <tbody>
                ${createProductRows(products, startIndex, fontSize, cellPadding, rowHeight)}
    `;
    
    // เพิ่ม Summary แค่หน้าสุดท้ายของสินค้า
    if (isLastPage) {
        tableContent += createSummaryRows(totalQuantity, quotationData.summary, fontSize, cellPadding, rowHeight, quotationData);
    }
    
    tableContent += `
            </tbody>
        </table>
    `;
    
    return tableContent;
}
/**
 * สร้าง Single Page HTML (≤8 รายการ) - ทั้งสินค้าและเงื่อนไข
 */
function createSinglePageHTML(quotationData, totalQuantity) {
    return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ใบเสนอราคา - Quotation</title>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Prompt', 'TH SarabunPSK', Arial, sans-serif; font-size: 9px; line-height: 1.2; color: black; margin: 0; padding: 0; background: white;">
    <div style="width: 210mm; min-height: 297mm; margin: 0; background: white; padding: 10mm; box-sizing: border-box;">
        ${createHeaderSection(1, 1)}
        ${createCompanyInfoSection()}
        ${createCustomerInfoTable(quotationData)}
        ${createSinglePageProductTable(quotationData, totalQuantity)}
        ${createTransportationSection()}
        ${createBankAccountSection()}
        ${createPaymentTermsSection(quotationData.summary.grandTotal, quotationData.summary.grandTotalNumber, quotationData)}
        ${createThankYouMessage()}
        ${createSignatureSection(quotationData)}
    </div>
</body>
</html>`;
}

/**
 * สร้างตารางสินค้าสำหรับหน้าเดียว (≤8 รายการ) 
 */
function createSinglePageProductTable(quotationData, totalQuantity) {
    const productCount = quotationData.products.length;
    const isCompact = productCount > 5;
    
    const fontSize = isCompact ? '8px' : '9px';
    const headerFontSize = isCompact ? '8px' : '9px';
    const cellPadding = isCompact ? '3px' : '5px';
    const rowHeight = isCompact ? '22px' : '28px';
    
    return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: ${fontSize}; table-layout: fixed;">
            ${createTableHeader(headerFontSize, cellPadding)}
            <tbody>
                ${createProductRows(quotationData.products, 1, fontSize, cellPadding, rowHeight)}
                ${createSummaryRows(totalQuantity, quotationData.summary, fontSize, cellPadding, rowHeight, quotationData)}
            </tbody>
        </table>
    `;
}

/**
 * สร้าง HTML แบบใหม่ - หน้าแรกเน้นสินค้า หน้าสองเน้นเงื่อนไข
 */
function createNewLayoutHTML(quotationData, totalQuantity) {
    return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ใบเสนอราคา - Quotation</title>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Prompt', 'TH SarabunPSK', Arial, sans-serif; font-size: 9px; line-height: 1.2; color: black; margin: 0; padding: 0; background: white;">
    
    <!-- หน้าแรก: Product Focus Page -->
    <div style="width: 210mm; height: 297mm; margin: 0; background: white; padding: 10mm; box-sizing: border-box; overflow: hidden;">
        ${createHeaderSection()}
        ${createCompanyInfoSection()}
        ${createCustomerInfoTable(quotationData)}
        ${createProductOnlyTable(quotationData, totalQuantity)}
    </div>
    
    <!-- หน้าสอง: Terms & Conditions Page -->
    <div style="width: 210mm; height: 297mm; margin: 0; background: white; padding: 10mm; box-sizing: border-box; overflow: hidden;">
        ${createTermsPageHeader(quotationData)}
        ${createTransportationSection()}
        ${createBankAccountSection()}
        ${createPaymentTermsSection(quotationData.summary.grandTotal, quotationData.summary.grandTotalNumber, quotationData)}
        ${createThankYouMessage()}
        ${createSignatureSection(quotationData)}
    </div>
    
</body>
</html>`;
}

/**
 * สร้าง Header สำหรับหน้าเงื่อนไข
 */
function createTermsPageHeader(quotationData, currentPage, totalPages) {
    return `
        ${createHeaderSection(currentPage, totalPages)}
        ${createCompanyInfoSection()}
        ${createCustomerInfoTable(quotationData)}
        <div style="width: 100%; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
            <table style="width: 100%; border: none; border-collapse: collapse; font-size: 10px;">
                <tr>
                    <td style="width: 100%; vertical-align: top;">
                        <div style="font-weight: 700; font-size: 14px; margin-bottom: 5px;">เงื่อนไขและการชำระเงิน / Terms & Conditions</div>
                    </td>
                </tr>
            </table>
        </div>
    `;
}

/**
 * สร้างตารางสินค้าแบบเน้นเฉพาะสินค้า (หน้าแรก)
 */
function createProductOnlyTable(quotationData, totalQuantity) {
    const productCount = quotationData.products.length;
    const isCompact = productCount > 10;
    
    const fontSize = isCompact ? '8px' : '9px';
    const headerFontSize = isCompact ? '8px' : '9px';
    const cellPadding = isCompact ? '3px' : '5px';
    const rowHeight = isCompact ? '22px' : '28px';
    
    return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: ${fontSize}; table-layout: fixed;">
            ${createTableHeader(headerFontSize, cellPadding)}
            <tbody>
                ${createProductRows(quotationData.products, 1, fontSize, cellPadding, rowHeight)}
                ${createSummaryRows(totalQuantity, quotationData.summary, fontSize, cellPadding, rowHeight, quotationData)}
            </tbody>
        </table>
    `;
}

/**
 * สร้าง Table Header
 */
function createTableHeader(headerFontSize = '9px', cellPadding = '5px') {
    return `
        <thead>
            <tr style="background-color: #f3f4f6;">
                <th style="border: 1px solid black; padding: ${cellPadding}; text-align: center; font-weight: 600; font-size: ${headerFontSize}; line-height: 1.2; width: 6%;">
                    รายการ<br>No
                </th>
                <th style="border: 1px solid black; padding: ${cellPadding}; text-align: center; font-weight: 600; font-size: ${headerFontSize}; line-height: 1.2; width: 12%;">
                    รหัสสินค้า<br>P/N
                </th>
                <th style="border: 1px solid black; padding: ${cellPadding}; text-align: center; font-weight: 600; font-size: ${headerFontSize}; line-height: 1.2; width: 25%;">
                    รายการ<br>Description
                </th>
                <th style="border: 1px solid black; padding: ${cellPadding}; text-align: center; font-weight: 600; font-size: ${headerFontSize}; line-height: 1.2; width: 8%;">
                    จำนวน<br>Qty
                </th>
                <th style="border: 1px solid black; padding: ${cellPadding}; text-align: center; font-weight: 600; font-size: ${headerFontSize}; line-height: 1.2; width: 10%;">
                    ราคาต่อหน่วย<br>Unit Price
                </th>
                <th style="border: 1px solid black; padding: ${cellPadding}; text-align: center; font-weight: 600; font-size: ${headerFontSize}; line-height: 1.2; width: 9%;">
                    ส่วนลด<br>Disc %
                </th>
                <th style="border: 1px solid black; padding: ${cellPadding}; text-align: center; font-weight: 600; font-size: ${headerFontSize}; line-height: 1.2; width: 14%;">
                    จำนวนเงิน<br>Amount
                </th>
                <th style="border: 1px solid black; padding: ${cellPadding}; text-align: center; font-weight: 600; font-size: ${headerFontSize}; line-height: 1.2; width: 6%;">
                    VAT %
                </th>
            </tr>
        </thead>
    `;
}

/**
 * สร้างแถวสินค้า (รองรับเลขลำดับต่อเนื่อง)
 */
function createProductRows(products, startIndex = 1, fontSize = '9px', cellPadding = '5px', rowHeight = '25px') {
    return products.map((product, index) => {
        const rowNumber = startIndex + index;
        const isCompact = fontSize === '8px' || fontSize === '7px';
        
        return `
        <tr style="height: ${rowHeight};">
            <td style="border: 1px solid black; text-align: center; vertical-align: middle; font-size: ${fontSize}; padding: ${cellPadding};">
                ${rowNumber}
            </td>
            <td style="border: 1px solid black; text-align: center; vertical-align: middle; font-size: ${isCompact ? '7px' : fontSize}; padding: ${cellPadding}; word-wrap: break-word; overflow-wrap: break-word;">
                ${product.productCode || ''}
            </td>
            <td style="border: 1px solid black; text-align: left; padding-left: ${cellPadding}; vertical-align: middle; font-size: ${isCompact ? '7px' : fontSize}; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;">
                ${product.description || ''}
            </td>
            <td style="border: 1px solid black; text-align: center; vertical-align: middle; font-size: ${fontSize}; padding: ${cellPadding};">
                ${product.quantity || '0'}
            </td>
            <td style="border: 1px solid black; text-align: right; padding-right: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; padding: ${cellPadding};">
                ${product.unitPrice || '0.00'}
            </td>
            <td style="border: 1px solid black; text-align: center; vertical-align: middle; font-size: ${fontSize}; padding: ${cellPadding};">
                ${product.discount || '-'}
            </td>
            <td style="border: 1px solid black; text-align: right; padding-right: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; padding: ${cellPadding};">
                ${product.amount || '0.00'}
            </td>
            <td style="border: 1px solid black; text-align: center; vertical-align: middle; font-size: ${fontSize}; padding: ${cellPadding};">
                ${product.vat || '7%'}
            </td>
        </tr>`;
    }).join('');
}

/**
 * สร้างแถวสรุปยอด (รองรับ Dynamic Layout)
 */
function createSummaryRows(totalQuantity, summary, fontSize = '9px', cellPadding = '5px', rowHeight = '28px', quotationData = {}) {
    return `
        <tr style="height: ${rowHeight};">
            <td style="border: 1px solid black; text-align: center; padding: ${cellPadding}; font-weight: 500; background-color: #e5e7eb; font-size: ${fontSize};" colspan="2">
                หมายเหตุ / Remarks
            </td>
            <td style="border: 1px solid black; text-align: center; padding: ${cellPadding}; font-weight: 500; background-color: #e5e7eb; font-size: ${fontSize};">
                Total items
            </td>
            <td style="border: 1px solid black; text-align: center; padding: ${cellPadding}; font-weight: 500; background-color: #e5e7eb; font-size: ${fontSize};">
                ${totalQuantity}
            </td>
            <td style="border: 1px solid black; text-align: center; padding: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; background-color: white;" colspan="2">
                รวมเป็นเงิน / Total
            </td>
            <td style="border: 1px solid black; text-align: right; padding-right: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; background-color: white;">
                ${summary.subtotal || '0.00'}
            </td>
            <td style="border: 1px solid black; padding: ${cellPadding}; background-color: #f0f0f0;" rowspan="5"></td>
        </tr>
        <tr style="height: ${rowHeight};">
            <td style="border: 1px solid black; padding: ${cellPadding}; font-weight: 500; font-size: ${fontSize}; background-color: white;">Project</td>
            <td style="border: 1px solid black; padding: ${cellPadding}; background-color: white; font-size: ${fontSize};" colspan="3">
                ${quotationData.projectInfo || ''}
            </td>
            <td style="border: 1px solid black; text-align: center; padding: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; background-color: white;" colspan="2">
                ส่วนลด / Discount
            </td>
            <td style="border: 1px solid black; text-align: right; padding-right: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; background-color: white;">
                ${summary.totalDiscount || '0.00'}
            </td>
        </tr>
        <tr style="height: ${rowHeight};">
            <td style="border: 1px solid black; padding: ${cellPadding}; font-weight: 500; font-size: ${fontSize}; background-color: white;">Detail</td>
            <td style="border: 1px solid black; padding: ${cellPadding}; background-color: white; font-size: ${fontSize};" colspan="3">
                ${quotationData.detailInfo || ''}
            </td>
            <td style="border: 1px solid black; text-align: center; padding: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; background-color: white;" colspan="2">
                รวมเป็นเงิน / Total
            </td>
            <td style="border: 1px solid black; text-align: right; padding-right: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; background-color: white;">
                ${summary.afterDiscount || '0.00'}
            </td>
        </tr>
        <tr style="height: ${rowHeight};">
            <td style="border: 1px solid black; padding: ${cellPadding}; font-weight: 500; font-size: ${fontSize}; background-color: white;">Shipping</td>
            <td style="border: 1px solid black; padding: ${cellPadding}; background-color: white; font-size: ${fontSize};" colspan="3">
                ${quotationData.shippingInfo || ''}
            </td>
            <td style="border: 1px solid black; text-align: center; padding: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; background-color: white;" colspan="2">
                ภาษีมูลค่าเพิ่ม / VAT
            </td>
            <td style="border: 1px solid black; text-align: right; padding-right: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; background-color: white;">
                ${summary.vat || '0.00'}
            </td>
        </tr>
        <tr style="height: ${rowHeight};">
            <td style="border: 1px solid black; padding: ${cellPadding}; font-weight: 500; font-size: ${fontSize}; background-color: white;">Location</td>
            <td style="border: 1px solid black; padding: ${cellPadding}; background-color: white; font-size: ${fontSize};" colspan="3">
                ${quotationData.locationInfo || ''}
            </td>
            <td style="border: 1px solid black; text-align: center; padding: ${cellPadding}; vertical-align: middle; font-weight: 600; font-size: ${fontSize}; background-color: white;" colspan="2">
                ยอดรวมสุทธิ / Net Total
            </td>
            <td style="border: 1px solid black; text-align: right; padding-right: ${cellPadding}; vertical-align: middle; font-size: ${fontSize}; background-color: white;">
                ${summary.grandTotal || '0.00'}
            </td>
        </tr>
    `;
}

/**
 * สร้าง Header Section
 */
function createHeaderSection(currentPage = 1, totalPages = 1) {
    return `
        <div style="width: 100%; margin-bottom: 15px; position: relative; font-family: 'Prompt', sans-serif;">
            <div style="text-align: center; position: relative;">
                <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">ใบเสนอราคา</div>
                <div style="font-size: 12px; font-weight: 500; color: #4b5563;">Quotation</div>
                
                <!-- เลขหน้า -->
                <div style="position: absolute; top: -20px; right: -15px; font-size: 7px; color: #000; font-weight: 300;">
                    ${currentPage}/${totalPages}
                </div>
                
                <!-- โลโก้ -->
                <div style="position: absolute; top: 0; right: 0; width: 60px; height: 50px;">
                    <img src="https://web.mrgshrimp.com/good_com/mgs.png" 
                         alt="Company Logo" 
                         style="width: 60px; height: 50px; object-fit: contain;">
                </div>
            </div>
        </div>
    `;
}


/**
 * สร้างข้อมูลบริษัท
 */
function createCompanyInfoSection() {
    return `
        <div style="width: 100%; margin-bottom: 9px;">
            <table style="width: 100%; border: none; border-collapse: collapse; font-size: 8px;">
                <tr>
                    <td style="width: 50%; vertical-align: top; padding-right: 12px;">
                        <div style="font-weight: 700; font-size: 8px; margin-bottom: 4px;">
                            บริษัท เอ็ม โกลบอล ซอร์สซิ่ง จำกัด (สำนักงานใหญ่)
                        </div>
                        <div>57/9 หมู่4 ถนนเอกชัย ตำบลโคกขาม อำเภอเมืองจังหวัดสมุทรสาคร 74000</div>
                        <div>โทร: 034-864091-4</div>
                        <div>เลขประจำตัวผู้เสียภาษี: 0745562009131</div>
                    </td>
                    <td style="width: 50%; vertical-align: top; padding-left: 12px;">
                        <div style="font-weight: 600; font-size: 8px; margin-bottom: 4px;">
                           M Global Sourcing Ltd.
                        </div>
                        <div>57/9 MU 4 Ekkachai Road, Khok Kham, Muang Samut Sakhon, Samut Sakhon 74000, Thailand</div>
                        <div>Tel: 034-864091-4</div>
                        <div>Tax ID: 0745562009131</div>
                    </td>
                </tr>
            </table>
        </div>
    `;
}

/**
 * สร้างตารางข้อมูลลูกค้า
 */
function createCustomerInfoTable(quotationData) {
    return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 9px; font-size: 9px; border: 1px solid black;">
            <tr>
                <td style="padding: 4px; font-weight: 400; width: 18%; background-color: #f0f0f0;">
                    ลูกค้า / Customer:
                </td>
                <td style="padding: 4px; width: 32%;">
                    ${quotationData.customerName || ''}
                </td>
                <td style="padding: 4px; font-weight: 400; width: 30%; background-color: #f0f0f0;">
                    Quotation No. / เลขใบเสนอราคา:
                </td>
                <td style="padding: 4px; width: 28%;">
                    ${quotationData.quotationNo || ''}
                </td>
            </tr>
             <tr>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    Customer ID
                </td>
                <td style="padding: 4px;">
                     ${quotationData.customerId || ''}
                </td>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    วันที่ / Date:
                </td>
                <td style="padding: 4px;">
                    ${quotationData.date || ''}
                </td>
            </tr>
            <tr>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0; vertical-align: top;">
                    ที่อยู่ / Address:
                </td>
                <td style="padding: 4px; vertical-align: top;">
                    ${quotationData.customerAddress || ''}
                </td>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    อ้างถึง / Ref:
                </td>
                <td style="padding: 4px;">
                    ${quotationData.ref || '-'}
                </td>
            </tr>
           
            <tr>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    โทรศัพท์ / Tel:
                </td>
                <td style="padding: 4px;">
                    ${quotationData.customerTel || ''}
                </td>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    การยื่นราคา / Validity:
                </td>
                <td style="padding: 4px;">
                    ${quotationData.validity || ''}
                </td>
            </tr>
            <tr>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    โทรสาร / Fax:
                </td>
                <td style="padding: 4px;">
                    ${quotationData.customerFax || '-'}
                </td>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    กำหนดส่งสินค้า / Delivery:
                </td>
                <td style="padding: 4px;">
                    ${quotationData.delivery || ''}
                </td>
            </tr>
            <tr>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    E-Mail:
                </td>
                <td style="padding: 4px;">
                    ${quotationData.customerEmail || ''}
                </td>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    พนักงานขาย / Sales:
                </td>
                <td style="padding: 6px;">
                    ${quotationData.employeeName || ''}
                </td>
            </tr>
            <tr>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    ผู้ติดต่อ / Attn:
                </td>
                <td style="padding: 4px;">
                    ${quotationData.customerContact || ''}
                </td>
                <td style="padding: 4px; font-weight: 400; background-color: #f0f0f0;">
                    โทรศัพท์ / Tel:
                </td>
                <td style="padding: 4px;">
                    ${quotationData.employeeTel || ''}
                </td>
            </tr>
        </table>
    `;
}

/**
 * สร้างส่วนรายละเอียดการขนส่ง
 */
function createTransportationSection() {
    return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 8px;">
            <tr>
                <td style="border: 1px solid black; background-color: #f0f0f0; padding: 6px; font-size: 10px; font-weight: 600;" colspan="2">
                    รายละเอียดการขนส่ง / Transportation details
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 6px; text-align: center; vertical-align: top; width: 5%;">1</td>
                <td style="border: 1px solid black; padding: 6px; text-align: left;">
                    กรณีลูกค้า - ภายใน เวลา 15.00 น. ของวันที่ ชำระเงิน สินค้าจะถูกส่งไปในวันถัดไป
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 6px; text-align: center; vertical-align: top;">2</td>
                <td style="border: 1px solid black; padding: 6px; text-align: left;">
                    กรณีลูกค้า - ให้ บริษัท เอ็ม โกลบอล ซอร์สซิ่ง จัดส่ง / ขนส่ง เขต ปริมณฑล ยอดสินค้า > 200,000 บาท ส่งฟรี / นอกเขต ปริมณฑล คิดค่าส่งตามระยะทาง
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 6px; text-align: center; vertical-align: top;">3</td>
                <td style="border: 1px solid black; padding: 6px; text-align: left;">
                   กรณีลูกค้า - ให้ บริษัท เอ็ม โกลบอล ซอร์สซิ่ง จัดส่ง / ขนส่ง นอกเขต/ในเขตปริมณฑล ยอดสินค้า < 200,000 บาท คิดตามค่าขนส่งตามจริง ระยะเวลาในการจัดส่ง 1-3 วัน (บริการขนส่งเอกชน)
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 6px; text-align: center; vertical-align: top;">4</td>
                <td style="border: 1px solid black; padding: 6px; text-align: left;">
                  กรณีลูกค้า - มารับสินค้าเอง สามารถเข้ามารับสินค้า หลังการ สั่งซื้อสินค้าเสร็จสิ้น ภายในเวลา 15.00 น. ของวันถัดไป จันทร์-ศุกร์ 8.00 -17.00 น. เสาร์ 8.00-11.00 น.
                </td>
            </tr>
        </table>
    `;
}

/**
 * สร้างส่วนบัญชีธนาคาร
 */
function createBankAccountSection() {
    return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 3px; font-size: 9px;">
            <tr style="background-color: #f0f0f0;">
                <td style="border: 1px solid black; padding: 6px; font-weight: 600;" colspan="2">
                    บัญชีธนาคาร / Bank Account
                </td>
            </tr>
            <tr>
                <td style="border: 1px solid black; padding: 6px; vertical-align: top; line-height: 1.3; width: 50%;">
                    บริษัท เอ็ม โกลบอล ซอร์สซิ่ง จำกัด (สำนักงานใหญ่)<br>
                    ธนาคาร ทหารไทย ประเภท ออมทรัพย์ สาขา สมุทรสาคร<br>
                    เลขที่บัญชี 376-7-14713-9
                </td>
                <td style="border: 1px solid black; padding: 6px; vertical-align: top; line-height: 1.3; width: 50%;">
                    M Global Sourcing Ltd.<br>
                    TTB Bank (Samutsakorn Branch)<br>
                    Account # : 376-7-14713-9
                </td>
            </tr>
        </table>
    `;
}

/**
 * สร้างส่วนเงื่อนไขการชำระเงิน
 */
function createPaymentTermsSection(grandTotal, grandTotalNumber = 0, quotationData = {}) {
    return `
        <div style="border: 1px solid black; margin-bottom: 3px; font-size: 9px;">
            <div style="background-color: #f0f0f0; border-bottom: 1px solid black; padding: 6px;">
                <div style="font-weight: 700; font-size: 10px;">การชำระเงิน / Payment Terms</div>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin: 0;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="border: 1px solid black; padding: 6px; text-align: center; font-weight: 700; width: 8%; font-size: 9px; line-height: 1.2;">#</th>
                        <th style="border: 1px solid black; padding: 6px; text-align: left; font-weight: 700; font-size: 9px; line-height: 1.2;">รายละเอียด / Description</th>
                        <th style="border: 1px solid black; padding: 6px; text-align: center; font-weight: 700; width: 15%; font-size: 9px; line-height: 1.2;">THB</th>
                        <th style="border: 1px solid black; padding: 6px; text-align: center; font-weight: 700; width: 15%; font-size: 9px; line-height: 1.2;">รวม / Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="height: 28px;">
                        <td style="border: 1px solid black; text-align: center; padding: 6px; vertical-align: middle; font-size: 9px;">1</td>
                        <td style="border: 1px solid black; text-align: left; padding: 6px; vertical-align: middle; font-size: 9px;">
                            ${quotationData.paymentTerm || '100% payment after delivery, credit within 30 days.'}
                        </td>
                        <td style="border: 1px solid black; text-align: center; padding: 6px; vertical-align: middle; font-size: 9px;">THB</td>
                        <td style="border: 1px solid black; text-align: center; padding: 6px; vertical-align: middle; font-size: 9px;">
                            ${grandTotal || '0.00'}
                        </td>
                    </tr>
                    
                    <tr style="font-weight: 700; height: 28px; background-color: #f8f9fa;">
                        <td style="border: 1px solid black; text-align: center; padding: 4px; vertical-align: middle; font-size: 9px; width: 15%;">
                            ยอดรวมสุทธิ
                        </td>
                        <td style="border: 1px solid black; text-align: center; vertical-align: middle; padding: 4px; font-size: 8px; width: 45%;">
                            ${grandTotalNumber > 0 ? '( ' + numberToThaiText(grandTotalNumber) + ' )' : ''}
                        </td>
                        <td style="border: 1px solid black; text-align: center; padding: 4px; vertical-align: middle; font-size: 9px; width: 15%;">THB</td>
                        <td style="border: 1px solid black; text-align: center; padding: 4px; vertical-align: middle; font-size: 9px; width: 15%;">
                            ${grandTotal || '0.00'}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

/**
 * สร้างข้อความขอบคุณ
 */
function createThankYouMessage() {
    return `
        <div style="text-align: center; font-size: 10px; font-weight: 500; margin-bottom: 8px; margin-top: 5px">
            บริษัทฯ ขอขอบพระคุณ และหวังเป็นอย่างยิ่งว่า เราจะได้ทำธุรกิจร่วมกัน / THANK YOU
            </br>
            </br>
            </br>
        </div>
    `;
}

/**
 * สร้างส่วนลายเซ็น
 */
/**
 * สร้างส่วนลายเซ็น - เพิ่มรูปลายเซ็น
 */
function createSignatureSection(quotationData) {
    let signatureImageHtml = '';
    
    // ลองใช้ binary data ก่อน (จาก database)
    if (quotationData.salePersonSignatureBase64 && quotationData.salePersonSignatureContentType) {
        signatureImageHtml = `<img src="data:${quotationData.salePersonSignatureContentType};base64,${quotationData.salePersonSignatureBase64}" 
             alt="Signature" 
             style="width: 140px; height: 55px; object-fit: contain; margin-bottom: 4px;">`;
        console.log("Using signature from database (binary data)");
    } 
    // fallback ใช้ URL ถ้าไม่มี binary data
    else if (quotationData.employeeSignatureUrl) {
        signatureImageHtml = `<img src="${quotationData.employeeSignatureUrl}" 
             alt="Signature" 
             style="width: 140px; height: 55px; object-fit: contain; margin-bottom: 4px;">`;
        console.log("Using signature from URL (fallback)");
    } else {
        console.log("No signature data available");
    }

    return `
        <div style="width: 100%; margin-top: 20px;">
            <table style="width: 100%; border: none; border-collapse: collapse;">
                <tr>
                    <td style="width: 50%; text-align: center; vertical-align: top; padding-right: 12px;">
                        <div style="border-bottom: 1px solid black; height: 47px; margin-bottom: 10px;"></div>
                        <div style="margin-bottom: 8px; font-size: 9px;">${quotationData.customerName || ''}</div>
                        <div style="margin-bottom: 8px; font-size: 9px;">ลูกค้า / Customer</div>
                        <div style="font-size: 9px;">
                            วันที่ / Date 
                            <span style="display: inline-block; border-bottom: 1px dotted black; width: 15px; margin: 0 2px;"></span> /
                            <span style="display: inline-block; border-bottom: 1px dotted black; width: 15px; margin: 0 2px;"></span> /
                            <span style="display: inline-block; border-bottom: 1px dotted black; width: 30px; margin: 0 2px;"></span>
                        </div>
                    </td>
                    <td style="width: 50%; text-align: center; vertical-align: top; padding-left: 12px;">
                        <div style="height: 47px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid black;">
                            ${signatureImageHtml}
                        </div>
                        <div style="margin-bottom: 8px; font-size: 9px;">${quotationData.employeeName || ''}</div>
                        <div style="margin-bottom: 8px; font-size: 9px;">
                            ${quotationData.employeePosition || 'วิศวกร ก่าย ขาย / Sales Engineer'}
                        </div>
                        <div style="font-size: 9px;">วันที่ / Date ${quotationData.date || ''}</div>
                    </td>
                </tr>
            </table>
        </div>
    `;
}

// ==================== PDF & EMAIL FUNCTIONS ====================

/**
 * ตรวจสอบโครงสร้าง HTML
 */
function validateHTMLStructure(html) {
    const divCount = (html.match(/<div/g) || []).length;
    const closingDivCount = (html.match(/<\/div>/g) || []).length;
    const tableCount = (html.match(/<table/g) || []).length;
    const closingTableCount = (html.match(/<\/table>/g) || []).length;
    
    console.log('HTML Structure Check:');
    console.log(`- Total <div> tags: ${divCount}`);
    console.log(`- Total </div> tags: ${closingDivCount}`);
    console.log(`- Total <table> tags: ${tableCount}`);
    console.log(`- Total </table> tags: ${closingTableCount}`);
    console.log(`- Balanced divs: ${divCount === closingDivCount}`);
    console.log(`- Balanced tables: ${tableCount === closingTableCount}`);
    
    return divCount === closingDivCount && tableCount === closingTableCount;
}

/**
 * สร้าง PDF Buffer - ปรับให้เหมาะกับ PDF converter เวอร์ชันเก่า
 */
function generatePdfBuffer(html) {
    return new Promise((resolve, reject) => {
        const options = {
            format: 'A4',
            orientation: 'portrait',
            border: {
                top: '0mm',
                right: '0mm', 
                bottom: '0mm',
                left: '0mm'
            },
            type: 'pdf',
            quality: '100',
            renderDelay: 8000, // เพิ่มเป็น 8 วินาที
            zoomFactor: 1.0,
            dpi: 150,
            width: '210mm',
            height: '297mm',
            timeout: 120000, // เพิ่มเป็น 2 นาที
            phantomArgs: [
                '--load-images=yes',
                '--local-to-remote-url-access=yes',
                '--web-security=false',
                '--ignore-ssl-errors=yes',
                '--ssl-protocol=any',
                '--disk-cache=false'
            ],
            httpHeaders: {
                'Cache-Control': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        console.log("Generating PDF with enhanced image loading...");
        
        pdf.create(html, options).toBuffer((err, buffer) => {
            if (err) {
                console.error("PDF Generation Error:", err);
                return reject(err);
            }
            
            console.log("PDF generated successfully!");
            console.log(`Buffer size: ${(buffer.length / 1024).toFixed(2)} KB`);
            resolve(buffer);
        });
    });
}

/**
 * สร้าง Email Template
 */
function createEmailTemplate(quotationNo = "QTM250001", customerName = "ลูกค้า") {
    return `
        <div style="font-family: 'Prompt', Arial, sans-serif; padding: 20px; text-align: center; background-color: #f9f9f9;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">ใบเสนอราคา / Quotation</h2>
                <div style="border: 2px solid #3498db; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p style="font-size: 16px; color: #34495e; margin: 10px 0;">
                        <strong>เลขใบเสนอราคา:</strong> ${quotationNo}
                    </p>
                    <p style="font-size: 16px; color: #34495e; margin: 10px 0;">
                        <strong>ลูกค้า:</strong> ${customerName}
                    </p>
                </div>
                <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="font-size: 14px; color: #7f8c8d; margin: 0;">
                        กรุณาดู PDF attachment สำหรับรายละเอียดครบถ้วน<br />
                        Please see PDF attachment for complete details
                    </p>
                </div>
                <div style="margin-top: 30px; color: #95a5a6; font-size: 12px;">
                    บริษัท เอ็ม โกลบอล ซอร์สซิ่ง จำกัด<br />
                    M Global Sourcing Ltd.
                </div>
            </div>
        </div>
    `;
}

/**
 * ตั้งค่า SMTP
 */
function getSMTPConfigurations(username, password) {
    return [
        {
            name: 'Larksuite (Port 587)',
            config: {
                host: 'smtp.larksuite.com',
                port: 587,
                secure: false,
                connectionTimeout: 30000,
                greetingTimeout: 15000,
                socketTimeout: 30000,
                auth: { user: username, pass: password },
                tls: { 
                    rejectUnauthorized: false,
                    ciphers: 'SSLv3'
                }
            }
        },
        {
            name: 'Larksuite (Port 465)',
            config: {
                host: 'smtp.larksuite.com',
                port: 465,
                secure: true,
                connectionTimeout: 30000,
                greetingTimeout: 15000,
                socketTimeout: 30000,
                auth: { user: username, pass: password },
                tls: { 
                    rejectUnauthorized: false,
                    servername: 'smtp.larksuite.com'
                }
            }
        },
        {
            name: 'Gmail (Port 587)',
            config: {
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                connectionTimeout: 30000,
                greetingTimeout: 15000,
                socketTimeout: 30000,
                auth: { user: username, pass: password },
                tls: { rejectUnauthorized: false }
            }
        },
        {
            name: 'Outlook (Port 587)',
            config: {
                service: 'hotmail',
                host: 'smtp-mail.outlook.com',
                port: 587,
                secure: false,
                connectionTimeout: 30000,
                greetingTimeout: 15000,
                socketTimeout: 30000,
                auth: { user: username, pass: password },
                tls: { 
                    rejectUnauthorized: false,
                    ciphers: 'SSLv3'
                }
            }
        }
    ];
}

/**
 * ทดสอบการเชื่อมต่อ SMTP
 */
function testSMTPConnection(config, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Connection timeout after ${timeoutMs}ms`));
        }, timeoutMs);

        try {
            const transporter = nodemailer.createTransport(config);
            transporter.verify((error, success) => {
                clearTimeout(timeout);
                if (error) {
                    reject(error);
                } else {
                    resolve(transporter);
                }
            });
        } catch (error) {
            clearTimeout(timeout);
            reject(error);
        }
    });
}

function parseEmailParameters(value) {
    try {
        const params = {};
        
        if (typeof value === 'string' && value.includes('username:')) {
            const pairs = value.split('&');
            pairs.forEach(pair => {
                const [key, ...valueParts] = pair.split(':');
                if (key && valueParts.length > 0) {
                    params[key] = valueParts.join(':');
                }
            });
        } else {
            console.warn('Invalid parameter format, using defaults');
            return {
                username: 'test@example.com',
                password: 'password',
                recipient: 'test@example.com',
                cc: '',
                subject: 'ใบเสนอราคา',
                body: 'กรุณาดูรายละเอียดในไฟล์แนบ',
                attachments: '',
                maxItemsPerPage: '15'
            };
        }
        
        // เพิ่มส่วนนี้:
        const requiredFields = ['username', 'password', 'recipient'];
        for (const field of requiredFields) {
            if (!params[field]) {
                throw new Error(`Missing required parameter: ${field}`);
            }
        }
        
        return {
            username: params.username || '',
            password: params.password || '',
            recipient: params.recipient || '',
            cc: params.cc || '',
            subject: params.subject || 'ใบเสนอราคา',
            body: params.body || 'กรุณาดูรายละเอียดในไฟล์แนบ',
            attachments: params.attachments || '',
            maxItemsPerPage: params.maxItemsPerPage || '15'
        };
        
    } catch (error) {
        console.error('Error parsing email parameters:', error.message);
        throw new Error('Invalid email parameter format');
    }
}

/**
 * สร้าง ZIP ไฟล์จากไฟล์ที่อัปโหลด
 */
async function createZipFromFiles(files, quotationNo = 'Documents') {
    return new Promise((resolve, reject) => {
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        const chunks = [];
        
        archive.on('data', (chunk) => {
            chunks.push(chunk);
        });

        archive.on('end', () => {
            const buffer = Buffer.concat(chunks);
            console.log(`ZIP created: ${(buffer.length / 1024).toFixed(2)} KB`);
            resolve(buffer);
        });

        archive.on('error', (err) => {
            console.error('ZIP creation error:', err);
            reject(err);
        });

        files.forEach((file, index) => {
            const fileName = file.originalname || `ไฟล์แนบ_${index + 1}`;
            console.log(`Adding to ZIP: ${fileName}`);
            
            archive.append(file.buffer, { 
                name: fileName 
            });
        });

        archive.finalize();
    });
}

// ==================== MAIN FUNCTION ====================

/**
 * ฟังก์ชันหลักสำหรับส่งใบเสนอราคา - แบบใหม่ แยกหน้าสินค้าและเงื่อนไข (แก้ไข fallback)
 */
async function SendOrder(backendData = null, emailParams = null, uploadedFiles = null) {
    try {
        console.log("=== SendOrder Function Called (New Layout Version) ===");
        console.log("Received backendData:", backendData ? "Yes" : "No");
        console.log("Received emailParams:", emailParams ? "Yes" : "No");
        console.log("Received uploadedFiles:", uploadedFiles ? `Yes (${uploadedFiles.length} files)` : "No");
        
        // ใช้ข้อมูลตัวอย่างหากไม่มีข้อมูลจาก backend
        if (!backendData) {
            console.log("No backend data provided, using sample data for testing");
            backendData = {
                salesNumber: await generateQuotationNumber(),
                customerName: 'บริษัท ศิขรินทรอินดัสตรี้ 2018 จำกัด',
                customerId: 'C100001',
                customerType: 'ลูกค้าใหม่',
                customerAddress: '693/2 ถนนศิขรินทร์ แขวงสามเสนใน เขตพญาไท กรุงเทพมหานคร 10400',
                customerTel: '081-412-2351',
                customerFax: '-',
                customerEmail: 'Audionpo2018@gmail.com',
                customerContact: 'คุณ ษฐน ผลบุญแนะนำ',
                employeeName: 'Sathaporn Rimying',
                employeeTel: '063-915-1052',
                employeePosition: 'วิศวกร ฝ่ายขาย / Sales Engineer',
                date: new Date(),
                ref: '-',
                validityInfo: '7 Days',
                deliveryInfo: '60 Days',
                discount: 0,
                note: 'ราคานี้รวม การติดตั้ง การฝึกอบรม และการรับประกัน 1 ปี',
                products: [
                    { 
                        id: 'MMMT-XECO003', 
                        name: 'DTH-ECO-40 END CLAMP 01 (40MM) , 40 MM', 
                        price: 13.13, 
                        quantity: 50, 
                        discount: 3 
                    },
                    { 
                        id: 'MMMT-XECO003', 
                        name: 'DTH-OC O3 BOLT COMBINATION O3 M8 BOLT 25MM+NUT03 (SET)', 
                        price: 7.50, 
                        quantity: 300, 
                        discount: 3 
                    },
                    { 
                        id: 'MTDI-ZQH-01', 
                        name: 'Mechanical shipping cost', 
                        price: 500.00, 
                        quantity: 1, 
                        discount: 0 
                    }
                ]
            };
        }

        // จัดการพารามิเตอร์อีเมล
        let emailSettings;
        if (!emailParams) {
            const defaultValue = "username:phisit.yut@mrgshrimp.com&password:XgdvYwJ0udPecp1T&recipient:phisit.yut@mrgshrimp.com&cc:&subject:test&body:testtest&attachments:&maxItemsPerPage:15";
            emailSettings = parseEmailParameters(defaultValue);
        } else {
            emailSettings = parseEmailParameters(emailParams);
        }

        console.log("Email settings parsed:", {
            username: emailSettings.username,
            recipient: emailSettings.recipient,
            subject: emailSettings.subject
        });

        // แปลงข้อมูลและสร้าง PDF
        console.log("Converting backend data to PDF format...");
        const quotationData = await convertBackendDataToPDFFormat(backendData);
        console.log(`Converted products count: ${quotationData.products.length}`);

        console.log("Creating HTML template with new layout...");
        const completeHTML = createHTMLTemplate(quotationData);

        // ตรวจสอบโครงสร้าง HTML
        const isStructureValid = validateHTMLStructure(completeHTML);
        if (!isStructureValid) {
            console.warn("Warning: HTML structure is not balanced!");
        }

        console.log("Generating PDF with new layout...");
        const pdfBuffer = await generatePdfBuffer(completeHTML);

        const timestampFilename = generateTimestampFilename('quotation');
        console.log(`Generated filename: ${timestampFilename}`);
        console.log(`PDF products count: ${quotationData.products.length}`);

        // ทดลองส่งอีเมล
        console.log("Setting up SMTP connection...");
        const smtpConfigs = getSMTPConfigurations(emailSettings.username, emailSettings.password);
        let transporter = null;
        let successfulProvider = null;

        for (const smtpOption of smtpConfigs) {
            try {
                console.log(`Trying ${smtpOption.name}...`);
                transporter = await testSMTPConnection(smtpOption.config, 15000);
                console.log(`${smtpOption.name} connection successful!`);
                successfulProvider = smtpOption.name;
                break;
            } catch (error) {
                console.log(`${smtpOption.name} failed:`, error.message);
                continue;
            }
        }

        if (!transporter) {
            console.log("All SMTP providers failed!");
            throw new Error("ส่งข้อมูลไปที่ email ไม่สำเร็จ - SMTP connection failed");
        }

        // สร้าง attachments array
        const attachments = [
            {
                filename: timestampFilename,
                content: pdfBuffer,
                contentType: 'application/pdf',
            }
        ];

        if (uploadedFiles && Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
            console.log(`Creating ZIP from ${uploadedFiles.length} user uploaded file(s):`);
            uploadedFiles.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.originalname} (${file.size} bytes)`);
            });

            // สร้าง ZIP buffer
            const zipBuffer = await createZipFromFiles(uploadedFiles, quotationData.quotationNo);
            
            attachments.push({
                filename: `เอกสารแนบ_${quotationData.quotationNo}.zip`,
                content: zipBuffer,
                contentType: 'application/zip'
            });

            console.log(`ZIP created successfully: เอกสารแนบ_${quotationData.quotationNo}.zip`);
        } else {
            console.log("No user uploaded files to zip");
        }

        // รับ email จาก frontend
        let toEmails = [];
        // แปลงเป็น string ก่อน split
        const employeeEmailRaw = String(backendData.employeeEmail || '').trim();

        if (employeeEmailRaw) {
            toEmails = employeeEmailRaw
                .split(/[,;\r\n]+/)
                .map(e => e.trim())
                .filter(Boolean);
        }

        // fallback
        if (toEmails.length === 0 && emailSettings.recipient) {
            console.log("No employeeEmail found, fallback to emailParams recipient");
            toEmails = [emailSettings.recipient];
        }
        
        console.log("Raw employeeEmail from backend:", backendData.employeeEmail);
        console.log("Final toEmails:", toEmails);

        const ccList = emailSettings.cc ? emailSettings.cc.split(',').map(email => email.trim()).filter(Boolean) : [];

        const mailOptions = {
            // from: `"Nueng" <${emailSettings.username}>`,
            from: `"Quotation Mech" <${emailSettings.username}>`,
            // cc: ["salescomechanical@mglobalsourcing.net", ...ccList], // ส่งให้แน่นอน + cc list จาก emailParams
            // to: toEmails,                  // ใช้ array ที่กรองแล้ว
            // cc: ["pilan.mill@gmail.com", ...ccList], // ส่งให้แน่นอน + cc list จาก emailParams
            // to: "phisit.yut@mrgshrimp.com",
            to: "pilan.mill@gmail.com", // ใช้ email ทดสอบ
            // to: "phkkapapha.sam@mglobalsourcing.net",
            // to: "orderconfirmnormal@mglobalsourcing.net",
            // to: "salescomechanical@mglobalsourcing.net",
            // cc: ccList.length ? ccList : undefined,
            subject: `รายการเปิดใบเสนอราคา ${quotationData.quotationNo} - ${quotationData.customerName} - MECH`,
            html: createEmailTemplate(quotationData.quotationNo, quotationData.customerName),
            // attachments: attachments, // ใช้ array ที่เตรียมไว้
            attachments: attachments.length ? attachments : undefined,
        };

        console.log(`Using ${successfulProvider} to send email...`);
        console.log(`Total attachments: ${attachments.length} (1 PDF + ${uploadedFiles ? uploadedFiles.length : 0} user files)`);

        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`Sending email attempt ${attempt}/2...`);
                const info = await transporter.sendMail(mailOptions);
                console.log("Email sent successfully:", info.response);
                
                return { 
                    success: true, 
                    method: 'email_sent',
                    provider: successfulProvider,
                    messageId: info.messageId, 
                    filename: timestampFilename,
                    quotationNo: quotationData.quotationNo,
                    customerName: quotationData.customerName,
                    productCount: quotationData.products.length,
                    attachedFilesCount: uploadedFiles ? uploadedFiles.length : 0,
                    message: "Email sent successfully with new layout"
                };
                
            } catch (sendError) {
                console.log(`Send attempt ${attempt} failed:`, sendError.message);
                if (attempt < 2) {
                    console.log(`Waiting 3 seconds before retry...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                } else {
                    throw new Error(`ส่งข้อมูลไปที่ email ไม่สำเร็จ - ${sendError.message}`);
                }
            }
        }

    } catch (error) {
        console.error("Error in SendOrder:", error.message);
        console.error("Error stack:", error.stack);
        return {
            success: false,
            method: 'email_failed',
            message: "ส่งข้อมูลไปที่ email ไม่สำเร็จ",
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}


// ==================== EXPORTS ====================

module.exports = {
    SendOrder,
    convertBackendDataToPDFFormat,
    generateQuotationNumber,
    convertToNewQuotationFormat
};
