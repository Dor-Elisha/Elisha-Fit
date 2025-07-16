import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  name: Joi.string().max(50).optional().messages({
    'string.max': 'Name must be at most 50 characters long',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Program validation schema
export const programSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().max(1000).allow(''),
  targetMuscleGroups: Joi.array().items(Joi.string()).required(),
  userId: Joi.string().optional(),
  exercises: Joi.array().items(
    Joi.object({
      exerciseId: Joi.string().required(),
      name: Joi.string().required(),
      sets: Joi.number().min(1).max(20).required(),
      reps: Joi.number().min(1).max(100).required(),
      rest: Joi.number().min(0).max(600).required(),
      weight: Joi.number().min(0).max(1000).optional(),
      notes: Joi.string().max(500).allow(''),
      order: Joi.number().min(1).max(100).optional() // <-- allow order
    })
  ).min(1).required()
}).unknown(true); // <-- Allow unknown top-level properties

// Progress entry validation schema
export const progressEntrySchema = Joi.object({
  programId: Joi.string().required(),
  workoutDate: Joi.date().max('now').optional(),
  exercises: Joi.array().items(
    Joi.object({
      exerciseId: Joi.string().required(),
      exerciseName: Joi.string().required(),
      sets: Joi.array().items(
        Joi.object({
          setNumber: Joi.number().min(1).required(),
          weight: Joi.number().min(0).max(1000).required(),
          reps: Joi.number().min(0).max(1000).required(),
          restTime: Joi.number().min(0).max(3600).required(),
          completed: Joi.boolean().optional(),
          notes: Joi.string().max(500).allow(''),
        })
      ).min(1).required(),
      notes: Joi.string().max(1000).allow(''),
    })
  ).min(1).required(),
  totalDuration: Joi.number().min(1).max(480).required(),
  notes: Joi.string().max(2000).allow(''),
  rating: Joi.number().min(1).max(5).optional(),
  completed: Joi.boolean().optional(),
});

// Goal validation schema
export const goalSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().max(500).allow(''),
  category: Joi.string().valid('strength', 'endurance', 'weight', 'body_composition', 'flexibility', 'custom').required(),
  targetValue: Joi.number().min(0).required(),
  currentValue: Joi.number().min(0).optional(),
  unit: Joi.string().max(20).required(),
  deadline: Joi.date().min('now').optional(),
  status: Joi.string().valid('active', 'completed', 'abandoned').optional(),
});

// Goal progress update schema
export const goalProgressSchema = Joi.object({
  value: Joi.number().min(0).required(),
  notes: Joi.string().max(200).allow(''),
});

export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const { error } = registerSchema.validate(req.body);
  if (error?.details?.[0]?.message) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { error } = loginSchema.validate(req.body);
  if (error?.details?.[0]?.message) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
}

export function validateProgram(req: Request, res: Response, next: NextFunction): void {
  const { error } = programSchema.validate(req.body);
  if (error?.details?.[0]?.message) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
}

export function validateProgressEntry(req: Request, res: Response, next: NextFunction): void {
  const { error } = progressEntrySchema.validate(req.body);
  if (error?.details?.[0]?.message) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
}

export function validateGoal(req: Request, res: Response, next: NextFunction): void {
  const { error } = goalSchema.validate(req.body);
  if (error?.details?.[0]?.message) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
}

export function validateGoalProgress(req: Request, res: Response, next: NextFunction): void {
  const { error } = goalProgressSchema.validate(req.body);
  if (error?.details?.[0]?.message) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
} 