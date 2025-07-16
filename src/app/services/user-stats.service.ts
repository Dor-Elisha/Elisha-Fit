import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  date: string | null;
  category: string;
  rarity: string;
}

export interface AchievementCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ProgressIndicator {
  current: number;
  target: number;
  label: string;
  icon: string;
}

export interface UserBadge {
  id: number;
  name: string;
  icon: string;
  earned: boolean;
  level: number;
  maxLevel: number;
  description: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  workoutReminders: boolean;
  progressReports: boolean;
  privacyMode: boolean;
}

export interface RecentActivity {
  type: string;
  title: string;
  time: string;
  icon: string;
  color: string;
}

export interface WeeklyProgressData {
  day: string;
  workouts: number;
  calories: number;
}

export interface StatsCard {
  icon: string;
  value: number;
  label: string;
  sublabel: string;
  color: string;
  trend: string;
  trendDirection: string;
}

export interface QuickAction {
  icon: string;
  label: string;
  description: string;
  route: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserStatsService {
  private baseUrl = `${environment.apiUrl}/user-stats`;

  constructor(private http: HttpClient) {}

  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`);
  }

  getAchievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.baseUrl}/achievements`);
  }

  getAchievementCategories(): Observable<AchievementCategory[]> {
    return this.http.get<AchievementCategory[]>(`${this.baseUrl}/achievement-categories`);
  }

  getProgressIndicators(): Observable<{
    weeklyGoal: ProgressIndicator;
    monthlyGoal: ProgressIndicator;
    strengthGoal: ProgressIndicator;
    cardioGoal: ProgressIndicator;
    flexibilityGoal: ProgressIndicator;
  }> {
    return this.http.get<{
      weeklyGoal: ProgressIndicator;
      monthlyGoal: ProgressIndicator;
      strengthGoal: ProgressIndicator;
      cardioGoal: ProgressIndicator;
      flexibilityGoal: ProgressIndicator;
    }>(`${this.baseUrl}/progress-indicators`);
  }

  getUserBadges(): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`${this.baseUrl}/badges`);
  }

  getUserSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(`${this.baseUrl}/settings`);
  }

  updateUserSettings(settings: Partial<UserSettings>): Observable<UserSettings> {
    return this.http.put<UserSettings>(`${this.baseUrl}/settings`, settings);
  }

  getRecentActivity(): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.baseUrl}/recent-activity`);
  }

  getWeeklyProgress(): Observable<WeeklyProgressData[]> {
    return this.http.get<WeeklyProgressData[]>(`${this.baseUrl}/weekly-progress`);
  }

  getDashboardStats(): Observable<{
    statsCards: StatsCard[];
    quickActions: QuickAction[];
    recentActivity: RecentActivity[];
    weeklyProgress: WeeklyProgressData[];
  }> {
    return this.http.get<{
      statsCards: StatsCard[];
      quickActions: QuickAction[];
      recentActivity: RecentActivity[];
      weeklyProgress: WeeklyProgressData[];
    }>(`${this.baseUrl}/dashboard`);
  }
} 