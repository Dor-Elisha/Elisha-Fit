import { Request, Response, NextFunction } from 'express';
import { verifyJwt, JwtPayload } from '../utils/jwt';
import User from '../models/User';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
      };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access token required.' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyJwt<JwtPayload>(token);
    
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token.' });
      return;
    }

    // Fetch user from database
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found.' });
      return;
    }

    // Add user info to request
    req.user = {
      id: (user._id as any).toString(),
      email: user.email,
      ...(user.name && { name: user.name }),
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed.' });
    return;
  }
} 