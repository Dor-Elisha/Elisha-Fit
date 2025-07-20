import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { WorkoutService } from '../../../services/workout.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { AdapterService } from '../../../services/adapter.service';
import { ActivatedRoute } from '@angular/router';
import { ExerciseService } from '../../../services/exercise.service';
import { GeneralService } from '../../../services/general.service';

@Component({
  selector: 'app-workout-wizard',
  templateUrl: './workout-wizard.component.html',
  styleUrls: ['./workout-wizard.component.scss']
})
export class WorkoutWizardComponent implements OnInit, OnDestroy {
  currentStep = 1;
  totalSteps = 4; // Added a review step
  
  workoutForm: FormGroup;
  selectedExercises: any[] = [];
  configuredExercises: any[] = [];
  
  // Validation states
  step1Valid = false;
  step2Valid = false;
  step3Valid = false;
  step4Valid = false;
  
  // Loading states
  stepLoading = false;
  creatingWorkout = false;
  
  // Form validation tracking
  formErrors: { [key: string]: string[] } = {};
  fieldTouched: { [key: string]: boolean } = {};
  

  
  private destroy$ = new Subject<void>();

  // Breadcrumb navigation
  wizardBreadcrumbs: any[] = [
    {
      label: 'Workouts',
      url: '/workouts',
      icon: 'fas fa-dumbbell'
    },
    {
      label: 'Create Workout',
      icon: 'fas fa-plus'
    }
  ];

  get mainActionLabel(): string {
    return this.editMode ? 'Save Changes' : 'Create Workout';
  }

  updateBreadcrumbForEdit() {
    if (this.editMode) {
      this.wizardBreadcrumbs = [
        {
          label: 'Workouts',
          url: '/workouts',
          icon: 'fas fa-dumbbell'
        },
        {
          label: 'Edit Workout',
          icon: 'fas fa-edit'
        }
      ];
    }
  }

