import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const programSchema: Joi.ObjectSchema<any>;
export declare const progressEntrySchema: Joi.ObjectSchema<any>;
export declare const goalSchema: Joi.ObjectSchema<any>;
export declare const goalProgressSchema: Joi.ObjectSchema<any>;
export declare function validateRegister(req: Request, res: Response, next: NextFunction): void;
export declare function validateLogin(req: Request, res: Response, next: NextFunction): void;
export declare function validateProgram(req: Request, res: Response, next: NextFunction): void;
export declare function validateProgressEntry(req: Request, res: Response, next: NextFunction): void;
export declare function validateGoal(req: Request, res: Response, next: NextFunction): void;
export declare function validateGoalProgress(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=validation.d.ts.map