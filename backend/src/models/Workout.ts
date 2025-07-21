import mongooseShared from '../sharedMongoose';
import { Document, Schema } from 'mongoose';
const mongoose = mongooseShared;

export interface IWorkoutExercise {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  rest?: number;
  restTime?: number; // in seconds
  weight?: number; // in kg/lbs
  order?: number;
  exerciseId?: string; // reference to original exercise from exercises.json
  notes?: string;
}

export interface IWorkoutMetadata {
  estimatedDuration?: number; // in minutes (optional)
  totalExercises: number;
  targetMuscleGroups: string[];
  equipment?: string[]; // optional
  tags: string[];
  isPublic: boolean;
  version: string;
}

export interface IWorkout extends Document {
  name: string;
  description?: string;
  exercises: IWorkoutExercise[];
  targetMuscleGroups: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutExerciseSchema = new Schema<IWorkoutExercise>({
  // id is optional
  id: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
    max: 50,
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
    max: 1000,
  },
  rest: {
    type: Number,
    required: false,
  },
  restTime: {
    type: Number,
    required: false,
  },
  weight: {
    type: Number,
    required: false,
  },
  order: {
    type: Number,
    required: false,
  },
  exerciseId: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, { _id: false });

const WorkoutMetadataSchema = new Schema<IWorkoutMetadata>({
  estimatedDuration: {
    type: Number,
    min: 1,
    max: 480, // 8 hours max
  },
  totalExercises: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  targetMuscleGroups: [{
    type: String,
    required: true,
  }],
  equipment: [{
    type: String,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  isPublic: {
    type: Boolean,
    default: false,
  },
  version: {
    type: String,
    default: '1.0.0',
  },
}, { _id: false });

const WorkoutSchema = new Schema<IWorkout>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  exercises: [WorkoutExerciseSchema],
  targetMuscleGroups: [{
    type: String,
    required: true,
  }],
  userId: {
    type: String,
    required: true,
    index: true, // For efficient queries by user
  },
}, {
  timestamps: true,
});

// Index for efficient queries
WorkoutSchema.index({ userId: 1, createdAt: -1 });
WorkoutSchema.index({ 'metadata.isPublic': 1 });

export const Workout = mongoose.model<IWorkout>('Workout', WorkoutSchema);
export default Workout; 