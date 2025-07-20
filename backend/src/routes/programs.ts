import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { Workout } from '../models';
import mongoose from 'mongoose';
import { validateWorkout } from '../middleware/validation';
// import validation middleware as needed

const router = Router();

// List all workouts for the authenticated user
const getWorkouts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const workouts = await Workout.find({ userId });
    res.json(workouts);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workouts' });
    return;
  }
};

// Get a single workout by ID (only if owned by user)
const getWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid workout ID' });
      return;
    }
    const workout = await Workout.findOne({ _id: id, userId: userId as string });
    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }
    res.json(workout);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workout' });
    return;
  }
};

// Create a new workout
const createWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const workout = new Workout({ ...req.body, userId });
    await workout.save();
    res.status(201).json(workout);
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to create workout', details: err instanceof Error ? err.message : err });
    return;
  }
};

// Update a workout (only if owned by user)
const updateWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid workout ID' });
      return;
    }
    // TODO: Add validation middleware
    const workout = await Workout.findOneAndUpdate(
      { _id: id, userId: userId as string },
      req.body,
      { new: true, runValidators: true }
    );
    if (!workout) {
      res.status(404).json({ error: 'Workout not found or not owned by user' });
      return;
    }
    res.json(workout);
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to update workout', details: err instanceof Error ? err.message : err });
    return;
  }
};

// Delete a workout (only if owned by user)
const deleteWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid workout ID' });
      return;
    }
    const workout = await Workout.findOneAndDelete({ _id: id, userId: userId as string });
    if (!workout) {
      res.status(404).json({ error: 'Workout not found or not owned by user' });
      return;
    }
    res.json({ message: 'Workout deleted' });
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete workout', details: err instanceof Error ? err.message : err });
    return;
  }
};

// All routes require authentication
router.use(authenticate);

router.get('/', getWorkouts);
router.get('/:id', getWorkout);
router.post('/', validateWorkout, createWorkout);
router.put('/:id', validateWorkout, updateWorkout);
router.delete('/:id', deleteWorkout);

export default router; 