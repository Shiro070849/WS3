const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,

  // publicPath แบบ Dynamic:
  // - ถ้าตั้ง VUE_APP_USE_SUBDOMAIN=true → publicPath: '/' (สำหรับ subdomain)
  // - ถ้าไม่ตั้ง หรือ false → publicPath: '/smartsecruity/' (สำหรับ IP + Path)
  publicPath: process.env.NODE_ENV === 'production'
    ? (process.env.VUE_APP_USE_SUBDOMAIN === 'true' ? '/' : '/smartsecruity/')
    : '/',

  // (ถ้าต้องการ alias เพิ่มสามารถใส่ในที่นี่ภายหลังได้)
});
