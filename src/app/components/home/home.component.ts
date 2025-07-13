import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeneralService } from '../../services/general.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(
    public gs: GeneralService,
    private router: Router
  ) { }

  activeTab: 'overview' | 'calendar' | 'programs' = 'overview';
  today = new Date();
  workoutsThisWeek = 3;
  activeProgram = 1;
  totalSessions = 24;
  caloriesBurned = 1543;
  weeklyGoal = 5;
  currentStreak = 7;
  loading = false;
  _ = _;

  // Enhanced statistics cards
  statsCards = [
    {
      icon: 'fas fa-calendar-week',
      value: this.workoutsThisWeek,
      label: 'Workouts This Week',
      sublabel: `${this.workoutsThisWeek}/${this.weeklyGoal} goal`,
      color: 'primary',
      trend: '+2 from last week',
      trendDirection: 'up'
    },
    {
      icon: 'fas fa-fire',
      value: this.caloriesBurned,
      label: 'Calories Burned',
      sublabel: 'This week',
      color: 'warning',
      trend: '+12% from last week',
      trendDirection: 'up'
    },
    {
      icon: 'fas fa-bullseye',
      value: this.currentStreak,
      label: 'Current Streak',
      sublabel: 'Days in a row',
      color: 'success',
      trend: 'Personal best!',
      trendDirection: 'up'
    },
    {
      icon: 'fas fa-dumbbell',
      value: this.totalSessions,
      label: 'Total Sessions',
      sublabel: 'All time',
      color: 'info',
      trend: '+3 this month',
      trendDirection: 'up'
    }
  ];

  // Quick action buttons
  quickActions = [
    {
      icon: 'fas fa-plus-circle',
      label: 'Create Program',
      description: 'Design a new workout program',
      route: '/program-wizard',
      color: 'fitness'
    },
    {
      icon: 'fas fa-dumbbell',
      label: 'Log Workout',
      description: 'Record today\'s workout',
      route: '/progress-entry',
      color: 'primary'
    },
    {
      icon: 'fas fa-chart-line',
      label: 'View Progress',
      description: 'Check your fitness journey',
      route: '/progress-dashboard',
      color: 'success'
    },
    {
      icon: 'fas fa-calendar-plus',
      label: 'Schedule Workout',
      description: 'Plan your next session',
      route: '/calendar',
      color: 'info'
    }
  ];

  // Recent activity
  recentActivity = [
    {
      type: 'workout',
      title: 'Upper Body Strength',
      time: '2 hours ago',
      icon: 'fas fa-dumbbell',
      color: 'primary'
    },
    {
      type: 'program',
      title: 'Created "Summer Shred" program',
      time: '1 day ago',
      icon: 'fas fa-plus-circle',
      color: 'success'
    },
    {
      type: 'goal',
      title: 'Achieved 5-day streak!',
      time: '2 days ago',
      icon: 'fas fa-trophy',
      color: 'warning'
    }
  ];

  // Weekly progress data
  weeklyProgress = [
    { day: 'Mon', workouts: 1, calories: 320 },
    { day: 'Tue', workouts: 0, calories: 0 },
    { day: 'Wed', workouts: 1, calories: 280 },
    { day: 'Thu', workouts: 1, calories: 450 },
    { day: 'Fri', workouts: 0, calories: 0 },
    { day: 'Sat', workouts: 1, calories: 380 },
    { day: 'Sun', workouts: 0, calories: 0 }
  ];



  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    // TODO: Load real data from services
    setTimeout(() => {
      this.updateStatsCards();
      this.loading = false;
    }, 1000); // Simulate loading time
  }

  updateStatsCards(): void {
    // Update card values with real data
    this.statsCards[0].value = this.workoutsThisWeek;
    this.statsCards[0].sublabel = `${this.workoutsThisWeek}/${this.weeklyGoal} goal`;
    
    this.statsCards[1].value = this.caloriesBurned;
    this.statsCards[2].value = this.currentStreak;
    this.statsCards[3].value = this.totalSessions;
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


}
