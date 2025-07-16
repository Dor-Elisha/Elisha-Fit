import mongoose, { Document } from 'mongoose';
export interface IProgramExercise {
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
export interface IProgramMetadata {
    estimatedDuration?: number;
    totalExercises: number;
    targetMuscleGroups: string[];
    equipment?: string[];
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
export declare const Program: mongoose.Model<IProgram, {}, {}, {}, mongoose.Document<unknown, {}, IProgram, {}> & IProgram & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Program;
//# sourceMappingURL=Program.d.ts.map