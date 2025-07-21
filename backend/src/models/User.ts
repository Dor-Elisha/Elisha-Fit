import mongooseShared from '../sharedMongoose';
import { Document, Schema } from 'mongoose';
const mongoose = mongooseShared;
import bcrypt from 'bcryptjs';
import config from '../config/config';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  logs?: Array<{
    date: Date;
    workoutName: string;
    completedAll: boolean;
    summary: string;
    workoutId?: string;
  }>;
  exerciseDefaults: Map<string, { weight: number }>;
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Do not return password by default
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name must be at most 50 characters'],
    default: '',
  },
  logs: [
    {
      date: { type: Date, required: true },
      workoutName: { type: String, required: true },
      completedAll: { type: Boolean, required: true },
      summary: { type: String, required: true },
      workoutId: { type: String, required: false },
    }
  ],
  exerciseDefaults: {
    type: Map,
    of: new Schema({
      weight: { type: Number, required: false },
    }, { _id: false }),
    default: {},
  },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(config.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Add method to compare password
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
export default User; 