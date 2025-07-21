"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exerciseService_1 = require("../services/exerciseService");
const router = (0, express_1.Router)();
const getExercises = async (req, res) => {
    try {
        let { category, muscle, equipment, search, limit, page } = req.query;
        let fetchAll = false;
        if (limit === undefined || limit === '0' || limit === '-1') {
            fetchAll = true;
        }
        const parsedLimit = fetchAll ? 0 : Number(limit) || 50;
        const parsedPage = Number(page) || 1;
        const result = await exerciseService_1.ExerciseService.getExercises({
            category: category,
            muscle: muscle,
            equipment: equipment,
            search: search,
            limit: parsedLimit,
            page: parsedPage
        });
        res.json({
            data: result.exercises,
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                totalCount: result.pagination.total,
                totalPages: result.pagination.pages
            }
        });
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch exercises' });
        return;
    }
};
const getExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const exercise = await exerciseService_1.ExerciseService.getExerciseById(id);
        if (!exercise) {
            res.status(404).json({ error: 'Exercise not found' });
            return;
        }
        res.json(exercise);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch exercise' });
        return;
    }
};
const getCategories = async (req, res) => {
    try {
        const categories = await exerciseService_1.ExerciseService.getCategories();
        res.json(categories);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
        return;
    }
};
const getMuscles = async (req, res) => {
    try {
        const muscles = await exerciseService_1.ExerciseService.getMuscles();
        res.json(muscles);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch muscles' });
        return;
    }
};
const getEquipment = async (req, res) => {
    try {
        const equipment = await exerciseService_1.ExerciseService.getEquipment();
        res.json(equipment);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch equipment' });
        return;
    }
};
router.get('/', getExercises);
router.get('/categories', getCategories);
router.get('/muscles', getMuscles);
router.get('/equipment', getEquipment);
router.get('/:id', getExercise);
router.post('/reload', async (req, res) => {
    try {
        await exerciseService_1.ExerciseService.loadExercisesFromFile();
        res.json({ success: true, message: 'Exercises reloaded from file.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to reload exercises', details: err?.message || err });
    }
});
exports.default = router;
//# sourceMappingURL=exercises.js.map