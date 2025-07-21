import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { GeneralService } from '../../services/general.service';
import { WorkoutService } from '../../services/workout.service';
import { Router, NavigationExtras } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AdapterService } from '../../services/adapter.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.component.html',
  styleUrls: ['./workouts.component.scss']
})
export class WorkoutsComponent implements OnInit, OnDestroy {
  workouts: any[] = [];
  filteredWorkouts: any[] = [];
  searchTerm = '';
  selectedCategory = 'all';
  loading = false;
  @Input() showBreadcrumbs = true;

  categories = ['all', 'strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'mixed'];
  difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  // Confirmation dialog properties
  showDeleteDialog = false;
  deleteDialogData: any = {
    title: 'Delete Workout',
    message: 'Are you sure you want to delete this workout? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
    showIcon: true
  };
  workoutToDelete: any | null = null;

  // Duplicate dialog properties
  showDuplicateDialog = false;
  duplicateDialogData: any | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    public gs: GeneralService,
    private workoutService: WorkoutService,
    private router: Router,
    private toastr: ToastrService,
    private adapter: AdapterService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Remove route-based detection logic
    // Check for new program in router state
    const nav = this.router.getCurrentNavigation();
    const newWorkout = nav?.extras?.state?.['newWorkout'];
    this.gs.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        this.workouts = userInfo?.workouts || [];
        if (newWorkout) {
          this.workouts = [newWorkout, ...this.workouts.filter(w => w._id !== newWorkout._id)];
        }
        this.filteredWorkouts = [...this.workouts];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkouts(): void {
    this.loading = true;
    this.workoutService.getWorkouts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workouts) => {
          this.workouts = this.adapter.toLegacyWorkoutArray(workouts);
          this.filteredWorkouts = [...this.workouts];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading workouts:', error);
          this.toastr.error('Failed to load workouts');
          this.loading = false;
        }
      });
  }

  filterWorkouts(): void {
    this.filteredWorkouts = this.workouts.filter(workout => {
      const matchesSearch = workout.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           workout.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' || 
                             workout.tags?.some((tag: string) => tag === this.selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange(): void {
    this.filterWorkouts();
  }

  onCategoryChange(): void {
    this.filterWorkouts();
  }

  createNewWorkout(): void {
    this.router.navigate(['/workout-wizard']);
  }

  viewWorkout(workout: any): void {
    console.log('Navigating to workout detail:', workout._id);
    this.router.navigate(['/workout-detail', workout._id]);
  }

  editWorkout(workout: any): void {
    this.router.navigate(['/workout-wizard', workout._id]);
  }

  duplicateWorkout(workout: any): void {
    this.duplicateDialogData = {
      workout: workout,
      suggestedName: `${workout.name} (Copy)`
    };
    this.showDuplicateDialog = true;
  }

  onConfirmDuplicate(workoutName: string): void {
    if (!this.duplicateDialogData?.workout) return;

    this.workoutService.duplicateWorkout(this.adapter.getWorkoutId(this.duplicateDialogData.workout), workoutName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (duplicatedWorkout) => {
          this.toastr.success(`Workout "${duplicatedWorkout.name}" created successfully`);
          // Add to userInfo.programs and update BehaviorSubject
          const userInfo = this.gs.userInfo$ && (this.gs as any).userInfoSubject?.value;
          if (userInfo && Array.isArray(userInfo.workouts)) {
            userInfo.workouts = [duplicatedWorkout, ...userInfo.workouts];
            (this.gs as any).userInfoSubject.next({ ...userInfo });
          }
          this.closeDuplicateDialog();
        },
        error: (error) => {
          console.error('Error duplicating workout:', error);
          this.toastr.error('Failed to duplicate workout');
        }
      });
  }

  onCancelDuplicate(): void {
    this.closeDuplicateDialog();
  }

  closeDuplicateDialog(): void {
    this.showDuplicateDialog = false;
    this.duplicateDialogData = null;
  }

  deleteWorkout(workout: any): void {
    this.workoutToDelete = workout;
    this.deleteDialogData.message = `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.workoutToDelete) return;

    this.workoutService.deleteWorkout(this.workoutToDelete._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Workout deleted successfully');
          // Remove from userInfo.programs and update BehaviorSubject
          const userInfo = this.gs.userInfo$ && (this.gs as any).userInfoSubject?.value;
          if (userInfo && Array.isArray(userInfo.workouts)) {
            userInfo.workouts = userInfo.workouts.filter((w: any) => w._id !== this.workoutToDelete._id);
            (this.gs as any).userInfoSubject.next({ ...userInfo });
          }
          this.closeDeleteDialog();
        },
        error: (error) => {
          console.error('Error deleting workout:', error);
          this.toastr.error('Failed to delete workout');
        }
      });
  }

  onCancelDelete(): void {
    this.closeDeleteDialog();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.workoutToDelete = null;
  }

  getWorkoutStats(workout: any): any {
    return {
      exercises: workout.exercises?.length || 0,
      estimatedDuration: workout.estimatedDuration || 0,
    };
  }

  getDifficultyColor(difficulty: string): string {
    // Remove this function if not used elsewhere
    return '#6c757d';
  }

  getWorkoutCategory(workout: any): string {
    const tags = workout.tags || [];
    if (tags.includes('strength')) return 'strength';
    if (tags.includes('cardio')) return 'cardio';
    if (tags.includes('flexibility')) return 'flexibility';
    if (tags.includes('hiit')) return 'hiit';
    if (tags.includes('yoga')) return 'yoga';
    return 'mixed';
  }
}
