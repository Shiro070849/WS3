# 🚀 คู่มือการ Deploy WS3 Application

## 📁 โครงสร้างโปรเจค

```
WS3/
├── frontend/          # Vue.js Application
│   ├── .env.development      # Development config (localhost)
│   ├── .env.production       # Production config (server)
│   ├── build-production.bat  # Build script
│   └── dist/                 # Output (หลัง build)
├── backend/           # Node.js + Express API
│   ├── .env                  # Backend config
│   └── server.js             # Main server file
└── README_DEPLOY.md   # ไฟล์นี้
```

---

## 🌐 URL Configuration

### Development (ตอนพัฒนา)
- **Frontend**: http://localhost:8080/
- **Backend**: http://localhost:8088/
- **API**: http://localhost:8088/api/

### Production (บน Server)
- **Frontend**: http://smartsecurity.ruxchai.co.th/mgssale/
- **Backend**: http://smartsecurity.ruxchai.co.th:8088/
- **API**: http://smartsecurity.ruxchai.co.th:8088/api/

---

## 📋 ขั้นตอนการ Deploy ครั้งแรก

### 1️⃣ เตรียม Server (Windows Server)

**ติดตั้งสิ่งที่จำเป็น (ถ้ายังไม่มี):**

1. **Node.js**: ดาวน์โหลดจาก https://nodejs.org/ (LTS version)
2. **PM2** (Process Manager สำหรับ Node.js):
   ```cmd
   npm install -g pm2
   npm install -g pm2-windows-startup
   pm2-startup install
   ```

3. **IIS หรือ HTTP Server** สำหรับ serve frontend (ถ้ายังไม่มี)

---

### 2️⃣ Deploy Backend (ครั้งแรก)

**บน Server (Remote Desktop):**

1. **สร้างโฟลเดอร์สำหรับโปรเจค**
   ```
   C:\inetpub\ws3\backend\
   ```

2. **Remote Desktop เข้า Server**

3. **Copy โฟลเดอร์ backend** จากเครื่อง local → Server
   - วิธี 1: Copy-Paste ผ่าน Remote Desktop
   - วิธี 2: ใช้ Share Folder

4. **Install dependencies**
   ```cmd
   cd C:\inetpub\ws3\backend
   npm install --production
   ```

5. **สร้างไฟล์ .env สำหรับ production**
   ```env
   NODE_ENV=production
   PORT=8088

   # SQL Server Config
   SQL_SERVER=192.168.1.65
   SQL_USER=your_user
   SQL_PASSWORD=your_password
   SQL_DATABASE=SmartSecurity
   SQL_ENCRYPT=false
   ```

6. **รัน backend ด้วย PM2**
   ```cmd
   cd C:\inetpub\ws3\backend
   pm2 start server.js --name "ws3-backend"
   pm2 save
   ```

7. **ตรวจสอบสถานะ**
   ```cmd
   pm2 status
   pm2 logs ws3-backend
   ```

---

### 3️⃣ Deploy Frontend (ครั้งแรก)

#### **บนเครื่อง Local:**

1. **Build production**
   ```cmd
   cd frontend
   build-production.bat
   ```
   จะได้โฟลเดอร์ `dist/` ที่มีไฟล์ทั้งหมด

#### **บน Server (Remote Desktop):**

2. **สร้างโฟลเดอร์สำหรับ frontend**
   ```
   C:\inetpub\wwwroot\mgssale\
   ```

