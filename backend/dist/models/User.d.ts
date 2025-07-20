import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    password: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
    logs?: Array<{
        date: Date;
        workoutName: string;
        completedAll: boolean;
        summary: string;
        workoutId?: string;
    }>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map