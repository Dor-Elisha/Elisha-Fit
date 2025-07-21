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
    // Convert exerciseDefaults Map to plain object if present
    let exerciseDefaults = {};
    if (user.exerciseDefaults && typeof user.exerciseDefaults === 'object' && user.exerciseDefaults instanceof Map) {
      exerciseDefaults = Object.fromEntries(user.exerciseDefaults);
    } else if (user.exerciseDefaults && typeof user.exerciseDefaults === 'object') {
      exerciseDefaults = user.exerciseDefaults;
    }
    console.log('DEBUG: exerciseDefaults for user', user._id, exerciseDefaults);
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        logs,
        exerciseDefaults,
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
    return res.json({ user: {
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      logs: user.logs || [],
      exerciseDefaults: user.exerciseDefaults ? (user.exerciseDefaults instanceof Map ? Object.fromEntries(user.exerciseDefaults) : user.exerciseDefaults) : {},
    }});
  } catch (err: any) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PUT /api/user/exercise-weight
router.put('/exercise-weight', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const userId = req.user.id;
    const { exerciseId, weight } = req.body;
    if (!exerciseId || typeof weight !== 'number') {
      return res.status(400).json({ error: 'exerciseId and weight are required.' });
    }
    // Update user exerciseDefaults
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    user.exerciseDefaults.set(exerciseId, { weight });
    await user.save();
    // Update all workouts for this user containing this exercise
    // Use aggregation pipeline to update all matching exercises in all workouts
    await Workout.updateMany(
      { userId, 'exercises.exerciseId': exerciseId },
      [
        {
          $set: {
            exercises: {
              $map: {
                input: "$exercises",
                as: "ex",
                in: {
                  $cond: [
                    { $eq: ["$$ex.exerciseId", exerciseId] },
                    { $mergeObjects: ["$$ex", { weight: weight }] },
                    "$$ex"
                  ]
                }
              }
            }
          }
        }
      ]
    );
    // Convert exerciseDefaults Map to plain object for response
    let exerciseDefaults = {};
    if (user.exerciseDefaults && typeof user.exerciseDefaults === 'object' && user.exerciseDefaults instanceof Map) {
      exerciseDefaults = Object.fromEntries(user.exerciseDefaults);
    } else if (user.exerciseDefaults && typeof user.exerciseDefaults === 'object') {
      exerciseDefaults = user.exerciseDefaults;
    }
    return res.json({ exerciseDefaults });
  } catch (err) {
    console.error('Exercise weight update error:', err);
    return res.status(500).json({ error: 'Failed to update exercise weight.' });
  }
});

export default router; 