"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getEnvVar(key, required = true) {
    const value = process.env[key];
    if (!value && required) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || '';
}
exports.config = {
    port: parseInt(process.env.PORT || '8080', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: getEnvVar('FRONTEND_URL'),
    mongodbUri: getEnvVar('MONGODB_URI'),
    mongodbUriProd: getEnvVar('MONGODB_URI_PROD', false),
    jwtSecret: getEnvVar('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
};
exports.default = exports.config;
//# sourceMappingURL=config.js.map