import mongooseShared from '../sharedMongoose';
import { Document, Schema } from 'mongoose';
const mongoose = mongooseShared;

export interface IExercise extends Document {
  id: string;
  name: string;
  category: string;
  muscle: string;
  equipment: string;
  instructions: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  muscle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  equipment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  instructions: [{
    type: String,
    trim: true,
    maxlength: 1000
  }],
  images: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
ExerciseSchema.index({ category: 1, muscle: 1 });
ExerciseSchema.index({ equipment: 1 });
ExerciseSchema.index({ name: 'text', category: 'text', muscle: 'text' });

export const Exercise = mongoose.model<IExercise>('Exercise', ExerciseSchema); 