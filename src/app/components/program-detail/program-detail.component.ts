import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Program, ProgramDifficulty } from '../../models/program.interface';
import { ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { DuplicateProgramData } from '../duplicate-program-dialog/duplicate-program-dialog.component';

@Component({
  selector: 'app-program-detail',
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss']
})
export class ProgramDetailComponent implements OnInit {
  @Input() program: Program | null = null;
  @Input() loading = false;
  @Input() showActions = true;
  @Input() isReadOnly = false;
  
  @Output() editProgram = new EventEmitter<Program>();
  @Output() deleteProgram = new EventEmitter<Program>();
  @Output() duplicateProgram = new EventEmitter<Program>();
  @Output() startWorkout = new EventEmitter<Program>();
  @Output() backToList = new EventEmitter<void>();

  // Confirmation dialog properties
  showDeleteDialog = false;
  deleteDialogData: ConfirmDialogData = {
    title: 'Delete Program',
    message: 'Are you sure you want to delete this program? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
    showIcon: true
  };

  // Duplicate dialog properties
  showDuplicateDialog = false;
  duplicateDialogData: DuplicateProgramData | null = null;

  selectedTab: 'overview' | 'exercises' | 'stats' | 'history' = 'overview';
  expandedExercises: Set<string> = new Set();

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (this.program) {
      // Expand first exercise by default
      if (this.program.exercises.length > 0) {
        this.expandedExercises.add(this.program.exercises[0].id);
      }
    }
  }

  onEditProgram(): void {
    if (this.program) {
      this.editProgram.emit(this.program);
    }
  }

  onDeleteProgram(): void {
    if (this.program) {
      this.deleteDialogData.message = `Are you sure you want to delete "${this.program.name}"? This action cannot be undone.`;
      this.showDeleteDialog = true;
    }
  }

  onConfirmDelete(): void {
    if (this.program) {
      this.deleteProgram.emit(this.program);
      this.closeDeleteDialog();
    }
  }

  onCancelDelete(): void {
    this.closeDeleteDialog();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
  }

  onDuplicateProgram(): void {
    if (this.program) {
      this.duplicateDialogData = {
        program: this.program,
        suggestedName: `${this.program.name} (Copy)`
      };
      this.showDuplicateDialog = true;
    }
  }

  onConfirmDuplicate(programName: string): void {
    if (this.program) {
      this.duplicateProgram.emit(this.program);
      this.closeDuplicateDialog();
    }
  }

  onCancelDuplicate(): void {
    this.closeDuplicateDialog();
  }

  closeDuplicateDialog(): void {
    this.showDuplicateDialog = false;
    this.duplicateDialogData = null;
  }

  onStartWorkout(): void {
    if (this.program) {
      this.startWorkout.emit(this.program);
    }
  }

  onBackToList(): void {
    this.backToList.emit();
  }

  selectTab(tab: 'overview' | 'exercises' | 'stats' | 'history'): void {
    this.selectedTab = tab;
  }

  toggleExerciseExpansion(exerciseId: string): void {
    if (this.expandedExercises.has(exerciseId)) {
      this.expandedExercises.delete(exerciseId);
    } else {
      this.expandedExercises.add(exerciseId);
    }
  }

  isExerciseExpanded(exerciseId: string): boolean {
    return this.expandedExercises.has(exerciseId);
  }

  getDifficultyColor(difficulty: ProgramDifficulty): string {
    switch (difficulty) {
      case 'beginner': return '#28a745';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getCategoryIcon(program: Program): string {
    const tags = program.metadata?.tags || [];
    const muscleGroups = program.metadata?.targetMuscleGroups || [];
    
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

  getTotalDuration(): number {
    if (!this.program || !this.program.exercises || this.program.exercises.length === 0) {
      return this.program?.metadata?.estimatedDuration || 0;
    }

    return this.program.exercises.reduce((total, exercise) => {
      const exerciseTime = (exercise.sets * exercise.reps * 3) + (exercise.sets * exercise.restTime);
      return total + exerciseTime;
    }, 0) / 60; // Convert to minutes
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      }
      return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
    }
  }

  getTotalVolume(): number {
    if (!this.program || !this.program.exercises) return 0;
    
    return this.program.exercises.reduce((total, exercise) => {
      return total + (exercise.sets * exercise.reps * exercise.weight);
    }, 0);
  }

  getTotalSets(): number {
    if (!this.program || !this.program.exercises) return 0;
    
    return this.program.exercises.reduce((total, exercise) => {
      return total + exercise.sets;
    }, 0);
  }

  getTotalReps(): number {
    if (!this.program || !this.program.exercises) return 0;
    
    return this.program.exercises.reduce((total, exercise) => {
      return total + (exercise.sets * exercise.reps);
    }, 0);
  }

  getAverageRestTime(): number {
    if (!this.program || !this.program.exercises || this.program.exercises.length === 0) return 0;
    
    const totalRestTime = this.program.exercises.reduce((total, exercise) => {
      return total + exercise.restTime;
    }, 0);
    
    return Math.round(totalRestTime / this.program.exercises.length);
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

  getProgramStats() {
    if (!this.program) return null;

    return {
      totalExercises: this.program.exercises?.length || 0,
      totalDuration: this.formatDuration(this.getTotalDuration()),
      totalVolume: this.getTotalVolume(),
      totalSets: this.getTotalSets(),
      totalReps: this.getTotalReps(),
      averageRestTime: this.formatRestTime(this.getAverageRestTime()),
      difficulty: this.program.difficulty.charAt(0).toUpperCase() + this.program.difficulty.slice(1),
      category: this.getCategoryFromTags(),
      equipment: this.program.metadata?.equipment || [],
      muscleGroups: this.program.metadata?.targetMuscleGroups || [],
      tags: this.program.metadata?.tags || []
    };
  }

  getCategoryFromTags(): string {
    if (!this.program?.metadata?.tags) return 'Mixed';
    
    const tags = this.program.metadata.tags;
    
    if (tags.includes('strength')) return 'Strength Training';
    if (tags.includes('hiit')) return 'HIIT';
    if (tags.includes('cardio')) return 'Cardio';
    if (tags.includes('flexibility')) return 'Flexibility';
    if (tags.includes('yoga')) return 'Yoga';
    
    return 'Mixed';
  }

  getMuscleGroupColor(muscleGroup: string): string {
    const colors = [
      '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1',
      '#fd7e14', '#20c997', '#e83e8c', '#6c757d', '#17a2b8'
    ];
    
    const index = muscleGroup.length % colors.length;
    return colors[index];
  }

  getEquipmentIcon(equipment: string): string {
    const iconMap: { [key: string]: string } = {
      'bodyweight': 'fas fa-user',
      'dumbbell': 'fas fa-dumbbell',
      'barbell': 'fas fa-weight-hanging',
      'kettlebell': 'fas fa-circle',
      'resistance band': 'fas fa-elastic',
      'treadmill': 'fas fa-running',
      'bike': 'fas fa-bicycle',
      'rower': 'fas fa-water',
      'bench': 'fas fa-couch',
      'mat': 'fas fa-square',
      'pull-up bar': 'fas fa-grip-lines',
      'cable machine': 'fas fa-cogs'
    };
    
    return iconMap[equipment.toLowerCase()] || 'fas fa-dumbbell';
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
}
