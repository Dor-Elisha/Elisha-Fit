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
exports.ProgressEntry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SetProgressSchema = new mongoose_1.Schema({
    setNumber: {
        type: Number,
        required: true,
        min: 1,
    },
    weight: {
        type: Number,
        required: true,
        min: 0,
        max: 1000,
    },
    reps: {
        type: Number,
        required: true,
        min: 0,
        max: 1000,
    },
    restTime: {
        type: Number,
        required: true,
        min: 0,
        max: 3600,
    },
    completed: {
        type: Boolean,
        required: true,
        default: true,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500,
    },
}, { _id: false });
const ExerciseProgressSchema = new mongoose_1.Schema({
    exerciseId: {
        type: String,
        required: true,
    },
    exerciseName: {
        type: String,
        required: true,
        trim: true,
    },
    sets: [SetProgressSchema],
    notes: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
}, { _id: false });
const ProgressEntrySchema = new mongoose_1.Schema({
    programId: {
        type: String,
        required: true,
        index: true,
    },
    userId: {
        type: String,
        required: true,
        index: true,
    },
    workoutDate: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
    },
    exercises: [ExerciseProgressSchema],
    totalDuration: {
        type: Number,
        required: true,
        min: 1,
        max: 480,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 2000,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    completed: {
        type: Boolean,
        required: true,
        default: true,
    },
}, {
    timestamps: true,
});
ProgressEntrySchema.index({ userId: 1, workoutDate: -1 });
ProgressEntrySchema.index({ userId: 1, programId: 1, workoutDate: -1 });
ProgressEntrySchema.index({ userId: 1, completed: 1 });
exports.ProgressEntry = mongoose_1.default.model('ProgressEntry', ProgressEntrySchema);
exports.default = exports.ProgressEntry;
//# sourceMappingURL=Progress.js.map