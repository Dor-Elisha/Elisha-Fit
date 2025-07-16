"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
function signJwt(payload, options) {
    const plainPayload = { ...payload };
    const jwtOptions = { ...options };
    if (config_1.default.jwtExpiresIn) {
        if (typeof config_1.default.jwtExpiresIn === 'string') {
            jwtOptions.expiresIn = config_1.default.jwtExpiresIn;
        }
        else {
            jwtOptions.expiresIn = config_1.default.jwtExpiresIn;
        }
    }
    return jsonwebtoken_1.default.sign(plainPayload, config_1.default.jwtSecret, jwtOptions);
}
function verifyJwt(token) {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
    }
    catch (err) {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map