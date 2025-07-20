"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const mongoose_1 = __importDefault(require("mongoose"));
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const getWorkouts = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const workouts = await models_1.Workout.find({ userId });
        res.json(workouts);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch workouts' });
        return;
    }
};
const getWorkout = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid workout ID' });
            return;
        }
        const workout = await models_1.Workout.findOne({ _id: id, userId: userId });
        if (!workout) {
            res.status(404).json({ error: 'Workout not found' });
            return;
        }
        res.json(workout);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch workout' });
        return;
    }
};
const createWorkout = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const workout = new models_1.Workout({ ...req.body, userId });
        await workout.save();
        res.status(201).json(workout);
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to create workout', details: err instanceof Error ? err.message : err });
        return;
    }
};
const updateWorkout = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid workout ID' });
            return;
        }
        const workout = await models_1.Workout.findOneAndUpdate({ _id: id, userId: userId }, req.body, { new: true, runValidators: true });
        if (!workout) {
            res.status(404).json({ error: 'Workout not found or not owned by user' });
            return;
        }
        res.json(workout);
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to update workout', details: err instanceof Error ? err.message : err });
        return;
    }
};
const deleteWorkout = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid workout ID' });
            return;
        }
        const workout = await models_1.Workout.findOneAndDelete({ _id: id, userId: userId });
        if (!workout) {
            res.status(404).json({ error: 'Workout not found or not owned by user' });
            return;
        }
        res.json({ message: 'Workout deleted' });
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to delete workout', details: err instanceof Error ? err.message : err });
        return;
    }
};
router.use(auth_1.authenticate);
router.get('/', getWorkouts);
router.get('/:id', getWorkout);
router.post('/', validation_1.validateWorkout, createWorkout);
router.put('/:id', validation_1.validateWorkout, updateWorkout);
router.delete('/:id', deleteWorkout);
exports.default = router;
//# sourceMappingURL=workouts.js.map