import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { ScheduledWorkout } from '../models';

const router = Router();

// Get scheduled workout for a user and date
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const date = req.query.date as string;
    if (!userId || !date) {
      return res.status(400).json({ error: 'Missing user or date' });
    }
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const scheduled = await ScheduledWorkout.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    return res.json(scheduled);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch scheduled workout' });
  }
});

// Schedule a program for a user and date
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { date, programId, programSnapshot } = req.body;
    if (!userId || !date || !programId || !programSnapshot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const scheduled = await ScheduledWorkout.findOneAndUpdate(
      { userId, date: new Date(date) },
      { userId, date: new Date(date), programId, programSnapshot },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(201).json(scheduled);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to schedule workout' });
  }
});

// Remove a scheduled workout for a user and date
router.delete('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const date = req.query.date as string;
    if (!userId || !date) {
      return res.status(400).json({ error: 'Missing user or date' });
    }
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    await ScheduledWorkout.deleteOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    return res.json({ message: 'Scheduled workout removed' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove scheduled workout' });
  }
});

// Get all scheduled workouts for a user in a date range
router.get('/range', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const start = req.query.start as string;
    const end = req.query.end as string;
    if (!userId || !start || !end) {
      return res.status(400).json({ error: 'Missing user or date range' });
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    const scheduled = await ScheduledWorkout.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });
    return res.json(scheduled);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch scheduled workouts for range' });
  }
});

export default router; 