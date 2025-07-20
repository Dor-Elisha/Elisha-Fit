"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalProgressSchema = exports.goalSchema = exports.progressEntrySchema = exports.workoutSchema = void 0;
exports.validateRegister = validateRegister;
exports.validateLogin = validateLogin;
exports.validateWorkout = validateWorkout;
exports.validateProgressEntry = validateProgressEntry;
exports.validateGoal = validateGoal;
exports.validateGoalProgress = validateGoalProgress;
const joi_1 = __importDefault(require("joi"));
const registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required',
    }),
    name: joi_1.default.string().max(50).optional().messages({
        'string.max': 'Name must be at most 50 characters long',
    }),
});
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().required().messages({
        'any.required': 'Password is required',
    }),
});
exports.workoutSchema = joi_1.default.object({
    name: joi_1.default.string().max(100).required(),
    description: joi_1.default.string().max(1000).allow(''),
    targetMuscleGroups: joi_1.default.array().items(joi_1.default.string()).required(),
    userId: joi_1.default.string().optional(),
    exercises: joi_1.default.array().items(joi_1.default.object({
        exerciseId: joi_1.default.string().required(),
        name: joi_1.default.string().required(),
        sets: joi_1.default.number().min(1).max(20).required(),
        reps: joi_1.default.number().min(1).max(100).required(),
        rest: joi_1.default.number().min(0).max(600).required(),
        weight: joi_1.default.number().min(0).max(1000).optional(),
        notes: joi_1.default.string().max(500).allow(''),
        order: joi_1.default.number().min(1).max(100).optional()
    })).min(1).required()
}).unknown(true);
exports.progressEntrySchema = joi_1.default.object({
    workoutId: joi_1.default.string().required(),
    workoutDate: joi_1.default.date().max('now').optional(),
    exercises: joi_1.default.array().items(joi_1.default.object({
        exerciseId: joi_1.default.string().required(),
        exerciseName: joi_1.default.string().required(),
        sets: joi_1.default.array().items(joi_1.default.object({
            setNumber: joi_1.default.number().min(1).required(),
            weight: joi_1.default.number().min(0).max(1000).required(),
            reps: joi_1.default.number().min(0).max(1000).required(),
            restTime: joi_1.default.number().min(0).max(3600).required(),
            completed: joi_1.default.boolean().optional(),
            notes: joi_1.default.string().max(500).allow(''),
        })).min(1).required(),
        notes: joi_1.default.string().max(1000).allow(''),
    })).min(1).required(),
    totalDuration: joi_1.default.number().min(1).max(480).required(),
    notes: joi_1.default.string().max(2000).allow(''),
    rating: joi_1.default.number().min(1).max(5).optional(),
    completed: joi_1.default.boolean().optional(),
});
exports.goalSchema = joi_1.default.object({
    title: joi_1.default.string().max(100).required(),
    description: joi_1.default.string().max(500).allow(''),
    category: joi_1.default.string().valid('strength', 'endurance', 'weight', 'body_composition', 'flexibility', 'custom').required(),
    targetValue: joi_1.default.number().min(0).required(),
    currentValue: joi_1.default.number().min(0).optional(),
    unit: joi_1.default.string().max(20).required(),
    deadline: joi_1.default.date().min('now').optional(),
    status: joi_1.default.string().valid('active', 'completed', 'abandoned').optional(),
});
exports.goalProgressSchema = joi_1.default.object({
    value: joi_1.default.number().min(0).required(),
    notes: joi_1.default.string().max(200).allow(''),
});
function validateRegister(req, res, next) {
    const { error } = registerSchema.validate(req.body);
    if (error?.details?.[0]?.message) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    next();
}
function validateLogin(req, res, next) {
    const { error } = loginSchema.validate(req.body);
    if (error?.details?.[0]?.message) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    next();
}
function validateWorkout(req, res, next) {
    const { error } = exports.workoutSchema.validate(req.body);
    if (error?.details?.[0]?.message) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    next();
}
function validateProgressEntry(req, res, next) {
    const { error } = exports.progressEntrySchema.validate(req.body);
    if (error?.details?.[0]?.message) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    next();
}
function validateGoal(req, res, next) {
    const { error } = exports.goalSchema.validate(req.body);
    if (error?.details?.[0]?.message) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    next();
}
function validateGoalProgress(req, res, next) {
    const { error } = exports.goalProgressSchema.validate(req.body);
    if (error?.details?.[0]?.message) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    next();
}
//# sourceMappingURL=validation.js.map