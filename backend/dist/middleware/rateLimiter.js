"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exerciseLimiter = exports.analyticsLimiter = exports.apiLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString()
        });
    }
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many authentication attempts, please try again later.',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString()
        });
    }
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
        error: 'Too many API requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many API requests from this IP, please try again later.',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString()
        });
    }
});
exports.analyticsLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        error: 'Too many analytics requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many analytics requests, please try again later.',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString()
        });
    }
});
exports.exerciseLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        error: 'Too many exercise data requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many exercise data requests, please try again later.',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString()
        });
    }
});
//# sourceMappingURL=rateLimiter.js.map