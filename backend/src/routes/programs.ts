import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { Program } from '../models';
import mongoose from 'mongoose';
import { validateProgram } from '../middleware/validation';
// import validation middleware as needed

const router = Router();

// List all programs for the authenticated user
const getPrograms = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const programs = await Program.find({ userId });
    res.json(programs);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch programs' });
    return;
  }
};

// Get a single program by ID (only if owned by user)
const getProgram = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid program ID' });
      return;
    }
    const program = await Program.findOne({ _id: id, userId: userId as string });
    if (!program) {
      res.status(404).json({ error: 'Program not found' });
      return;
    }
    res.json(program);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch program' });
    return;
  }
};

// Create a new program
const createProgram = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const program = new Program({ ...req.body, userId });
    await program.save();
    res.status(201).json(program);
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to create program', details: err instanceof Error ? err.message : err });
    return;
  }
};

// Update a program (only if owned by user)
const updateProgram = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid program ID' });
      return;
    }
    // TODO: Add validation middleware
    const program = await Program.findOneAndUpdate(
      { _id: id, userId: userId as string },
      req.body,
      { new: true, runValidators: true }
    );
    if (!program) {
      res.status(404).json({ error: 'Program not found or not owned by user' });
      return;
    }
    res.json(program);
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to update program', details: err instanceof Error ? err.message : err });
    return;
  }
};

// Delete a program (only if owned by user)
const deleteProgram = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid program ID' });
      return;
    }
    const program = await Program.findOneAndDelete({ _id: id, userId: userId as string });
    if (!program) {
      res.status(404).json({ error: 'Program not found or not owned by user' });
      return;
    }
    res.json({ message: 'Program deleted' });
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete program', details: err instanceof Error ? err.message : err });
    return;
  }
};

// All routes require authentication
router.use(authenticate);

router.get('/', getPrograms);
router.get('/:id', getProgram);
router.post('/', validateProgram, createProgram);
router.put('/:id', validateProgram, updateProgram);
router.delete('/:id', deleteProgram);

export default router; 