  constructor(
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private workoutService: WorkoutService,
    private router: Router,
    private toastr: ToastrService,
    private adapter: AdapterService,
    private route: ActivatedRoute,
    private exerciseService: ExerciseService,
    private gs: GeneralService
  ) {
    this.workoutForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      targetMuscleGroups: [[], [Validators.required, Validators.minLength(1)]],
      tags: [[]]
    });
  }

  editMode = false;
  workoutId: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editMode = true;
        this.workoutId = id;
        this.updateBreadcrumbForEdit();
        this.loadWorkoutForEdit(id);
      } else {
        this.editMode = false;
        this.updateBreadcrumbForEdit();
      }
    });
    this.initializeFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeFormValidation(): void {
    // Listen to form changes for step 1 validation with debouncing
    this.workoutForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.validateStep1();
      });
    
    // Initial validation check
    this.validateStep1();
  }

  loadWorkoutForEdit(id: string): void {
    this.stepLoading = true;
    this.workoutService.getWorkoutById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workout) => {
          if (!workout) {
            this.toastr.error('Workout not found');
            this.router.navigate(['/workouts']);
            return;
          }
          this.workoutForm.patchValue({
            name: workout.name,
            description: workout.description,
            targetMuscleGroups: workout.targetMuscleGroups || [],
            tags: workout.tags || []
          });
          // Hydrate exercises with full data for images
          const exercises = workout.exercises || [];
          const exerciseIds = exercises.map((ex: any) => ex.exerciseId || ex.id);
          if (exerciseIds.length > 0) {
            forkJoin(exerciseIds.map(id => this.exerciseService.getExerciseById(id))).pipe(takeUntil(this.destroy$)).subscribe((fullExercises) => {
              const fullExercisesArr = fullExercises as any[];
              this.selectedExercises = fullExercisesArr.map((fullEx: any, i: number) => ({ ...fullEx, ...exercises[i] }));
              this.configuredExercises = this.selectedExercises.map(ex => ({ ...ex }));
              this.step1Valid = this.workoutForm.valid;
              this.step2Valid = this.selectedExercises.length > 0;
              this.step3Valid = this.configuredExercises.length > 0;
              this.stepLoading = false;
            });
          } else {
            this.selectedExercises = [];
            this.configuredExercises = [];
            this.stepLoading = false;
          }
        },
        error: (error) => {
          this.toastr.error('Failed to load workout');
          this.router.navigate(['/workouts']);
          this.stepLoading = false;
        }
      });
  }


  onExercisesSelected(exercises: any[]) {
    this.selectedExercises = exercises;
    this.step2Valid = exercises.length > 0;
  }

  onExerciseRemoved(exercise: any) {
    // Remove from configured exercises if it exists there
    const configIndex = this.configuredExercises.findIndex(e => e.name === exercise.name);
    if (configIndex > -1) {
      this.configuredExercises.splice(configIndex, 1);
    }
  }

  onExercisesConfigured(exercises: any[]) {
    this.configuredExercises = exercises;
  }

  onStep3ValidationChange(isValid: boolean) {
    this.step3Valid = isValid;
  }

  validateStep1(): void {
    this.step1Valid = this.workoutForm.valid;
    this.updateFormErrors();
  }

  updateFormErrors(): void {
    this.formErrors = {};
    Object.keys(this.workoutForm.controls).forEach(key => {
      const control = this.workoutForm.get(key);
      if (control && control.errors && control.touched) {
        this.formErrors[key] = this.getFieldErrors(control);
      }
    });
  }

  getFieldErrors(control: AbstractControl): string[] {
    const errors: string[] = [];
    if (control.errors) {
      Object.keys(control.errors).forEach(errorKey => {
        switch (errorKey) {
          case 'required':
            errors.push('This field is required');
            break;
          case 'minlength':
            errors.push(`Minimum length is ${control.errors?.[errorKey].requiredLength} characters`);
            break;
          case 'maxlength':
            errors.push(`Maximum length is ${control.errors?.[errorKey].requiredLength} characters`);
            break;
          case 'min':
            errors.push(`Minimum value is ${control.errors?.[errorKey].min}`);
            break;
          case 'max':
            errors.push(`Maximum value is ${control.errors?.[errorKey].max}`);
            break;
          case 'email':
            errors.push('Please enter a valid email address');
            break;
          default:
            errors.push('Invalid input');
        }
      });
    }
    return errors;
  }



  isFieldInvalid(fieldName: string): boolean {
    const control = this.workoutForm.get(fieldName);
    return !!(control && control.touched && control.invalid);
  }

  getFieldError(fieldName: string): string {
    return this.formErrors[fieldName]?.[0] || '';
  }

  toggleMuscleGroup(muscle: string, select: boolean): void {
    const currentGroups = this.workoutForm.get('targetMuscleGroups')?.value || [];
    if (select) {
      if (!currentGroups.includes(muscle)) {
        currentGroups.push(muscle);
      }
    } else {
      const index = currentGroups.indexOf(muscle);
      if (index > -1) {
        currentGroups.splice(index, 1);
      }
    }
    this.workoutForm.patchValue({ targetMuscleGroups: currentGroups });
  }

  isMuscleGroupSelected(muscle: string): boolean {
    const currentGroups = this.workoutForm.get('targetMuscleGroups')?.value || [];
    return currentGroups.includes(muscle);
  }



  canNavigateToStep(step: number): boolean {
    switch (step) {
      case 1:
        return true; // Always can go to step 1
      case 2:
        return this.step1Valid; // Can go to step 2 if step 1 is valid
      case 3:
        return this.step1Valid && this.step2Valid; // Can go to step 3 if steps 1 and 2 are valid
      case 4:
        return this.step1Valid && this.step2Valid && this.step3Valid; // Can go to step 4 if all previous steps are valid
      default:
        return false;
    }
  }

  // Remove step4Valid and update canProceedToNextStep to always return true for step 4 if previous steps are valid
  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.step1Valid;
      case 2:
        return this.step2Valid;
      case 3:
        return this.step3Valid;
      case 4:
        return this.step1Valid && this.step2Valid && this.step3Valid;
      default:
        return false;
    }
  }

  nextStep() {
    if (this.canProceedToNextStep() && this.currentStep < this.totalSteps) {
      this.stepLoading = true;
      // Simulate step transition loading
      setTimeout(() => {
        this.currentStep++;
        this.stepLoading = false;
      }, 500);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (this.canNavigateToStep(step)) {
      this.currentStep = step;
    }
  }



  createWorkout() {
    if (!this.step1Valid || !this.step2Valid || !this.step3Valid) {
      this.toastr.error('Please complete all steps before saving the workout.');
      return;
    }
    this.creatingWorkout = true;
    const formValue = this.workoutForm.value;
    const payload = {
      name: formValue.name,
      description: formValue.description,
      targetMuscleGroups: formValue.targetMuscleGroups,
      tags: formValue.tags,
      exercises: this.configuredExercises.map((ex, index) => ({
        exerciseId: ex.exerciseId || ex.id || this.selectedExercises[index]?.exerciseId || this.selectedExercises[index]?.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        rest: ex.rest,
        weight: ex.weight,
        notes: ex.notes,
        order: ex.order
      }))
    };
    if (this.editMode && this.workoutId) {
      this.workoutService.updateWorkout(this.workoutId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedWorkout) => {
            this.creatingWorkout = false;
            // Update local userInfo if available
            const userInfo = this.gs.userInfo$ && (this.gs as any).userInfoSubject?.value;
            if (userInfo && Array.isArray(userInfo.workouts)) {
              userInfo.workouts = userInfo.workouts.map((p: any) => p._id === updatedWorkout._id ? updatedWorkout : p);
              (this.gs as any).userInfoSubject.next({ ...userInfo });
            }
            this.toastr.success('Workout updated successfully');
            this.router.navigate(['/workouts']);
          },
          error: (error) => {
            this.creatingWorkout = false;
            this.toastr.error('Failed to update workout');
          }
        });
    } else {
      this.workoutService.createWorkout(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdWorkout) => {
            this.creatingWorkout = false;
            // Update local userInfo if available
            const userInfo = this.gs.userInfo$ && (this.gs as any).userInfoSubject?.value;
            if (userInfo && Array.isArray(userInfo.workouts)) {
              userInfo.workouts = [createdWorkout, ...userInfo.workouts.filter((p: any) => p._id !== createdWorkout._id)];
              (this.gs as any).userInfoSubject.next({ ...userInfo });
            }
            this.toastr.success('Workout created successfully');
            this.router.navigate(['/workouts']);
          },
          error: (error) => {
            this.creatingWorkout = false;
            this.toastr.error('Failed to create workout');
          }
        });
    }
  }

  getWorkoutSummary(): any {
    return {
      name: this.workoutForm.get('name')?.value,
      description: this.workoutForm.get('description')?.value,
      targetMuscleGroups: this.workoutForm.get('targetMuscleGroups')?.value,
      tags: this.workoutForm.get('tags')?.value,
      exerciseCount: this.configuredExercises.length,
      totalSets: this.configuredExercises.reduce((total, exercise) => total + (exercise.sets || 0), 0),
      totalRestTime: this.configuredExercises.reduce((total, exercise) => total + ((exercise.sets || 0) * (exercise.restTime || 0)), 0)
    };
  }

  getFormData(): any {
    return {
      ...this.workoutForm.value,
      exercises: this.configuredExercises
    };
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
  private extractEquipment(exercises: any[]): string[] {
    const equipment = new Set<string>();
    exercises.forEach(exercise => {
      if (exercise.equipment) {
        equipment.add(exercise.equipment);
      }
    });
    return Array.from(equipment);
  }
}
