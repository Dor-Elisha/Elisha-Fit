import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ExerciseService } from '../../../services/exercise.service';

@Component({
  selector: 'app-exercise-selector',
  templateUrl: './exercise-selector.component.html',
  styleUrls: ['./exercise-selector.component.scss']
})
export class ExerciseSelectorComponent implements OnInit {
  @Input() selectedExercises: any[] = [];
  @Output() selectedExercisesChange = new EventEmitter<any[]>();

  exercises: any[] = [];
  filteredExercises: any[] = [];
  categories: string[] = [];
  muscleGroups: string[] = [];
  
  searchControl = new FormControl('');
  selectedCategory = '';
  selectedMuscleGroup = '';

  constructor(private exerciseService: ExerciseService) {}

  ngOnInit(): void {
    this.loadExercises();
    this.setupSearch();
  }

  loadExercises() {
    this.exerciseService.getExercises().subscribe((data: any) => {
      this.exercises = data.exercises || [];
      this.filteredExercises = [...this.exercises];
      
      // Extract unique categories and muscle groups
      this.categories = [...new Set(this.exercises.map(ex => ex.category).filter(Boolean))];
      this.muscleGroups = [...new Set(this.exercises.flatMap(ex => ex.primaryMuscles || []))];
    });
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters() {
    let filtered = [...this.exercises];
    
    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(ex => ex.category === this.selectedCategory);
    }
    
    // Apply muscle group filter
    if (this.selectedMuscleGroup) {
      filtered = filtered.filter(ex => 
        ex.primaryMuscles?.includes(this.selectedMuscleGroup)
      );
    }
    
    this.filteredExercises = filtered;
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onMuscleGroupChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchControl.setValue('');
    this.selectedCategory = '';
    this.selectedMuscleGroup = '';
    this.applyFilters();
  }

  toggleExercise(ex: any) {
    const idx = this.selectedExercises.findIndex(e => e.id === ex.id);
    if (idx > -1) {
      this.selectedExercises.splice(idx, 1);
    } else {
      this.selectedExercises.push(ex);
    }
    this.selectedExercisesChange.emit([...this.selectedExercises]);
  }

  isSelected(ex: any): boolean {
    return this.selectedExercises.some(e => e.id === ex.id);
  }

  get selectedExerciseNames(): string {
    return this.selectedExercises.map(e => e.name).join(', ');
  }
}
