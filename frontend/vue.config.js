const { defineConfig } = require('@vue/cli-service');
const path = require('path'); // Import path module to resolve paths

module.exports = defineConfig({
  transpileDependencies: true,

  // ให้เว็บรันที่ path ย่อย /smartsecruity เช่น http://192.168.31.36/smartsecruity/
  // ตอน build production, asset ทั้งหมดจะอ้างอิงจาก /smartsecruity/
  publicPath: process.env.NODE_ENV === 'production' ? '/smartsecruity/' : '/',

  // (ถ้าต้องการ alias เพิ่มสามารถใส่ในที่นี่ภายหลังได้)
});
