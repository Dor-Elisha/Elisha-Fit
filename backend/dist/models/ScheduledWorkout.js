"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledWorkout = void 0;
const sharedMongoose_1 = __importDefault(require("../sharedMongoose"));
const mongoose_1 = require("mongoose");
const mongoose = sharedMongoose_1.default;
const ScheduledWorkoutSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    workoutId: {
        type: String,
        required: true,
        index: true,
    },
    workoutSnapshot: {
        type: mongoose_1.Schema.Types.Mixed,
        required: false,
    },
}, {
    timestamps: true
});
ScheduledWorkoutSchema.index({ userId: 1, date: 1 }, { unique: true });
exports.ScheduledWorkout = mongoose.model('ScheduledWorkout', ScheduledWorkoutSchema);
exports.default = exports.ScheduledWorkout;
//# sourceMappingURL=ScheduledWorkout.js.map