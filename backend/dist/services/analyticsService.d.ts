export interface DashboardStats {
    totalWorkouts: number;
    totalPrograms: number;
    activeGoals: number;
    completedGoals: number;
    recentWorkouts: any[];
    upcomingGoals: any[];
    weeklyWorkoutFrequency: number;
    averageWorkoutDuration: number;
}
export interface ProgressAnalytics {
    totalWorkouts: number;
    averageWorkoutDuration: number;
    workoutFrequency: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    progressTrends: {
        date: string;
        workouts: number;
        duration: number;
    }[];
    topExercises: {
        exerciseName: string;
        frequency: number;
    }[];
    completionRate: number;
}
export interface GoalAnalytics {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    abandonedGoals: number;
    completionRate: number;
    averageProgress: number;
    goalsByCategory: {
        category: string;
        count: number;
        completed: number;
    }[];
    recentProgress: {
        goalId: string;
        title: string;
        progress: number;
        target: number;
        percentage: number;
    }[];
}
export declare class AnalyticsService {
    static getDashboardStats(userId: string): Promise<DashboardStats>;
    static getProgressAnalytics(userId: string, days?: number): Promise<ProgressAnalytics>;
    static getGoalAnalytics(userId: string): Promise<GoalAnalytics>;
    static getWorkoutPatterns(userId: string, days?: number): Promise<any>;
    private static calculateLongestStreak;
}
//# sourceMappingURL=analyticsService.d.ts.map