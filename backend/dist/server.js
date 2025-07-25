"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('DEBUG: server.ts is being executed');
const app_1 = __importDefault(require("./app"));
const exerciseService_1 = require("./services/exerciseService");
const sharedMongoose_1 = __importDefault(require("./sharedMongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("./config/config"));
dotenv_1.default.config();
const app = new app_1.default();
async function startServer() {
    try {
        if (sharedMongoose_1.default.connection.readyState !== 1) {
            const mongoUri = config_1.default.mongoUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/elisha-fit';
            console.log('🔗 Connecting to MongoDB:', mongoUri);
            const options = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferMaxEntries: 0,
                bufferCommands: false,
                retryWrites: true
            };
            await sharedMongoose_1.default.connect(mongoUri, options);
            console.log('✅ MongoDB connected');
            const db = sharedMongoose_1.default.connection;
            db.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
            });
            db.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
            });
            db.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
            });
        }
        console.log('📚 Loading exercise data...');
        await exerciseService_1.ExerciseService.loadExercisesFromFile();
        console.log('🚀 Starting Express server...');
        app.listen();
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
startServer();
//# sourceMappingURL=server.js.map