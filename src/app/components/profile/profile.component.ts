import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouteService } from '../../services/route.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from '../../services/loading.service';
import { Subject, takeUntil } from 'rxjs';

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
  
  // Form
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  // Profile data
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
  
  // Statistics
  userStats = {
    totalWorkouts: 0,
    totalCalories: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageWorkoutDuration: 0,
    favoriteExercise: '',
    totalPrograms: 0,
    completedPrograms: 0
  };
  
  // Achievements
  achievements = [
    { id: 1, name: 'First Workout', description: 'Complete your first workout', icon: 'fas fa-star', earned: true, date: '2024-01-15', category: 'milestone', rarity: 'common' },
    { id: 2, name: 'Week Warrior', description: 'Complete 5 workouts in a week', icon: 'fas fa-calendar-week', earned: true, date: '2024-01-20', category: 'consistency', rarity: 'uncommon' },
    { id: 3, name: 'Streak Master', description: 'Maintain a 7-day workout streak', icon: 'fas fa-fire', earned: true, date: '2024-01-25', category: 'consistency', rarity: 'rare' },
    { id: 4, name: 'Program Completer', description: 'Finish your first program', icon: 'fas fa-trophy', earned: false, date: null, category: 'achievement', rarity: 'epic' },
    { id: 5, name: 'Calorie Burner', description: 'Burn 1000 calories in a week', icon: 'fas fa-fire', earned: false, date: null, category: 'performance', rarity: 'rare' },
    { id: 6, name: 'Strength Builder', description: 'Increase your max weight by 20%', icon: 'fas fa-dumbbell', earned: true, date: '2024-02-01', category: 'performance', rarity: 'epic' },
    { id: 7, name: 'Endurance Runner', description: 'Complete a 30-minute cardio session', icon: 'fas fa-running', earned: false, date: null, category: 'cardio', rarity: 'uncommon' },
    { id: 8, name: 'Flexibility Master', description: 'Complete 10 stretching sessions', icon: 'fas fa-child', earned: false, date: null, category: 'flexibility', rarity: 'common' },
    { id: 9, name: 'Early Bird', description: 'Complete 5 morning workouts', icon: 'fas fa-sun', earned: true, date: '2024-01-30', category: 'lifestyle', rarity: 'uncommon' },
    { id: 10, name: 'Social Butterfly', description: 'Share 3 workout achievements', icon: 'fas fa-share-alt', earned: false, date: null, category: 'social', rarity: 'common' },
    { id: 11, name: 'Goal Crusher', description: 'Achieve 3 personal fitness goals', icon: 'fas fa-bullseye', earned: false, date: null, category: 'achievement', rarity: 'legendary' },
    { id: 12, name: 'Consistency King', description: 'Work out for 30 consecutive days', icon: 'fas fa-crown', earned: false, date: null, category: 'consistency', rarity: 'legendary' }
  ];

  // Achievement Categories
  achievementCategories = [
    { id: 'milestone', name: 'Milestones', icon: 'fas fa-flag', color: 'primary' },
    { id: 'consistency', name: 'Consistency', icon: 'fas fa-calendar-check', color: 'success' },
    { id: 'performance', name: 'Performance', icon: 'fas fa-chart-line', color: 'warning' },
    { id: 'cardio', name: 'Cardio', icon: 'fas fa-heartbeat', color: 'danger' },
    { id: 'flexibility', name: 'Flexibility', icon: 'fas fa-child', color: 'info' },
    { id: 'lifestyle', name: 'Lifestyle', icon: 'fas fa-sun', color: 'secondary' },
    { id: 'social', name: 'Social', icon: 'fas fa-users', color: 'purple' },
    { id: 'achievement', name: 'Achievements', icon: 'fas fa-trophy', color: 'gold' }
  ];

  // Progress Indicators
  progressIndicators = {
    weeklyGoal: { current: 4, target: 5, label: 'Weekly Workouts', icon: 'fas fa-calendar-week' },
    monthlyGoal: { current: 18, target: 20, label: 'Monthly Workouts', icon: 'fas fa-calendar-alt' },
    strengthGoal: { current: 75, target: 100, label: 'Strength Progress', icon: 'fas fa-dumbbell' },
    cardioGoal: { current: 60, target: 100, label: 'Cardio Progress', icon: 'fas fa-heartbeat' },
    flexibilityGoal: { current: 30, target: 100, label: 'Flexibility Progress', icon: 'fas fa-child' }
  };

  // Badges
  userBadges = [
    { id: 1, name: 'Fitness Enthusiast', icon: 'fas fa-fire', earned: true, level: 2, maxLevel: 5, description: 'Complete workouts consistently' },
    { id: 2, name: 'Strength Builder', icon: 'fas fa-dumbbell', earned: true, level: 1, maxLevel: 3, description: 'Focus on strength training' },
    { id: 3, name: 'Cardio Master', icon: 'fas fa-running', earned: false, level: 0, maxLevel: 3, description: 'Excel in cardiovascular fitness' },
    { id: 4, name: 'Flexibility Guru', icon: 'fas fa-child', earned: false, level: 0, maxLevel: 3, description: 'Master flexibility and mobility' },
    { id: 5, name: 'Early Bird', icon: 'fas fa-sun', earned: true, level: 1, maxLevel: 2, description: 'Prefer morning workouts' },
    { id: 6, name: 'Weekend Warrior', icon: 'fas fa-calendar-weekend', earned: false, level: 0, maxLevel: 2, description: 'Active on weekends' }
  ];
  
  // Settings
  settings = {
    emailNotifications: true,
    pushNotifications: true,
    workoutReminders: true,
    progressReports: true,
    privacyMode: false
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private rs: RouteService,
    private fb: FormBuilder,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.user = u;
      this.loadUserData();
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
    // TODO: Load real stats from service
    this.userStats = {
      totalWorkouts: 24,
      totalCalories: 15430,
      currentStreak: 7,
      longestStreak: 12,
      averageWorkoutDuration: 45,
      favoriteExercise: 'Squats',
      totalPrograms: 5,
      completedPrograms: 2
    };
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
      
      // TODO: Update user data via service
      setTimeout(() => {
        this.profileData = { ...this.profileData, ...updatedData };
        this.user = { ...this.user, ...updatedData };
        this.editing = false;
        this.loadingService.hide();
      }, 1000);
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

  updateSetting(setting: string, value: boolean): void {
    this.settings[setting as keyof typeof this.settings] = value;
    // TODO: Save settings to backend
  }

  onEmailNotificationsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateSetting('emailNotifications', target.checked);
  }

  onPushNotificationsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateSetting('pushNotifications', target.checked);
  }

  onWorkoutRemindersChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateSetting('workoutReminders', target.checked);
  }

  onProgressReportsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateSetting('progressReports', target.checked);
  }

  onPrivacyModeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateSetting('privacyMode', target.checked);
  }

  getFitnessLevelColor(level: string): string {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'danger'
    };
    return colors[level as keyof typeof colors] || 'primary';
  }

  getAchievementProgress(): number {
    const earned = this.achievements.filter(a => a.earned).length;
    return (earned / this.achievements.length) * 100;
  }

  getAchievementsByCategory(category: string): any[] {
    return this.achievements.filter(a => a.category === category);
  }

  getCategoryProgress(category: string): number {
    const categoryAchievements = this.getAchievementsByCategory(category);
    if (categoryAchievements.length === 0) return 0;
    const earned = categoryAchievements.filter(a => a.earned).length;
    return (earned / categoryAchievements.length) * 100;
  }

  getRarityColor(rarity: string): string {
    const colors = {
      common: 'text-muted',
      uncommon: 'text-success',
      rare: 'text-primary',
      epic: 'text-warning',
      legendary: 'text-danger'
    };
    return colors[rarity as keyof typeof colors] || 'text-muted';
  }

  getRarityBadgeClass(rarity: string): string {
    const classes = {
      common: 'badge bg-secondary',
      uncommon: 'badge bg-success',
      rare: 'badge bg-primary',
      epic: 'badge bg-warning text-dark',
      legendary: 'badge bg-danger'
    };
    return classes[rarity as keyof typeof classes] || 'badge bg-secondary';
  }

  getProgressPercentage(current: number, target: number): number {
    return Math.min((current / target) * 100, 100);
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    if (percentage >= 40) return 'info';
    return 'danger';
  }

  getBadgeLevelClass(badge: any): string {
    if (!badge.earned) return 'badge-locked';
    if (badge.level === badge.maxLevel) return 'badge-max';
    return 'badge-level-' + badge.level;
  }

  getEarnedBadgesCount(): number {
    return this.userBadges.filter(b => b.earned).length;
  }

  getEarnedAchievementsCount(): number {
    return this.achievements.filter(a => a.earned).length;
  }

  getTotalBadgeLevels(): number {
    return this.userBadges.reduce((total, badge) => total + badge.level, 0);
  }

  getMaxBadgeLevels(): number {
    return this.userBadges.reduce((total, badge) => total + badge.maxLevel, 0);
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
      }
    }
    return '';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.touched && field.errors);
  }

  logout(): void {
    this.showLogoutDialog = true;
  }

  confirmLogout(): void {
    this.loadingService.showForFormSubmission('Logging out...');
    
    // Simulate logout process
    setTimeout(() => {
      this.auth.logout();
      this.showLogoutDialog = false;
      this.loadingService.hide();
    }, 500);
  }

  cancelLogout(): void {
    this.showLogoutDialog = false;
  }
}
