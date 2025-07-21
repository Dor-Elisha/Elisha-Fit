"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sharedMongoose_1 = __importDefault(require("../sharedMongoose"));
const mongoose_1 = require("mongoose");
const mongoose = sharedMongoose_1.default;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../config/config"));
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid email format'],
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    name: {
        type: String,
        trim: true,
        maxlength: [50, 'Name must be at most 50 characters'],
        default: '',
    },
    logs: [
        {
            date: { type: Date, required: true },
            workoutName: { type: String, required: true },
            completedAll: { type: Boolean, required: true },
            summary: { type: String, required: true },
            workoutId: { type: String, required: false },
        }
    ],
    exerciseDefaults: {
        type: Map,
        of: new mongoose_1.Schema({
            weight: { type: Number, required: false },
        }, { _id: false }),
        default: {},
    },
}, {
    timestamps: true,
});
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(config_1.default.bcryptRounds);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (err) {
        next(err);
    }
});
UserSchema.methods.comparePassword = async function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
exports.User = mongoose.model('User', UserSchema);
exports.default = exports.User;
//# sourceMappingURL=User.js.map