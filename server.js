const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

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

// API routes - in production, serve from the compiled backend
if (isProduction) {
  try {
    // Import the compiled backend routes
    const authRoutes = require('./backend/dist/routes/auth').default;
    const workoutsRouter = require('./backend/dist/routes/workouts').default;
    const exercisesRouter = require('./backend/dist/routes/exercises').default;
    const userStatsRouter = require('./backend/dist/routes/user-stats').default;
    const userRouter = require('./backend/dist/routes/user').default;

    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/workouts', workoutsRouter);
    app.use('/api/v1/exercises', exercisesRouter);
    app.use('/api/v1/user-stats', userStatsRouter);
    app.use('/api/v1/user', userRouter);
    
    console.log('✅ Backend API routes loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load backend routes:', error.message);
    // Fallback API response
    app.use('/api/v1', (req, res) => {
      res.status(503).json({ 
        error: 'Backend services temporarily unavailable',
        message: 'API integration in progress'
      });
    });
  }
} else {
  // In development, we'll need to run the backend separately
  app.use('/api/v1', (req, res) => {
    res.status(503).json({ 
      error: 'Backend not available in development mode',
      message: 'Please start the backend server separately'
    });
  });
}

// Handle Angular routing - serve index.html for all non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/workouts', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/workout-wizard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Elisha-Fit app running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Mode: ${isProduction ? 'Production (with API)' : 'Development (frontend only)'}`);
}); 