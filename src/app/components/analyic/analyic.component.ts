import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-analyic',
  templateUrl: './analyic.component.html',
  styleUrls: ['./analyic.component.scss']
})
export class AnalyicComponent implements OnInit, OnDestroy {
  activeTab: 'overview' | 'progress' | 'goals' | 'performance' = 'overview';
  
  // Mock data for analytics
  weeklyProgress = [
    { day: 'Mon', workouts: 1, calories: 320, duration: 45 },
    { day: 'Tue', workouts: 0, calories: 0, duration: 0 },
    { day: 'Wed', workouts: 1, calories: 280, duration: 40 },
    { day: 'Thu', workouts: 1, calories: 450, duration: 60 },
    { day: 'Fri', workouts: 0, calories: 0, duration: 0 },
    { day: 'Sat', workouts: 1, calories: 380, duration: 55 },
    { day: 'Sun', workouts: 0, calories: 0, duration: 0 }
  ];

  monthlyStats = {
    totalWorkouts: 15,
    totalCalories: 2840,
    averageDuration: 48,
    consistency: 75,
    improvement: 12
  };

  goals = [
    {
      name: 'Weekly Workouts',
      current: 4,
      target: 5,
      unit: 'workouts',
      progress: 80
    },
    {
      name: 'Monthly Calories',
      current: 2840,
      target: 3000,
      unit: 'calories',
      progress: 95
    },
    {
      name: 'Consistency',
      current: 75,
      target: 80,
      unit: '%',
      progress: 94
    }
  ];

  performanceMetrics = [
    { metric: 'Strength', value: 85, trend: 'up', change: '+5%' },
    { metric: 'Endurance', value: 72, trend: 'up', change: '+8%' },
    { metric: 'Flexibility', value: 68, trend: 'up', change: '+3%' },
    { metric: 'Balance', value: 75, trend: 'stable', change: '0%' }
  ];

  private destroy$ = new Subject<void>();

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProgressPercentage(current: number, target: number): number {
    return Math.min((current / target) * 100, 100);
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 90) return 'var(--success-color)';
    if (percentage >= 70) return 'var(--warning-color)';
    return 'var(--danger-color)';
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'fas fa-arrow-up';
      case 'down': return 'fas fa-arrow-down';
      default: return 'fas fa-minus';
    }
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-danger';
      default: return 'text-muted';
    }
  }
}
