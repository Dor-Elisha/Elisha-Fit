"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionLogger = exports.developmentLogger = exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || undefined,
        userId: req.user?.id || undefined,
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        params: Object.keys(req.params).length > 0 ? req.params : undefined
    };
    if (req.method !== 'GET' && req.body) {
        const sanitizedBody = { ...req.body };
        delete sanitizedBody.password;
        delete sanitizedBody.token;
        delete sanitizedBody.refreshToken;
        logData.requestBody = sanitizedBody;
    }
    console.log('Request:', logData);
    const originalSend = res.send;
    res.send = function (data) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const responseLog = {
            ...logData,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            responseSize: data ? JSON.stringify(data).length : 0
        };
        console.log('Response:', responseLog);
        if (res.statusCode >= 400) {
            console.error('Error Response:', {
                ...responseLog,
                error: data
            });
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLogger = requestLogger;
const developmentLogger = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`\n🚀 ${req.method} ${req.originalUrl}`);
        console.log(`📅 ${new Date().toISOString()}`);
        console.log(`👤 IP: ${req.ip || req.connection.remoteAddress || 'unknown'}`);
        console.log(`🔑 User: ${req.user?.id || 'anonymous'}`);
        if (Object.keys(req.query).length > 0) {
            console.log(`🔍 Query:`, req.query);
        }
        if (Object.keys(req.params).length > 0) {
            console.log(`📝 Params:`, req.params);
        }
        if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
            const sanitizedBody = { ...req.body };
            delete sanitizedBody.password;
            delete sanitizedBody.token;
            console.log(`📦 Body:`, sanitizedBody);
        }
        console.log('─'.repeat(50));
    }
    next();
};
exports.developmentLogger = developmentLogger;
const productionLogger = (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        const startTime = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
            console.log(`${logLevel} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
        });
    }
    next();
};
exports.productionLogger = productionLogger;
//# sourceMappingURL=logger.js.map