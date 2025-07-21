"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workout = void 0;
const sharedMongoose_1 = __importDefault(require("../sharedMongoose"));
const mongoose_1 = require("mongoose");
const mongoose = sharedMongoose_1.default;
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
exports.Workout = mongoose.model('Workout', WorkoutSchema);
exports.default = exports.Workout;
//# sourceMappingURL=Workout.js.map