const sql = require('mssql');
const config = require('../config/Mssql.config');

class DatabaseService {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      if (this.pool) {
        return this.pool;
      }

      this.pool = await sql.connect(config.sql);
      console.log('Connected to SQL Server database');
      return this.pool;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async query(queryString, params = {}) {
    try {
      const pool = await this.connect();
      const request = pool.request();

      // เพิ่ม parameters ใน query
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });

      const result = await request.query(queryString);
      return result;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
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
