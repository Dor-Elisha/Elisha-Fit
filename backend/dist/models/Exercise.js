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
exports.Exercise = void 0;
const mongoose_1 = __importStar(require("mongoose"));
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
exports.Exercise = mongoose_1.default.model('Exercise', ExerciseSchema);
//# sourceMappingURL=Exercise.js.map