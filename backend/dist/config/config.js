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
    port: process.env.PORT || 8080,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/elisha-fit',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    nodeEnv: process.env.NODE_ENV || 'development',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
exports.default = exports.config;
//# sourceMappingURL=config.js.map