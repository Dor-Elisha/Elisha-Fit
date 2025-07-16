"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const models_1 = require("../models");
class AnalyticsService {
    static async getDashboardStats(userId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalWorkouts, totalPrograms, activeGoals, completedGoals] = await Promise.all([
            models_1.ProgressEntry.countDocuments({ userId }),
            models_1.Program.countDocuments({ userId }),
            models_1.Goal.countDocuments({ userId, status: 'active' }),
            models_1.Goal.countDocuments({ userId, status: 'completed' })
        ]);
        const recentWorkouts = await models_1.ProgressEntry.find({ userId })
            .sort({ workoutDate: -1 })
            .limit(5)
            .select('workoutDate totalDuration exercises rating');
        const upcomingGoals = await models_1.Goal.find({
            userId,
            status: 'active',
            deadline: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        })
            .sort({ deadline: 1 })
            .limit(5)
            .select('title deadline currentValue targetValue');
        const weeklyWorkouts = await models_1.ProgressEntry.countDocuments({
            userId,
            workoutDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        const avgDurationResult = await models_1.ProgressEntry.aggregate([
            { $match: { userId } },
            { $group: { _id: null, avgDuration: { $avg: '$totalDuration' } } }
        ]);
        const averageWorkoutDuration = avgDurationResult[0]?.avgDuration || 0;
        return {
            totalWorkouts,
            totalPrograms,
            activeGoals,
            completedGoals,
            recentWorkouts,
            upcomingGoals,
            weeklyWorkoutFrequency: weeklyWorkouts,
            averageWorkoutDuration: Math.round(averageWorkoutDuration)
        };
    }
    static async getProgressAnalytics(userId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const workouts = await models_1.ProgressEntry.find({
            userId,
            workoutDate: { $gte: startDate }
        }).sort({ workoutDate: 1 });
        const totalWorkouts = workouts.length;
        const averageWorkoutDuration = workouts.length > 0
            ? Math.round(workouts.reduce((sum, w) => sum + w.totalDuration, 0) / workouts.length)
            : 0;
        const now = new Date();
        const dailyWorkouts = await models_1.ProgressEntry.countDocuments({
            userId,
            workoutDate: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
        });
        const weeklyWorkouts = await models_1.ProgressEntry.countDocuments({
            userId,
            workoutDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        const monthlyWorkouts = await models_1.ProgressEntry.countDocuments({
            userId,
            workoutDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        const progressTrends = await models_1.ProgressEntry.aggregate([
            { $match: { userId, workoutDate: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$workoutDate' } },
                    workouts: { $sum: 1 },
                    duration: { $sum: '$totalDuration' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const topExercises = await models_1.ProgressEntry.aggregate([
            { $match: { userId } },
            { $unwind: '$exercises' },
            {
                $group: {
                    _id: '$exercises.exerciseName',
                    frequency: { $sum: 1 }
                }
            },
            { $sort: { frequency: -1 } },
            { $limit: 10 }
        ]);
        const completedWorkouts = workouts.filter(w => w.completed).length;
        const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
        return {
            totalWorkouts,
            averageWorkoutDuration,
            workoutFrequency: {
                daily: dailyWorkouts,
                weekly: weeklyWorkouts,
                monthly: monthlyWorkouts
            },
            progressTrends: progressTrends.map(pt => ({
                date: pt._id,
                workouts: pt.workouts,
                duration: pt.duration
            })),
            topExercises: topExercises.map(te => ({
                exerciseName: te._id,
                frequency: te.frequency
            })),
            completionRate: Math.round(completionRate)
        };
    }
    static async getGoalAnalytics(userId) {
        const goals = await models_1.Goal.find({ userId });
        const totalGoals = goals.length;
        const activeGoals = goals.filter(g => g.status === 'active').length;
        const completedGoals = goals.filter(g => g.status === 'completed').length;
        const abandonedGoals = goals.filter(g => g.status === 'abandoned').length;
        const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
        const activeGoalProgress = goals
            .filter(g => g.status === 'active')
            .map(g => (g.currentValue / g.targetValue) * 100);
        const averageProgress = activeGoalProgress.length > 0
            ? activeGoalProgress.reduce((sum, p) => sum + p, 0) / activeGoalProgress.length
            : 0;
        const goalsByCategory = await models_1.Goal.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
                }
            },
            { $sort: { count: -1 } }
        ]);
        const recentProgress = await models_1.Goal.find({ userId, status: 'active' })
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('title currentValue targetValue');
        return {
            totalGoals,
            activeGoals,
            completedGoals,
            abandonedGoals,
            completionRate: Math.round(completionRate),
            averageProgress: Math.round(averageProgress),
            goalsByCategory: goalsByCategory.map(gbc => ({
                category: gbc._id,
                count: gbc.count,
                completed: gbc.completed
            })),
            recentProgress: recentProgress.map(rp => ({
                goalId: rp._id.toString(),
                title: rp.title,
                progress: rp.currentValue,
                target: rp.targetValue,
                percentage: Math.round((rp.currentValue / rp.targetValue) * 100)
            }))
        };
    }
    static async getWorkoutPatterns(userId, days = 90) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const workouts = await models_1.ProgressEntry.find({
            userId,
            workoutDate: { $gte: startDate }
        }).sort({ workoutDate: 1 });
        const dayOfWeekStats = await models_1.ProgressEntry.aggregate([
            { $match: { userId, workoutDate: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dayOfWeek: '$workoutDate' },
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$totalDuration' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const hourOfDayStats = await models_1.ProgressEntry.aggregate([
            { $match: { userId, workoutDate: { $gte: startDate } } },
            {
                $group: {
                    _id: { $hour: '$workoutDate' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return {
            totalWorkouts: workouts.length,
            averageWorkoutsPerWeek: Math.round((workouts.length / (days / 7)) * 10) / 10,
            dayOfWeekDistribution: dayOfWeekStats,
            hourOfDayDistribution: hourOfDayStats,
            longestStreak: this.calculateLongestStreak(workouts),
            averageWorkoutDuration: workouts.length > 0
                ? Math.round(workouts.reduce((sum, w) => sum + w.totalDuration, 0) / workouts.length)
                : 0
        };
    }
    static calculateLongestStreak(workouts) {
        if (workouts.length === 0)
            return 0;
        let currentStreak = 1;
        let longestStreak = 1;
        let currentDate = new Date(workouts[0].workoutDate);
        currentDate.setHours(0, 0, 0, 0);
        for (let i = 1; i < workouts.length; i++) {
            const workoutDate = new Date(workouts[i].workoutDate);
            workoutDate.setHours(0, 0, 0, 0);
            const dayDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            }
            else {
                currentStreak = 1;
            }
            currentDate = workoutDate;
        }
        return longestStreak;
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analyticsService.js.map