import mongoose from 'mongoose';
export declare class Database {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getConnection(): mongoose.Connection;
    isConnectedToDatabase(): boolean;
}
declare const _default: Database;
export default _default;
//# sourceMappingURL=database.d.ts.map