const { defineConfig } = require('@vue/cli-service');
const path = require('path'); // Import path module to resolve paths

module.exports = defineConfig({
  transpileDependencies: true,

  // Define publicPath for production and development
  publicPath: process.env.NODE_ENV === 'production' ? '/mgssale' : '/',

  // Configure alias to ensure '@' maps to 'src' directory correctly
});
