"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/register', validation_1.validateRegister, authController_1.register);
router.post('/login', validation_1.validateLogin, authController_1.login);
router.post('/refresh', auth_1.authenticate, authController_1.refreshToken);
router.post('/logout', auth_1.authenticate, authController_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map