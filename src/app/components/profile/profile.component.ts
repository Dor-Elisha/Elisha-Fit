import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RouteService } from '../../services/route.service';
import { LoadingService } from '../../services/loading.service';
import { UserStatsService } from '../../services/user-stats.service';
import { GeneralService } from '../../services/general.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any;
  editing = false;
  activeTab: 'profile' | 'stats' | 'settings' | 'achievements' = 'profile';
  showLogoutDialog = false;
  selectedCategory = 'milestone';

  profileForm: FormGroup;
  passwordForm: FormGroup;

  profileData = {
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    fitnessLevel: 'beginner',
    goals: [],
    bio: ''
  };

  // Data from services
  userStats: any = {
    totalWorkouts: 0,
    totalCalories: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageWorkoutDuration: 0,
    favoriteExercise: '',
    totalPrograms: 0,
    completedPrograms: 0
  };

  achievements: any[] = [];
  achievementCategories: any[] = [];
  progressIndicators: {
    weeklyGoal: any;
    monthlyGoal: any;
    strengthGoal: any;
    cardioGoal: any;
    flexibilityGoal: any;
  } | null = null;
  userBadges: any[] = [];
  settings: any = {
    emailNotifications: true,
    pushNotifications: true,
    workoutReminders: true,
    progressReports: true,
    privacyMode: false
  };

  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private gs: GeneralService,
    private auth: AuthService,
    private routeService: RouteService,
    private loadingService: LoadingService,
    private userStatsService: UserStatsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.gs.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        if (userInfo) {
          this.user = userInfo.user;
      this.loadUserData();
        }
    });
    this.initializeForms();
    this.loadUserStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: [''],
      gender: [''],
      height: [''],
      weight: [''],
      fitnessLevel: ['beginner'],
      bio: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  loadUserData(): void {
    if (this.user) {
      this.profileData = {
        name: this.user.name || '',
        email: this.user.email || '',
        phone: this.user.phone || '',
        dateOfBirth: this.user.dateOfBirth || '',
        gender: this.user.gender || '',
        height: this.user.height || '',
        weight: this.user.weight || '',
        fitnessLevel: this.user.fitnessLevel || 'beginner',
        goals: this.user.goals || [],
        bio: this.user.bio || ''
      };
      this.profileForm.patchValue(this.profileData);
    }
  }

  loadUserStats(): void {
    this.loading = true;
    this.error = null;

    // Load user stats
    this.userStatsService.getUserStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.userStats = stats;
        },
        error: (error) => {
          console.error('Error loading user stats:', error);
          this.error = 'Failed to load user statistics';
        }
      });

    // Load achievements
    this.userStatsService.getAchievements()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (achievements) => {
          this.achievements = achievements;
        },
        error: (error) => {
          console.error('Error loading achievements:', error);
          this.error = 'Failed to load achievements';
        }
      });

    // Load achievement categories
    this.userStatsService.getAchievementCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.achievementCategories = categories;
        },
        error: (error) => {
          console.error('Error loading achievement categories:', error);
          this.error = 'Failed to load achievement categories';
        }
      });

    // Load progress indicators
    this.userStatsService.getProgressIndicators()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (indicators) => {
          this.progressIndicators = indicators;
        },
        error: (error) => {
          console.error('Error loading progress indicators:', error);
          this.error = 'Failed to load progress indicators';
        }
      });

    // Load user badges
    this.userStatsService.getUserBadges()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (badges) => {
          this.userBadges = badges;
        },
        error: (error) => {
          console.error('Error loading user badges:', error);
          this.error = 'Failed to load user badges';
        }
      });

    // Load user settings
    this.userStatsService.getUserSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.settings = settings;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading user settings:', error);
          this.error = 'Failed to load user settings';
          this.loading = false;
        }
      });
  }

  enableEdit(): void {
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    this.loadUserData(); // Reset form to original values
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.loadingService.showForFormSubmission('Updating profile...');
      
      const updatedData = this.profileForm.value;
      
      // Update user data via RouteService
      this.routeService.updateUserName(this.user.id, updatedData.name)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.profileData = { ...this.profileData, ...updatedData };
            this.user = { ...this.user, ...updatedData };
            this.editing = false;
            this.loadingService.hide();
            // TODO: Add toastr service for success message
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.loadingService.hide();
            // TODO: Add toastr service for error message
          }
        });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.loadingService.showForFormSubmission('Changing password...');
      
      // TODO: Change password via service
      setTimeout(() => {
        this.passwordForm.reset();
        this.loadingService.hide();
      }, 1000);
    }
  }

  onEmailNotificationsChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateSetting('emailNotifications', checked);
  }

  onPushNotificationsChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateSetting('pushNotifications', checked);
  }

  onWorkoutRemindersChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateSetting('workoutReminders', checked);
  }

  onProgressReportsChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateSetting('progressReports', checked);
  }

  onPrivacyModeChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateSetting('privacyMode', checked);
  }

  private updateSetting(key: keyof any, value: boolean): void {
    const update = { [key]: value };
    this.userStatsService.updateUserSettings(update)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedSettings) => {
          this.settings = updatedSettings;
        },
        error: (error) => {
          console.error(`Error updating ${String(key)}:`, error);
          // Revert the change in UI
          this.settings[key] = !value;
        }
      });
  }

  getFitnessLevelColor(level: string): string {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'danger'
    };
    return colors[level as keyof typeof colors] || 'secondary';
  }

  getAchievementProgress(): number {
    const earned = this.achievements.filter(a => a.earned).length;
    return this.achievements.length > 0 ? (earned / this.achievements.length) * 100 : 0;
  }

  getAchievementsByCategory(category: string): any[] {
    return this.achievements.filter(a => a.category === category);
  }

  getCategoryProgress(category: string): number {
    const categoryAchievements = this.getAchievementsByCategory(category);
    const earned = categoryAchievements.filter(a => a.earned).length;
    return categoryAchievements.length > 0 ? (earned / categoryAchievements.length) * 100 : 0;
  }

  getRarityColor(rarity: string): string {
    const colors = {
      common: '#6c757d',
      uncommon: '#28a745',
      rare: '#007bff',
      epic: '#6f42c1',
      legendary: '#fd7e14'
    };
    return colors[rarity as keyof typeof colors] || '#6c757d';
  }

  getRarityBadgeClass(rarity: string): string {
    const classes = {
      common: 'badge-secondary',
      uncommon: 'badge-success',
      rare: 'badge-primary',
      epic: 'badge-purple',
      legendary: 'badge-warning'
    };
    return classes[rarity as keyof typeof classes] || 'badge-secondary';
  }

  getProgressPercentage(current: number, target: number): number {
    return Math.min((current / target) * 100, 100);
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 90) return 'var(--success-color)';
    if (percentage >= 70) return 'var(--warning-color)';
    return 'var(--danger-color)';
  }

  getBadgeLevelClass(badge: any): string {
    if (!badge.earned) return 'badge-locked';
    if (badge.level === badge.maxLevel) return 'badge-max';
    return 'badge-earned';
  }

  getEarnedBadgesCount(): number {
    return this.userBadges.filter(b => b.earned).length;
  }

  getEarnedAchievementsCount(): number {
    return this.achievements.filter(a => a.earned).length;
  }

  getTotalBadgeLevels(): number {
    return this.userBadges.reduce((sum, badge) => sum + badge.level, 0);
  }

  getMaxBadgeLevels(): number {
    return this.userBadges.reduce((sum, badge) => sum + badge.maxLevel, 0);
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  logout(): void {
    this.showLogoutDialog = true;
  }

  confirmLogout(): void {
    this.auth.logout();
    this.showLogoutDialog = false;
  }

  cancelLogout(): void {
    this.showLogoutDialog = false;
  }
}
