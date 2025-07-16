import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, catchError, throwError, map } from 'rxjs';
import { AdapterService } from './adapter.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private readonly baseUrl = `${environment.apiUrl}/goals`;
  private goalsSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private adapter: AdapterService
  ) {
    // Load goals on initialization
    this.getGoals().subscribe();
  }

  /**
   * Get all goals for the current user
   * HTTP Method: GET
   */
  getGoals(): Observable<any[]> {
    this.loadingSubject.next(true);
    return this.http.get<any[]>(this.baseUrl).pipe(
      catchError(error => {
        console.error('Error fetching goals:', error);
        this.loadingSubject.next(false);
        return of([]);
      }),
      map(goals => {
        this.loadingSubject.next(false);
        return this.adapter.toLegacyGoalArray(goals);
      })
    );
  }

  /**
   * Get loading state
   */
  getLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  /**
   * Create a new goal
   * HTTP Method: POST
   */
  createGoal(goal: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): Observable<any> {
    this.loadingSubject.next(true);
    const backendGoal = this.adapter.fromLegacyGoal(goal as any);
    return this.http.post<any>(this.baseUrl, backendGoal).pipe(
      catchError(error => {
        console.error('Error creating goal:', error);
        this.loadingSubject.next(false);
        return throwError(() => new Error('Failed to create goal'));
      }),
      map(newGoal => {
        this.loadingSubject.next(false);
        return this.adapter.toLegacyGoal(newGoal);
      })
    );
  }

  /**
   * Update an existing goal
   * HTTP Method: PUT
   */
  updateGoal(updatedGoal: any): Observable<any> {
    this.loadingSubject.next(true);
    const backendGoal = this.adapter.fromLegacyGoal(updatedGoal);
    return this.http.put<any>(`${this.baseUrl}/${this.adapter.getGoalId(updatedGoal)}`, backendGoal).pipe(
      catchError(error => {
        console.error(`Error updating goal ${this.adapter.getGoalId(updatedGoal)}:`, error);
        this.loadingSubject.next(false);
        return throwError(() => new Error('Failed to update goal'));
      }),
      map(goal => {
        this.loadingSubject.next(false);
        return this.adapter.toLegacyGoal(goal);
      })
    );
  }

  /**
   * Delete a goal
   * HTTP Method: DELETE
   */
  deleteGoal(goalId: string): Observable<boolean> {
    this.loadingSubject.next(true);
    return this.http.delete(`${this.baseUrl}/${goalId}`).pipe(
      catchError(error => {
        console.error(`Error deleting goal ${goalId}:`, error);
        this.loadingSubject.next(false);
        return throwError(() => new Error('Failed to delete goal'));
      }),
      map(() => {
        this.loadingSubject.next(false);
        return true;
      })
    );
  }

  /**
   * Mark goal as completed
   * HTTP Method: PUT (updates the goal)
   */
  completeGoal(goalId: string): Observable<any | null> {
    this.loadingSubject.next(true);
    return this.http.put<any>(`${this.baseUrl}/${goalId}/progress`, { completed: true }).pipe(
      catchError(error => {
        console.error(`Error completing goal ${goalId}:`, error);
        this.loadingSubject.next(false);
        return of(null);
      }),
      map(goal => {
        this.loadingSubject.next(false);
        return goal ? this.adapter.toLegacyGoal(goal) : null;
      })
    );
  }

  /**
   * Get goals by user (filtered on backend)
   * HTTP Method: GET with query params
   */
  getGoalsByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?userId=${userId}`).pipe(
      catchError(error => {
        console.error(`Error fetching goals for user ${userId}:`, error);
        return of([]);
      }),
      map(goals => this.adapter.toLegacyGoalArray(goals))
    );
  }

  /**
   * Get active goals (not completed)
   * HTTP Method: GET with query params
   */
  getActiveGoals(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?userId=${userId}&completed=false`).pipe(
      catchError(error => {
        console.error(`Error fetching active goals for user ${userId}:`, error);
        return of([]);
      }),
      map(goals => this.adapter.toLegacyGoalArray(goals))
    );
  }

  /**
   * Get completed goals
   * HTTP Method: GET with query params
   */
  getCompletedGoals(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?userId=${userId}&completed=true`).pipe(
      catchError(error => {
        console.error(`Error fetching completed goals for user ${userId}:`, error);
        return of([]);
      }),
      map(goals => this.adapter.toLegacyGoalArray(goals))
    );
  }

  /**
   * Get goals by type
   * HTTP Method: GET with query params
   */
  getGoalsByType(userId: string, type: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?userId=${userId}&type=${type}`).pipe(
      catchError(error => {
        console.error(`Error fetching goals by type for user ${userId}:`, error);
        return of([]);
      }),
      map(goals => this.adapter.toLegacyGoalArray(goals))
    );
  }

  // Calculate goal progress
  calculateGoalProgress(goal: any, progressEntries: any[]): {
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
  private getCurrentValue(goal: any, progressEntries: any[]): number {
    switch (goal.type) {
      case 'WORKOUTS_PER_WEEK':
        return this.getWorkoutsThisWeek(progressEntries);
      case 'TOTAL_WORKOUTS':
        return progressEntries.length;
      case 'TOTAL_DURATION':
        return progressEntries.reduce((sum: number, entry: any) => sum + entry.totalDuration, 0);
      case 'WEIGHT_GOAL':
        return this.getMaxWeight(progressEntries);
      case 'REPS_GOAL':
        return this.getMaxReps(progressEntries);
      case 'STREAK_GOAL':
        return this.getCurrentStreak(progressEntries);
      case 'CUSTOM':
        return goal.current;
      default:
        return 0;
    }
  }

  // Get workouts this week
  private getWorkoutsThisWeek(progressEntries: any[]): number {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return progressEntries.filter(entry => 
      new Date(entry.workoutDate) >= startOfWeek
    ).length;
  }

  // Get max weight from progress entries
  private getMaxWeight(progressEntries: any[]): number {
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
  private getMaxReps(progressEntries: any[]): number {
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
  private getCurrentStreak(progressEntries: any[]): number {
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

  /**
   * Clear all goals (for testing/reset)
   * Note: This would need backend implementation for proper clearing
   */
  clearGoals(): Observable<boolean> {
    // This would need a backend endpoint to clear all goals for a user
    console.warn('clearGoals method needs backend implementation');
    return of(false);
  }
} 