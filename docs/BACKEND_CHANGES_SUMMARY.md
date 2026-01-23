# สรุปการแก้ไข Backend และผลกระทบ

## 📋 สรุปการแก้ไขทั้งหมด

### 1. Service Layer

#### ✅ `settings.service.js`
- **แก้ไข:** `getUserAccessibleCompanies()` → ใช้ `SystemUserCompany` แทน `SystemUser.IC_ID`
- **เพิ่ม:** `getUserAccessibleCompanyIds()` → Helper function ใหม่
- **แก้ไข:** `createUser()` → รองรับ `companyIds` (Array) แทน `companyId` (single)
- **แก้ไข:** `updateUser()` → รองรับ `companyIds` (Array) แทน `companyId` (single)
- **แก้ไข:** `getUserById()` → เพิ่ม `companyIds` ใน response

#### ✅ `vehicle.service.js`
- **แก้ไข:** `getAllVehicles()` → เปลี่ยนจาก `userCompanyId` เป็น `userId` และใช้ `getUserAccessibleCompanyIds()`
- **เปลี่ยน:** `WHERE IC_ID = @CompanyId` → `WHERE IC_ID IN (@CompanyId1, @CompanyId2, ...)`

#### ✅ `dashboard.service.js`
- **แก้ไข:** `getTodayStats()` → เปลี่ยนจาก `userCompanyId` เป็น `userId` และใช้ `getUserAccessibleCompanyIds()`
- **แก้ไข:** `getRecentActivities()` → เปลี่ยนจาก `userCompanyId` เป็น `userId` และใช้ `getUserAccessibleCompanyIds()`
- **เปลี่ยน:** `WHERE IC_ID = @CompanyId` → `WHERE IC_ID IN (@CompanyId1, @CompanyId2, ...)`

#### ✅ `statistics.service.js`
- **เพิ่ม:** `getFinalCompanyIds()` → Helper function ใหม่
- **แก้ไข:** ทุก function → เปลี่ยนจาก `companyId` เป็น `userId` และ `filterCompanyId`
  - `getOverviewStats(period, userId, filterCompanyId, vehicleType)`
  - `getVehicleTypeStats(period, userId, filterCompanyId, vehicleType)`
  - `getPeakHoursStats(period, userId, filterCompanyId, vehicleType)`
  - `getTopCompaniesStats(period, limit, userId, filterCompanyId, vehicleType)`
  - `getTrafficTrendStats(period, userId, filterCompanyId, vehicleType)`
  - `getAdditionalStats(period, userId, filterCompanyId, vehicleType)`
- **เปลี่ยน:** `WHERE IC_ID = @CompanyId` → `WHERE IC_ID IN (@CompanyId1, @CompanyId2, ...)`

#### ✅ `report.service.js`
- **แก้ไข:** `getReports()` → เพิ่ม `filters.userId` และใช้ `getUserAccessibleCompanyIds()`
- **แก้ไข:** `getStatistics()` → เพิ่ม `filters.userId` และใช้ `getUserAccessibleCompanyIds()`
- **เปลี่ยน:** `WHERE IC_ID = @CompanyId` → `WHERE IC_ID IN (@CompanyId1, @CompanyId2, ...)`

#### ✅ `permission.service.js`
- **แก้ไข:** `getUserAccessibleScreens()` → ใช้ `getUserAccessibleCompanyIds()` แทน `user.IC_ID`
- **เปลี่ยน:** `WHERE IC_ID = @CompanyId` → `WHERE IC_ID IN (@CompanyId1, @CompanyId2, ...)`

#### ✅ `auth.js` (Middleware)
- **แก้ไข:** `getUserCompanyInfo()` → เพิ่ม `accessibleCompanyIds` ใน `req.user`

---

## ⚠️ ปัญหาที่พบ: Controllers ยังไม่สอดคล้องกับ Service

### 🔴 ปัญหา 1: `statistics.controller.js`
**ปัจจุบัน:**
```javascript
const finalCompanyId = this.getFinalCompanyId(userCompanyId, companyId);
await statisticsService.getOverviewStats(period, finalCompanyId, vehicleType);
```

**ควรเป็น:**
```javascript
await statisticsService.getOverviewStats(period, userId, companyId, vehicleType);
```

