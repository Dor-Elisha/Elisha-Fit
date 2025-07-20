const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the Angular build
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Elisha-Fit app is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple API placeholder
app.use('/api/v1', (req, res) => {
  res.status(503).json({ 
    error: 'Backend services temporarily unavailable',
    message: 'API integration in progress'
  });
});

// Handle Angular routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Elisha-Fit app running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 