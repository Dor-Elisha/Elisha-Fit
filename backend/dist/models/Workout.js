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
exports.Workout = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const WorkoutExerciseSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    sets: {
        type: Number,
        required: true,
        min: 1,
        max: 50,
    },
    reps: {
        type: Number,
        required: true,
        min: 1,
        max: 1000,
    },
    rest: {
        type: Number,
        required: false,
    },
    restTime: {
        type: Number,
        required: false,
    },
    weight: {
        type: Number,
        required: false,
    },
    order: {
        type: Number,
        required: false,
    },
    exerciseId: {
        type: String,
        required: false,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500,
    },
}, { _id: false });
const WorkoutMetadataSchema = new mongoose_1.Schema({
    estimatedDuration: {
        type: Number,
        min: 1,
        max: 480,
    },
    totalExercises: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
    },
    targetMuscleGroups: [{
            type: String,
            required: true,
        }],
    equipment: [{
            type: String,
        }],
    tags: [{
            type: String,
            trim: true,
        }],
    isPublic: {
        type: Boolean,
        default: false,
    },
    version: {
        type: String,
        default: '1.0.0',
    },
}, { _id: false });
const WorkoutSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    exercises: [WorkoutExerciseSchema],
    targetMuscleGroups: [{
            type: String,
            required: true,
        }],
    userId: {
        type: String,
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});
WorkoutSchema.index({ userId: 1, createdAt: -1 });
WorkoutSchema.index({ 'metadata.isPublic': 1 });
exports.Workout = mongoose_1.default.model('Workout', WorkoutSchema);
exports.default = exports.Workout;
//# sourceMappingURL=Workout.js.map