import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProgramExerciseFormData } from '../../../models/program.interface';

@Component({
  selector: 'app-exercise-config',
  templateUrl: './exercise-config.component.html',
  styleUrls: ['./exercise-config.component.scss']
})
export class ExerciseConfigComponent implements OnInit {
  @Input() selectedExercises: any[] = [];
  @Output() configuredExercisesChange = new EventEmitter<ProgramExerciseFormData[]>();
  @Output() validationStateChange = new EventEmitter<boolean>();

  exerciseForms: FormGroup[] = [];
  configuredExercises: ProgramExerciseFormData[] = [];
  validationErrors: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  ngOnChanges(): void {
    if (this.selectedExercises.length > 0) {
      this.initializeForms();
    }
  }

  // Custom validators
  private weightValidator(control: AbstractControl): ValidationErrors | null {
    const weight = control.value;
    if (weight === null || weight === undefined) return null;
    
    if (weight < 0) {
      return { negativeWeight: true };
    }
    if (weight > 1000) {
      return { excessiveWeight: true };
    }
    return null;
  }

  private restTimeValidator(control: AbstractControl): ValidationErrors | null {
    const restTime = control.value;
    if (restTime === null || restTime === undefined) return null;
    
    if (restTime < 0) {
      return { negativeRestTime: true };
    }
    if (restTime > 600) {
      return { excessiveRestTime: true };
    }
    return null;
  }

  private exerciseIntensityValidator(control: AbstractControl): ValidationErrors | null {
    const form = control.parent;
    if (!form) return null;
    
    const sets = form.get('sets')?.value;
    const reps = form.get('reps')?.value;
    const weight = form.get('weight')?.value;
    
    if (sets && reps && weight) {
      const totalVolume = sets * reps * weight;
      if (totalVolume > 10000) {
        return { excessiveVolume: true };
      }
    }
    return null;
  }

  initializeForms() {
    this.exerciseForms = [];
    this.configuredExercises = [];
    this.validationErrors = [];
    
    this.selectedExercises.forEach((exercise, index) => {
      const form = this.fb.group({
        name: [
          exercise.name, 
          [
            Validators.required, 
            Validators.minLength(2), 
            Validators.maxLength(100)
          ]
        ],
        sets: [
          3, 
          [
            Validators.required, 
            Validators.min(1), 
            Validators.max(20),
            Validators.pattern(/^\d+$/)
          ]
        ],
        reps: [
          10, 
          [
            Validators.required, 
            Validators.min(1), 
            Validators.max(100),
            Validators.pattern(/^\d+$/)
          ]
        ],
        restTime: [
          60, 
          [
            Validators.required, 
            Validators.min(0), 
            Validators.max(600),
            Validators.pattern(/^\d+$/),
            this.restTimeValidator.bind(this)
          ]
        ],
        weight: [
          0, 
          [
            Validators.required, 
            Validators.min(0), 
            Validators.max(1000),
            Validators.pattern(/^\d+(\.\d{1,2})?$/),
            this.weightValidator.bind(this)
          ]
        ],
        order: [
          index + 1, 
          [
            Validators.required, 
            Validators.min(1),
            Validators.pattern(/^\d+$/)
          ]
        ],
        notes: [
          '', 
          [
            Validators.maxLength(500)
          ]
        ]
      }, { validators: this.exerciseIntensityValidator.bind(this) });

      this.exerciseForms.push(form);
      
      // Listen to form changes
      form.valueChanges.subscribe(() => {
        this.updateConfiguredExercises();
        this.updateValidationState();
      });

      // Initialize with default values
      this.updateConfiguredExercises();
    });
  }

  updateConfiguredExercises() {
    this.configuredExercises = this.exerciseForms.map((form, index) => {
      const values = form.value;
      return {
        name: values.name,
        sets: values.sets,
        reps: values.reps,
        restTime: values.restTime,
        weight: values.weight,
        order: values.order,
        notes: values.notes
      };
    });
    
    this.configuredExercisesChange.emit(this.configuredExercises);
  }

  updateValidationState() {
    const isValid = this.isFormValid();
    this.validationStateChange.emit(isValid);
    this.collectValidationErrors();
  }

  collectValidationErrors() {
    this.validationErrors = [];
    
    this.exerciseForms.forEach((form, index) => {
      const exerciseName = this.selectedExercises[index]?.name || `Exercise ${index + 1}`;
      
      Object.keys(form.controls).forEach(controlName => {
        const control = form.get(controlName);
        if (control?.errors && control.touched) {
          Object.keys(control.errors).forEach(errorKey => {
            const errorMessage = this.getErrorMessage(errorKey, controlName, exerciseName);
            if (errorMessage) {
              this.validationErrors.push(errorMessage);
            }
          });
        }
      });
    });
  }

  getErrorMessage(errorKey: string, fieldName: string, exerciseName: string): string {
    const fieldLabels: { [key: string]: string } = {
      name: 'Name',
      sets: 'Sets',
      reps: 'Reps',
      restTime: 'Rest Time',
      weight: 'Weight',
      order: 'Order',
      notes: 'Notes'
    };

    const fieldLabel = fieldLabels[fieldName] || fieldName;

    switch (errorKey) {
      case 'required':
        return `${exerciseName}: ${fieldLabel} is required`;
      case 'minlength':
        return `${exerciseName}: ${fieldLabel} must be at least 2 characters`;
      case 'maxlength':
        return `${exerciseName}: ${fieldLabel} must be at most 100 characters`;
      case 'min':
        return `${exerciseName}: ${fieldLabel} must be at least 1`;
      case 'max':
        return `${exerciseName}: ${fieldLabel} must be at most 20`;
      case 'pattern':
        return `${exerciseName}: ${fieldLabel} must be a valid number`;
      case 'negativeWeight':
        return `${exerciseName}: Weight cannot be negative`;
      case 'excessiveWeight':
        return `${exerciseName}: Weight cannot exceed 1000`;
      case 'negativeRestTime':
        return `${exerciseName}: Rest time cannot be negative`;
      case 'excessiveRestTime':
        return `${exerciseName}: Rest time cannot exceed 600 seconds`;
      case 'excessiveVolume':
        return `${exerciseName}: Total volume (sets × reps × weight) is too high`;
      default:
        return `${exerciseName}: ${fieldLabel} has an invalid value`;
    }
  }

  getFormGroup(index: number): FormGroup {
    return this.exerciseForms[index];
  }

  isFormValid(): boolean {
    return this.exerciseForms.every(form => form.valid);
  }

  markAllAsTouched(): void {
    this.exerciseForms.forEach(form => {
      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        control?.markAsTouched();
      });
    });
    this.updateValidationState();
  }

  getTotalEstimatedTime(): number {
    return this.configuredExercises.reduce((total, exercise) => {
      const exerciseTime = (exercise.sets * exercise.reps * 3) + (exercise.sets * exercise.restTime);
      return total + exerciseTime;
    }, 0);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getValidationSummary(): string {
    if (this.validationErrors.length === 0) {
      return 'All exercises are properly configured';
    }
    return `${this.validationErrors.length} validation error(s) found`;
  }
}
