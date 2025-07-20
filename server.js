const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['RateLimit-Remaining', 'RateLimit-Reset']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the Angular build
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Elisha-Fit Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API endpoints for production (placeholder)
if (isProduction) {
  app.use('/api/v1/*', (req, res) => {
    res.status(503).json({ 
      error: 'Backend services temporarily unavailable',
      message: 'API integration in progress'
    });
  });
} else {
  // In development, we'll need to run the backend separately
  app.use('/api/v1/*', (req, res) => {
    res.status(503).json({ 
      error: 'Backend not available in development mode',
      message: 'Please start the backend server separately'
    });
  });
}

// Handle Angular routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Elisha-Fit app running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Mode: ${isProduction ? 'Production (frontend only)' : 'Development (frontend only)'}`);
}); 