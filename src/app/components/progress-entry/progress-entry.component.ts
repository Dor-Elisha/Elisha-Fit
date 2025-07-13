import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { 
  Program, 
  ProgressEntry, 
  ExerciseProgress, 
  SetProgress,
  ProgressFormData,
  ExerciseProgressFormData,
  SetProgressFormData,
  ValidationResult
} from '../../models/program.interface';

@Component({
  selector: 'app-progress-entry',
  templateUrl: './progress-entry.component.html',
  styleUrls: ['./progress-entry.component.scss']
})
export class ProgressEntryComponent implements OnInit {
  @Input() program: Program | null = null;
  @Input() isVisible: boolean = false;
  @Output() save = new EventEmitter<ProgressEntry>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  progressForm: FormGroup;
  loading: boolean = false;
  validationErrors: string[] = [];
  today: string = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder) {
    this.progressForm = this.fb.group({
      programId: ['', Validators.required],
      exercises: this.fb.array([]),
      notes: [''],
      rating: [null, [Validators.min(1), Validators.max(5)]],
      workoutDate: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.program) {
      this.initializeForm();
    }
  }

  ngOnChanges(): void {
    if (this.program && this.isVisible) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (!this.program) return;

    this.progressForm.patchValue({
      programId: this.program.id,
      workoutDate: new Date()
    });

    // Clear existing exercises
    const exercisesArray = this.progressForm.get('exercises') as FormArray;
    exercisesArray.clear();

    // Add form controls for each exercise in the program
    this.program.exercises.forEach((exercise, index) => {
      const exerciseGroup = this.fb.group({
        exerciseId: [exercise.id, Validators.required],
        exerciseName: [exercise.name, Validators.required],
        sets: this.fb.array([]),
        notes: ['']
      });

      const setsArray = exerciseGroup.get('sets') as FormArray;
      
      // Add form controls for each set
      for (let i = 0; i < exercise.sets; i++) {
        const setGroup = this.fb.group({
          setNumber: [i + 1, Validators.required],
          weight: [exercise.weight, [Validators.required, Validators.min(0), Validators.max(1000)]],
          reps: [exercise.reps, [Validators.required, Validators.min(1), Validators.max(100)]],
          restTime: [exercise.restTime, [Validators.required, Validators.min(0), Validators.max(600)]],
          completed: [true, Validators.required],
          notes: ['']
        });
        setsArray.push(setGroup);
      }

      exercisesArray.push(exerciseGroup);
    });
  }

  get exercisesArray(): FormArray {
    return this.progressForm.get('exercises') as FormArray;
  }

  getSetsArray(exerciseIndex: number): FormArray {
    return this.exercisesArray.at(exerciseIndex).get('sets') as FormArray;
  }

  getSetControl(exerciseIndex: number, setIndex: number, controlName: string): any {
    return this.getSetsArray(exerciseIndex).at(setIndex).get(controlName);
  }

  getExerciseControl(exerciseIndex: number, controlName: string): any {
    return this.exercisesArray.at(exerciseIndex).get(controlName);
  }

  getSetGroup(exerciseIndex: number, setIndex: number): FormGroup {
    return this.getSetsArray(exerciseIndex).at(setIndex) as FormGroup;
  }

  onSave(): void {
    if (this.progressForm.valid) {
      this.loading = true;
      this.validationErrors = [];

      try {
        const formData = this.progressForm.value;
        const progressEntry: ProgressEntry = {
          id: this.generateId(),
          programId: formData.programId,
          userId: 'current-user', // This should come from auth service
          workoutDate: new Date(formData.workoutDate),
          exercises: formData.exercises.map((exercise: any) => ({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            sets: exercise.sets.map((set: any) => ({
              setNumber: set.setNumber,
              weight: set.weight,
              reps: set.reps,
              restTime: set.restTime,
              completed: set.completed,
              notes: set.notes
            })),
            notes: exercise.notes
          })),
          totalDuration: this.calculateTotalDuration(formData.exercises),
          notes: formData.notes,
          rating: formData.rating,
          completed: true
        };

        this.save.emit(progressEntry);
      } catch (error) {
        this.validationErrors.push('An error occurred while saving progress.');
        console.error('Error saving progress:', error);
      } finally {
        this.loading = false;
      }
    } else {
      this.markFormGroupTouched();
      this.collectValidationErrors();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  private generateId(): string {
    return 'progress_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private calculateTotalDuration(exercises: any[]): number {
    let totalDuration = 0;
    exercises.forEach(exercise => {
      exercise.sets.forEach((set: any) => {
        if (set.completed) {
          totalDuration += set.restTime || 0;
        }
      });
    });
    return Math.round(totalDuration / 60); // Convert to minutes
  }

  private markFormGroupTouched(): void {
    Object.keys(this.progressForm.controls).forEach(key => {
      const control = this.progressForm.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouchedRecursive(control);
      } else if (control instanceof FormArray) {
        this.markFormArrayTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private markFormGroupTouchedRecursive(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouchedRecursive(control);
      } else if (control instanceof FormArray) {
        this.markFormArrayTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private markFormArrayTouched(formArray: FormArray): void {
    formArray.controls.forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouchedRecursive(control);
      } else if (control instanceof FormArray) {
        this.markFormArrayTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  private collectValidationErrors(): void {
    this.validationErrors = [];
    
    if (this.progressForm.errors) {
      this.validationErrors.push('Please fix the form errors below.');
    }

    // Check for specific field errors
    const exercisesArray = this.progressForm.get('exercises') as FormArray;
    exercisesArray.controls.forEach((exerciseControl, exerciseIndex) => {
      if (exerciseControl instanceof FormGroup) {
        const setsArray = exerciseControl.get('sets') as FormArray;
        setsArray.controls.forEach((setControl, setIndex) => {
          if (setControl instanceof FormGroup) {
            Object.keys(setControl.controls).forEach(key => {
              const control = setControl.get(key);
              if (control?.errors && control.touched) {
                const fieldName = this.getFieldDisplayName(key);
                const errorMessage = this.getErrorMessage(control.errors);
                this.validationErrors.push(`Exercise ${exerciseIndex + 1}, Set ${setIndex + 1}, ${fieldName}: ${errorMessage}`);
              }
            });
          }
        });
      }
    });
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldMap: { [key: string]: string } = {
      'weight': 'Weight',
      'reps': 'Reps',
      'restTime': 'Rest Time',
      'completed': 'Completed'
    };
    return fieldMap[fieldName] || fieldName;
  }

  private getErrorMessage(errors: any): string {
    if (errors['required']) return 'This field is required.';
    if (errors['min']) return `Minimum value is ${errors['min'].min}.`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}.`;
    return 'Invalid value.';
  }

  getFormattedRestTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getFormattedWeight(weight: number): string {
    return `${weight} kg`;
  }
}
