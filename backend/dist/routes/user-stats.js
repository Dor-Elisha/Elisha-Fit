"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/dashboard', (req, res) => {
    res.json({
        statsCards: [],
        quickActions: [],
        recentActivity: [],
        weeklyProgress: [
            { day: 'Mon', workouts: 0, calories: 0 },
            { day: 'Tue', workouts: 0, calories: 0 },
            { day: 'Wed', workouts: 0, calories: 0 },
            { day: 'Thu', workouts: 0, calories: 0 },
            { day: 'Fri', workouts: 0, calories: 0 },
            { day: 'Sat', workouts: 0, calories: 0 },
            { day: 'Sun', workouts: 0, calories: 0 }
        ]
    });
});
exports.default = router;
//# sourceMappingURL=user-stats.js.map