# WS3 API Documentation

**Version:** 1.0.0
**Last Updated:** 2025-10-10
**Port:** 8081
**Status:** Active

## Base URL
```
http://localhost:8081
```

---

## API Endpoints

### 1. Health Check
ตรวจสอบสถานะ API Server

**Endpoint:** `GET /`

**Response:**
```json
{
  "message": "Welcome to WS3 API",
  "status": "running",
  "version": "1.0.0",
  "timestamp": "2025-10-10T08:05:53.930Z"
}
```

---

## WayIn API (บันทึกการเข้า)

### 2. สร้างข้อมูลการเข้า
บันทึกข้อมูลผู้เข้าหรือยานพาหนะเข้าพื้นที่

**Endpoint:** `POST /api/wayin`

**Headers:**
```
Content-Type: application/json
```

**Request Body (ตัวอย่างที่ใช้งานได้จริง):**
```json
{
  "systemUserId": 1,
  "barcode": "TEST001",
  "fullName": "นายทดสอบ ระบบ",
  "licensePlate": "กท-1234",
  "vehicleType": "รถยนต์",
  "device": "DEVICE001"
}
```

**Request Body (ฟิลด์ทั้งหมด):**
```json
{
  "systemUserId": 1,           // Required - รหัสเจ้าหน้าที่ที่บันทึก
  "barcode": "TEST001",        // Optional - บาร์โค้ด (ถ้าไม่ส่ง ระบบจะสร้างอัตโนมัติ)
  "cardId": 0,                 // Optional - รหัสบัตร (default: 0)
  "fullName": "ชื่อ-นามสกุล",  // Optional - ชื่อผู้เข้า
  "gender": "ชาย",             // Optional - เพศ
  "address": "ที่อยู่",         // Optional - ที่อยู่
  "licensePlate": "กท-1234",   // Optional - ทะเบียนรถ
  "licenseProvince": "จังหวัด", // Optional - จังหวัด
  "vehicleType": "รถยนต์",      // Optional - ประเภทยานพาหนะ
  "internalDivision": "แผนก",  // Optional - แผนกที่ติดต่อ
  "follower": 1,               // Optional - จำนวนผู้ติดตาม (default: 0)
  "fromCompany": "บริษัท",     // Optional - บริษัทที่มาติดต่อ
  "contactName": "ผู้ติดต่อ",   // Optional - ชื่อผู้ติดต่อ
  "remarks": "หมายเหตุ",        // Optional - หมายเหตุ
  "device": "DEVICE001",       // Optional - รหัสอุปกรณ์
  "recordedOn": "2025-10-10T14:30:00" // Optional - วันเวลาที่บันทึก (ถ้าไม่ส่งจะใช้เวลาปัจจุบัน)
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Way In record created successfully",
  "data": {
    "WI_ID": 677880
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "System User ID is required"
}
```

---

### 3. ดึงข้อมูลการเข้าตาม ID
ดึงข้อมูลผู้เข้าตามรหัส WI_ID

**Endpoint:** `GET /api/wayin/:id`

**Example:** `GET /api/wayin/677880`

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "WI_ID": 677880,
    "WI_Barcode": "TEST001",
    "WI_CardID": "0",
    "WI_FullName": "นายทดสอบ ระบบ",
    "WI_Gender": null,
    "WI_Address": null,
    "WI_LicensePlate": "กท-1234",
    "WI_LicenseProvince": null,
    "WI_VehicleType": "รถยนต์",
    "WI_InternalDivision": null,
    "WI_Follower": 0,
    "WI_Remarks": null,
    "SU_ID": 1,
    "WI_RecordedOn": "2025-10-10T08:05:53.930Z",
    "QDevice": "DEVICE001",
    "SystemUserName": "กอล์ฟ",
    "SystemUserCode": "RCS1800001"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Way In record not found"
}
```

---

### 4. ดูรายการผู้ที่เข้ามาแล้วยังไม่ออก (Active Visitors)
ดูรายการผู้ที่เข้ามาแล้วแต่ยังไม่ได้ออก

**Endpoint:** `GET /api/visitors/active`

**Response Success (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "WI_ID": 677880,
      "WI_FullName": "นายทดสอบ ระบบ",
      "WI_LicensePlate": "กท-1234",
      "WI_RecordedOn": "2025-10-10T08:05:53.930Z",
      "SystemUserName": "กอล์ฟ",
      "SystemUserCode": "RCS1800001"
    }
  ]
}
```

---

### 5. ดูรายการการเข้าทั้งหมด
ดึงรายการการเข้าทั้งหมดพร้อม pagination

**Endpoint:** `GET /api/wayin`

**Query Parameters:**
- `page` - หน้าที่ต้องการ (default: 1)
- `limit` - จำนวนรายการต่อหน้า (default: 50)

