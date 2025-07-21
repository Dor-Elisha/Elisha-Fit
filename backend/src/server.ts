console.log('DEBUG: server.ts is being executed');
import App from './app';
import { ExerciseService } from './services/exerciseService';

// Create and start the application
const app = new App();

// Initialize database connection
async function startServer() {
  try {
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