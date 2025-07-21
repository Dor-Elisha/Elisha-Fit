"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const Workout_1 = __importDefault(require("../models/Workout"));
const ScheduledWorkout_1 = __importDefault(require("../models/ScheduledWorkout"));
const router = (0, express_1.Router)();
router.get('/initial-data', auth_1.authenticate, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    try {
        const userId = req.user.id;
        const user = await User_1.default.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const workouts = await Workout_1.default.find({ userId });
        const scheduledWorkouts = await ScheduledWorkout_1.default.find({ userId });
        const logs = user.logs || [];
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
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to load user data.' });
    }
});
router.put('/profile', auth_1.authenticate, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    try {
        const userId = req.user.id;
        const { name, currentWeight, height, goalWeight, birthday } = req.body;
        const update = {};
        if (name !== undefined)
            update.name = name;
        if (currentWeight !== undefined)
            update.currentWeight = currentWeight;
        if (height !== undefined)
            update.height = height;
        if (goalWeight !== undefined)
            update.goalWeight = goalWeight;
        if (birthday !== undefined)
            update.birthday = birthday;
        const user = await User_1.default.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        return res.json({ user });
    }
    catch (err) {
        console.error('Profile update error:', err);
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
});
router.put('/exercise-weight', auth_1.authenticate, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    try {
        const userId = req.user.id;
        const { exerciseId, weight } = req.body;
        if (!exerciseId || typeof weight !== 'number') {
            return res.status(400).json({ error: 'exerciseId and weight are required.' });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        user.exerciseDefaults.set(exerciseId, { weight });
        await user.save();
        await Workout_1.default.updateMany({ userId, 'exercises.exerciseId': exerciseId }, { $set: { 'exercises.$[elem].weight': weight } }, { arrayFilters: [{ 'elem.exerciseId': exerciseId }] });
        return res.json({ success: true });
    }
    catch (err) {
        console.error('Exercise weight update error:', err);
        return res.status(500).json({ error: 'Failed to update exercise weight.' });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map