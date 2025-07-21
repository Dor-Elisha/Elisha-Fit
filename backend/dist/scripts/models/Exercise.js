"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exercise = void 0;
var sharedMongoose_1 = require("../sharedMongoose");
var mongoose_1 = require("mongoose");
var mongoose = sharedMongoose_1.default;
var ExerciseSchema = new mongoose_1.Schema({
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
// Indexes for efficient queries
ExerciseSchema.index({ category: 1, muscle: 1 });
ExerciseSchema.index({ equipment: 1 });
ExerciseSchema.index({ name: 'text', category: 'text', muscle: 'text' });
exports.Exercise = mongoose.model('Exercise', ExerciseSchema);
