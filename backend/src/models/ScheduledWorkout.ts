import mongoose, { Document, Schema } from 'mongoose';

export interface IScheduledWorkout extends Document {
  userId: string;
  date: Date;
  programId: string;
  programSnapshot: any;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledWorkoutSchema = new Schema<IScheduledWorkout>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  programId: {
    type: String,
    required: true
  },
  programSnapshot: {
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

ScheduledWorkoutSchema.index({ userId: 1, date: 1 }, { unique: true });

export const ScheduledWorkout = mongoose.model<IScheduledWorkout>('ScheduledWorkout', ScheduledWorkoutSchema);
export default ScheduledWorkout; 