"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseService = void 0;
const Exercise_1 = require("../models/Exercise");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ExerciseService {
    static async loadExercisesFromFile() {
        try {
            await Exercise_1.Exercise.deleteMany({});
            const exercisesPath = path_1.default.resolve(__dirname, '../../../src/assets/data/exercises.json');
            const fileContent = fs_1.default.readFileSync(exercisesPath, 'utf8');
            const data = JSON.parse(fileContent);
            const exercisesToInsert = data.exercises.map((exercise, index) => ({
                id: `exercise_${index + 1}`,
                name: exercise.name,
                category: exercise.category,
                muscle: exercise.primaryMuscles[0] || 'general',
                equipment: exercise.equipment || 'body only',
                instructions: exercise.instructions,
                images: exercise.images
            }));
            await Exercise_1.Exercise.insertMany(exercisesToInsert);
            console.log(`Loaded ${exercisesToInsert.length} exercises into database`);
        }
        catch (error) {
            console.error('Error loading exercises:', error);
            throw error;
        }
    }
    static async getExercises(filters) {
        const { category, muscle, equipment, search, limit = 50, page = 1 } = filters;
        const filter = {};
        if (category)
            filter.category = category;
        if (muscle)
            filter.muscle = muscle;
        if (equipment)
            filter.equipment = equipment;
        if (search) {
            filter.$text = { $search: search };
        }
        let exercises;
        let total;
        let pages;
        let skip = (page - 1) * limit;
        if (limit === 0 || limit < 0) {
            exercises = await Exercise_1.Exercise.find(filter).sort({ name: 1 });
            total = exercises.length;
            pages = 1;
            skip = 0;
        }
        else {
            exercises = await Exercise_1.Exercise.find(filter)
                .limit(limit)
                .skip(skip)
                .sort({ name: 1 });
            total = await Exercise_1.Exercise.countDocuments(filter);
            pages = Math.ceil(total / limit);
        }
        return {
            exercises,
            pagination: {
                page,
                limit,
                total,
                pages
            }
        };
    }
    static async getExerciseById(id) {
        return await Exercise_1.Exercise.findOne({ id });
    }
    static async getCategories() {
        return await Exercise_1.Exercise.distinct('category');
    }
    static async getMuscles() {
        return await Exercise_1.Exercise.distinct('muscle');
    }
    static async getEquipment() {
        return await Exercise_1.Exercise.distinct('equipment');
    }
    static async searchExercises(query, limit = 10) {
        return await Exercise_1.Exercise.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit);
    }
}
exports.ExerciseService = ExerciseService;
//# sourceMappingURL=exerciseService.js.map