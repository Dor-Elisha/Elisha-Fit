const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// MongoDB Connection Test
async function testMongoDBConnection() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/elisha-fit';
    console.log('🔍 Testing MongoDB connection...');
    console.log('📡 MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful!');
    console.log('🗄️  Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections found:', collections.length);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔧 Connection details:', {
      uri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV,
      error: error.message
    });
  }
}

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
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: mongoose.connection.readyState === 1,
      name: mongoose.connection.name,
      host: mongoose.connection.host
    }
  });
});

// API routes will be loaded after database connection in startServer()

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

// Start server and test MongoDB connection
async function startServer() {
  try {
    // Test MongoDB connection first
    await testMongoDBConnection();
    
    // Load backend routes after database connection is established
    if (isProduction) {
      try {
        // Ensure mongoose connection is ready before loading models
        if (mongoose.connection.readyState !== 1) {
          console.log('⏳ Waiting for mongoose connection to be ready...');
          await new Promise((resolve) => {
            mongoose.connection.once('connected', resolve);
          });
        }
        
        // Import the compiled backend routes
        const authRoutes = require('./backend/dist/routes/auth').default;
        const workoutsRouter = require('./backend/dist/routes/workouts').default;
        const exercisesRouter = require('./backend/dist/routes/exercises').default;
        const userStatsRouter = require('./backend/dist/routes/user-stats').default;
        const userRouter = require('./backend/dist/routes/user').default;

        // Set up CORS for API routes
        app.use('/api/v1', (req, res, next) => {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
          if (req.method === 'OPTIONS') {
            res.sendStatus(200);
          } else {
            next();
          }
        });

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
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Elisha-Fit app running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Mode: ${isProduction ? 'Production (with API)' : 'Development (frontend only)'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 