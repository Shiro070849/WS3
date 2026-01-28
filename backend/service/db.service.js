const sql = require('mssql');
const config = require('../config/Mssql.config');

class DatabaseService {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      // เช็คว่า pool มีอยู่และยัง connected อยู่ไหม
      if (this.pool && this.pool.connected) {
        return this.pool;
      }

      // ถ้า pool มีแต่ไม่ connected ให้ปิดก่อน
      if (this.pool) {
        try {
          await this.pool.close();
        } catch (closeError) {
          // Ignore close errors
        }
        this.pool = null;
      }

      // ตรวจสอบว่ามี config ครบหรือไม่ก่อนเชื่อมต่อ
      if (!config.sql.server || !config.sql.database || !config.sql.user || !config.sql.password) {
        const missing = [];
        if (!config.sql.server) missing.push('SQL_SERVER');
        if (!config.sql.database) missing.push('SQL_DATABASE');
        if (!config.sql.user) missing.push('SQL_USER');
        if (!config.sql.password) missing.push('SQL_PASSWORD');
        
        const errorMsg = `❌ Database configuration is incomplete. Missing: ${missing.join(', ')}`;
        console.error('[DB]', errorMsg);
        console.error('[DB] Please check your .env file and ensure all database variables are set.');
        throw new Error(errorMsg);
      }

      console.log('[DB] Attempting to connect to database...');
      console.log('[DB] Server:', config.sql.server);
      console.log('[DB] Database:', config.sql.database);
      console.log('[DB] User:', config.sql.user);

      // สร้าง connection ใหม่
      this.pool = await sql.connect(config.sql);
      console.log('[DB] ✅ Connected to SQL Server database successfully');
      return this.pool;
    } catch (error) {
      console.error('[DB] ❌ Database connection error:', error.message);
      console.error('[DB] Error code:', error.code);
      console.error('[DB] Connection config:', {
        server: config.sql.server || 'MISSING',
        database: config.sql.database || 'MISSING',
        user: config.sql.user || 'MISSING',
        password: config.sql.password ? '***' : 'MISSING',
        encrypt: config.sql.options?.encrypt
      });
      
      // แสดงคำแนะนำเพิ่มเติม
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.error('[DB] 💡 Tip: Check if SQL Server is running and accessible from this server');
        console.error('[DB] 💡 Tip: Verify firewall rules allow connection to SQL Server port (usually 1433)');
      } else if (error.message?.includes('Login failed')) {
        console.error('[DB] 💡 Tip: Check SQL_USER and SQL_PASSWORD in .env file');
      } else if (error.message?.includes('Cannot find database')) {
        console.error('[DB] 💡 Tip: Check SQL_DATABASE name in .env file');
      }
      
      this.pool = null; // Reset pool on error
      throw error;
    }
  }

  async query(queryString, params = {}) {
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        const pool = await this.connect();
        
        // เช็คว่า pool ยัง connected อยู่ไหม
        if (!pool.connected) {
          console.warn('[DB] Pool not connected, reconnecting...');
          this.pool = null;
          continue;
        }

        const request = pool.request();

        // เพิ่ม parameters ใน query
        Object.keys(params).forEach(key => {
          request.input(key, params[key]);
        });

        const result = await request.query(queryString);
        return result;
      } catch (error) {
        // ถ้าเป็น connection error และยัง retry ไม่หมด ให้ลอง reconnect
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message?.includes('Connection is closed')) {
          console.warn(`[DB] Connection error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message);
          this.pool = null; // Reset pool to force reconnect
          retryCount++;
          if (retryCount <= maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
        }
        
        console.error('[DB] Query error:', error);
        console.error('[DB] Query:', queryString);
        console.error('[DB] Params:', params);
        throw error;
      }
    }
  }

  async close() {
    try {
      if (this.pool) {
        await this.pool.close();
        this.pool = null;
        console.log('Database connection closed');
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();
