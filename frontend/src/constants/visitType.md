## วัตถุประสงค์

คู่มือนี้จัดทำขึ้นเพื่ออธิบายขั้นตอนการเปลี่ยน **Company Type / URL ของบริษัท** ก่อนทำการ Deploy ระบบ ให้ Dev สามารถตั้งค่าได้ถูกต้องและลดความสับสน

---

## ขอบเขตการใช้งาน

* ใช้ในกรณีที่ต้อง Deploy ระบบแยกตามบริษัท
* ปัจจุบันรองรับบริษัท:

  * **Ruxchai**
  * **MRG Shrimp**

---

## ขั้นตอนการตั้งค่าก่อน Deploy

### 1. เปิดไฟล์ที่ใช้ตั้งค่า

ไปที่ไฟล์:

```
visitTypes.js
```

---

### 2. ตรวจสอบส่วน URL Template

ภายในไฟล์ `visitTypes.js` ให้ค้นหาส่วนของการกำหนดค่า `QR_URL_TEMPLATE` ซึ่งใช้กำหนด URL ตามบริษัทที่ต้องการ Deploy

ตัวอย่างโค้ด:

```js
// URL Template - เลือกใช้ตามบริษัทที่ Deploy

// สำหรับ Ruxchai:
QR_URL_TEMPLATE: process.env.VUE_APP_QR_URL || 'https://smartsecurity.ruxchai.co.th/index.php?param=',

// สำหรับ MRG Shrimp:
// QR_URL_TEMPLATE: process.env.VUE_APP_QR_URL || 'https://smartsecurity.mrgshrimp.com/',
```

---

### 3. เลือกบริษัทที่ต้องการ Deploy

* ให้ **เปิดใช้งาน (uncomment)** URL ของบริษัทที่ต้องการ Deploy
* และ **ปิดการใช้งาน (comment)** URL ของบริษัทอื่น

#### ตัวอย่าง

**กรณี Deploy สำหรับ Ruxchai**

```js
QR_URL_TEMPLATE: process.env.VUE_APP_QR_URL || 'https://smartsecurity.ruxchai.co.th/index.php?param=',
// QR_URL_TEMPLATE: process.env.VUE_APP_QR_URL || 'https://smartsecurity.mrgshrimp.com/',
```

**กรณี Deploy สำหรับ MRG Shrimp**

```js
// QR_URL_TEMPLATE: process.env.VUE_APP_QR_URL || 'https://smartsecurity.ruxchai.co.th/index.php?param=',
QR_URL_TEMPLATE: process.env.VUE_APP_QR_URL || 'https://smartsecurity.mrgshrimp.com/',
```

---

## ข้อควรระวัง

* ต้องตรวจสอบทุกครั้งก่อน Deploy ว่าเลือก URL ของบริษัทถูกต้อง
* ห้ามเปิดใช้งาน `QR_URL_TEMPLATE` มากกว่า 1 บริษัทพร้อมกัน
* หากมีการเพิ่มบริษัทใหม่ในอนาคต ให้เพิ่มในรูปแบบเดียวกันและระบุ comment ให้ชัดเจน

---

## สรุป

ก่อน Deploy ระบบทุกครั้ง Dev ต้องเข้าไปตั้งค่า `QR_URL_TEMPLATE` ในไฟล์ `visitTypes.js` ให้ตรงกับบริษัทเป้าหมาย โดยเปิดใช้งานเพียงบริษัทเดียวเท่านั้น เพื่อป้องกันการชี้ URL ผิดบริษัท
