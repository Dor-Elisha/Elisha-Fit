"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const analyticsService_1 = require("../services/analyticsService");
const router = (0, express_1.Router)();
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const stats = await analyticsService_1.AnalyticsService.getDashboardStats(userId);
        res.json(stats);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        return;
    }
};
const getProgressAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const days = req.query.days ? parseInt(req.query.days) : 30;
        const analytics = await analyticsService_1.AnalyticsService.getProgressAnalytics(userId, days);
        res.json(analytics);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch progress analytics' });
        return;
    }
};
const getGoalAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const analytics = await analyticsService_1.AnalyticsService.getGoalAnalytics(userId);
        res.json(analytics);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch goal analytics' });
        return;
    }
};
const getWorkoutPatterns = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const days = req.query.days ? parseInt(req.query.days) : 90;
        const patterns = await analyticsService_1.AnalyticsService.getWorkoutPatterns(userId, days);
        res.json(patterns);
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch workout patterns' });
        return;
    }
};
router.use(auth_1.authenticate);
router.get('/dashboard', getDashboardStats);
router.get('/progress', getProgressAnalytics);
router.get('/goals', getGoalAnalytics);
router.get('/workouts', getWorkoutPatterns);
exports.default = router;
//# sourceMappingURL=analytics.js.map