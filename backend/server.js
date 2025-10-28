const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// โหลด environment variables
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('Loading environment variables from:', envPath);
console.log('PORT from .env:', process.env.PORT);

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
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Development: 1000 requests, Production: 100 requests
  message: 'คำขอจาก IP นี้มากเกินไป กรุณาลองใหม่ภายหลัง',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

app.use(cors(corsOptions));

// Body parser with error handling
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware for JSON parse errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format',
      error: err.message
    });
  }
  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to WS3 API",
    status: "running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// API Routes
require("./routes/wayin.routes")(app);
require("./routes/wayout.routes")(app);
require("./routes/settings.routes")(app);
require("./routes/dashboard.routes")(app);
require("./routes/vehicle.routes")(app);
require("./routes/report.routes")(app);
require("./routes/statistics.routes")(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Server port
const PORT = parseInt(process.env.PORT) || 8081;

// Database connection test
const dbService = require('./service/db.service');

const startServer = async () => {
  try {
    // Test database connection
    await dbService.connect();
    console.log('Database connection test successful');

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n========================================');
      console.log('WS3 API Server');
      console.log('========================================');
      console.log(`Port: ${PORT}`);
      console.log(`Listening on: 0.0.0.0:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${process.env.SQL_DATABASE}`);
      console.log(`Server: ${process.env.SQL_SERVER}`);
      console.log(`Status: RUNNING`);
      console.log('========================================\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        dbService.close();
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
