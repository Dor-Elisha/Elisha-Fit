const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the Angular build
app.use(express.static(path.join(__dirname, 'dist/angular-spa')));

// Proxy API requests to the backend
app.use('/api', createProxyMiddleware({
  target: process.env.BACKEND_URL || 'http://localhost:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api/v1'
  }
}));

// Handle Angular routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-spa/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Elisha-Fit app running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 