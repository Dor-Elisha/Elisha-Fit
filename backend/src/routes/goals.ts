import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { Goal } from '../models';
import mongoose from 'mongoose';
import { validateGoal, validateGoalProgress } from '../middleware/validation';
// import validation middleware as needed

const router = Router();

// List all goals for the authenticated user
const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    res.json(goals);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals' });
    return;
  }
};

// Get a single goal by ID (only if owned by user)
const getGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid goal ID' });
      return;
    }
    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.json(goal);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goal' });
    return;
  }
};

// Create a new goal
const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // TODO: Add validation middleware
    const goal = new Goal({ ...req.body, userId });
    await goal.save();
    res.status(201).json(goal);
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to create goal', details: err instanceof Error ? err.message : err });
    return;
  }
};

// Update a goal (only if owned by user)
const updateGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid goal ID' });
      return;
    }
    // TODO: Add validation middleware
    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) {
      res.status(404).json({ error: 'Goal not found or not owned by user' });
      return;
    }
    res.json(goal);
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to update goal', details: err instanceof Error ? err.message : err });
    return;
  }
};

// Delete a goal (only if owned by user)
const deleteGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid goal ID' });
      return;
    }
    const goal = await Goal.findOneAndDelete({ _id: id, userId });
    if (!goal) {
      res.status(404).json({ error: 'Goal not found or not owned by user' });
      return;
    }
    res.json({ message: 'Goal deleted' });
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete goal', details: err instanceof Error ? err.message : err });
    return;
  }
};

// Update goal progress (only if owned by user)
const updateGoalProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid goal ID' });
      return;
    }
    const { value, notes } = req.body;
    if (typeof value !== 'number' || value < 0) {
      res.status(400).json({ error: 'Valid progress value is required' });
      return;
    }
    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      res.status(404).json({ error: 'Goal not found or not owned by user' });
      return;
    }
    await (goal as any).updateProgress(value, notes);
    res.json(goal);
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to update goal progress', details: err instanceof Error ? err.message : err });
    return;
  }
};

// All routes require authentication
router.use(authenticate);

router.get('/', getGoals);
router.get('/:id', getGoal);
router.post('/', validateGoal, createGoal);
router.put('/:id', validateGoal, updateGoal);
router.delete('/:id', deleteGoal);
router.put('/:id/progress', validateGoalProgress, updateGoalProgress);

export default router; 