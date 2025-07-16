import { Request, Response } from 'express';
import User from '../models/User';
import { signJwt } from '../utils/jwt';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }
    // Create user
    const user = new User({ email, password, name });
    await user.save();
    // Issue JWT
    const token = signJwt({ userId: (user._id as any).toString(), email: user.email });
    // Return user info (without password) and token
    return res.status(201).json({
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Registration failed.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Issue JWT
    const token = signJwt({ userId: (user._id as any).toString(), email: user.email });
    // Return user info (without password) and token
    return res.status(200).json({
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Login failed.' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    // The user should already be authenticated via middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Find the user to get fresh data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Issue new JWT
    const token = signJwt({ userId: (user._id as any).toString(), email: user.email });
    
    // Return user info and new token
    return res.status(200).json({
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Token refresh failed.' });
  }
}

export async function logout(req: Request, res: Response) {
  // Since JWT is stateless, we just return success
  // The client should remove the token from storage
  return res.status(200).json({ message: 'Logged out successfully.' });
} 