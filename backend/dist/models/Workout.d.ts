import mongooseShared from '../sharedMongoose';
import { Document } from 'mongoose';
export interface IWorkoutExercise {
    id?: string;
    name: string;
    sets: number;
    reps: number;
    rest?: number;
    restTime?: number;
    weight?: number;
    order?: number;
    exerciseId?: string;
    notes?: string;
}
export interface IWorkoutMetadata {
    estimatedDuration?: number;
    totalExercises: number;
    targetMuscleGroups: string[];
    equipment?: string[];
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
export declare const Workout: mongooseShared.Model<IWorkout, {}, {}, {}, mongooseShared.Document<unknown, {}, IWorkout, {}> & IWorkout & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Workout;
//# sourceMappingURL=Workout.d.ts.map