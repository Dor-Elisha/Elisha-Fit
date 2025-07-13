import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ProgramFormData, ProgramExerciseFormData } from '../../../models/program.interface';
import { BreadcrumbItem } from '../../breadcrumb/breadcrumb.component';
import { LoadingService } from '../../../services/loading.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-program-wizard',
  templateUrl: './program-wizard.component.html',
  styleUrls: ['./program-wizard.component.scss']
})
export class ProgramWizardComponent implements OnInit, OnDestroy {
  currentStep = 1;
  totalSteps = 4; // Added a review step
  
  programForm: FormGroup;
  selectedExercises: any[] = [];
  configuredExercises: ProgramExerciseFormData[] = [];
  
  // Validation states
  step1Valid = false;
  step2Valid = false;
  step3Valid = false;
  step4Valid = false;
  
  // Loading states
  stepLoading = false;
  creatingProgram = false;
  
  // Form validation tracking
  formErrors: { [key: string]: string[] } = {};
  fieldTouched: { [key: string]: boolean } = {};
  

  
  private destroy$ = new Subject<void>();

  // Breadcrumb navigation
  wizardBreadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Programs',
      url: '/programs',
      icon: 'fas fa-dumbbell'
    },
    {
      label: 'Create Program',
      icon: 'fas fa-plus'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private loadingService: LoadingService
  ) {
    this.programForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      difficulty: ['beginner', [Validators.required]],
      category: ['strength', [Validators.required]],
      estimatedDuration: [30, [Validators.required, Validators.min(5), Validators.max(300)]],
      targetMuscleGroups: [[], [Validators.required, Validators.minLength(1)]],
      equipment: [[]],
      tags: [[]]
    });
  }

  ngOnInit(): void {
    this.initializeFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeFormValidation(): void {
    // Listen to form changes for step 1 validation with debouncing
    this.programForm.valueChanges
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

  onExercisesConfigured(exercises: ProgramExerciseFormData[]) {
    this.configuredExercises = exercises;
  }

  onStep3ValidationChange(isValid: boolean) {
    this.step3Valid = isValid;
  }

  validateStep1(): void {
    this.step1Valid = this.programForm.valid;
    this.updateFormErrors();
  }

  updateFormErrors(): void {
    this.formErrors = {};
    Object.keys(this.programForm.controls).forEach(key => {
      const control = this.programForm.get(key);
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
    const control = this.programForm.get(fieldName);
    return !!(control && control.touched && control.invalid);
  }

  getFieldError(fieldName: string): string {
    return this.formErrors[fieldName]?.[0] || '';
  }

  toggleMuscleGroup(muscle: string, event: any): void {
    const currentGroups = this.programForm.get('targetMuscleGroups')?.value || [];
    if (event.target.checked) {
      currentGroups.push(muscle);
    } else {
      const index = currentGroups.indexOf(muscle);
      if (index > -1) {
        currentGroups.splice(index, 1);
      }
    }
    this.programForm.patchValue({ targetMuscleGroups: currentGroups });
  }

  isMuscleGroupSelected(muscle: string): boolean {
    const currentGroups = this.programForm.get('targetMuscleGroups')?.value || [];
    return currentGroups.includes(muscle);
  }

  toggleEquipment(equipment: string, event: any): void {
    const currentEquipment = this.programForm.get('equipment')?.value || [];
    if (event.target.checked) {
      currentEquipment.push(equipment);
    } else {
      const index = currentEquipment.indexOf(equipment);
      if (index > -1) {
        currentEquipment.splice(index, 1);
      }
    }
    this.programForm.patchValue({ equipment: currentEquipment });
  }

  isEquipmentSelected(equipment: string): boolean {
    const currentEquipment = this.programForm.get('equipment')?.value || [];
    return currentEquipment.includes(equipment);
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

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.step1Valid;
      case 2:
        return this.step2Valid;
      case 3:
        return this.step3Valid;
      case 4:
        return this.step4Valid;
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



  createProgram() {
    if (this.programForm.valid && this.configuredExercises.length > 0) {
      this.loadingService.showForFormSubmission('Creating your program...');
      this.creatingProgram = true;
      
      const programData: ProgramFormData = {
        ...this.programForm.value,
        exercises: this.configuredExercises
      };
      
      console.log('Creating program:', programData);
      // TODO: Send to backend service
      
      // Simulate API call
      setTimeout(() => {
        this.creatingProgram = false;
        this.loadingService.hide();
        // TODO: Navigate to program detail page or show success message
        alert('Program created successfully! (Check console for details)');
      }, 2000);
    } else {
      // Mark all forms as touched to show validation errors
      this.programForm.markAllAsTouched();
      this.updateFormErrors();
      
      // Navigate to the first step with errors
      if (!this.step1Valid) {
        this.currentStep = 1;
      } else if (!this.step2Valid) {
        this.currentStep = 2;
      } else if (!this.step3Valid) {
        this.currentStep = 3;
      }
    }
  }

  getProgramSummary(): any {
    return {
      name: this.programForm.get('name')?.value,
      description: this.programForm.get('description')?.value,
      difficulty: this.programForm.get('difficulty')?.value,
      category: this.programForm.get('category')?.value,
      estimatedDuration: this.programForm.get('estimatedDuration')?.value,
      targetMuscleGroups: this.programForm.get('targetMuscleGroups')?.value,
      equipment: this.programForm.get('equipment')?.value,
      tags: this.programForm.get('tags')?.value,
      exerciseCount: this.configuredExercises.length,
      totalSets: this.configuredExercises.reduce((total, exercise) => total + (exercise.sets || 0), 0),
      totalDuration: this.configuredExercises.reduce((total, exercise) => total + (exercise.restTime || 0), 0)
    };
  }

  getFormData(): ProgramFormData {
    return {
      ...this.programForm.value,
      exercises: this.configuredExercises
    };
  }
}
