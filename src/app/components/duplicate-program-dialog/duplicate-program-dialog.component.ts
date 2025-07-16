import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-duplicate-program-dialog',
  templateUrl: './duplicate-program-dialog.component.html',
  styleUrls: ['./duplicate-program-dialog.component.scss']
})
export class DuplicateProgramDialogComponent {
  @Input() isVisible = false;
  @Input() data: any | null = null;
  
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  duplicateForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.duplicateForm = this.fb.group({
      programName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
    });
  }

  ngOnChanges(): void {
    if (this.data && this.duplicateForm) {
      this.duplicateForm.patchValue({
        programName: this.data.suggestedName
      });
    }
  }

  onConfirm(): void {
    if (this.duplicateForm.valid) {
      const programName = this.duplicateForm.get('programName')?.value;
      this.confirm.emit(programName);
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

  getProgramStats(): { exercises: number; duration: string } {
    const program = this.data.program;
    const exerciseCount = program.exercises?.length || 0;
    let totalMinutes = 0;
    if (program.exercises && program.exercises.length > 0) {
      totalMinutes = program.exercises.reduce((total, exercise) => {
        const exerciseTime = (exercise.sets * exercise.reps * 3) + (exercise.sets * exercise.rest);
        return total + exerciseTime;
      }, 0) / 60;
    } else {
      totalMinutes = program.estimatedDuration || 0;
    }
    const duration = totalMinutes < 60 
      ? `${Math.round(totalMinutes)}m` 
      : `${Math.floor(totalMinutes / 60)}h ${Math.round(totalMinutes % 60)}m`;
    return { exercises: exerciseCount, duration };
  }

  getCategoryIcon(program: any): string {
    const tags = program.tags || [];
    const muscleGroups = program.targetMuscleGroups || [];
    
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
