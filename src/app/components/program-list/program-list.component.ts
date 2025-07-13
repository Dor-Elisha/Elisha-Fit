import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Program, ProgramDifficulty } from '../../models/program.interface';
import { ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { DuplicateProgramData } from '../duplicate-program-dialog/duplicate-program-dialog.component';

@Component({
  selector: 'app-program-list',
  templateUrl: './program-list.component.html',
  styleUrls: ['./program-list.component.scss']
})
export class ProgramListComponent implements OnInit {
  @Input() programs: Program[] = [];
  @Input() loading = false;
  @Input() showActions = true;
  
  @Output() editProgram = new EventEmitter<Program>();
  @Output() deleteProgram = new EventEmitter<Program>();
  @Output() duplicateProgram = new EventEmitter<Program>();
  @Output() viewProgram = new EventEmitter<Program>();
  @Output() startWorkout = new EventEmitter<Program>();

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
  programToDelete: Program | null = null;

  // Duplicate dialog properties
  showDuplicateDialog = false;
  duplicateDialogData: DuplicateProgramData | null = null;

  filteredPrograms: Program[] = [];
  searchTerm = '';
  selectedDifficulty: ProgramDifficulty | 'all' = 'all';
  selectedMuscleGroups: string[] = [];
  selectedTags: string[] = [];
  selectedDuration: 'all' | 'short' | 'medium' | 'long' = 'all';
  selectedEquipment: string[] = [];
  sortBy: 'name' | 'createdAt' | 'difficulty' | 'duration' | 'exercises' = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  showAdvancedFilters = false;

  difficulties = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'duration', label: 'Duration' },
    { value: 'exercises', label: 'Exercise Count' }
  ];

  durationOptions = [
    { value: 'all', label: 'All Durations' },
    { value: 'short', label: 'Short (< 30 min)' },
    { value: 'medium', label: 'Medium (30-60 min)' },
    { value: 'long', label: 'Long (> 60 min)' }
  ];

  // Available filter options (populated from programs)
  availableMuscleGroups: string[] = [];
  availableTags: string[] = [];
  availableEquipment: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.populateFilterOptions();
    this.filteredPrograms = [...this.programs];
    this.applyFilters();
  }

  ngOnChanges(): void {
    this.populateFilterOptions();
    this.filteredPrograms = [...this.programs];
    this.applyFilters();
  }

  private populateFilterOptions(): void {
    const muscleGroups = new Set<string>();
    const tags = new Set<string>();
    const equipment = new Set<string>();

    this.programs.forEach(program => {
      // Collect muscle groups
      if (program.metadata?.targetMuscleGroups) {
        program.metadata.targetMuscleGroups.forEach(mg => muscleGroups.add(mg));
      }

      // Collect tags
      if (program.metadata?.tags) {
        program.metadata.tags.forEach(tag => tags.add(tag));
      }

      // Collect equipment
      if (program.metadata?.equipment) {
        program.metadata.equipment.forEach(eq => equipment.add(eq));
      }
    });

    this.availableMuscleGroups = Array.from(muscleGroups).sort();
    this.availableTags = Array.from(tags).sort();
    this.availableEquipment = Array.from(equipment).sort();
  }

  applyFilters(): void {
    let filtered = [...this.programs];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(program => 
        program.name.toLowerCase().includes(search) ||
        program.description?.toLowerCase().includes(search) ||
        program.metadata?.tags?.some(tag => tag.toLowerCase().includes(search)) ||
        program.metadata?.targetMuscleGroups?.some(mg => mg.toLowerCase().includes(search)) ||
        program.metadata?.equipment?.some(eq => eq.toLowerCase().includes(search))
      );
    }

    // Apply difficulty filter
    if (this.selectedDifficulty !== 'all') {
      filtered = filtered.filter(program => program.difficulty === this.selectedDifficulty);
    }

    // Apply muscle groups filter
    if (this.selectedMuscleGroups.length > 0) {
      filtered = filtered.filter(program => 
        program.metadata?.targetMuscleGroups?.some(mg => 
          this.selectedMuscleGroups.includes(mg)
        )
      );
    }

    // Apply tags filter
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(program => 
        program.metadata?.tags?.some(tag => 
          this.selectedTags.includes(tag)
        )
      );
    }

    // Apply duration filter
    if (this.selectedDuration !== 'all') {
      filtered = filtered.filter(program => {
        const duration = this.getTotalDuration(program);
        switch (this.selectedDuration) {
          case 'short': return duration < 30;
          case 'medium': return duration >= 30 && duration <= 60;
          case 'long': return duration > 60;
          default: return true;
        }
      });
    }

    // Apply equipment filter
    if (this.selectedEquipment.length > 0) {
      filtered = filtered.filter(program => 
        program.metadata?.equipment?.some(eq => 
          this.selectedEquipment.includes(eq)
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'difficulty':
          aValue = this.getDifficultyOrder(a.difficulty);
          bValue = this.getDifficultyOrder(b.difficulty);
          break;
        case 'duration':
          aValue = this.getTotalDuration(a);
          bValue = this.getTotalDuration(b);
          break;
        case 'exercises':
          aValue = this.getExerciseCount(a);
          bValue = this.getExerciseCount(b);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredPrograms = filtered;
  }

  getDifficultyOrder(difficulty: ProgramDifficulty): number {
    switch (difficulty) {
      case 'beginner': return 1;
      case 'intermediate': return 2;
      case 'advanced': return 3;
      default: return 0;
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onDifficultyChange(): void {
    this.applyFilters();
  }

  onMuscleGroupChange(muscleGroup: string, checked: boolean): void {
    if (checked) {
      this.selectedMuscleGroups.push(muscleGroup);
    } else {
      this.selectedMuscleGroups = this.selectedMuscleGroups.filter(mg => mg !== muscleGroup);
    }
    this.applyFilters();
  }

  onTagChange(tag: string, checked: boolean): void {
    if (checked) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    }
    this.applyFilters();
  }

  onDurationChange(): void {
    this.applyFilters();
  }

  onEquipmentChange(equipment: string, checked: boolean): void {
    if (checked) {
      this.selectedEquipment.push(equipment);
    } else {
      this.selectedEquipment = this.selectedEquipment.filter(eq => eq !== equipment);
    }
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onEditProgram(program: Program): void {
    this.editProgram.emit(program);
  }

  onDeleteProgram(program: Program): void {
    this.programToDelete = program;
    this.deleteDialogData.message = `Are you sure you want to delete "${program.name}"? This action cannot be undone.`;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (this.programToDelete) {
      this.deleteProgram.emit(this.programToDelete);
      this.closeDeleteDialog();
    }
  }

  onCancelDelete(): void {
    this.closeDeleteDialog();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.programToDelete = null;
  }

  onDuplicateProgram(program: Program): void {
    this.duplicateDialogData = {
      program: program,
      suggestedName: `${program.name} (Copy)`
    };
    this.showDuplicateDialog = true;
  }

  onConfirmDuplicate(programName: string): void {
    if (this.duplicateDialogData) {
      this.duplicateProgram.emit(this.duplicateDialogData.program);
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

  onViewProgram(program: Program): void {
    this.viewProgram.emit(program);
  }

  onStartWorkout(program: Program): void {
    this.startWorkout.emit(program);
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
    // Use tags or muscle groups to determine category
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
      return 'fas fa-layer-group'; // mixed
    }
  }

  getExerciseCount(program: Program): number {
    return program.exercises?.length || 0;
  }

  getTotalDuration(program: Program): number {
    if (!program.exercises || program.exercises.length === 0) {
      return program.metadata?.estimatedDuration || 0;
    }

    return program.exercises.reduce((total, exercise) => {
      const exerciseTime = (exercise.sets * exercise.reps * 3) + (exercise.sets * exercise.restTime);
      return total + exerciseTime;
    }, 0) / 60; // Convert to minutes
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  getProgramStats(program: Program): { exercises: number; duration: string; difficulty: string } {
    return {
      exercises: this.getExerciseCount(program),
      duration: this.formatDuration(this.getTotalDuration(program)),
      difficulty: program.difficulty.charAt(0).toUpperCase() + program.difficulty.slice(1)
    };
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDifficulty = 'all';
    this.selectedMuscleGroups = [];
    this.selectedTags = [];
    this.selectedDuration = 'all';
    this.selectedEquipment = [];
    this.sortBy = 'createdAt';
    this.sortOrder = 'desc';
    this.showAdvancedFilters = false;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || 
           this.selectedDifficulty !== 'all' ||
           this.selectedMuscleGroups.length > 0 ||
           this.selectedTags.length > 0 ||
           this.selectedDuration !== 'all' ||
           this.selectedEquipment.length > 0;
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTerm.trim() !== '') count++;
    if (this.selectedDifficulty !== 'all') count++;
    if (this.selectedMuscleGroups.length > 0) count += this.selectedMuscleGroups.length;
    if (this.selectedTags.length > 0) count += this.selectedTags.length;
    if (this.selectedDuration !== 'all') count++;
    if (this.selectedEquipment.length > 0) count += this.selectedEquipment.length;
    return count;
  }
}
