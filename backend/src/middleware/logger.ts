import { Request, Response, NextFunction } from 'express';

export interface LogData {
  timestamp: string;
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  ip: string;
  userAgent?: string | undefined;
  userId?: string | undefined;
  requestBody?: any;
  query?: any;
  params?: any;
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Capture request data
  const logData: LogData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || undefined,
    userId: (req.user as any)?.id || undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    params: Object.keys(req.params).length > 0 ? req.params : undefined
  };

  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    delete sanitizedBody.refreshToken;
    logData.requestBody = sanitizedBody;
  }

  // Log the request
  console.log('Request:', logData);

  // Capture response data
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const responseLog = {
      ...logData,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      responseSize: data ? JSON.stringify(data).length : 0
    };

    // Log response
    console.log('Response:', responseLog);

    // Log errors for 4xx and 5xx status codes
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

// Development logging (more verbose)
export const developmentLogger = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n🚀 ${req.method} ${req.originalUrl}`);
    console.log(`📅 ${new Date().toISOString()}`);
    console.log(`👤 IP: ${req.ip || req.connection.remoteAddress || 'unknown'}`);
    console.log(`🔑 User: ${(req.user as any)?.id || 'anonymous'}`);
    
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

// Production logging (minimal)
export const productionLogger = (req: Request, res: Response, next: NextFunction): void => {
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