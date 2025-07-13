import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgramFormData, ProgramExerciseFormData } from '../../../models/program.interface';

@Component({
  selector: 'app-program-wizard',
  templateUrl: './program-wizard.component.html',
  styleUrls: ['./program-wizard.component.scss']
})
export class ProgramWizardComponent implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  
  programForm: FormGroup;
  selectedExercises: any[] = [];
  configuredExercises: ProgramExerciseFormData[] = [];
  
  // Validation states
  step1Valid = false;
  step2Valid = false;
  step3Valid = false;

  constructor(private fb: FormBuilder) {
    this.programForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      difficulty: ['beginner', [Validators.required]],
      category: ['strength', [Validators.required]],
      estimatedDuration: [30, [Validators.required, Validators.min(5), Validators.max(300)]]
    });
  }

  ngOnInit(): void {
    // Listen to form changes for step 1 validation
    this.programForm.valueChanges.subscribe(() => {
      this.step1Valid = this.programForm.valid;
    });
    
    // Initial validation check
    this.step1Valid = this.programForm.valid;
  }

  onExercisesSelected(exercises: any[]) {
    this.selectedExercises = exercises;
    this.step2Valid = exercises.length > 0;
  }

  onExercisesConfigured(exercises: ProgramExerciseFormData[]) {
    this.configuredExercises = exercises;
  }

  onStep3ValidationChange(isValid: boolean) {
    this.step3Valid = isValid;
  }

  canNavigateToStep(step: number): boolean {
    switch (step) {
      case 1:
        return true; // Always can go to step 1
      case 2:
        return this.step1Valid; // Can go to step 2 if step 1 is valid
      case 3:
        return this.step1Valid && this.step2Valid; // Can go to step 3 if steps 1 and 2 are valid
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
      default:
        return false;
    }
  }

  nextStep() {
    if (this.canProceedToNextStep() && this.currentStep < this.totalSteps) {
      this.currentStep++;
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

  getStepStatus(step: number): 'completed' | 'current' | 'pending' | 'disabled' {
    if (step < this.currentStep) {
      return 'completed';
    } else if (step === this.currentStep) {
      return 'current';
    } else if (this.canNavigateToStep(step)) {
      return 'pending';
    } else {
      return 'disabled';
    }
  }

  getStepValidationStatus(step: number): boolean {
    switch (step) {
      case 1:
        return this.step1Valid;
      case 2:
        return this.step2Valid;
      case 3:
        return this.step3Valid;
      default:
        return false;
    }
  }

  createProgram() {
    if (this.programForm.valid && this.configuredExercises.length > 0) {
      const programData: ProgramFormData = {
        ...this.programForm.value,
        exercises: this.configuredExercises
      };
      
      console.log('Creating program:', programData);
      // TODO: Send to backend service
      
      // For now, just log the data
      alert('Program created successfully! (Check console for details)');
    } else {
      // Mark all forms as touched to show validation errors
      this.programForm.markAllAsTouched();
      if (this.currentStep === 3) {
        // Trigger validation check for step 3
        const exerciseConfigComponent = document.querySelector('app-exercise-config');
        if (exerciseConfigComponent) {
          // This would need to be handled through ViewChild in a real implementation
          console.log('Please fix validation errors before creating the program');
        }
      }
    }
  }

  getFormData(): ProgramFormData {
    return {
      ...this.programForm.value,
      exercises: this.configuredExercises
    };
  }
}
