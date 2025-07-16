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
const getProgressEntries = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const entries = await models_1.ProgressEntry.find({ userId }).sort({ workoutDate: -1 });
        res.json(entries);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch progress entries' });
        return;
    }
};
const getProgressEntry = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid progress entry ID' });
            return;
        }
        const entry = await models_1.ProgressEntry.findOne({ _id: id, userId });
        if (!entry) {
            res.status(404).json({ error: 'Progress entry not found' });
            return;
        }
        res.json(entry);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch progress entry' });
        return;
    }
};
const createProgressEntry = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const entry = new models_1.ProgressEntry({ ...req.body, userId });
        await entry.save();
        res.status(201).json(entry);
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to create progress entry', details: err instanceof Error ? err.message : err });
        return;
    }
};
const updateProgressEntry = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid progress entry ID' });
            return;
        }
        const entry = await models_1.ProgressEntry.findOneAndUpdate({ _id: id, userId }, req.body, { new: true, runValidators: true });
        if (!entry) {
            res.status(404).json({ error: 'Progress entry not found or not owned by user' });
            return;
        }
        res.json(entry);
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to update progress entry', details: err instanceof Error ? err.message : err });
        return;
    }
};
const deleteProgressEntry = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid progress entry ID' });
            return;
        }
        const entry = await models_1.ProgressEntry.findOneAndDelete({ _id: id, userId });
        if (!entry) {
            res.status(404).json({ error: 'Progress entry not found or not owned by user' });
            return;
        }
        res.json({ message: 'Progress entry deleted' });
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to delete progress entry', details: err instanceof Error ? err.message : err });
        return;
    }
};
router.use(auth_1.authenticate);
router.get('/', getProgressEntries);
router.get('/:id', getProgressEntry);
router.post('/', validation_1.validateProgressEntry, createProgressEntry);
router.put('/:id', validation_1.validateProgressEntry, updateProgressEntry);
router.delete('/:id', deleteProgressEntry);
exports.default = router;
//# sourceMappingURL=progress.js.map