**Example:** `GET /api/wayin?page=1&limit=20`

**Response Success (200):**
```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "count": 20,
  "data": [...]
}
```

---

## WayOut API (บันทึกการออก)

### 6. สร้างข้อมูลการออก
บันทึกข้อมูลผู้ออกหรือยานพาหนะออกจากพื้นที่

**Endpoint:** `POST /api/wayout`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "wayInId": 677880,                    // Required - รหัส WI_ID ที่ต้องการบันทึกการออก
  "systemUserId": 1,                    // Required - รหัสเจ้าหน้าที่ที่บันทึก
  "remarks": "ออกเรียบร้อย",            // Optional - หมายเหตุ
  "recordedOn": "2025-10-10T17:30:00"   // Optional - วันเวลาที่บันทึก (ถ้าไม่ส่งจะใช้เวลาปัจจุบัน)
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Way Out record created successfully",
  "data": {
    "WO_ID": 100
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Way In ID is required"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Way In ID not found"
}
```

**Response Error (400) - Already Checked Out:**
```json
{
  "success": false,
  "message": "This visitor has already checked out"
}
```

---

### 7. ดึงข้อมูลการออกตาม WayOut ID
ดึงข้อมูลการออกตามรหัส WO_ID

**Endpoint:** `GET /api/wayout/:id`

**Example:** `GET /api/wayout/100`

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "WO_ID": 100,
    "WI_ID": 677880,
    "SU_ID": 1,
    "WO_RecordedOn": "2025-10-10T17:30:00.000Z",
    "WO_Remarks": "ออกเรียบร้อย",
    "WI_FullName": "นายทดสอบ ระบบ",
    "WI_LicensePlate": "กท-1234",
    "CheckInTime": "2025-10-10T08:05:53.930Z",
    "SystemUserName": "กอล์ฟ",
    "SystemUserCode": "RCS1800001"
  }
}
```

---

### 8. ดึงข้อมูลการออกตาม WayIn ID
ตรวจสอบว่า WayIn นี้มีการบันทึกออกแล้วหรือยัง

**Endpoint:** `GET /api/wayout/wayin/:wayInId`

**Example:** `GET /api/wayout/wayin/677880`

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "WO_ID": 100,
    "WI_ID": 677880,
    "WO_RecordedOn": "2025-10-10T17:30:00.000Z",
    "SystemUserName": "กอล์ฟ"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Way Out record not found for this Way In ID"
}
```

---

### 9. ดูรายการการออกทั้งหมด
ดึงรายการการออกทั้งหมดพร้อม pagination

**Endpoint:** `GET /api/wayout`

**Query Parameters:**
- `page` - หน้าที่ต้องการ (default: 1)
- `limit` - จำนวนรายการต่อหน้า (default: 50)

**Example:** `GET /api/wayout?page=1&limit=20`

**Response Success (200):**
```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "count": 20,
  "data": [...]
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (ข้อมูลไม่ครบหรือไม่ถูกต้อง) |
| 404 | Not Found (ไม่พบข้อมูล) |
| 500 | Internal Server Error (ข้อผิดพลาดจาก Server) |

---

## หมายเหตุสำคัญ

### ข้อมูลที่จำเป็น (Required):
- `systemUserId` - ต้องมี SU_ID ที่อยู่ในตาราง SystemUser แล้ว

### ข้อมูลที่มีค่า Default:
- `barcode` - ถ้าไม่ส่งมา ระบบจะสร้างอัตโนมัติ (รูปแบบ: WI{timestamp}{random})
- `follower` - ถ้าไม่ส่งมา จะเป็น 0
- `cardId` - ถ้าไม่ส่งมา จะเป็น 0
- `recordedOn` - ถ้าไม่ส่งมา ระบบจะใช้เวลาปัจจุบันอัตโนมัติ

### กฎการใช้งาน:
- ต้องบันทึก WayIn ก่อนถึงจะบันทึก WayOut ได้
- แต่ละ WayIn บันทึก WayOut ได้แค่ครั้งเดียว (ไม่สามารถออกซ้ำได้)

### Database Trigger:
- ตาราง WayIn มี Trigger `WI_Insert` ที่จะ sync ข้อมูลไปยังระบบอื่น
- หากต้องการทดสอบโดยไม่ sync ข้อมูล ให้ปิด Trigger ชั่วคราว:
```sql
ALTER TABLE [SmartSecurity].[dbo].[WayIn] DISABLE TRIGGER WI_Insert
```

---

## ตัวอย่างการใช้งานด้วย cURL

