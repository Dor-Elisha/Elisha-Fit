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
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const developmentLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const productionLogger: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=logger.d.ts.map