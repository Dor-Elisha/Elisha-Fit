import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { ExerciseService } from 'src/app/services/exercise.service';

@Component({
  selector: 'app-exercise-selector',
  templateUrl: './exercise-selector.component.html',
  styleUrls: ['./exercise-selector.component.scss']
})
export class ExerciseSelectorComponent implements OnInit, OnDestroy {
  @Input() config: any = {};
  @Input() selectedExercises: any[] = [];
  @Input() placeholder: string = 'Search exercises...';
  @Input() loading: boolean = false;
  
  @Output() exercisesSelected = new EventEmitter<any[]>();
  @Output() exerciseRemoved = new EventEmitter<any>();
  @Output() loadingChange = new EventEmitter<boolean>();

  // Data
  allExercises: any[] = [];
  filteredExercises: any[] = [];
  
  // Search and filters
  searchControl = new FormControl('');
  selectedCategory: string = '';
  selectedMuscleGroup: string = '';
  selectedEquipment: string = '';
  
  // Available filter options
  categories: string[] = [];
  muscleGroups: string[] = [];
  equipment: string[] = [];
  
  // UI state
  showFilters: boolean = false;
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'name' | 'category' | 'level' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 1;
  
  // Image navigation
  exerciseImageIndices: { [exerciseId: string]: number } = {};
  
  private destroy$ = new Subject<void>();

  constructor(private exerciseService: ExerciseService) {}

  ngOnInit(): void {
    this.loadExercises();
    this.setupSearchAndFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadExercises(): void {
    this.loadingChange.emit(true);
    // Load exercises and filter options in parallel
    combineLatest([
      this.exerciseService.getExercises({}),
      this.exerciseService.getCategories(),
      this.exerciseService.getMuscleGroups(),
      this.exerciseService.getEquipment()
    ]).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([exercises, categories, muscleGroups, equipment]) => {
          this.allExercises = exercises.exercises;
          this.filteredExercises = exercises.exercises;
          this.categories = categories;
          this.muscleGroups = muscleGroups;
          this.equipment = equipment;
          this.applyFilters();
          this.loadingChange.emit(false);
        },
        error: (error) => {
          console.error('Error loading exercises:', error);
          this.loadingChange.emit(false);
        }
      });
  }

  private setupSearchAndFilters(): void {
    // Combine search and filter changes
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      ),
      new Subject<string>().pipe(startWith('')) // Placeholder for filter changes
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    let filtered = [...this.allExercises];

    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.category.toLowerCase().includes(searchTerm) ||
        exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(searchTerm)) ||
        exercise.secondaryMuscles.some(muscle => muscle.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(exercise => exercise.category === this.selectedCategory);
    }

    // Apply muscle group filter
    if (this.selectedMuscleGroup) {
      filtered = filtered.filter(exercise =>
        exercise.primaryMuscles.includes(this.selectedMuscleGroup) ||
        exercise.secondaryMuscles.includes(this.selectedMuscleGroup)
      );
    }

    // Apply equipment filter
    if (this.selectedEquipment) {
      filtered = filtered.filter(exercise => exercise.equipment === this.selectedEquipment);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'level':
          aValue = a.level;
          bValue = b.level;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (this.sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    this.filteredExercises = filtered;
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredExercises.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  get paginatedExercises(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredExercises.slice(startIndex, endIndex);
  }

  // Filter methods
  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onMuscleGroupChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMuscleGroup = target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onEquipmentChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedEquipment = target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedMuscleGroup = '';
    this.selectedEquipment = '';
    this.searchControl.setValue('');
    this.currentPage = 1;
    this.applyFilters();
  }

  // Selection methods
  toggleExerciseSelection(exercise: any): void {
    if (!exercise.exerciseId && exercise.id) {
      exercise.exerciseId = exercise.id;
    }
    if (this.config.multiple) {
      const index = this.selectedExercises.findIndex(e => e.name === exercise.name);
      if (index > -1) {
        this.selectedExercises.splice(index, 1);
        this.exerciseRemoved.emit(exercise);
      } else {
        if (!this.config.maxSelections || this.selectedExercises.length < this.config.maxSelections) {
          this.selectedExercises.push(exercise);
          this.exercisesSelected.emit([...this.selectedExercises]);
        }
      }
    } else {
      this.selectedExercises = [exercise];
      this.exercisesSelected.emit([...this.selectedExercises]);
    }
  }

  isExerciseSelected(exercise: any): boolean {
    return this.selectedExercises.some(e => e.name === exercise.name);
  }

  removeSelectedExercise(exercise: any): void {
    const index = this.selectedExercises.findIndex(e => e.name === exercise.name);
    if (index > -1) {
      this.selectedExercises.splice(index, 1);
      this.exerciseRemoved.emit(exercise);
    }
  }

  // UI methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value as 'name' | 'category' | 'level';
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Utility methods
  getMuscleGroupsText(exercise: any): string {
    return [...new Set([...exercise.primaryMuscles, ...exercise.secondaryMuscles])].join(', ');
  }

  // Make Math available in template
  Math = Math;

  getDifficultyColor(level: string): string {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'expert': return 'danger';
      default: return 'secondary';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'strength': return 'fas fa-dumbbell';
      case 'cardio': return 'fas fa-heartbeat';
      case 'stretching': return 'fas fa-child';
      case 'olympic_weightlifting': return 'fas fa-weight-hanging';
      case 'strongman': return 'fas fa-user-ninja';
      case 'powerlifting': return 'fas fa-fire';
      case 'plyometrics': return 'fas fa-running';
      default: return 'fas fa-dumbbell';
    }
  }

  onImageError(event: Event, exercise: any): void {
    // Hide the image and show the icon instead
    const imgElement = event.target as HTMLImageElement;
    const imageContainer = imgElement.closest('.exercise-image, .item-image') as HTMLElement;
    const iconContainer = imageContainer?.nextElementSibling as HTMLElement;
    
    if (imageContainer && iconContainer) {
      imageContainer.style.display = 'none';
      iconContainer.style.display = 'flex';
    }
  }

  // Image navigation methods
  getCurrentImageIndex(exercise: any): number {
    return this.exerciseImageIndices[exercise.name] || 0;
  }

  getCurrentImage(exercise: any): string {
    const index = this.getCurrentImageIndex(exercise);
    return exercise.images[index] || exercise.images[0] || '';
  }

  hasMultipleImages(exercise: any): boolean {
    return exercise.images && exercise.images.length > 1;
  }

  nextImage(event: Event, exercise: any): void {
    event.stopPropagation(); // Prevent card selection
    const currentIndex = this.getCurrentImageIndex(exercise);
    const maxIndex = exercise.images.length - 1;
    this.exerciseImageIndices[exercise.name] = currentIndex < maxIndex ? currentIndex + 1 : 0;
  }

  previousImage(event: Event, exercise: any): void {
    event.stopPropagation(); // Prevent card selection
    const currentIndex = this.getCurrentImageIndex(exercise);
    const maxIndex = exercise.images.length - 1;
    this.exerciseImageIndices[exercise.name] = currentIndex > 0 ? currentIndex - 1 : maxIndex;
  }
} 