### สร้าง WayIn
```bash
curl -X POST http://localhost:8081/api/wayin \
  -H "Content-Type: application/json" \
  -d '{
    "systemUserId": 1,
    "fullName": "นายทดสอบ ระบบ",
    "licensePlate": "กท-1234",
    "vehicleType": "รถยนต์",
    "device": "DEVICE001"
  }'
```

### สร้าง WayOut
```bash
curl -X POST http://localhost:8081/api/wayout \
  -H "Content-Type: application/json" \
  -d '{
    "wayInId": 677880,
    "systemUserId": 1,
    "remarks": "ออกเรียบร้อย"
  }'
```

### ดูรายการผู้ที่อยู่ภายใน
```bash
curl http://localhost:8081/api/visitors/active
```

### ดูข้อมูลการเข้าตาม ID
```bash
curl http://localhost:8081/api/wayin/677880
```

---

## Test Data สำหรับทดสอบ App

### ข้อมูล SystemUser ที่มีอยู่ในฐานข้อมูล:

| SU_ID | SU_Code | SU_Name1 | SU_Username | SU_Password |
|-------|---------|----------|-------------|-------------|
| 1 | RCS1800001 | กอล์ฟ | 39999 | 123456 |
| 2 | RCS1800002 | ฟิตก์ | 11111 | 11111 |
| 1002 | 99999 | System Admin | sysadmin | spl1234 |
| 1003 | 120012 | ธีรชาย อินทรชิต | 120012 | 120012 |
| 1004 | 120017 | วิชาญ อินทรชิต | 120017 | 120017 |

### ตัวอย่างข้อมูลทดสอบ:

#### ทดสอบบันทึกการเข้า (WayIn):

**กรณีที่ 1: ข้อมูลครบถ้วน**
```json
{
  "systemUserId": 1,
  "barcode": "TEST001",
  "fullName": "นายทดสอบ ระบบ",
  "gender": "ชาย",
  "address": "กรุงเทพมหานคร",
  "licensePlate": "กท-1234",
  "licenseProvince": "กรุงเทพมหานคร",
  "vehicleType": "รถยนต์",
  "internalDivision": "แผนก IT",
  "follower": 2,
  "fromCompany": "บริษัท ABC จำกัด",
  "contactName": "นายติดต่อ ทดสอบ",
  "remarks": "มาติดต่องาน",
  "device": "DEVICE001"
}
```

**กรณีที่ 2: ข้อมูลเฉพาะที่จำเป็น (แนะนำ)**
```json
{
  "systemUserId": 1,
  "fullName": "นายทดสอบ ระบบ",
  "licensePlate": "กท-1234",
  "vehicleType": "รถยนต์",
  "device": "DEVICE001"
}
```

**กรณีที่ 3: มอเตอร์ไซค์**
```json
{
  "systemUserId": 2,
  "fullName": "นายทดสอบ มอเตอร์ไซค์",
  "licensePlate": "1กท-1234",
  "vehicleType": "มอเตอร์ไซค์",
  "device": "DEVICE002"
}
```

**กรณีที่ 4: คนเดินเท้า (ไม่มียานพาหนะ)**
```json
{
  "systemUserId": 1,
  "fullName": "นายทดสอบ เดินเท้า",
  "fromCompany": "บริษัท XYZ จำกัด",
  "contactName": "นายผู้จัดการ",
  "device": "DEVICE001"
}
```

#### ทดสอบบันทึกการออก (WayOut):

**ใช้ WI_ID ที่ได้จากการบันทึก WayIn**
```json
{
  "wayInId": 677880,
  "systemUserId": 1,
  "remarks": "ออกเรียบร้อย"
}
```

### ผลลัพธ์ที่คาดหวัง:

✅ **Success Response:**
- Status Code: 201 (Created)
- มี `WI_ID` หรือ `WO_ID` ส่งกลับมา

❌ **Error Response:**
- Status Code: 400, 404, 500
- มี error message อธิบายปัญหา

---

## Tips สำหรับทีม App:

1. **เก็บ WI_ID ไว้** - ต้องใช้ตอนบันทึกการออก
2. **ใช้ systemUserId** - ตาม user ที่ login อยู่
3. **barcode** - ถ้าไม่มีให้ส่งเป็น null หรือไม่ต้องส่ง ระบบจะสร้างให้
4. **recordedOn** - ถ้าไม่ส่ง ระบบจะใช้เวลาปัจจุบัน
5. **ทดสอบ GET /api/visitors/active** - เพื่อดูรายการคนที่อยู่ภายใน

---

**สำหรับทีม App Developer:**
ไฟล์นี้เป็นเอกสารคู่มือการใช้งาน API สำหรับระบบ WS3
หากมีข้อสงสัยหรือพบปัญหา กรุณาติดต่อทีม Backend

**Last Updated:** 2025-10-10
**Version:** 1.0.0
