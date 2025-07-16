import mongoose, { Document } from 'mongoose';
export interface IGoal extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    category: 'strength' | 'endurance' | 'weight' | 'body_composition' | 'flexibility' | 'custom';
    targetValue: number;
    currentValue: number;
    unit: string;
    deadline?: Date;
    status: 'active' | 'completed' | 'abandoned';
    progressHistory: Array<{
        date: Date;
        value: number;
        notes?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Goal: mongoose.Model<IGoal, {}, {}, {}, mongoose.Document<unknown, {}, IGoal, {}> & IGoal & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Goal.d.ts.map