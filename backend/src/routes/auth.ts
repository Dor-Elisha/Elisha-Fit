import { Router } from 'express';
import { register, login, logout, refreshToken } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', authenticate, refreshToken);
router.post('/logout', authenticate, logout);

export default router; 