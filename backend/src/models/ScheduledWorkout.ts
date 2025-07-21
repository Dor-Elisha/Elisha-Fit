import mongooseShared from '../sharedMongoose';
import { Document, Schema } from 'mongoose';
const mongoose = mongooseShared;

export interface IScheduledWorkout extends Document {
  userId: string;
  date: Date;
  workoutId: string;
  workoutSnapshot: any;
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
  workoutId: {
    type: String,
    required: true,
    index: true,
  },
  workoutSnapshot: {
    type: Schema.Types.Mixed,
    required: false,
  },
}, {
  timestamps: true
});

ScheduledWorkoutSchema.index({ userId: 1, date: 1 }, { unique: true });

export const ScheduledWorkout = mongoose.model<IScheduledWorkout>('ScheduledWorkout', ScheduledWorkoutSchema);
export default ScheduledWorkout; 