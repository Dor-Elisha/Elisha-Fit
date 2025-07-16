import mongoose, { Document, Schema } from 'mongoose';

export interface IProgramExercise {
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

export interface IProgramMetadata {
  estimatedDuration?: number; // in minutes (optional)
  totalExercises: number;
  targetMuscleGroups: string[];
  equipment?: string[]; // optional
  tags: string[];
  isPublic: boolean;
  version: string;
}

export interface IProgram extends Document {
  name: string;
  description?: string;
  exercises: IProgramExercise[];
  targetMuscleGroups: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramExerciseSchema = new Schema<IProgramExercise>({
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

const ProgramMetadataSchema = new Schema<IProgramMetadata>({
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

const ProgramSchema = new Schema<IProgram>({
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
  exercises: [ProgramExerciseSchema],
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
ProgramSchema.index({ userId: 1, createdAt: -1 });
ProgramSchema.index({ 'metadata.isPublic': 1 });

export const Program = mongoose.model<IProgram>('Program', ProgramSchema);
export default Program; 