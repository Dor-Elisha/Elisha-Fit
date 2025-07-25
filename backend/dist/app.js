"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('DEBUG: app.ts is being executed');
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const workouts_1 = __importDefault(require("./routes/workouts"));
const exercises_1 = __importDefault(require("./routes/exercises"));
const user_stats_1 = __importDefault(require("./routes/user-stats"));
const user_1 = __importDefault(require("./routes/user"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = require("./middleware/logger");
dotenv_1.default.config();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '8080', 10);
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
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
        this.app.use((0, cors_1.default)({
            origin: [
                process.env.FRONTEND_URL || 'http://localhost:3000',
                'https://elisha-fit-86fa277a8571.herokuapp.com',
                'https://elisha-fit.herokuapp.com'
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            exposedHeaders: ['RateLimit-Remaining', 'RateLimit-Reset']
        }));
        this.app.use(express_1.default.json({
            limit: '10mb',
            verify: (req, res, buf) => {
                try {
                    JSON.parse(buf.toString());
                }
                catch (e) {
                    res.status(400).json({ error: 'Invalid JSON' });
                    throw new Error('Invalid JSON');
                }
            }
        }));
        this.app.use(express_1.default.urlencoded({
            extended: true,
            limit: '10mb',
            parameterLimit: 100
        }));
        this.app.set('trust proxy', 1);
        if (process.env.NODE_ENV === 'development') {
            this.app.use((0, morgan_1.default)('dev'));
            this.app.use(logger_1.developmentLogger);
        }
        else {
            this.app.use((0, morgan_1.default)('combined'));
            this.app.use(logger_1.productionLogger);
        }
        this.app.use(rateLimiter_1.generalLimiter);
    }
    initializeRoutes() {
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                message: 'Elisha-Fit Backend API is running',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            });
        });
        this.app.use('/api/v1/auth', rateLimiter_1.authLimiter, auth_1.default);
        this.app.use('/api/v1/workouts', rateLimiter_1.apiLimiter, workouts_1.default);
        this.app.use('/api/v1/exercises', rateLimiter_1.exerciseLimiter, exercises_1.default);
        this.app.use('/api/v1/user-stats', rateLimiter_1.apiLimiter, user_stats_1.default);
        this.app.use('/api/v1/user', rateLimiter_1.apiLimiter, user_1.default);
        this.app.use(errorHandler_1.notFoundHandler);
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    listen() {
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
exports.default = App;
//# sourceMappingURL=app.js.map