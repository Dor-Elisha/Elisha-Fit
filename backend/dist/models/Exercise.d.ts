import mongoose, { Document } from 'mongoose';
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
export declare const Exercise: mongoose.Model<IExercise, {}, {}, {}, mongoose.Document<unknown, {}, IExercise, {}> & IExercise & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Exercise.d.ts.map