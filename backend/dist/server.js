"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('DEBUG: server.ts is being executed');
const app_1 = __importDefault(require("./app"));
const exerciseService_1 = require("./services/exerciseService");
const app = new app_1.default();
async function startServer() {
    try {
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