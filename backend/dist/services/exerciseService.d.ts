import { IExercise } from '../models/Exercise';
export declare class ExerciseService {
    static loadExercisesFromFile(): Promise<void>;
    static getExercises(filters: {
        category?: string;
        muscle?: string;
        equipment?: string;
        search?: string;
        limit?: number;
        page?: number;
    }): Promise<{
        exercises: IExercise[];
        pagination: any;
    }>;
    static getExerciseById(id: string): Promise<IExercise | null>;
    static getCategories(): Promise<string[]>;
    static getMuscles(): Promise<string[]>;
    static getEquipment(): Promise<string[]>;
    static searchExercises(query: string, limit?: number): Promise<IExercise[]>;
}
//# sourceMappingURL=exerciseService.d.ts.map