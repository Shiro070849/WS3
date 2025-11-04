const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์สำหรับเก็บ logo ถ้ายังไม่มี
const uploadDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนดการจัดเก็บไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // สร้างชื่อไฟล์: companyId_logo_timestamp.ext
    const companyId = req.params.id || 'temp';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${companyId}_logo_${timestamp}${ext}`);
  }
});

// กรอง file types ที่อนุญาต
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|svg|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('รองรับเฉพาะไฟล์ภาพ: .png, .jpg, .jpeg, .svg, .webp'));
  }
};

// สร้าง multer middleware
const uploadLogo = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // จำกัด 5MB
  },
  fileFilter: fileFilter
});

module.exports = uploadLogo;
