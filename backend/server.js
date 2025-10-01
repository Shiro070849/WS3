const express = require("express");
const bodyParser = require("body-parser");
const cors = require("./node_modules/cors");
const rateLimit = require('express-rate-limit');

const app = express();

const corsOptions = {
  origin: ["http://localhost:8080",
           "http://localhost:8081",
           "https://web.mrgshrimp.com",
           "*" 
          ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // เพิ่ม: ระบุ methods ที่อนุญาต
  allowedHeaders: ['Content-Type', 'Authorization'] // เพิ่ม: ระบุ headers ที่อนุญาต
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100, // จำกัดแต่ละ IP ให้ส่งคำขอได้ 100 ครั้งต่อหน้าต่างเวลา
  message: 'คำขอจาก IP นี้มากเกินไป กรุณาลองใหม่ภายหลัง'
});

app.use(limiter);

app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "50mb" }));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/home", (req, res) => {
  res.json({ message: "Welcome to MGS API" });
});

require("./routes/items.routes")(app);
require("./routes/orders.routes")(app);
require("./routes/customer.routes")(app);
require("./routes/saleperson.routes")(app);
require("./routes/dashboard.routes")(app);

app.listen(8000, () => console.log("server run listening on port 8000"));
