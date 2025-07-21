import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { ExerciseService } from '../../services/exercise.service';
import { GeneralService } from '../../services/general.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-workout-detail',
  templateUrl: './workout-detail.component.html',
  styleUrls: ['./workout-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkoutDetailComponent implements OnInit, OnDestroy {
  @Input() workout = null;
  @Input() loading = false;
  @Input() showActions = true;
  @Input() isReadOnly = false;

  @Output() editWorkout = new EventEmitter<any>();
  @Output() deleteWorkout = new EventEmitter<any>();
  @Output() duplicateWorkout = new EventEmitter<any>();
  @Output() startWorkout = new EventEmitter<any>();
  @Output() backToList = new EventEmitter<void>();

  showDeleteDialog = false;
  deleteDialogData: any = {
    title: 'Delete Workout',
    message: 'Are you sure you want to delete this workout? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger'
  };

  showDuplicateDialog = false;
  duplicateDialogData: any | null = null;

  selectedTab: 'overview' | 'exercises' | 'stats' | 'history' = 'overview';
  // Remove expandedExercises property
  // Remove toggleExerciseExpansion, expandAllExercises, collapseAllExercises, isExerciseExpanded methods

  // Data from services
  imageIndexes: number[] = [];
  imageError: boolean[] = [];
  exerciseProgress: any[] = [];
  
  loadingHistory = false;
  error: string | null = null;
  isStartMode = false;

  activeRest: { exerciseIdx: number, setIdx: number, seconds: number } | null = null;
  restCompleted: { [key: string]: boolean } = {};

  showFinishConfirm = false;
  autoFinish = false;
  logs: any[] = [];
  workoutId: string | null = null;

  editingWeightExercise: any = null;
  newWeight: any = '';

  private destroy$ = new Subject<void>();

  onFinishClick() {
    this.autoFinish = false;
    this.showFinishConfirm = true;
  }

  onConfirmFinish() {
    // Add workout log
    const summary = this.getWorkoutLogSummary();
    const log = {
      date: new Date(),
      workoutName: this.workout?.name || 'Unknown',
      completedAll: this.autoFinish || this.isAllSetsCompleted(),
      summary,
      workoutId: this.workoutId
    };
    // this.logService.addLog(log).subscribe({
    //   next: () => {
    //     this.logs.unshift(log);
    //   },
    //   error: (err) => {
    //     console.error('Failed to save log to backend', err);
    //     this.logs.unshift(log); // fallback: still add locally
    //   }
    // });
    this.isStartMode = false;
    this.showFinishConfirm = false;
    // Optionally, reset any other state here
  }

  onCancelFinish() {
    this.showFinishConfirm = false;
  }

  onCancelStart() {
    this.isStartMode = false;
  }

  openRestTimer(exerciseIdx: number, setIdx: number, seconds: number) {
    this.activeRest = { exerciseIdx, setIdx, seconds };
  }

  closeRestTimer() {
    this.activeRest = null;
  }

  onRestComplete() {
    if (this.activeRest) {
      const key = `${this.activeRest.exerciseIdx}-${this.activeRest.setIdx}`;
      this.restCompleted[key] = true;
      // Automatically check the checkbox for this set
      if (
        this.workout &&
        this.workout.exercises &&
        this.workout.exercises[this.activeRest.exerciseIdx] &&
        Array.isArray(this.workout.exercises[this.activeRest.exerciseIdx].setsCompleted)
      ) {
        this.workout.exercises[this.activeRest.exerciseIdx].setsCompleted[this.activeRest.setIdx] = true;
      }
      this.closeRestTimer();
    }
  }

  constructor(
    private route: ActivatedRoute,
    private workoutService: WorkoutService,
    private router: Router,
    private exerciseService: ExerciseService,
    private gs: GeneralService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.gs.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        if (userInfo?.workouts) {
          const id = this.route.snapshot.paramMap.get('id');
          this.workout = userInfo.workouts.find((p: any) => p._id === id || p.id === id);
        }
        if (userInfo?.user?.logs) {
          this.logs = userInfo.user.logs;
        }
        // If not found, fallback to fetching from services as before
    if (!this.workout) {
      this.loading = true;
      this.isReadOnly = true;
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.workoutId = id;
        this.workoutService.getWorkoutById(id).subscribe({
          next: (workout) => {
            if (workout) {
              // Map _id to id for LegacyProgram compatibility
              const legacyWorkout = {
                name: workout.name,
                description: workout.description,
                targetMuscleGroups: workout.targetMuscleGroups,
                exercises: workout.exercises.map((ex: any) => ({
                  exerciseId: ex.exerciseId,
                  name: ex.name,
                  sets: ex.sets,
                  reps: ex.reps,
                  rest: ex.rest,
                  weight: ex.weight,
                  notes: ex.notes
                }))
              };
              this.workout = legacyWorkout;
              // Always initialize setsCompleted for each exercise
              if (this.workout && this.workout.exercises) {
                this.workout.exercises.forEach((exercise: any) => {
                  if (!Array.isArray(exercise.setsCompleted) || exercise.setsCompleted.length !== exercise.sets) {
                    exercise.setsCompleted = Array(exercise.sets).fill(false);
                  }
                });
                // If start mode is requested, reset all setsCompleted to false
                if (this.isStartMode) {
                  this.workout.exercises.forEach((exercise: any) => {
                    exercise.setsCompleted = Array(exercise.sets).fill(false);
                  });
                }
              }
            } else {
              this.workout = null;
            }
            this.loading = false;
            if (this.workout) {
              this.loadExerciseProgress();
            }
          },
          error: (err) => {
            this.error = 'Failed to load workout.';
            this.loading = false;
          }
        });
      } else {
        this.error = 'No workout ID provided.';
        this.loading = false;
      }
    }
      });
    // Check for start mode from query params
    const startParam = this.route.snapshot.queryParamMap.get('start');
    if (startParam === 'true') {
      this.isStartMode = true;
      // Reset all checkboxes for a fresh start
      if (this.workout && this.workout.exercises) {
        this.workout.exercises.forEach((exercise: any) => {
          exercise.setsCompleted = Array(exercise.sets).fill(false);
        });
      }
    }
    // Load all exercises and inject images by name
    this.exerciseService.getExercises({}).subscribe((data: any) => {
      let allExercises: any[] = [];
      if (Array.isArray(data)) {
        allExercises = data;
      } else if (data && Array.isArray(data.exercises)) {
        allExercises = data.exercises;
      }
      if (this.workout && this.workout.exercises) {
        this.workout.exercises.forEach(ex => {
          const match = allExercises.find(e => e.name === ex.name);
          if (match && Array.isArray(match.images)) {
            (ex as any).images = match.images;
          } else {
            (ex as any).images = [];
          }
        });
      }
    });
    if (this.workout && this.workout.exercises) {
      this.imageIndexes = this.workout.exercises.map(() => 0);
      this.imageError = this.workout.exercises.map(() => false);
      this.exerciseProgress = this.workout.exercises.map(() => null);
    }
  }

  ngOnChanges(): void {
    if (this.workout) {
      this.loadExerciseProgress();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExerciseProgress(): void {
    if (!this.workout) return;
    this.workout.exercises.forEach((exercise: any, idx: number) => {
      // This method is no longer available from progress.service.ts
      // Assuming exerciseProgress is no longer needed or will be managed differently
      // For now, we'll just log a placeholder message
      console.log(`Loading progress for exercise at index ${idx}:`, exercise.name);
      // In a real scenario, you would fetch progress from a different service or source
      // this.progressService.getExerciseProgress(exercise.id)
      //   .subscribe({
      //     next: (progress) => {
      //       this.exerciseProgress[idx] = progress;
      //     },
      //     error: (error) => {
      //       console.error(`Error loading progress for exercise at index ${idx}:`, error);
      //     }
      //   });
    });
  }

  onEditWorkout(): void {
    this.editWorkout.emit(this.workout!);
  }

  onDeleteWorkout(): void {
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    this.deleteWorkout.emit(this.workout!);
    this.showDeleteDialog = false;
  }

  onCancelDelete(): void {
    this.showDeleteDialog = false;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
  }

  onDuplicateWorkout(): void {
    if (!this.workout) return;
    
    this.duplicateDialogData = {
      workout: this.workout,
      suggestedName: `${this.workout.name} (Copy)`
    };
    this.showDuplicateDialog = true;
  }

  onConfirmDuplicate(workoutName: string): void {
    this.duplicateWorkout.emit(this.workout!);
    this.showDuplicateDialog = false;
  }

  onCancelDuplicate(): void {
    this.showDuplicateDialog = false;
  }

  closeDuplicateDialog(): void {
    this.showDuplicateDialog = false;
  }

  onStartWorkout(): void {
    this.isStartMode = true;
    // Initialize setsCompleted for each exercise and reset all to false
    if (this.workout && this.workout.exercises) {
      this.workout.exercises.forEach((exercise: any) => {
        exercise.setsCompleted = Array(exercise.sets).fill(false);
      });
    }
    this.startWorkout.emit(this.workout!);
  }

  onExportWorkout(): void {
    if (!this.workout) return;
    
    const workoutData = {
      name: this.workout.name,
      description: this.workout.description,
      exercises: this.workout.exercises,
      estimatedDuration: this.workout.estimatedDuration,
      totalExercises: this.workout.exercises?.length || 0,
      targetMuscleGroups: this.workout.targetMuscleGroups || [],
      equipment: this.workout.equipment || [],
      tags: this.workout.tags || [],
      isPublic: this.workout.isPublic || false,
      version: this.workout.version || '1.0',
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(workoutData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.workout.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  onBackToList(): void {
    this.router.navigate(['/workouts']);
  }

  selectTab(tab: 'overview' | 'exercises' | 'stats' | 'history'): void {
    this.selectedTab = tab;
  }

  // Remove expandedExercises property
  // Remove toggleExerciseExpansion, expandAllExercises, collapseAllExercises, isExerciseExpanded methods

  getExerciseProgress(idx: number): any | null {
    return this.exerciseProgress[idx] || null;
  }

  getMuscleGroupDistribution(): any[] {
    if (!this.workout?.targetMuscleGroups) return [];
    
    const muscleGroups = this.workout.targetMuscleGroups || [];
    const totalExercises = this.workout.exercises.length;
    
    const distribution = muscleGroups.map(muscle => {
      const count = Math.floor(Math.random() * 5) + 1; // Mock count
      const percentage = Math.round((count / totalExercises) * 100);
      return { muscle, count, percentage };
    });
    
    return distribution.sort((a, b) => b.count - a.count);
  }

  getMaxSets(): number {
    if (!this.workout?.exercises) return 0;
    return Math.max(...this.workout.exercises.map(e => e.sets));
  }

  getMaxVolume(): number {
    if (!this.workout?.exercises) return 0;
    return Math.max(...this.workout.exercises.map(e => e.sets * e.reps * e.weight));
  }

  getBarHeight(value: number, maxValue: number): number {
    if (maxValue === 0) return 0;
    return Math.max(20, (value / maxValue) * 150);
  }

  getBarColor(index: number): string {
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];
    return colors[index % colors.length];
  }

  canEdit(): boolean {
    return this.showActions && !this.isReadOnly;
  }

  canDelete(): boolean {
    return this.showActions && !this.isReadOnly;
  }

  canDuplicate(): boolean {
    return this.showActions;
  }

  canStartWorkout(): boolean {
    return this.showActions && this.workout?.exercises?.length > 0;
  }

  onViewWorkout(workout: any): void {
    console.log('onViewWorkout called', workout);
    this.router.navigate(['/workout-detail', workout.id]);
  }

  // Add this method to compute total sets
  getTotalSets(): number {
    return this.workout?.exercises?.reduce((sum, ex) => sum + (ex.sets || 0), 0) || 0;
  }

  // Add this method to get a display category (fallback to N/A)
  getCategory(): string {
    // If you have a category in metadata or tags, adjust accordingly
    return (this.workout as any)?.category || (this.workout as any)?.metadata?.tags?.[0] || 'N/A';
  }

  getTotalReps(): number {
    return this.workout?.exercises?.reduce((sum, ex) => sum + ((ex.sets || 0) * (ex.reps || 0)), 0) || 0;
  }

  getTotalVolume(): number {
    return this.workout?.exercises?.reduce((sum, ex) => sum + ((ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0)), 0) || 0;
  }

  getCurrentImage(exercise: any, idx: number): string {
    if (this.imageError[idx]) {
      return 'assets/logo.png'; // fallback image
    }
    const images = Array.isArray(exercise.images) && exercise.images.length > 0 ? exercise.images : [];
    if (images.length === 0) {
      return 'assets/logo.png';
    }
    const imageIdx = this.imageIndexes[idx] || 0;
    return images[imageIdx];
  }

  prevImage(exercise: any, idx: number, event: Event) {
    event.stopPropagation();
    const images = Array.isArray(exercise.images) && exercise.images.length > 0 ? exercise.images : [];
    if (images.length < 2) return;
    const currentIdx = typeof this.imageIndexes[idx] === 'number' ? this.imageIndexes[idx] : 0;
    const newIdx = (currentIdx - 1 + images.length) % images.length;
    this.imageIndexes = [...this.imageIndexes];
    this.imageIndexes[idx] = newIdx;
  }

  nextImage(exercise: any, idx: number, event: Event) {
    event.stopPropagation();
    const images = Array.isArray(exercise.images) && exercise.images.length > 0 ? exercise.images : [];
    if (images.length < 2) return;
    const currentIdx = typeof this.imageIndexes[idx] === 'number' ? this.imageIndexes[idx] : 0;
    const newIdx = (currentIdx + 1) % images.length;
    this.imageIndexes = [...this.imageIndexes];
    this.imageIndexes[idx] = newIdx;
  }

  onImageError(event: Event, idx: number) {
    this.imageError = [...this.imageError];
    this.imageError[idx] = true;
    (event.target as HTMLImageElement).src = 'assets/logo.png';
  }

  // Helper to check if all sets are completed
  checkAllSetsCompleted() {
    if (!this.isStartMode || !this.workout || !this.workout.exercises) return;
    const allCompleted = this.workout.exercises.every((exercise: any) =>
      Array.isArray(exercise.setsCompleted) && exercise.setsCompleted.every((v: boolean) => v)
    );
    if (allCompleted) {
      this.autoFinish = true;
      this.showFinishConfirm = true;
    }
  }

  // Call this after any checkbox change
  onSetCheckboxChange() {
    this.checkAllSetsCompleted();
  }

  get workoutSummary() {
    if (!this.workout) return null;
    const exercises = this.workout.exercises || [];
    const notStarted = exercises.filter((ex: any) => !ex.setsCompleted || ex.setsCompleted.every((v: boolean) => !v));
    const partiallyCompleted = exercises
      .map((ex: any) => {
        if (!ex.setsCompleted) return null;
        const total = ex.setsCompleted.length;
        const completed = ex.setsCompleted.filter((v: boolean) => v).length;
        if (completed > 0 && completed < total) {
          return { name: ex.name, remaining: total - completed };
        }
        return null;
      })
      .filter((x: any) => x);
    const completed = exercises.filter((ex: any) => Array.isArray(ex.setsCompleted) && ex.setsCompleted.length > 0 && ex.setsCompleted.every((v: boolean) => v));
    return {
      notStarted,
      partiallyCompleted,
      completed
    };
  }

  isAllSetsCompleted(): boolean {
    if (!this.workout || !this.workout.exercises) return false;
    return this.workout.exercises.every((exercise: any) =>
      Array.isArray(exercise.setsCompleted) && exercise.setsCompleted.every((v: boolean) => v)
    );
  }

  getWorkoutLogSummary(): string {
    if (!this.workout || !this.workout.exercises) return '';
    const totalExercises = this.workout.exercises.length;
    const totalSets = this.workout.exercises.reduce((sum: number, ex: any) => sum + (ex.sets || 0), 0);
    const completedSets = this.workout.exercises.reduce((sum: number, ex: any) => sum + (ex.setsCompleted ? ex.setsCompleted.filter((v: boolean) => v).length : 0), 0);
    if (this.isAllSetsCompleted()) {
      return `Completed all ${totalSets} sets in ${totalExercises} exercises.`;
    } else {
      return `Completed ${completedSets} out of ${totalSets} sets in ${totalExercises} exercises.`;
    }
  }

  onEditWeight(exercise: any) {
    this.editingWeightExercise = exercise;
    this.newWeight = exercise.weight || '';
  }

  saveWeight() {
    if (this.editingWeightExercise) {
      const exerciseId = this.editingWeightExercise.exerciseId;
      const newWeight = this.newWeight;
      if (exerciseId && typeof newWeight === 'number' && !isNaN(newWeight)) {
        this.auth.updateExerciseWeight(exerciseId, newWeight).subscribe({
          next: (response: any) => {
            this.gs.updateExerciseWeightInWorkouts(exerciseId, newWeight, response.exerciseDefaults);
            this.editingWeightExercise.weight = newWeight;
            this.editingWeightExercise = null;
            this.newWeight = '';
          },
          error: () => {
            // Optionally, show an error message
          }
        });
      } else {
        this.editingWeightExercise.weight = newWeight;
        this.editingWeightExercise = null;
        this.newWeight = '';
      }
    }
  }

  cancelEditWeight() {
    this.editingWeightExercise = null;
    this.newWeight = '';
  }
}
