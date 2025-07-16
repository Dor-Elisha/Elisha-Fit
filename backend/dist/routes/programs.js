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
const getPrograms = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const programs = await models_1.Program.find({ userId });
        res.json(programs);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch programs' });
        return;
    }
};
const getProgram = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid program ID' });
            return;
        }
        const program = await models_1.Program.findOne({ _id: id, userId: userId });
        if (!program) {
            res.status(404).json({ error: 'Program not found' });
            return;
        }
        res.json(program);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch program' });
        return;
    }
};
const createProgram = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const program = new models_1.Program({ ...req.body, userId });
        await program.save();
        res.status(201).json(program);
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to create program', details: err instanceof Error ? err.message : err });
        return;
    }
};
const updateProgram = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid program ID' });
            return;
        }
        const program = await models_1.Program.findOneAndUpdate({ _id: id, userId: userId }, req.body, { new: true, runValidators: true });
        if (!program) {
            res.status(404).json({ error: 'Program not found or not owned by user' });
            return;
        }
        res.json(program);
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to update program', details: err instanceof Error ? err.message : err });
        return;
    }
};
const deleteProgram = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: 'Invalid program ID' });
            return;
        }
        const program = await models_1.Program.findOneAndDelete({ _id: id, userId: userId });
        if (!program) {
            res.status(404).json({ error: 'Program not found or not owned by user' });
            return;
        }
        res.json({ message: 'Program deleted' });
        return;
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to delete program', details: err instanceof Error ? err.message : err });
        return;
    }
};
router.use(auth_1.authenticate);
router.get('/', getPrograms);
router.get('/:id', getProgram);
router.post('/', validation_1.validateProgram, createProgram);
router.put('/:id', validation_1.validateProgram, updateProgram);
router.delete('/:id', deleteProgram);
exports.default = router;
//# sourceMappingURL=programs.js.map