import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { ExerciseService } from '../services/exerciseService';

const router: Router = Router();

// List all exercises with optional filtering
const getExercises = async (req: Request, res: Response) => {
  try {
    let { category, muscle, equipment, search, limit, page } = req.query;
    // If limit is not provided, or is 0 or -1, fetch all exercises
    let fetchAll = false;
    if (limit === undefined || limit === '0' || limit === '-1') {
      fetchAll = true;
    }
    const parsedLimit = fetchAll ? 0 : Number(limit) || 50;
    const parsedPage = Number(page) || 1;

    const result = await ExerciseService.getExercises({
      category: category as string,
      muscle: muscle as string,
      equipment: equipment as string,
      search: search as string,
      limit: parsedLimit,
      page: parsedPage
    });
    // Return as { data, pagination } to match ExerciseListResponse
    res.json({
      data: result.exercises,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalCount: result.pagination.total,
        totalPages: result.pagination.pages
      }
    });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
    return;
  }
};

// Get a specific exercise by ID
const getExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const exercise = await ExerciseService.getExerciseById(id);
    if (!exercise) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }
    res.json(exercise);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercise' });
    return;
  }
};

// Get exercise categories
const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await ExerciseService.getCategories();
    res.json(categories);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
    return;
  }
};

// Get exercise muscles
const getMuscles = async (req: Request, res: Response) => {
  try {
    const muscles = await ExerciseService.getMuscles();
    res.json(muscles);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch muscles' });
    return;
  }
};

// Get exercise equipment
const getEquipment = async (req: Request, res: Response) => {
  try {
    const equipment = await ExerciseService.getEquipment();
    res.json(equipment);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch equipment' });
    return;
  }
};

// Routes (no authentication required for exercise data)
router.get('/', getExercises);
router.get('/categories', getCategories);
router.get('/muscles', getMuscles);
router.get('/equipment', getEquipment);
router.get('/:id', getExercise);

export default router; 