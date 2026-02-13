# WS3 — ระบบ Smart Security

ระบบจัดการการเข้า-ออกยานพาหนะ (Vehicle Entry/Exit) รองรับหลายบริษัท มี Dashboard, รายงาน, สถิติ, และตั้งค่าตาม Role

---

## โครงสร้างโปรเจกต์

```
WS3/
├── backend/          # API Server (Node.js + Express)
├── frontend/         # เว็บแอป (Vue 3)
└── README.md         # ไฟล์นี้
```

| โฟลเดอร์ | หน้าที่ |
|----------|---------|
| **backend** | รัน API (พอร์ต 8088), เชื่อม SQL Server, จัดการ WayIn/WayOut, User, Company, Report, Statistics |
| **frontend** | UI (Vue 3 + Vue Router), รัน dev ที่พอร์ต 8080, build แล้วส่งไป backend หรือแยก deploy |

---

## สแต็กที่ใช้

- **Frontend:** Vue 3, Vue Router, Pinia, Tailwind CSS, Chart.js, Axios  
- **Backend:** Node.js, Express, MSSQL (SQL Server)  
- **Database:** SQL Server (ตารางหลัก เช่น SystemUser, InternalCompany, WayIn, WayOut, SystemUserCompany, GuardLocation)

---

## วิธีรันโปรเจกต์

### 1. Database (SQL Server)

- ใช้ SQL Server Management Studio (SSMS) สร้าง/เลือก Database
- ตั้งค่า connection ใน **backend** ผ่านไฟล์ **`.env`** (ดูตัวอย่างด้านล่าง)

### 2. Backend

```bash
cd backend
npm install
# สร้างไฟล์ .env จาก .env.example (ถ้ามี) แล้วใส่ค่า SQL_SERVER, SQL_DATABASE, SQL_USER, SQL_PASSWORD
npm start
```

- รันที่พอร์ต **8088** (หรือตาม `PORT` ใน `.env`)
- ตรวจว่าเชื่อม DB ได้: เปิด `http://localhost:8088/` ควรได้ JSON ตอบกลับ

### 3. Frontend

```bash
cd frontend
npm install
npm run serve
```

- รันที่พอร์ต **8080**
- เปิดเบราว์เซอร์ที่ `http://localhost:8080`
- หน้า Login ใช้ user ที่สร้างใน DB (เช่น `sysadmin` / รหัสที่ตั้งไว้)

---

## ตั้งค่า Backend (.env)

ในโฟลเดอร์ **backend** สร้างไฟล์ **`.env`** ตัวอย่าง:

```env
PORT=8088
SQL_SERVER=localhost
SQL_DATABASE=SmartSecurity
SQL_USER=dev
SQL_PASSWORD=your_password
NODE_ENV=development
```

แก้ค่าให้ตรงกับ SQL Server จริง (ชื่อ server, database, user, password)

---

## สคริปต์ Database (Deploy / ตั้งค่าเริ่มต้น)

อยู่ที่ **`backend/scripts/`**

### ลำดับรันหลัก (Deploy ชุดจบ)

รันใน SSMS **ตามลำดับ** (เลือก Database ก่อนรันทุกครั้ง):

1. **NumBer1_deploy-sync-to-backup.sql**  
   โครงสร้างตาราง, คอลัมน์ WayIn, SystemUserCompany, SystemSettings, GuardLocation, SystemScreen, สิทธิ์ Role, migrate User → SystemUserCompany

2. **NumBer2_map-user-role-company.sql**  
   ตั้ง SR_ID/IC_ID (เทส) + เติม SystemUserCompany

3. **Number3_systemadminuser.sql**  
   สร้าง/อัปเดต user **sysadmin** (Super Admin)

รายละเอียดสคริปต์อื่น (check, fix, ฝั่ง production) อ่านใน **`backend/scripts/FILES_STATUS.md`**

---

## บทบาทและสิทธิ์ (สรุป)

- **Super Admin:** user ที่ในตาราง `SystemUser` มี **IC_ID = NULL** → เห็นข้อมูลทุกบริษัท  
- **Company Admin / User อื่น:** ผูกกับบริษัทผ่าน `SystemUserCompany` หรือ `IC_ID` → เห็นเฉพาะบริษัทที่กำหนด  
- บริษัทที่ **ปิดใช้งาน** จะไม่โผล่ใน dropdown: ตรวจ/เปิดที่ตาราง **InternalCompany** คอลัมน์ **IC_IsActive** (1 = เปิด, 0 = ปิด)  
  - สคริปต์เปิดทุกบริษัท: **`backend/scripts/activate-all-companies.sql`**

