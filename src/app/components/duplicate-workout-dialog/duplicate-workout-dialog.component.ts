import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-duplicate-workout-dialog',
  templateUrl: './duplicate-workout-dialog.component.html',
  styleUrls: ['./duplicate-workout-dialog.component.scss']
})
export class DuplicateWorkoutDialogComponent {
  @Input() isVisible = false;
  @Input() data: any | null = null;
  
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  duplicateForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.duplicateForm = this.fb.group({
      workoutName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
    });
  }

  ngOnChanges(): void {
    if (this.data && this.duplicateForm) {
      this.duplicateForm.patchValue({
        workoutName: this.data.suggestedName
      });
    }
  }

  onConfirm(): void {
    if (this.duplicateForm.valid) {
      const workoutName = this.duplicateForm.get('workoutName')?.value;
      this.confirm.emit(workoutName);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getWorkoutStats(): { exercises: number; duration: string } {
    const workout = this.data.workout;
    const exerciseCount = workout.exercises?.length || 0;
    let totalMinutes = 0;
    if (workout.exercises && workout.exercises.length > 0) {
      totalMinutes = workout.exercises.reduce((total, exercise) => {
        const exerciseTime = (exercise.sets * exercise.reps * 3) + (exercise.sets * exercise.rest);
        return total + exerciseTime;
      }, 0) / 60;
    } else {
      totalMinutes = workout.estimatedDuration || 0;
    }
    const duration = totalMinutes < 60 
      ? `${Math.round(totalMinutes)}m` 
      : `${Math.floor(totalMinutes / 60)}h ${Math.round(totalMinutes % 60)}m`;
    return { exercises: exerciseCount, duration };
  }

  getCategoryIcon(workout: any): string {
    const tags = workout.tags || [];
    const muscleGroups = workout.targetMuscleGroups || [];
    
    if (tags.includes('strength') || muscleGroups.some(mg => mg.includes('chest') || mg.includes('back') || mg.includes('legs'))) {
      return 'fas fa-dumbbell';
    } else if (tags.includes('hiit') || tags.includes('interval')) {
      return 'fas fa-fire';
    } else if (tags.includes('cardio') || tags.includes('running') || tags.includes('cycling')) {
      return 'fas fa-heartbeat';
    } else if (tags.includes('flexibility') || tags.includes('stretching')) {
      return 'fas fa-child';
    } else if (tags.includes('yoga') || tags.includes('meditation')) {
      return 'fas fa-pray';
    } else {
      return 'fas fa-layer-group';
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#28a745';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#dc3545';
      default: return '#6c757d';
    }
  }
}
