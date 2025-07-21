console.log('DEBUG: server.ts is being executed');
import App from './app';
import { ExerciseService } from './services/exerciseService';
import mongoose from './sharedMongoose';
import dotenv from 'dotenv';
import config from './config/config';

dotenv.config();

// Create and start the application
const app = new App();

// Initialize database connection
async function startServer() {
  try {
    // Connect to MongoDB if not already connected (for local/dev)
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = config.mongoUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/elisha-fit';
      console.log('🔗 Connecting to MongoDB for local/dev:', mongoUri);
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected (dev/local)');
    }
    console.log('📚 Loading exercise data...');
    await ExerciseService.loadExercisesFromFile();
    
    console.log('🚀 Starting Express server...');
    app.listen();
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer(); 