**ผลกระทบ:** ❌ Service รับ parameter ผิด → จะเกิด Error

---

### 🔴 ปัญหา 2: `dashboard.controller.js`
**ปัจจุบัน:**
```javascript
const stats = await dashboardService.getTodayStats(userCompanyId, filterCompanyId, ...);
```

**ควรเป็น:**
```javascript
const stats = await dashboardService.getTodayStats(userId, filterCompanyId, ...);
```

**ผลกระทบ:** ❌ Service รับ parameter ผิด → จะเกิด Error

---

### 🔴 ปัญหา 3: `vehicle.controller.js`
**ปัจจุบัน:**
```javascript
filters: {
  userCompanyId: userCompanyId,  // ❌ ผิด
  ...
}
```

**ควรเป็น:**
```javascript
filters: {
  userId: userId,  // ✅ ถูก
  ...
}
```

**ผลกระทบ:** ❌ Service รับ parameter ผิด → จะเกิด Error

---

### 🔴 ปัญหา 4: `report.controller.js`
**ปัจจุบัน:**
```javascript
filters: {
  companyId: req.query.companyId,  // ❌ ไม่มี userId
  ...
}
```

**ควรเป็น:**
```javascript
filters: {
  userId: req.query.userId,  // ✅ ต้องเพิ่ม
  companyId: req.query.companyId,
  ...
}
```

**ผลกระทบ:** ❌ Service จะไม่รู้ว่า User เป็นใคร → อาจแสดงข้อมูลผิด

---

### 🔴 ปัญหา 5: `settings.controller.js`
**ปัจจุบัน:**
```javascript
await settingsService.createUser({
  companyId: companyId,  // ❌ Single value
  ...
});
```

**ควรเป็น:**
```javascript
await settingsService.createUser({
  companyIds: [companyId],  // ✅ Array (รองรับหลาย Company)
  companyId: companyId,  // ✅ Backward compatible
  ...
});
```

**ผลกระทบ:** ⚠️ ยังทำงานได้ (เพราะ service รองรับ backward compatible) แต่จะสร้างแค่ 1 Company

---

## ✅ Backward Compatibility

### สิ่งที่ยังทำงานได้:
1. ✅ `SystemUser.IC_ID` ยังคงอยู่ (ใช้ค่าแรกของ Array)
2. ✅ Super Admin (IC_ID = NULL) ยังทำงานเหมือนเดิม
3. ✅ ระบบเก่ายังอ่านค่าได้เหมือนเดิม

### สิ่งที่ต้องแก้ไข:
1. ❌ Controllers ต้องส่ง `userId` แทน `userCompanyId`
2. ❌ Controllers ต้องส่ง `userId` และ `filterCompanyId` แทน `finalCompanyId`
3. ⚠️ Frontend ต้องส่ง `userId` ใน query parameter

---

## 📝 สรุปผลกระทบ

### ❌ จะเกิด Error:
- `statistics.controller.js` → Service รับ parameter ผิด
- `dashboard.controller.js` → Service รับ parameter ผิด
- `vehicle.controller.js` → Service รับ parameter ผิด

### ⚠️ ยังทำงานได้แต่ไม่ถูกต้อง:
- `report.controller.js` → ไม่มี `userId` → อาจแสดงข้อมูลผิด
- `settings.controller.js` → ยังสร้างได้แค่ 1 Company

### ✅ ยังทำงานได้ปกติ:
- `auth.js` middleware → เพิ่ม field ใหม่ (ไม่กระทบ)
- `permission.service.js` → ใช้ logic ใหม่ (ไม่กระทบ)

---

## 🔧 ต้องแก้ไข Controllers

1. ✅ `statistics.controller.js` → ส่ง `userId` และ `filterCompanyId` แทน `finalCompanyId`
2. ✅ `dashboard.controller.js` → ส่ง `userId` แทน `userCompanyId`
3. ✅ `vehicle.controller.js` → ส่ง `userId` แทน `userCompanyId`
4. ✅ `report.controller.js` → เพิ่ม `userId` ใน filters
5. ⚠️ `settings.controller.js` → รองรับ `companyIds` (Array) แต่ยังใช้ `companyId` (single) ได้

