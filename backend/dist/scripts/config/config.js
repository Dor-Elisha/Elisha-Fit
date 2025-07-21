"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
function getEnvVar(key, required) {
    if (required === void 0) { required = true; }
    var value = process.env[key];
    if (!value && required) {
        throw new Error("Missing required environment variable: ".concat(key));
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