---

## หน้าที่หลักของแอป (Frontend)

| หน้า | หน้าที่ |
|------|---------|
| **Dashboard** | สรุปรถเข้า/ออกวันนี้, รถค้าง, จำนวนบริษัท, รายการเข้า-ออกล่าสุด (มี filter บริษัทเมื่อมีหลายบริษัท) |
| **รายการ การเข้า-ออก** | จัดการ WayIn/WayOut (ทะเบียน, คนขับ, บริษัท ฯลฯ) |
| **Report** | รายงานสรุปเข้า-ออก, filter วันที่/บริษัท/ประเภทรถ/สถานะ, ส่งออก Excel/PDF |
| **Statistics** | สถิติแนวโน้ม, ประเภทรถ, ชั่วโมงเร่งด่วน, บริษัทที่ใช้บริการบ่อย, สถิติแยกตามจุดเข้า-ออก |
| **Settings** | ตั้งค่าบริษัท, User, Role, สิทธิ์หน้าจอ, Location, ฯลฯ |

---

## โครงสร้าง Backend (สรุป)

- **`server.js`** — จุดเข้า, ตั้ง CORS, rate limit, โหลด routes  
- **`routes/`** — config, auth, wayin, wayout, settings, location, dashboard, vehicle, vehicleType, report, statistics  
- **`controllers/`** — logic รับ/ส่ง request ต่อ service  
- **`service/`** — logic หลัก + เชื่อม DB (เช่น `db.service`, `settings.service`, `report.service`, `statistics.service`)  
- **`middleware/auth.js`** — ดึงข้อมูล user/company จาก `userId` สำหรับ API ที่ต้องกรองตามบริษัท  
- **`scripts/`** — สคริปต์ SQL สำหรับ deploy, map user-role-company, สร้าง sysadmin, check/fix และเปิดบริษัท

---

## โครงสร้าง Frontend (สรุป)

- **`src/views/`** — หน้าหลัก: Login, Dashboard, Vehicle (รายการเข้า-ออก), Report, Statistics, Settings, Error403  
- **`src/components/`** — component ใช้ซ้ำ (Sidebar, Card, Table, Modal, ตัว filter วันที่ ฯลฯ)  
- **`src/services/api.js`** — เรียก API ฝั่ง backend (wayin, wayout, dashboard, reports, statistics, settings ฯลฯ)  
- **`src/stores/`** — Pinia (เช่น filter store สำหรับวันที่)  
- **`vue.config.js`** — ตั้ง proxy ชี้ไป backend ตอน dev

---

## สิ่งที่คนทำต่อควรรู้

1. **Database:** ทุกสคริปต์ใน `backend/scripts/` **ไม่มี `USE [DatabaseName]`** — ต้องเลือก Database ใน SSMS เองก่อนรัน  
2. **Super Admin ดูได้ทุกบริษัท:** ต้องมี `SystemUser.IC_ID = NULL` และไม่ต้องมีแถวใน `SystemUserCompany` สำหรับ user นั้น (มีสคริปต์ `check-sysadmin-db.sql` และ `fix-sysadmin-see-all-companies.sql` ให้ใช้ตรวจ/แก้)  
3. **บริษัทไม่โผล่ในระบบ:** ตรวจ `InternalCompany.IC_IsActive = 1` และใช้ `activate-all-companies.sql` ถ้าต้องการเปิดทุกบริษัท  
4. **Deploy ฝั่ง Production:** นอกจากชุด NumBer1 → 2 → 3 แล้ว ฝั่ง full server อาจต้องรัน **`add-role-emp-on-full-server.sql`** (ดูใน `FILES_STATUS.md`)  
5. **พอร์ต:** Backend 8088, Frontend dev 8080 — ตรวจ CORS ใน `backend/server.js` ถ้าแยก domain/พอร์ต

---

## License

Private / ใช้ภายในองค์กร (ตรวจจาก repo และนโยบายบริษัท)
