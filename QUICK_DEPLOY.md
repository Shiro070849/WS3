# 🚀 Quick Deploy Guide (ฉบับย่อ)

## 📝 Deploy Frontend ใหม่ (เมื่อแก้เว็บ)

### บนเครื่อง Local:
1. ไปที่โฟลเดอร์ `frontend`
2. Double-click `build-production.bat`
3. รอจนเสร็จ จะได้โฟลเดอร์ `dist`

### บน Server:
1. Remote Desktop เข้า Server
2. ไปที่ `C:\inetpub\wwwroot\mgssale\`
3. ลบไฟล์เก่าออก (หรือไม่ก็ได้)
4. Copy-Paste ไฟล์จาก `dist\*` ไปวาง
5. เสร็จ! กด Ctrl+F5 บนเบราว์เซอร์

---

## 🔧 Deploy Backend ใหม่ (เมื่อแก้ API)

### บน Server:
1. Remote Desktop เข้า Server
2. Copy-Paste โฟลเดอร์ `backend` ไปทับของเดิม
3. เปิด Command Prompt (cmd)
4. รันคำสั่ง:
   ```cmd
   pm2 restart ws3-backend
   ```
5. เสร็จ!

---

## ⚡ คำสั่งด่วน

```cmd
# ตรวจสอบ Backend ทำงานหรือไม่
pm2 status

# ดู Log
pm2 logs ws3-backend

# Restart Backend
pm2 restart ws3-backend

# Restart IIS (Frontend)
iisreset
```

---

## 🆘 เจอปัญหา?

- **Frontend ไม่อัพเดต**: กด Ctrl+F5 บนเบราว์เซอร์
- **Backend ไม่ตอบ**: `pm2 restart ws3-backend`
- **อื่นๆ**: อ่าน [README_DEPLOY.md](README_DEPLOY.md)
