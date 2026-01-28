"use strict";

const dotenv = require("dotenv");
const path = require("path");

// โหลด environment variables จาก .env ในโฟลเดอร์ backend
const envPath = path.join(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

// ถ้าโหลด .env ไม่ได้ ให้แจ้งเตือน (แต่ไม่ error เพราะอาจจะใช้ system env vars)
if (result.error) {
  console.warn('[Mssql.config] Warning: Could not load .env file:', envPath);
  console.warn('[Mssql.config] Using system environment variables instead');
}

// ดึงค่าจาก environment variables และลบ quotes ถ้ามี
const getEnvValue = (key) => {
  const value = process.env[key];
  if (!value) return undefined;
  // ลบ quotes รอบค่าถ้ามี (ทั้ง single และ double quotes)
  return value.replace(/^["']|["']$/g, '');
};

const SQL_SERVER = getEnvValue('SQL_SERVER');
const SQL_USER = getEnvValue('SQL_USER');
const SQL_PASSWORD = getEnvValue('SQL_PASSWORD');
const SQL_DATABASE = getEnvValue('SQL_DATABASE');
const SQL_ENCRYPT = getEnvValue('SQL_ENCRYPT');

// ตรวจสอบว่ามี environment variables ครบหรือไม่
const missingVars = [];
if (!SQL_SERVER) missingVars.push('SQL_SERVER');
if (!SQL_USER) missingVars.push('SQL_USER');
if (!SQL_PASSWORD) missingVars.push('SQL_PASSWORD');
if (!SQL_DATABASE) missingVars.push('SQL_DATABASE');

if (missingVars.length > 0) {
  console.error('[Mssql.config] ❌ Missing required environment variables:', missingVars.join(', '));
  console.error('[Mssql.config] Please check your .env file at:', envPath);
  console.error('[Mssql.config] Current working directory:', process.cwd());
  console.error('[Mssql.config] Environment variables found:', {
    SQL_SERVER: SQL_SERVER ? '***' : 'MISSING',
    SQL_USER: SQL_USER ? '***' : 'MISSING',
    SQL_PASSWORD: SQL_PASSWORD ? '***' : 'MISSING',
    SQL_DATABASE: SQL_DATABASE || 'MISSING',
    SQL_ENCRYPT: SQL_ENCRYPT || 'false'
  });
}

const sqlEncrypt = SQL_ENCRYPT === "true";

module.exports = {
  sql: {
    server: SQL_SERVER,
    database: SQL_DATABASE,
    user: SQL_USER,
    password: SQL_PASSWORD,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      encrypt: sqlEncrypt,
      enableArithAbort: true,
      requestTimeout: 300000,
      trustServerCertificate: true,
    },
  },
};
