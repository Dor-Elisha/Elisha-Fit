import express from 'express';
import { User } from '../models/User';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Add a log entry for the current user
router.post('/', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const { date, programName, completedAll, summary, programId } = req.body;
    if (!date || !programName || typeof completedAll !== 'boolean' || !summary) {
      return res.status(400).json({ message: 'Missing required log fields' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.logs = user.logs || [];
    user.logs.unshift({ date, programName, completedAll, summary, programId });
    await user.save();
    return res.status(201).json({ message: 'Log added' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get all logs for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ logs: user.logs || [] });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get logs for the current user in a date range
router.get('/range', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: 'Missing start or end date' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);
    const logsInRange = (user.logs || []).filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });
    return res.status(200).json({ logs: logsInRange });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router; 