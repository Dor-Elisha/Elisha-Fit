import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-program-list',
  templateUrl: './program-list.component.html',
  styleUrls: ['./program-list.component.scss']
})
export class ProgramListComponent implements OnInit {
  @Input() programs: any[] = [];
  @Input() loading = false;
  @Input() showActions = true;
  
  @Output() editProgram = new EventEmitter<any>();
  @Output() deleteProgram = new EventEmitter<any>();
  @Output() duplicateProgram = new EventEmitter<any>();
  @Output() viewProgram = new EventEmitter<any>();
  @Output() startWorkout = new EventEmitter<any>();
  @Output() createProgram = new EventEmitter<void>();

  // Confirmation dialog properties
  showDeleteDialog = false;
  deleteDialogData: any = {
    title: 'Delete Program',
    message: 'Are you sure you want to delete this program? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
    showIcon: true
  };
  programToDelete: any | null = null;

  // Duplicate dialog properties
  showDuplicateDialog = false;
  duplicateDialogData: any | null = null;

  filteredPrograms: any[] = [];
  searchTerm = '';
  selectedMuscleGroups: string[] = [];
  selectedTags: string[] = [];
  selectedDuration: 'all' | 'short' | 'medium' | 'long' = 'all';
  selectedEquipment: string[] = [];
  sortBy: 'name' | 'createdAt' | 'duration' | 'exercises' = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  showAdvancedFilters = false;

  sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Date Created' },
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

  constructor(private router: Router) {}

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
      if (program.targetMuscleGroups) {
        program.targetMuscleGroups.forEach(mg => muscleGroups.add(mg));
      }

      // Collect tags
      if (program.tags) {
        program.tags.forEach(tag => tags.add(tag));
      }

      // Collect equipment
      if (program.equipment) {
        program.equipment.forEach(eq => equipment.add(eq));
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
        program.tags?.some(tag => tag.toLowerCase().includes(search)) ||
        program.targetMuscleGroups?.some(mg => mg.toLowerCase().includes(search)) ||
        program.equipment?.some(eq => eq.toLowerCase().includes(search))
      );
    }

    // Apply muscle groups filter
    if (this.selectedMuscleGroups.length > 0) {
      filtered = filtered.filter(program => 
        program.targetMuscleGroups?.some(mg => 
          this.selectedMuscleGroups.includes(mg)
        )
      );
    }

    // Apply tags filter
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(program => 
        program.tags?.some(tag => 
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
        program.equipment?.some(eq => 
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

  onSearchChange(): void {
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

  onEditProgram(program: any): void {
    this.editProgram.emit(program);
  }

  onDeleteProgram(program: any): void {
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

  onDuplicateProgram(program: any): void {
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

  onViewProgram(program: any): void {
    console.log('onViewProgram called', program);
    this.router.navigate(['/program-detail', program.id]);
  }

  onStartWorkout(program: any): void {
    this.startWorkout.emit(program);
  }

  onCreateProgram(): void {
    this.createProgram.emit();
  }

  getExerciseCount(program: any): number {
    return program.exercises?.length || 0;
  }

  getTotalDuration(program: any): number {
    if (!program.exercises || program.exercises.length === 0) {
      return program.estimatedDuration || 0;
    }

    return program.exercises.reduce((total: number, exercise: any) => {
      const exerciseTime = (exercise.sets * exercise.reps * 3) + (exercise.sets * exercise.rest);
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

  getProgramStats(program: any): { exercises: number; duration: string } {
    return {
      exercises: this.getExerciseCount(program),
      duration: this.formatDuration(this.getTotalDuration(program))
    };
  }

  clearFilters(): void {
    this.searchTerm = '';
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
           this.selectedMuscleGroups.length > 0 ||
           this.selectedTags.length > 0 ||
           this.selectedDuration !== 'all' ||
           this.selectedEquipment.length > 0;
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTerm.trim() !== '') count++;
    if (this.selectedMuscleGroups.length > 0) count += this.selectedMuscleGroups.length;
    if (this.selectedTags.length > 0) count += this.selectedTags.length;
    if (this.selectedDuration !== 'all') count++;
    if (this.selectedEquipment.length > 0) count += this.selectedEquipment.length;
    return count;
  }
}
