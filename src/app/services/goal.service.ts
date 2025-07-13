import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Goal, GoalType, ProgressEntry } from '../models/program.interface';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private goals: Goal[] = [];
  private goalsSubject = new BehaviorSubject<Goal[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loadGoalsFromStorage();
  }

  // Get all goals
  getGoals(): Observable<Goal[]> {
    return this.goalsSubject.asObservable();
  }

  // Get loading state
  getLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  // Create new goal
  createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Observable<Goal> {
    this.loadingSubject.next(true);
    
    const newGoal: Goal = {
      ...goal,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.goals.push(newGoal);
    this.saveGoalsToStorage();
    this.goalsSubject.next([...this.goals]);
    this.loadingSubject.next(false);
    
    return of(newGoal);
  }

  // Update existing goal
  updateGoal(updatedGoal: Goal): Observable<Goal> {
    this.loadingSubject.next(true);
    
    const index = this.goals.findIndex(g => g.id === updatedGoal.id);
    if (index !== -1) {
      this.goals[index] = {
        ...updatedGoal,
        updatedAt: new Date()
      };
      this.saveGoalsToStorage();
      this.goalsSubject.next([...this.goals]);
    }
    
    this.loadingSubject.next(false);
    return of(updatedGoal);
  }

  // Delete goal
  deleteGoal(goalId: string): Observable<boolean> {
    this.loadingSubject.next(true);
    
    const index = this.goals.findIndex(g => g.id === goalId);
    if (index !== -1) {
      this.goals.splice(index, 1);
      this.saveGoalsToStorage();
      this.goalsSubject.next([...this.goals]);
      this.loadingSubject.next(false);
      return of(true);
    }
    
    this.loadingSubject.next(false);
    return of(false);
  }

  // Mark goal as completed
  completeGoal(goalId: string): Observable<Goal | null> {
    this.loadingSubject.next(true);
    
    const goal = this.goals.find(g => g.id === goalId);
    if (goal) {
      goal.completed = true;
      goal.completedDate = new Date();
      goal.updatedAt = new Date();
      
      this.saveGoalsToStorage();
      this.goalsSubject.next([...this.goals]);
      this.loadingSubject.next(false);
      return of(goal);
    }
    
    this.loadingSubject.next(false);
    return of(null);
  }

  // Get goals by user
  getGoalsByUser(userId: string): Observable<Goal[]> {
    const userGoals = this.goals.filter(g => g.userId === userId);
    return of(userGoals);
  }

  // Get active goals (not completed)
  getActiveGoals(userId: string): Observable<Goal[]> {
    const activeGoals = this.goals.filter(g => g.userId === userId && !g.completed);
    return of(activeGoals);
  }

  // Get completed goals
  getCompletedGoals(userId: string): Observable<Goal[]> {
    const completedGoals = this.goals.filter(g => g.userId === userId && g.completed);
    return of(completedGoals);
  }

  // Get goals by type
  getGoalsByType(userId: string, type: GoalType): Observable<Goal[]> {
    const typeGoals = this.goals.filter(g => g.userId === userId && g.type === type);
    return of(typeGoals);
  }

  // Calculate goal progress
  calculateGoalProgress(goal: Goal, progressEntries: ProgressEntry[]): {
    currentValue: number;
    percentage: number;
    isCompleted: boolean;
    remainingDays: number;
  } {
    const currentValue = this.getCurrentValue(goal, progressEntries);
    const percentage = Math.min((currentValue / goal.target) * 100, 100);
    const remainingDays = this.getRemainingDays(goal.targetDate);
    const isCompleted = currentValue >= goal.target;

    return {
      currentValue,
      percentage: Math.round(percentage),
      isCompleted,
      remainingDays
    };
  }

  // Get current value based on goal type
  private getCurrentValue(goal: Goal, progressEntries: ProgressEntry[]): number {
    switch (goal.type) {
      case GoalType.WORKOUTS_PER_WEEK:
        return this.getWorkoutsThisWeek(progressEntries);
      case GoalType.TOTAL_WORKOUTS:
        return progressEntries.length;
      case GoalType.TOTAL_DURATION:
        return progressEntries.reduce((sum, entry) => sum + entry.totalDuration, 0);
      case GoalType.WEIGHT_GOAL:
        return this.getMaxWeight(progressEntries);
      case GoalType.REPS_GOAL:
        return this.getMaxReps(progressEntries);
      case GoalType.STREAK_GOAL:
        return this.getCurrentStreak(progressEntries);
      case GoalType.CUSTOM:
        return goal.current;
      default:
        return 0;
    }
  }

  // Get workouts this week
  private getWorkoutsThisWeek(progressEntries: ProgressEntry[]): number {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return progressEntries.filter(entry => 
      new Date(entry.workoutDate) >= startOfWeek
    ).length;
  }

  // Get max weight from progress entries
  private getMaxWeight(progressEntries: ProgressEntry[]): number {
    let maxWeight = 0;
    progressEntries.forEach(entry => {
      entry.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.weight > maxWeight) {
            maxWeight = set.weight;
          }
        });
      });
    });
    return maxWeight;
  }

  // Get max reps from progress entries
  private getMaxReps(progressEntries: ProgressEntry[]): number {
    let maxReps = 0;
    progressEntries.forEach(entry => {
      entry.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.reps > maxReps) {
            maxReps = set.reps;
          }
        });
      });
    });
    return maxReps;
  }

  // Get current streak
  private getCurrentStreak(progressEntries: ProgressEntry[]): number {
    if (!progressEntries.length) return 0;
    
    const dates = progressEntries
      .map(e => new Date(e.workoutDate))
      .sort((a, b) => a.getTime() - b.getTime());
    
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const diff = Math.floor((today.getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0 || diff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  }

  // Get remaining days
  private getRemainingDays(targetDate: Date): number {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // Generate unique ID
  private generateId(): string {
    return 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Load goals from localStorage
  private loadGoalsFromStorage(): void {
    try {
      const stored = localStorage.getItem('elisha-fit-goals');
      if (stored) {
        this.goals = JSON.parse(stored).map((goal: any) => ({
          ...goal,
          startDate: new Date(goal.startDate),
          targetDate: new Date(goal.targetDate),
          completedDate: goal.completedDate ? new Date(goal.completedDate) : undefined,
          createdAt: new Date(goal.createdAt),
          updatedAt: new Date(goal.updatedAt)
        }));
        this.goalsSubject.next([...this.goals]);
      }
    } catch (error) {
      console.error('Error loading goals from storage:', error);
      this.goals = [];
    }
  }

  // Save goals to localStorage
  private saveGoalsToStorage(): void {
    try {
      localStorage.setItem('elisha-fit-goals', JSON.stringify(this.goals));
    } catch (error) {
      console.error('Error saving goals to storage:', error);
    }
  }

  // Clear all goals (for testing/reset)
  clearGoals(): void {
    this.goals = [];
    this.saveGoalsToStorage();
    this.goalsSubject.next([]);
  }
} 