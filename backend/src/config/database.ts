import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from '../config/config';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}; 