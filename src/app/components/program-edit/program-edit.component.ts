import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { Program, ProgramExercise, ProgramDifficulty } from '../../models/program.interface';
import { Exercise } from '../../models/exercise.interface';
import { ExerciseService } from '../../services/exercise.service';
import { GeneralService } from '../../services/general.service';

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
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
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
    // For now, we'll create a mock program since getProgram doesn't exist
    // In a real implementation, this would load from the service
    this.program = {
      id: '1',
      name: 'Sample Program',
      description: 'A sample workout program',
      difficulty: ProgramDifficulty.BEGINNER,
      exercises: [],
      metadata: {
        estimatedDuration: 30,
        totalExercises: 0,
        targetMuscleGroups: [],
        equipment: [],
        tags: [],
        isPublic: false,
        version: '1.0'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1'
    };
    
    this.populateForm(this.program);
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
    const exerciseName = exercisesArray.at(index).get('exerciseName')?.value;
    exercisesArray.removeAt(index);
    this.toastr.info(`${exerciseName} removed from program`);
  }

  moveExerciseUp(index: number): void {
    if (index > 0) {
      const exercisesArray = this.programForm.get('exercises') as FormArray;
      const currentExercise = exercisesArray.at(index);
      exercisesArray.removeAt(index);
      exercisesArray.insert(index - 1, currentExercise);
    }
  }

  moveExerciseDown(index: number): void {
    const exercisesArray = this.programForm.get('exercises') as FormArray;
    if (index < exercisesArray.length - 1) {
      const currentExercise = exercisesArray.at(index);
      exercisesArray.removeAt(index);
      exercisesArray.insert(index + 1, currentExercise);
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
    this.saving = true;
    const formValue = this.programForm.value;
    const updatedProgram: Program = {
      ...this.program,
      name: formValue.name,
      description: formValue.description,
      difficulty: formValue.difficulty,
      exercises: formValue.exercises,
      updatedAt: new Date()
    };
    setTimeout(() => {
      this.saving = false;
      this.programForm.markAsPristine();
      this.toastr.success('Program updated successfully');
      this.router.navigate(['/programs']);
    }, 1000);
  }

  saveAsNew(): void {
    if (!this.isFormValid) {
      this.toastr.error('Please fix validation errors before saving');
      return;
    }
    const formValue = this.programForm.value;
    const newProgram: Omit<Program, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formValue.name,
      description: formValue.description,
      difficulty: formValue.difficulty,
      exercises: formValue.exercises,
      metadata: {
        estimatedDuration: 30,
        totalExercises: formValue.exercises.length,
        targetMuscleGroups: [],
        equipment: [],
        tags: [],
        isPublic: false,
        version: '1.0'
      },
      userId: 'current-user'
    };
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.toastr.success('Program saved as new successfully');
      this.router.navigate(['/programs']);
    }, 1000);
  }

  cancel(): void {
    if (this.hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        this.router.navigate(['/programs']);
      }
    } else {
      this.router.navigate(['/programs']);
    }
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
      return `${fieldName} must be no more than ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['min']) {
      return `${fieldName} must be at least ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `${fieldName} must be no more than ${errors['max'].max}`;
    }
    return `${fieldName} is invalid`;
  }

  getExerciseFieldError(control: AbstractControl | null, fieldName: string): string {
    return this.getFieldError(control, fieldName);
  }

  getCategoryIcon(category: string): string {
    switch (category.toLowerCase()) {
      case 'strength': return 'fitness_center';
      case 'cardio': return 'directions_run';
      case 'flexibility': return 'accessibility';
      case 'balance': return 'balance';
      case 'sports': return 'sports_soccer';
      case 'stretching': return 'self_improvement';
      case 'plyometrics': return 'directions_run';
      case 'powerlifting': return 'fitness_center';
      case 'olympic weightlifting': return 'fitness_center';
      case 'strongman': return 'fitness_center';
      default: return 'fitness_center';
    }
  }

  getDifficultyColor(difficulty: ProgramDifficulty): string {
    switch (difficulty) {
      case ProgramDifficulty.BEGINNER: return 'success';
      case ProgramDifficulty.INTERMEDIATE: return 'warning';
      case ProgramDifficulty.ADVANCED: return 'error';
      default: return 'primary';
    }
  }

  formatRestTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
}
