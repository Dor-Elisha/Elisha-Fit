import mongoose, { Document } from 'mongoose';
export interface IScheduledWorkout extends Document {
    userId: string;
    date: Date;
    workoutId: string;
    workoutSnapshot: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ScheduledWorkout: mongoose.Model<IScheduledWorkout, {}, {}, {}, mongoose.Document<unknown, {}, IScheduledWorkout, {}> & IScheduledWorkout & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default ScheduledWorkout;
//# sourceMappingURL=ScheduledWorkout.d.ts.map