"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const User_1 = __importDefault(require("../models/User"));
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Access token required.' });
            return;
        }
        const token = authHeader.substring(7);
        const payload = (0, jwt_1.verifyJwt)(token);
        if (!payload) {
            res.status(401).json({ error: 'Invalid or expired token.' });
            return;
        }
        const user = await User_1.default.findById(payload.userId);
        if (!user) {
            res.status(401).json({ error: 'User not found.' });
            return;
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            ...(user.name && { name: user.name }),
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Authentication failed.' });
        return;
    }
}
//# sourceMappingURL=auth.js.map