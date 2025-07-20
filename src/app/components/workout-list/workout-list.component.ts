import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.scss']
})
export class WorkoutListComponent implements OnInit {
  @Input() workouts: any[] = [];
  @Input() loading = false;
  @Input() showActions = true;
  
  @Output() editWorkout = new EventEmitter<any>();
  @Output() deleteWorkout = new EventEmitter<any>();
  @Output() duplicateWorkout = new EventEmitter<any>();
  @Output() viewWorkout = new EventEmitter<any>();
  @Output() startWorkout = new EventEmitter<any>();
  @Output() createWorkout = new EventEmitter<void>();

  // Confirmation dialog properties
  showDeleteDialog = false;
  deleteDialogData: any = {
    title: 'Delete Workout',
    message: 'Are you sure you want to delete this workout? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
    showIcon: true
  };
  workoutToDelete: any | null = null;

  // Duplicate dialog properties
  showDuplicateDialog = false;
  duplicateDialogData: any | null = null;

  filteredWorkouts: any[] = [];
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

  // Available filter options (populated from workouts)
  availableMuscleGroups: string[] = [];
  availableTags: string[] = [];
  availableEquipment: string[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.populateFilterOptions();
    this.filteredWorkouts = [...this.workouts];
    this.applyFilters();
  }

  ngOnChanges(): void {
    this.populateFilterOptions();
    this.filteredWorkouts = [...this.workouts];
    this.applyFilters();
  }

  private populateFilterOptions(): void {
    const muscleGroups = new Set<string>();
    const tags = new Set<string>();
    const equipment = new Set<string>();

    this.workouts.forEach(workout => {
      // Collect muscle groups
      if (workout.targetMuscleGroups) {
        workout.targetMuscleGroups.forEach(mg => muscleGroups.add(mg));
      }

      // Collect tags
      if (workout.tags) {
        workout.tags.forEach(tag => tags.add(tag));
      }

      // Collect equipment
      if (workout.equipment) {
        workout.equipment.forEach(eq => equipment.add(eq));
      }
    });

    this.availableMuscleGroups = Array.from(muscleGroups).sort();
    this.availableTags = Array.from(tags).sort();
    this.availableEquipment = Array.from(equipment).sort();
  }

  applyFilters(): void {
    let filtered = [...this.workouts];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(workout => 
        workout.name.toLowerCase().includes(search) ||
        workout.description?.toLowerCase().includes(search) ||
        workout.tags?.some(tag => tag.toLowerCase().includes(search)) ||
        workout.targetMuscleGroups?.some(mg => mg.toLowerCase().includes(search)) ||
        workout.equipment?.some(eq => eq.toLowerCase().includes(search))
      );
    }

    // Apply muscle groups filter
    if (this.selectedMuscleGroups.length > 0) {
      filtered = filtered.filter(workout => 
        workout.targetMuscleGroups?.some(mg => 
          this.selectedMuscleGroups.includes(mg)
        )
      );
    }

    // Apply tags filter
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(workout => 
        workout.tags?.some(tag => 
          this.selectedTags.includes(tag)
        )
      );
    }

    // Apply duration filter
    if (this.selectedDuration !== 'all') {
      filtered = filtered.filter(workout => {
        const duration = this.getTotalDuration(workout);
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
      filtered = filtered.filter(workout => 
        workout.equipment?.some(eq => 
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

    this.filteredWorkouts = filtered;
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

  onEditWorkout(workout: any): void {
    this.editWorkout.emit(workout);
  }

  onDeleteWorkout(workout: any): void {
    this.workoutToDelete = workout;
    this.deleteDialogData.message = `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (this.workoutToDelete) {
      this.deleteWorkout.emit(this.workoutToDelete);
      this.closeDeleteDialog();
    }
  }

  onCancelDelete(): void {
    this.closeDeleteDialog();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.workoutToDelete = null;
  }

  onDuplicateWorkout(workout: any): void {
    this.duplicateDialogData = {
      workout: workout,
      suggestedName: `${workout.name} (Copy)`
    };
    this.showDuplicateDialog = true;
  }

  onConfirmDuplicate(workoutName: string): void {
    if (this.duplicateDialogData) {
      this.duplicateWorkout.emit(this.duplicateDialogData.workout);
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

  onViewWorkout(workout: any): void {
    console.log('onViewWorkout called', workout);
    this.router.navigate(['/workout-detail', workout.id]);
  }

  onStartWorkout(workout: any): void {
    this.startWorkout.emit(workout);
  }

  onCreateWorkout(): void {
    this.createWorkout.emit();
  }

  getExerciseCount(workout: any): number {
    return workout.exercises?.length || 0;
  }

  getTotalDuration(workout: any): number {
    if (!workout.exercises || workout.exercises.length === 0) {
      return workout.estimatedDuration || 0;
    }

    return workout.exercises.reduce((total: number, exercise: any) => {
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

  getWorkoutStats(workout: any): { exercises: number; duration: string } {
    return {
      exercises: this.getExerciseCount(workout),
      duration: this.formatDuration(this.getTotalDuration(workout))
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
