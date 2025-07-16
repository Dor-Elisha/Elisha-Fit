import { Exercise, IExercise } from '../models/Exercise';
import fs from 'fs';
import path from 'path';

interface ExerciseData {
  name: string;
  force?: string;
  level: string;
  mechanic?: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

interface ExercisesFile {
  exercises: ExerciseData[];
}

export class ExerciseService {
  /**
   * Load exercises from JSON file into database
   */
  static async loadExercisesFromFile(): Promise<void> {
    try {
      // Check if exercises already exist in database
      const existingCount = await Exercise.countDocuments();
      if (existingCount > 0) {
        console.log('Exercises already loaded in database');
        return;
      }

      // Read exercises.json file
      const exercisesPath = path.resolve(__dirname, '../../../src/assets/data/exercises.json');
      const fileContent = fs.readFileSync(exercisesPath, 'utf8');
      const data: ExercisesFile = JSON.parse(fileContent);

      // Transform and insert exercises
      const exercisesToInsert = data.exercises.map((exercise, index) => ({
        id: `exercise_${index + 1}`,
        name: exercise.name,
        category: exercise.category,
        muscle: exercise.primaryMuscles[0] || 'general', // Use first primary muscle
        equipment: exercise.equipment || 'body only',
        instructions: exercise.instructions,
        images: exercise.images
      }));

      await Exercise.insertMany(exercisesToInsert);
      console.log(`Loaded ${exercisesToInsert.length} exercises into database`);
    } catch (error) {
      console.error('Error loading exercises:', error);
      throw error;
    }
  }

  /**
   * Get all exercises with optional filtering
   */
  static async getExercises(filters: {
    category?: string;
    muscle?: string;
    equipment?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<{ exercises: IExercise[]; pagination: any }> {
    const { category, muscle, equipment, search, limit = 50, page = 1 } = filters;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (muscle) filter.muscle = muscle;
    if (equipment) filter.equipment = equipment;
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    let exercises;
    let total;
    let pages;
    let skip = (page - 1) * limit;
    if (limit === 0 || limit < 0) {
      // Fetch all exercises
      exercises = await Exercise.find(filter).sort({ name: 1 });
      total = exercises.length;
      pages = 1;
      skip = 0;
    } else {
      exercises = await Exercise.find(filter)
        .limit(limit)
        .skip(skip)
        .sort({ name: 1 });
      total = await Exercise.countDocuments(filter);
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

  /**
   * Get exercise by ID
   */
  static async getExerciseById(id: string): Promise<IExercise | null> {
    return await Exercise.findOne({ id });
  }

  /**
   * Get distinct categories
   */
  static async getCategories(): Promise<string[]> {
    return await Exercise.distinct('category');
  }

  /**
   * Get distinct muscles
   */
  static async getMuscles(): Promise<string[]> {
    return await Exercise.distinct('muscle');
  }

  /**
   * Get distinct equipment
   */
  static async getEquipment(): Promise<string[]> {
    return await Exercise.distinct('equipment');
  }

  /**
   * Search exercises by name
   */
  static async searchExercises(query: string, limit: number = 10): Promise<IExercise[]> {
    return await Exercise.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
  }
} 