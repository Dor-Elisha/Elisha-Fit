import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import User from '../models/User';
import Workout from '../models/Workout';
import ScheduledWorkout from '../models/ScheduledWorkout';

const router: Router = Router();

// GET /api/user/initial-data
router.get('/initial-data', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const userId = req.user.id;
    // Fetch user profile (excluding password)
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    // Fetch user's workouts
    const workouts = await Workout.find({ userId });
    // Fetch user's scheduled workouts
    const scheduledWorkouts = await ScheduledWorkout.find({ userId });
    // Logs are embedded in user model
    const logs = user.logs || [];
    // Build response
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        logs,
      },
      workouts,
      scheduledWorkouts,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load user data.' });
  }
});

// PUT /api/user/profile
router.put('/profile', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const userId = req.user.id;
    const { name, currentWeight, height, goalWeight, birthday } = req.body;
    const update: any = {};
    if (name !== undefined) update.name = name;
    if (currentWeight !== undefined) update.currentWeight = currentWeight;
    if (height !== undefined) update.height = height;
    if (goalWeight !== undefined) update.goalWeight = goalWeight;
    if (birthday !== undefined) update.birthday = birthday;
    const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user });
  } catch (err: any) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router; 