import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GeneralService } from '../../services/general.service';
import { WorkoutService } from '../../services/workout.service';
import { UserStatsService, StatsCard, QuickAction, RecentActivity, WeeklyProgressData } from '../../services/user-stats.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(
    public gs: GeneralService,
    private router: Router,
    private programService: WorkoutService,
    private userStatsService: UserStatsService
  ) { }

  activeTab: 'overview' | 'calendar' | 'programs' = 'programs';
  today = new Date();
  
  // Data from services
  statsCards: StatsCard[] = [];
  quickActions: QuickAction[] = [];
  recentActivity: RecentActivity[] = [];
  weeklyProgress: WeeklyProgressData[] = [];
  
  loading = false;
  error: string | null = null;
  hasDataError = false; // Track if there's an actual API error vs. just empty data
  dataState: 'loading' | 'loaded' | 'error' | 'empty' = 'loading'; // Track the overall data state
  _ = _;

  userInfo: any;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.gs.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        if (userInfo) {
          this.userInfo = userInfo;
          // Example: Access user, programs, logs, scheduledWorkouts from userInfo
          // const user = userInfo?.user;
          // const programs = userInfo?.programs;
          // const logs = userInfo?.user?.logs;
          // const scheduledWorkouts = userInfo?.scheduledWorkouts;
          // You can now use these in your component as needed
          // ...
          // If you need to react to changes, consider making userInfo a BehaviorSubject in GeneralService
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    this.hasDataError = false;
    this.dataState = 'loading';
    
    // Load dashboard data from service
    this.userStatsService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Safely initialize data arrays with robust null/undefined checking
          this.statsCards = Array.isArray(data?.statsCards) ? data.statsCards : [];
          this.quickActions = Array.isArray(data?.quickActions) ? data.quickActions : [];
          this.recentActivity = Array.isArray(data?.recentActivity) ? data.recentActivity : [];
          this.weeklyProgress = Array.isArray(data?.weeklyProgress) ? data.weeklyProgress : [];
          
          // Ensure weeklyProgress has proper structure for each day
          if (this.weeklyProgress.length === 0) {
            // Initialize with empty week structure if no data
            this.weeklyProgress = [
              { day: 'Mon', workouts: 0, calories: 0 },
              { day: 'Tue', workouts: 0, calories: 0 },
              { day: 'Wed', workouts: 0, calories: 0 },
              { day: 'Thu', workouts: 0, calories: 0 },
              { day: 'Fri', workouts: 0, calories: 0 },
              { day: 'Sat', workouts: 0, calories: 0 },
              { day: 'Sun', workouts: 0, calories: 0 }
            ];
          }
          
          this.loading = false;
          
          // Determine if we have any meaningful data
          const hasAnyData = this.statsCards.length > 0 || 
                           this.recentActivity.length > 0 || 
                           this.weeklyProgress.some(day => day.workouts > 0);
          
          this.dataState = hasAnyData ? 'loaded' : 'empty';
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          
          // Determine the type of error and set appropriate error message
          let errorMessage = 'Unable to load your dashboard data. Please try refreshing the page.';
          
          if (error.status === 0) {
            errorMessage = 'Connection error: Unable to reach the server. Please check your internet connection and try again.';
          } else if (error.status === 401) {
            errorMessage = 'Session expired: Please log in again to continue.';
          } else if (error.status === 403) {
            errorMessage = 'Access denied: You don\'t have permission to view this dashboard. Please contact support if this is unexpected.';
          } else if (error.status === 404) {
            errorMessage = 'Dashboard not found: The requested dashboard data could not be located. Please try refreshing the page.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error: Our servers are experiencing issues. Please try again in a few minutes.';
          } else if (error.name === 'TimeoutError') {
            errorMessage = 'Request timeout: The server is taking too long to respond. Please check your connection and try again.';
          } else if (error.status === 429) {
            errorMessage = 'Too many requests: Please wait a moment before trying again.';
          } else if (error.status >= 400 && error.status < 500) {
            errorMessage = 'Request error: There was an issue with your request. Please try refreshing the page.';
          }
          
          // Only set error state for actual API failures, not empty data
          this.error = errorMessage;
          this.hasDataError = true;
          this.loading = false;
          this.dataState = 'error';
          
          // Ensure quick actions are available even during errors for navigation
          if (!this.quickActions || this.quickActions.length === 0) {
            this.quickActions = [
              {
                label: 'Log Workout',
                description: 'Record your fitness activity',
                icon: 'fas fa-plus',
                color: 'primary',
                route: '/progress-entry'
              },
              {
                label: 'View Programs',
                description: 'Browse workout programs',
                icon: 'fas fa-dumbbell',
                color: 'secondary',
                route: '/programs'
              },
              {
                label: 'Set Goals',
                description: 'Create fitness goals',
                icon: 'fas fa-bullseye',
                color: 'success',
                route: '/goals'
              }
            ];
          }
        }
      });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }

  viewProgram(program: any): void {
    this.router.navigate(['/programs', program.id]);
  }

  getProgressPercentage(current: number, goal: number): number {
    return Math.min((current / goal) * 100, 100);
  }

  getWeeklyProgressColor(day: any): string {
    if (day.workouts > 0) return 'var(--fitness-primary)';
    return 'var(--text-muted)';
  }

  getCardColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      info: 'bg-info',
      fitness: 'bg-fitness'
    };
    return colorMap[color] || 'bg-primary';
  }

  getTrendIcon(direction: string): string {
    return direction === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  }

  getTrendColor(direction: string): string {
    return direction === 'up' ? 'text-success' : 'text-danger';
  }

  hasWeeklyProgress(): boolean {
    return this.weeklyProgress.some(day => day.workouts > 0);
  }

  hasRecentActivity(): boolean {
    return this.recentActivity.length > 0;
  }

  hasSavedPrograms(): boolean {
    return this.gs.savedPrograms && this.gs.savedPrograms.length > 0;
  }
}
