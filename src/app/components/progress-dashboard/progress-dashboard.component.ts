import { Component, Input, OnInit } from '@angular/core';
import { ProgressEntry, Program } from '../../models/program.interface';
import { ExportService } from '../../services/export.service';

export interface DashboardSummary {
  totalWorkouts: number;
  currentStreak: number;
  bestStreak: number;
  bestWeek: string;
  bestMonth: string;
  totalDuration: number;
  averageRating: number;
  completedGoals: number;
  activeGoals: number;
  recentAchievements: string[];
}

@Component({
  selector: 'app-progress-dashboard',
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss']
})
export class ProgressDashboardComponent implements OnInit {
  @Input() progressEntries: ProgressEntry[] = [];
  @Input() programs: Program[] = [];
  @Input() goals: any[] = [];
  @Input() loading: boolean = false;

  summary: DashboardSummary | null = null;

  constructor(private exportService: ExportService) {}

  ngOnInit(): void {
    this.calculateSummary();
  }

  ngOnChanges(): void {
    this.calculateSummary();
  }

  exportData(type: 'csv' | 'json') {
    if (!this.progressEntries || this.progressEntries.length === 0) return;
    if (type === 'csv') {
      // Flatten nested objects for CSV export
      const flat = this.progressEntries.map(entry => ({
        ...entry,
        workoutDate: new Date(entry.workoutDate).toISOString().split('T')[0],
        exercises: entry.exercises.map(e => e.exerciseName).join('; '),
        totalSets: entry.exercises.reduce((sum, ex) => sum + ex.sets.length, 0),
        totalReps: entry.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps, 0), 0)
      }));
      this.exportService.exportToCSV(flat, 'progress-export.csv');
    } else {
      this.exportService.exportToJSON(this.progressEntries, 'progress-export.json');
    }
  }

  calculateSummary(): void {
    if (!this.progressEntries || this.progressEntries.length === 0) {
      this.summary = null;
      return;
    }
    const totalWorkouts = this.progressEntries.length;
    const totalDuration = this.progressEntries.reduce((sum, entry) => sum + entry.totalDuration, 0);
    const averageRating = totalWorkouts > 0 ? (this.progressEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / totalWorkouts) : 0;
    const streaks = this.calculateStreaks();
    const bestWeek = this.getBestWeek();
    const bestMonth = this.getBestMonth();
    const completedGoals = this.goals.filter(g => g.completed).length;
    const activeGoals = this.goals.filter(g => !g.completed).length;
    const recentAchievements = this.getRecentAchievements();
    this.summary = {
      totalWorkouts,
      currentStreak: streaks.current,
      bestStreak: streaks.best,
      bestWeek,
      bestMonth,
      totalDuration,
      averageRating: Math.round(averageRating * 10) / 10,
      completedGoals,
      activeGoals,
      recentAchievements
    };
  }

  calculateStreaks(): { current: number; best: number } {
    if (!this.progressEntries.length) return { current: 0, best: 0 };
    const dates = this.progressEntries
      .map(e => new Date(e.workoutDate))
      .sort((a, b) => a.getTime() - b.getTime());
    let best = 0, current = 0, streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else if (diff > 1) {
        if (streak > best) best = streak;
        streak = 1;
      }
    }
    best = Math.max(best, streak);
    // Calculate current streak
    const today = new Date();
    let currentStreak = 0;
    for (let i = dates.length - 1; i >= 0; i--) {
      const diff = Math.floor((today.getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0 || diff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }
    return { current: currentStreak, best };
  }

  getBestWeek(): string {
    if (!this.progressEntries.length) return '';
    const weekMap: { [key: string]: number } = {};
    this.progressEntries.forEach(entry => {
      const d = new Date(entry.workoutDate);
      const year = d.getFullYear();
      const week = this.getWeekNumber(d);
      const key = `${year}-W${week}`;
      weekMap[key] = (weekMap[key] || 0) + 1;
    });
    const best = Object.entries(weekMap).sort((a, b) => b[1] - a[1])[0];
    return best ? `${best[0]} (${best[1]} workouts)` : '';
  }

  getBestMonth(): string {
    if (!this.progressEntries.length) return '';
    const monthMap: { [key: string]: number } = {};
    this.progressEntries.forEach(entry => {
      const d = new Date(entry.workoutDate);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const best = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0];
    return best ? `${best[0]} (${best[1]} workouts)` : '';
  }

  getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  getRecentAchievements(): string[] {
    // Placeholder: In a real app, this would be more dynamic
    const achievements: string[] = [];
    if (this.progressEntries.length >= 10) achievements.push('10 Workouts Completed!');
    if (this.summary && this.summary.bestStreak >= 7) achievements.push('7-Day Streak!');
    if (this.summary && this.summary.totalDuration >= 1000) achievements.push('1000 Minutes Logged!');
    return achievements;
  }

  getFormattedDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}
