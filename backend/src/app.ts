console.log('DEBUG: app.ts is being executed');
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import programsRouter from './routes/programs';
import goalsRouter from './routes/goals';
import exercisesRouter from './routes/exercises';
import userStatsRouter from './routes/user-stats';
import logsRouter from './routes/logs';
import scheduledWorkoutsRouter from './routes/scheduled-workouts';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { 
  generalLimiter, 
  authLimiter, 
  apiLimiter, 
  analyticsLimiter, 
  exerciseLimiter 
} from './middleware/rateLimiter';
import { developmentLogger, productionLogger } from './middleware/logger';

// Load environment variables
dotenv.config();

class App {
  public app: Application;
  public port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '8080', 10);
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
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
    
    // CORS configuration for Angular frontend
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['RateLimit-Remaining', 'RateLimit-Reset']
    }));

    // Body parsing middleware with size limits
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        try {
          JSON.parse(buf.toString());
        } catch (e) {
          (res as any).status(400).json({ error: 'Invalid JSON' });
          throw new Error('Invalid JSON');
        }
      }
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb',
      parameterLimit: 100
    }));

    // Trust proxy for rate limiting
    this.app.set('trust proxy', 1);

    // Request logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
      this.app.use(developmentLogger);
    } else {
      this.app.use(morgan('combined'));
      this.app.use(productionLogger);
    }

    // Rate limiting
    this.app.use(generalLimiter);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        message: 'Elisha-Fit Backend API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes with specific rate limiting
    this.app.use('/api/v1/auth', authLimiter, authRoutes);
    this.app.use('/api/v1/programs', apiLimiter, programsRouter);
    this.app.use('/api/v1/goals', apiLimiter, goalsRouter);
    this.app.use('/api/v1/exercises', exerciseLimiter, exercisesRouter);
    this.app.use('/api/v1/user-stats', apiLimiter, userStatsRouter);
    this.app.use('/api/v1/logs', apiLimiter, logsRouter);
    this.app.use('/api/v1/scheduled-workouts', apiLimiter, scheduledWorkoutsRouter);

    // 404 handler for unmatched routes
    this.app.use(notFoundHandler);
  }

  private initializeErrorHandling(): void {
    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  public listen(): void {
    console.log('DEBUG: listen() method called, about to start server');
    this.app.listen(this.port, () => {
      console.log(`🚀 Elisha-Fit Backend API running on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
      console.log(`📝 Logging: ${process.env.NODE_ENV === 'development' ? 'Development' : 'Production'} mode`);
    });
  }
}

export default App; 