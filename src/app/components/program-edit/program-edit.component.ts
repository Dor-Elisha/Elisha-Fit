import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { Program, ProgramExercise, ProgramDifficulty } from '../../models/program.interface';
import { Exercise } from '../../models/exercise.interface';
import { ExerciseService } from '../../services/exercise.service';
import { ProgramService } from '../../services/program.service';
import { GeneralService } from '../../services/general.service';
import { ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-program-edit',
  templateUrl: './program-edit.component.html',
  styleUrls: ['./program-edit.component.scss']
})
export class ProgramEditComponent implements OnInit, OnDestroy {
  programForm!: FormGroup;
  program: Program | null = null;
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  selectedExercises: Exercise[] = [];
  loading = false;
  saving = false;
  searchTerm = '';
  selectedCategory: string = 'all';
  difficultyLevels = Object.values(ProgramDifficulty);
  exerciseCategories: string[] = [];
  
  // Confirmation dialog properties
  showSaveDialog = false;
  showCancelDialog = false;
  showDeleteDialog = false;
  saveDialogData: ConfirmDialogData = {
    title: 'Save Changes',
    message: 'Are you sure you want to save the changes to this program?',
    confirmText: 'Save',
    cancelText: 'Cancel',
    type: 'info',
    showIcon: true
  };
  cancelDialogData: ConfirmDialogData = {
    title: 'Discard Changes',
    message: 'You have unsaved changes. Are you sure you want to discard them?',
    confirmText: 'Discard',
    cancelText: 'Keep Editing',
    type: 'warning',
    showIcon: true
  };
  deleteDialogData: ConfirmDialogData = {
    title: 'Delete Program',
    message: 'Are you sure you want to delete this program? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
    showIcon: true
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private programService: ProgramService,
    private generalService: GeneralService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExercises();
    this.loadProgram();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.programForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      difficulty: [ProgramDifficulty.BEGINNER, Validators.required],
      exercises: this.fb.array([])
    });
  }

  private loadExercises(): void {
    this.loading = true;
    this.exerciseService.getExercises()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exercises) => {
          this.exercises = exercises;
          this.filteredExercises = exercises;
          this.exerciseCategories = [...new Set(exercises.map((ex: Exercise) => ex.category))] as string[];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading exercises:', error);
          this.toastr.error('Failed to load exercises');
          this.loading = false;
        }
      });
  }

  private loadProgram(): void {
    const programId = this.route.snapshot.paramMap.get('id');
    if (!programId) {
      this.toastr.error('Program ID not found');
      this.router.navigate(['/programs']);
      return;
    }

    this.loading = true;
    this.programService.getProgramById(programId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (program) => {
          if (!program) {
            this.toastr.error('Program not found');
            this.router.navigate(['/programs']);
            return;
          }
          this.program = program;
          this.populateForm(program);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading program:', error);
          this.toastr.error('Failed to load program');
          this.loading = false;
          this.router.navigate(['/programs']);
        }
      });
  }

  private populateForm(program: Program): void {
    this.programForm.patchValue({
      name: program.name,
      description: program.description,
      difficulty: program.difficulty
    });

    // Clear existing exercises
    const exercisesArray = this.programForm.get('exercises') as FormArray;
    exercisesArray.clear();

    // Add exercises to form array
    program.exercises.forEach(exercise => {
      exercisesArray.push(this.createExerciseFormGroup(exercise));
    });
  }

  private createExerciseFormGroup(exercise: any): FormGroup {
    return this.fb.group({
      exerciseName: [exercise.name, Validators.required],
      sets: [exercise.sets || 3, [Validators.required, Validators.min(1), Validators.max(20)]],
      reps: [exercise.reps || 10, [Validators.required, Validators.min(1), Validators.max(1000)]],
      restTime: [exercise.restTime || 60, [Validators.required, Validators.min(0), Validators.max(600)]],
      weight: [exercise.weight || 0, [Validators.min(0), Validators.max(1000)]],
      order: [exercise.order || 0, Validators.required],
      notes: [exercise.notes || '']
    });
  }

  private setupFormListeners(): void {
    // Listen for form changes to update selected exercises
    this.programForm.get('exercises')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(exercises => {
        this.selectedExercises = exercises.map((ex: any) => 
          this.exercises.find(e => e.name === ex.exerciseName)
        ).filter(Boolean) as Exercise[];
      });
  }

  get exercisesArray(): FormArray {
    return this.programForm.get('exercises') as FormArray;
  }

  get isFormValid(): boolean {
    return this.programForm.valid && this.exercisesArray.length > 0;
  }

  get hasChanges(): boolean {
    return this.programForm.dirty || this.programForm.touched;
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filterExercises();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterExercises();
  }

  filterExercises(): void {
    this.filteredExercises = this.exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           exercise.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' || exercise.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  selectExercise(exercise: Exercise): void {
    const exercisesArray = this.programForm.get('exercises') as FormArray;
    // Check if exercise is already added
    const existingIndex = exercisesArray.controls.findIndex(
      control => control.get('exerciseName')?.value === exercise.name
    );
    if (existingIndex >= 0) {
      this.toastr.warning('Exercise already added to program');
      return;
    }
    // Add new exercise to form array
    exercisesArray.push(this.fb.group({
      exerciseName: [exercise.name, Validators.required],
      sets: [3, [Validators.required, Validators.min(1), Validators.max(20)]],
      reps: [10, [Validators.required, Validators.min(1), Validators.max(1000)]],
      restTime: [60, [Validators.required, Validators.min(0), Validators.max(600)]],
      weight: [0, [Validators.min(0), Validators.max(1000)]],
      order: [exercisesArray.length, Validators.required],
      notes: ['']
    }));
    this.toastr.success(`${exercise.name} added to program`);
  }

  removeExercise(index: number): void {
    const exercisesArray = this.programForm.get('exercises') as FormArray;
    exercisesArray.removeAt(index);
    this.toastr.success('Exercise removed from program');
  }

  moveExerciseUp(index: number): void {
    if (index > 0) {
      const exercisesArray = this.programForm.get('exercises') as FormArray;
      const exercise = exercisesArray.at(index);
      exercisesArray.removeAt(index);
      exercisesArray.insert(index - 1, exercise);
      this.toastr.success('Exercise moved up');
    }
  }

  moveExerciseDown(index: number): void {
    const exercisesArray = this.programForm.get('exercises') as FormArray;
    if (index < exercisesArray.length - 1) {
      const exercise = exercisesArray.at(index);
      exercisesArray.removeAt(index);
      exercisesArray.insert(index + 1, exercise);
      this.toastr.success('Exercise moved down');
    }
  }

  duplicateExercise(index: number): void {
    const exercisesArray = this.programForm.get('exercises') as FormArray;
    const exerciseToDuplicate = exercisesArray.at(index).value;
    exercisesArray.insert(index + 1, this.fb.group({
      exerciseName: [exerciseToDuplicate.exerciseName, Validators.required],
      sets: [exerciseToDuplicate.sets, [Validators.required, Validators.min(1), Validators.max(20)]],
      reps: [exerciseToDuplicate.reps, [Validators.required, Validators.min(1), Validators.max(1000)]],
      restTime: [exerciseToDuplicate.restTime, [Validators.required, Validators.min(0), Validators.max(600)]],
      weight: [exerciseToDuplicate.weight, [Validators.min(0), Validators.max(1000)]],
      order: [exerciseToDuplicate.order, Validators.required],
      notes: [exerciseToDuplicate.notes]
    }));
    this.toastr.success('Exercise duplicated');
  }

  saveProgram(): void {
    if (!this.isFormValid) {
      this.toastr.error('Please fix validation errors before saving');
      return;
    }
    if (!this.program) {
      this.toastr.error('Program not found');
      return;
    }

    this.saveDialogData.message = `Are you sure you want to save the changes to "${this.program.name}"?`;
    this.showSaveDialog = true;
  }

  onConfirmSave(): void {
    if (!this.program) return;

    this.saving = true;
    const formValue = this.programForm.value;
    
    const updatedProgram: Program = {
      ...this.program,
      name: formValue.name,
      description: formValue.description,
      difficulty: formValue.difficulty,
      exercises: formValue.exercises.map((ex: any, index: number) => ({
        id: this.program!.exercises[index]?.id || this.generateId(),
        name: ex.exerciseName,
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        weight: ex.weight,
        order: index + 1,
        notes: ex.notes
      })),
      updatedAt: new Date()
    };

    this.programService.updateProgram(updatedProgram.id, updatedProgram)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.programForm.markAsPristine();
          this.toastr.success('Program updated successfully');
          this.router.navigate(['/programs']);
        },
        error: (error) => {
          this.saving = false;
          console.error('Error updating program:', error);
          this.toastr.error('Failed to update program');
        }
      });

    this.closeSaveDialog();
  }

  onCancelSave(): void {
    this.closeSaveDialog();
  }

  closeSaveDialog(): void {
    this.showSaveDialog = false;
  }

  saveAsNew(): void {
    if (!this.isFormValid) {
      this.toastr.error('Please fix validation errors before saving');
      return;
    }

    this.saving = true;
    const formValue = this.programForm.value;
    
    const newProgram: Omit<Program, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formValue.name,
      description: formValue.description,
      difficulty: formValue.difficulty,
      exercises: formValue.exercises.map((ex: any, index: number) => ({
        id: this.generateId(),
        name: ex.exerciseName,
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        weight: ex.weight,
        order: index + 1,
        notes: ex.notes
      })),
      metadata: {
        estimatedDuration: this.calculateEstimatedDuration(formValue.exercises),
        totalExercises: formValue.exercises.length,
        targetMuscleGroups: this.extractMuscleGroups(formValue.exercises),
        equipment: this.extractEquipment(formValue.exercises),
        tags: [],
        isPublic: false,
        version: '1.0'
      },
      userId: 'current-user'
    };

    this.programService.createProgram(newProgram)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.toastr.success('Program saved as new successfully');
          this.router.navigate(['/programs']);
        },
        error: (error) => {
          this.saving = false;
          console.error('Error creating program:', error);
          this.toastr.error('Failed to create new program');
        }
      });
  }

  cancel(): void {
    if (this.hasChanges) {
      this.showCancelDialog = true;
    } else {
      this.navigateBack();
    }
  }

  onConfirmCancel(): void {
    this.closeCancelDialog();
    this.navigateBack();
  }

  onCancelCancel(): void {
    this.closeCancelDialog();
  }

  closeCancelDialog(): void {
    this.showCancelDialog = false;
  }

  deleteProgram(): void {
    if (!this.program) return;
    
    this.deleteDialogData.message = `Are you sure you want to delete "${this.program.name}"? This action cannot be undone.`;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.program) return;

    this.programService.deleteProgram(this.program.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Program deleted successfully');
          this.router.navigate(['/programs']);
        },
        error: (error) => {
          console.error('Error deleting program:', error);
          this.toastr.error('Failed to delete program');
        }
      });

    this.closeDeleteDialog();
  }

  onCancelDelete(): void {
    this.closeDeleteDialog();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
  }

  private navigateBack(): void {
    this.router.navigate(['/programs']);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private calculateEstimatedDuration(exercises: any[]): number {
    return exercises.reduce((total, exercise) => {
      const exerciseTime = (exercise.sets * exercise.reps * 3) + (exercise.sets * exercise.restTime);
      return total + exerciseTime;
    }, 0) / 60; // Convert to minutes
  }

  private extractMuscleGroups(exercises: any[]): string[] {
    const muscleGroups = new Set<string>();
    exercises.forEach(exercise => {
      const exerciseData = this.exercises.find(e => e.name === exercise.exerciseName);
      if (exerciseData?.primaryMuscles) {
        exerciseData.primaryMuscles.forEach(mg => muscleGroups.add(mg));
      }
      if (exerciseData?.secondaryMuscles) {
        exerciseData.secondaryMuscles.forEach(mg => muscleGroups.add(mg));
      }
    });
    return Array.from(muscleGroups);
  }

  private extractEquipment(exercises: any[]): string[] {
    const equipment = new Set<string>();
    exercises.forEach(exercise => {
      const exerciseData = this.exercises.find(e => e.name === exercise.exerciseName);
      if (exerciseData?.equipment) {
        equipment.add(exerciseData.equipment);
      }
    });
    return Array.from(equipment);
  }

  getFieldError(control: AbstractControl | null, fieldName: string): string {
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    if (errors['required']) {
      return `${fieldName} is required`;
    }
    if (errors['minlength']) {
      return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['min']) {
      return `${fieldName} must be at least ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `${fieldName} cannot exceed ${errors['max'].max}`;
    }

    return `${fieldName} is invalid`;
  }

  getExerciseFieldError(control: AbstractControl | null, fieldName: string): string {
    return this.getFieldError(control, fieldName);
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'strength': 'fas fa-dumbbell',
      'cardio': 'fas fa-heartbeat',
      'flexibility': 'fas fa-child',
      'balance': 'fas fa-balance-scale',
      'plyometric': 'fas fa-fire',
      'olympic_weightlifting': 'fas fa-weight-hanging',
      'strongman': 'fas fa-crown',
      'powerlifting': 'fas fa-trophy',
      'crossfit': 'fas fa-bolt',
      'yoga': 'fas fa-pray',
      'pilates': 'fas fa-spa',
      'calisthenics': 'fas fa-user'
    };
    
    return iconMap[category.toLowerCase()] || 'fas fa-dumbbell';
  }

  getDifficultyColor(difficulty: ProgramDifficulty): string {
    switch (difficulty) {
      case 'beginner': return '#28a745';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#dc3545';
      default: return '#6c757d';
    }
  }

  formatRestTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes}m`;
      }
      return `${minutes}m ${remainingSeconds}s`;
    }
  }
}