3. **Remote Desktop เข้า Server แล้ว Copy-Paste**
   - Copy โฟลเดอร์ `dist/*` จากเครื่อง local
   - Paste ไปที่ `C:\inetpub\wwwroot\mgssale\` บน server

4. **Config IIS (ถ้าใช้ IIS)**
   - เปิด IIS Manager
   - สร้าง Virtual Directory ชื่อ `mgssale`
   - Point ไปที่ `C:\inetpub\wwwroot\mgssale\`
   - เพิ่ม URL Rewrite rule สำหรับ Vue Router (ถ้าจำเป็น)

---

### 4️⃣ เปิด Port (ถ้าจำเป็น)

**เปิด Port 8088 สำหรับ Backend:**

```cmd
# Windows Firewall
netsh advfirewall firewall add rule name="WS3 Backend" dir=in action=allow protocol=TCP localport=8088
```

---

## 🔄 ขั้นตอนการ Deploy ใหม่ (เมื่อแก้ไขโค้ด)

### ✅ กรณีแก้ไข **Frontend** เท่านั้น (ใช้บ่อยที่สุด) ⭐

#### **บนเครื่อง Local:**

1. **Build ใหม่**
   ```cmd
   cd frontend
   build-production.bat
   ```
   หรือ double-click ไฟล์ `build-production.bat`

#### **บน Server (Remote Desktop):**

2. **Remote Desktop เข้า Server**

3. **ลบไฟล์เก่าออก** (ไม่จำเป็นต้องลบทั้งหมด แต่แนะนำ)
   ```
   ลบไฟล์ใน C:\inetpub\wwwroot\mgssale\
   ```

4. **Copy-Paste ไฟล์ใหม่**
   - Copy โฟลเดอร์ `dist\*` จากเครื่อง local
   - Paste ไปที่ `C:\inetpub\wwwroot\mgssale\` บน server
   - (หรือลาก-วาง drag-drop ผ่าน Remote Desktop)

5. **รีเฟรชเบราว์เซอร์** (Ctrl + F5)

✅ **ไม่ต้อง restart อะไร!** Frontend เป็นแค่ไฟล์ static

---

### ✅ กรณีแก้ไข **Backend**

#### **บนเครื่อง Local:**

1. **Zip โฟลเดอร์ backend** (เพื่อความสะดวก)

#### **บน Server (Remote Desktop):**

2. **Remote Desktop เข้า Server**

3. **Copy-Paste โฟลเดอร์ backend ใหม่**
   - Copy โฟลเดอร์ `backend\` จากเครื่อง local
   - Paste ทับที่ `C:\inetpub\ws3\backend\`

4. **Install dependencies ใหม่** (ถ้ามีการเพิ่ม package)
   ```cmd
   cd C:\inetpub\ws3\backend
   npm install
   ```

5. **Restart backend ด้วย PM2**
   ```cmd
   pm2 restart ws3-backend
   ```

6. **ตรวจสอบ log**
   ```cmd
   pm2 logs ws3-backend
   ```

---

### ✅ กรณีแก้ไขทั้ง **Frontend + Backend**

ทำทั้ง 2 ขั้นตอนข้างบน:
1. Build + Copy Frontend ก่อน
2. แล้วค่อย Copy + Restart Backend

---

## 🛠️ คำสั่งที่ใช้บ่อย

### Frontend (Local - เครื่อง Developer)

```cmd
# Development (รันตอนพัฒนา)
cd frontend
npm run serve

# Production (Build ก่อน Deploy)
cd frontend
npm run build
# หรือ
build-production.bat
```

### Backend (Server - Windows Server)

```cmd
# PM2 Commands
pm2 status                    # ดูสถานะทั้งหมด
pm2 logs ws3-backend          # ดู log แบบ real-time
pm2 logs ws3-backend --lines 50   # ดู log 50 บรรทัดล่าสุด
pm2 restart ws3-backend       # Restart backend
pm2 stop ws3-backend          # หยุด backend
pm2 start ws3-backend         # เริ่ม backend
pm2 delete ws3-backend        # ลบออกจาก PM2

# ตรวจสอบ port
netstat -ano | findstr :8088

# ตรวจสอบ Node.js process
tasklist | findstr node
```

### IIS (Windows Server)

```cmd
# Restart IIS (ถ้าใช้ IIS สำหรับ Frontend)
iisreset

# หรือใช้ PowerShell
Restart-Service W3SVC

