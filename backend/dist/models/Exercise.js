"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exercise = void 0;
const sharedMongoose_1 = __importDefault(require("../sharedMongoose"));
const mongoose_1 = require("mongoose");
const mongoose = sharedMongoose_1.default;
const ExerciseSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    category: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    muscle: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    equipment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    instructions: [{
            type: String,
            trim: true,
            maxlength: 1000
        }],
    images: [{
            type: String,
            trim: true
        }]
}, {
    timestamps: true
});
ExerciseSchema.index({ category: 1, muscle: 1 });
ExerciseSchema.index({ equipment: 1 });
ExerciseSchema.index({ name: 'text', category: 'text', muscle: 'text' });
exports.Exercise = mongoose.model('Exercise', ExerciseSchema);
//# sourceMappingURL=Exercise.js.map