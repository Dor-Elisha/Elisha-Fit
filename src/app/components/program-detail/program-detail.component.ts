import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramService } from '../../services/program.service';
import { ExerciseService } from '../../services/exercise.service';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-program-detail',
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgramDetailComponent implements OnInit {
  @Input() program = null;
  @Input() loading = false;
  @Input() showActions = true;
  @Input() isReadOnly = false;

  @Output() editProgram = new EventEmitter<any>();
  @Output() deleteProgram = new EventEmitter<any>();
  @Output() duplicateProgram = new EventEmitter<any>();
  @Output() startWorkout = new EventEmitter<any>();
  @Output() backToList = new EventEmitter<void>();

  showDeleteDialog = false;
  deleteDialogData: any = {
    title: 'Delete Program',
    message: 'Are you sure you want to delete this program? This action cannot be undone.',
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
  programId: string | null = null;

  onFinishClick() {
    this.autoFinish = false;
    this.showFinishConfirm = true;
  }

  onConfirmFinish() {
    // Add workout log
    const summary = this.getWorkoutLogSummary();
    const log = {
      date: new Date(),
      programName: this.program?.name || 'Unknown',
      completedAll: this.autoFinish || this.isAllSetsCompleted(),
      summary,
      programId: this.programId
    };
    this.logService.addLog(log).subscribe({
      next: () => {
        this.logs.unshift(log);
      },
      error: (err) => {
        console.error('Failed to save log to backend', err);
        this.logs.unshift(log); // fallback: still add locally
      }
    });
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
        this.program &&
        this.program.exercises &&
        this.program.exercises[this.activeRest.exerciseIdx] &&
        Array.isArray(this.program.exercises[this.activeRest.exerciseIdx].setsCompleted)
      ) {
        this.program.exercises[this.activeRest.exerciseIdx].setsCompleted[this.activeRest.setIdx] = true;
      }
      this.closeRestTimer();
    }
  }

  constructor(
    private route: ActivatedRoute,
    private programService: ProgramService,
    private router: Router,
    private exerciseService: ExerciseService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    console.log('ProgramDetailComponent loaded');
    // If no program input, fetch from route param
    if (!this.program) {
      this.loading = true;
      this.isReadOnly = true;
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.programId = id;
        this.programService.getProgramById(id).subscribe({
          next: (program) => {
            if (program) {
              // Map _id to id for LegacyProgram compatibility
              const legacyProgram = {
                name: program.name,
                description: program.description,
                targetMuscleGroups: program.targetMuscleGroups,
                exercises: program.exercises.map((ex: any) => ({
                  exerciseId: ex.exerciseId,
                  name: ex.name,
                  sets: ex.sets,
                  reps: ex.reps,
                  rest: ex.rest,
                  weight: ex.weight,
                  notes: ex.notes
                }))
              };
              this.program = legacyProgram;
              // Always initialize setsCompleted for each exercise
              if (this.program && this.program.exercises) {
                this.program.exercises.forEach((exercise: any) => {
                  if (!Array.isArray(exercise.setsCompleted) || exercise.setsCompleted.length !== exercise.sets) {
                    exercise.setsCompleted = Array(exercise.sets).fill(false);
                  }
                });
                // If start mode is requested, reset all setsCompleted to false
                if (this.isStartMode) {
                  this.program.exercises.forEach((exercise: any) => {
                    exercise.setsCompleted = Array(exercise.sets).fill(false);
                  });
                }
              }
            } else {
              this.program = null;
            }
            this.loading = false;
            if (this.program) {
              this.loadExerciseProgress();
            }
          },
          error: (err) => {
            this.error = 'Failed to load program.';
            this.loading = false;
          }
        });
      } else {
        this.error = 'No program ID provided.';
        this.loading = false;
      }
    } else if (this.program && (this.program._id || this.program.id)) {
      this.programId = this.program._id || this.program.id;
    }
    // Check for start mode from query params
    const startParam = this.route.snapshot.queryParamMap.get('start');
    if (startParam === 'true') {
      this.isStartMode = true;
      // Reset all checkboxes for a fresh start
      if (this.program && this.program.exercises) {
        this.program.exercises.forEach((exercise: any) => {
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
      if (this.program && this.program.exercises) {
        this.program.exercises.forEach(ex => {
          const match = allExercises.find(e => e.name === ex.name);
          if (match && Array.isArray(match.images)) {
            (ex as any).images = match.images;
          } else {
            (ex as any).images = [];
          }
        });
      }
    });
    if (this.program && this.program.exercises) {
      this.imageIndexes = this.program.exercises.map(() => 0);
      this.imageError = this.program.exercises.map(() => false);
      this.exerciseProgress = this.program.exercises.map(() => null);
    }
  }

  ngOnChanges(): void {
    if (this.program) {
      this.loadExerciseProgress();
    }
  }

  loadExerciseProgress(): void {
    if (!this.program) return;
    this.program.exercises.forEach((exercise: any, idx: number) => {
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

  onEditProgram(): void {
    this.editProgram.emit(this.program!);
  }

  onDeleteProgram(): void {
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    this.deleteProgram.emit(this.program!);
    this.showDeleteDialog = false;
  }

  onCancelDelete(): void {
    this.showDeleteDialog = false;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
  }

  onDuplicateProgram(): void {
    if (!this.program) return;
    
    this.duplicateDialogData = {
      program: this.program,
      suggestedName: `${this.program.name} (Copy)`
    };
    this.showDuplicateDialog = true;
  }

  onConfirmDuplicate(programName: string): void {
    this.duplicateProgram.emit(this.program!);
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
    if (this.program && this.program.exercises) {
      this.program.exercises.forEach((exercise: any) => {
        exercise.setsCompleted = Array(exercise.sets).fill(false);
      });
    }
    this.startWorkout.emit(this.program!);
  }

  onExportProgram(): void {
    if (!this.program) return;
    
    const programData = {
      name: this.program.name,
      description: this.program.description,
      exercises: this.program.exercises,
      estimatedDuration: this.program.estimatedDuration,
      totalExercises: this.program.exercises?.length || 0,
      targetMuscleGroups: this.program.targetMuscleGroups || [],
      equipment: this.program.equipment || [],
      tags: this.program.tags || [],
      isPublic: this.program.isPublic || false,
      version: this.program.version || '1.0',
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(programData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.program.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  onBackToList(): void {
    this.router.navigate(['/programs']);
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
    if (!this.program?.targetMuscleGroups) return [];
    
    const muscleGroups = this.program.targetMuscleGroups || [];
    const totalExercises = this.program.exercises.length;
    
    const distribution = muscleGroups.map(muscle => {
      const count = Math.floor(Math.random() * 5) + 1; // Mock count
      const percentage = Math.round((count / totalExercises) * 100);
      return { muscle, count, percentage };
    });
    
    return distribution.sort((a, b) => b.count - a.count);
  }

  getMaxSets(): number {
    if (!this.program?.exercises) return 0;
    return Math.max(...this.program.exercises.map(e => e.sets));
  }

  getMaxVolume(): number {
    if (!this.program?.exercises) return 0;
    return Math.max(...this.program.exercises.map(e => e.sets * e.reps * e.weight));
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
    return this.showActions && this.program?.exercises?.length > 0;
  }

  onViewProgram(program: any): void {
    console.log('onViewProgram called', program);
    this.router.navigate(['/program-detail', program.id]);
  }

  // Add this method to compute total sets
  getTotalSets(): number {
    return this.program?.exercises?.reduce((sum, ex) => sum + (ex.sets || 0), 0) || 0;
  }

  // Add this method to get a display category (fallback to N/A)
  getCategory(): string {
    // If you have a category in metadata or tags, adjust accordingly
    return (this.program as any)?.category || (this.program as any)?.metadata?.tags?.[0] || 'N/A';
  }

  getTotalReps(): number {
    return this.program?.exercises?.reduce((sum, ex) => sum + ((ex.sets || 0) * (ex.reps || 0)), 0) || 0;
  }

  getTotalVolume(): number {
    return this.program?.exercises?.reduce((sum, ex) => sum + ((ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0)), 0) || 0;
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
    if (!this.isStartMode || !this.program || !this.program.exercises) return;
    const allCompleted = this.program.exercises.every((exercise: any) =>
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
    if (!this.program) return null;
    const exercises = this.program.exercises || [];
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
    if (!this.program || !this.program.exercises) return false;
    return this.program.exercises.every((exercise: any) =>
      Array.isArray(exercise.setsCompleted) && exercise.setsCompleted.every((v: boolean) => v)
    );
  }

  getWorkoutLogSummary(): string {
    if (!this.program || !this.program.exercises) return '';
    const totalExercises = this.program.exercises.length;
    const totalSets = this.program.exercises.reduce((sum: number, ex: any) => sum + (ex.sets || 0), 0);
    const completedSets = this.program.exercises.reduce((sum: number, ex: any) => sum + (ex.setsCompleted ? ex.setsCompleted.filter((v: boolean) => v).length : 0), 0);
    if (this.isAllSetsCompleted()) {
      return `Completed all ${totalSets} sets in ${totalExercises} exercises.`;
    } else {
      return `Completed ${completedSets} out of ${totalSets} sets in ${totalExercises} exercises.`;
    }
  }
}