# ดูสถานะ IIS
Get-Service W3SVC
```

---

## 🔧 การแก้ปัญหาที่พบบ่อย

### ❌ ปัญหา: Frontend เข้าไม่ได้ (404 Not Found)

**แก้ไข:**
1. ตรวจสอบว่าไฟล์อยู่ที่ `C:\inetpub\wwwroot\mgssale\`
2. ตรวจสอบว่ามีไฟล์ `index.html` ในโฟลเดอร์หรือไม่
3. ถ้าใช้ IIS: ตรวจสอบ Virtual Directory ใน IIS Manager
4. Restart IIS: `iisreset`

### ❌ ปัญหา: Backend API ไม่ตอบ (ERR_CONNECTION_REFUSED)

**แก้ไข:**
```cmd
# 1. ตรวจสอบว่า backend รันอยู่หรือไม่
pm2 status

# 2. ดู log มี error อะไรหรือไม่
pm2 logs ws3-backend

# 3. ตรวจสอบว่า port 8088 เปิดอยู่หรือไม่
netstat -ano | findstr :8088

# 4. Restart backend
pm2 restart ws3-backend

# 5. ถ้ายังไม่ได้ ลอง start ใหม่
pm2 delete ws3-backend
cd C:\inetpub\ws3\backend
pm2 start server.js --name "ws3-backend"
```

### ❌ ปัญหา: CORS Error

**แก้ไข:**
แก้ไขไฟล์ `backend/server.js`:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://smartsecurity.ruxchai.co.th",
    "https://smartsecurity.ruxchai.co.th"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
};
```

จากนั้น:
1. Copy ไฟล์ `server.js` ใหม่ไปที่ server
2. Restart backend: `pm2 restart ws3-backend`

### ❌ ปัญหา: Build ไม่ผ่าน (Build Failed)

**แก้ไข:**
```cmd
# ลบ node_modules และ install ใหม่
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install

# หรือใช้ cache clean
npm cache clean --force
npm install
```

### ❌ ปัญหา: หน้าเว็บไม่อัพเดต (ยัง cache เก่า)

**แก้ไข:**
1. **Hard Refresh บนเบราว์เซอร์**: `Ctrl + F5`
2. **Clear Browser Cache**: ลบ cache ของ browser
3. **เปิด Incognito Mode**: ทดสอบใน private mode

### ❌ ปัญหา: PM2 หายหลัง restart server

**แก้ไข:**
```cmd
# ตั้งให้ PM2 start อัตโนมัติตอน boot
npm install -g pm2-windows-startup
pm2-startup install

# บันทึก process ปัจจุบัน
pm2 save
```

---

## 📞 Checklist ก่อน Deploy

### Frontend
- [ ] แก้ไขโค้ดเสร็จแล้ว
- [ ] ทดสอบบนเครื่อง local (npm run serve)
- [ ] ไม่มี error ใน console
- [ ] ไฟล์ `.env.production` มี URL ถูกต้อง
- [ ] รัน `npm run build` สำเร็จ
- [ ] Upload โฟลเดอร์ `dist/` ไป server

### Backend
- [ ] แก้ไขโค้ดเสร็จแล้ว
- [ ] ทดสอบบนเครื่อง local
- [ ] ไฟล์ `.env` บน server ถูกต้อง
- [ ] CORS config รองรับ production domain
- [ ] Upload โค้ดไป server
- [ ] รัน `npm install` (ถ้ามีการเพิ่ม package)
- [ ] Restart backend ด้วย PM2
- [ ] ตรวจสอบ log ไม่มี error

---

## 🔐 Security Notes

1. **อย่า commit ไฟล์ .env ลง Git**
2. **ใช้ HTTPS สำหรับ Production** (แนะนำติดตั้ง SSL Certificate)
3. **ตั้งค่า Firewall บน Server**
4. **Backup Database สม่ำเสมอ**
5. **จำกัด CORS origin** (ลบ `"*"` ออกจาก corsOptions)

---

## 📧 Contact

หากมีปัญหาหรือคำถาม ติดต่อ: [your-email@example.com]

---

**สร้างเมื่อ:** 2026-01-27
**แก้ไขล่าสุด:** 2026-01-27
