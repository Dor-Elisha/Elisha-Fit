"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const GoalSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    category: {
        type: String,
        enum: ['strength', 'endurance', 'weight', 'body_composition', 'flexibility', 'custom'],
        required: true
    },
    targetValue: {
        type: Number,
        required: true,
        min: 0
    },
    currentValue: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    deadline: {
        type: Date,
        validate: {
            validator: function (value) {
                return !value || value > new Date();
            },
            message: 'Deadline must be in the future'
        }
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    },
    progressHistory: [{
            date: {
                type: Date,
                required: true,
                default: Date.now
            },
            value: {
                type: Number,
                required: true,
                min: 0
            },
            notes: {
                type: String,
                trim: true,
                maxlength: 200
            }
        }]
}, {
    timestamps: true
});
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, category: 1 });
GoalSchema.index({ deadline: 1, status: 1 });
GoalSchema.virtual('progressPercentage').get(function () {
    if (this.targetValue === 0)
        return 0;
    return Math.min((this.currentValue / this.targetValue) * 100, 100);
});
GoalSchema.methods.updateProgress = function (value, notes) {
    this.currentValue = value;
    this.progressHistory.push({
        date: new Date(),
        value,
        notes
    });
    if (this.currentValue >= this.targetValue && this.status === 'active') {
        this.status = 'completed';
    }
    return this.save();
};
GoalSchema.methods.isOverdue = function () {
    return this.deadline && this.deadline < new Date() && this.status === 'active';
};
GoalSchema.pre('save', function (next) {
    if (this.currentValue >= this.targetValue && this.status === 'active') {
        this.status = 'completed';
    }
    next();
});
exports.Goal = mongoose_1.default.model('Goal', GoalSchema);
//# sourceMappingURL=Goal.js.map