"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
async function register(req, res) {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const existing = await User_1.default.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Email is already registered.' });
        }
        const user = new User_1.default({ email, password, name });
        await user.save();
        const token = (0, jwt_1.signJwt)({ userId: user._id.toString(), email: user.email });
        return res.status(201).json({
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            token,
        });
    }
    catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Registration failed.' });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const token = (0, jwt_1.signJwt)({ userId: user._id.toString(), email: user.email });
        return res.status(200).json({
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            token,
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Login failed.' });
    }
}
async function refreshToken(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        const user = await User_1.default.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found.' });
        }
        const token = (0, jwt_1.signJwt)({ userId: user._id.toString(), email: user.email });
        return res.status(200).json({
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            token,
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Token refresh failed.' });
    }
}
async function logout(req, res) {
    return res.status(200).json({ message: 'Logged out successfully.' });
}
//# sourceMappingURL=authController.js.map