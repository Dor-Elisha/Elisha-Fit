import mongoose, { Document } from 'mongoose';
export interface ISetProgress {
    setNumber: number;
    weight: number;
    reps: number;
    restTime: number;
    completed: boolean;
    notes?: string;
}
export interface IExerciseProgress {
    exerciseId: string;
    exerciseName: string;
    sets: ISetProgress[];
    notes?: string;
}
export interface IProgressEntry extends Document {
    programId: string;
    userId: string;
    workoutDate: Date;
    exercises: IExerciseProgress[];
    totalDuration: number;
    notes?: string;
    rating?: number;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProgressEntry: mongoose.Model<IProgressEntry, {}, {}, {}, mongoose.Document<unknown, {}, IProgressEntry, {}> & IProgressEntry & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default ProgressEntry;
//# sourceMappingURL=Progress.d.ts.map