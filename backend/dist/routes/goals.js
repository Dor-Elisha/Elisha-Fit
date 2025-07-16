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
const getGoals = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const goals = await models_1.Goal.find({ userId }).sort({ createdAt: -1 });
        res.json(goals);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch goals' });
        return;
    }
};
const getGoal = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid goal ID' });
            return;
        }
        const goal = await models_1.Goal.findOne({ _id: id, userId });
        if (!goal) {
            res.status(404).json({ error: 'Goal not found' });
            return;
        }
        res.json(goal);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch goal' });
        return;
    }
};
const createGoal = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const goal = new models_1.Goal({ ...req.body, userId });
        await goal.save();
        res.status(201).json(goal);
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to create goal', details: err instanceof Error ? err.message : err });
        return;
    }
};
const updateGoal = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid goal ID' });
            return;
        }
        const goal = await models_1.Goal.findOneAndUpdate({ _id: id, userId }, req.body, { new: true, runValidators: true });
        if (!goal) {
            res.status(404).json({ error: 'Goal not found or not owned by user' });
            return;
        }
        res.json(goal);
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to update goal', details: err instanceof Error ? err.message : err });
        return;
    }
};
const deleteGoal = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid goal ID' });
            return;
        }
        const goal = await models_1.Goal.findOneAndDelete({ _id: id, userId });
        if (!goal) {
            res.status(404).json({ error: 'Goal not found or not owned by user' });
            return;
        }
        res.json({ message: 'Goal deleted' });
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to delete goal', details: err instanceof Error ? err.message : err });
        return;
    }
};
const updateGoalProgress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid goal ID' });
            return;
        }
        const { value, notes } = req.body;
        if (typeof value !== 'number' || value < 0) {
            res.status(400).json({ error: 'Valid progress value is required' });
            return;
        }
        const goal = await models_1.Goal.findOne({ _id: id, userId });
        if (!goal) {
            res.status(404).json({ error: 'Goal not found or not owned by user' });
            return;
        }
        await goal.updateProgress(value, notes);
        res.json(goal);
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to update goal progress', details: err instanceof Error ? err.message : err });
        return;
    }
};
router.use(auth_1.authenticate);
router.get('/', getGoals);
router.get('/:id', getGoal);
router.post('/', validation_1.validateGoal, createGoal);
router.put('/:id', validation_1.validateGoal, updateGoal);
router.delete('/:id', deleteGoal);
router.put('/:id/progress', validation_1.validateGoalProgress, updateGoalProgress);
exports.default = router;
//# sourceMappingURL=goals.js.map