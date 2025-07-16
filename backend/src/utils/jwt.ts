import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import config from '../config/config';
import type ms from 'ms';

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signJwt(payload: JwtPayload, options?: SignOptions): string {
  // Ensure payload is a plain object
  const plainPayload = { ...payload };
  const jwtOptions: SignOptions = { ...options };
  if (config.jwtExpiresIn) {
    if (typeof config.jwtExpiresIn === 'string') {
      jwtOptions.expiresIn = config.jwtExpiresIn as ms.StringValue;
    } else {
      jwtOptions.expiresIn = config.jwtExpiresIn as number;
    }
  }
  return jwt.sign(plainPayload, config.jwtSecret as Secret, jwtOptions);
}

export function verifyJwt<T = JwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, config.jwtSecret as Secret) as T;
  } catch (err) {
    return null;
  }
} 