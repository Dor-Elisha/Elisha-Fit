import dotenv from 'dotenv';

dotenv.config();

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export const config = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/elisha-fit',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  nodeEnv: process.env.NODE_ENV || 'development',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

export default config; 