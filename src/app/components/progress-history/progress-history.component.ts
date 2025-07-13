import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { 
  ProgressEntry, 
  Program, 
  ProgressFilters,
  ExerciseProgress,
  SetProgress
} from '../../models/program.interface';

@Component({
  selector: 'app-progress-history',
  templateUrl: './progress-history.component.html',
  styleUrls: ['./progress-history.component.scss']
})
export class ProgressHistoryComponent implements OnInit {
  @Input() progressEntries: ProgressEntry[] = [];
  @Input() programs: Program[] = [];
  @Input() loading: boolean = false;
  @Output() viewDetails = new EventEmitter<ProgressEntry>();
  @Output() deleteEntry = new EventEmitter<ProgressEntry>();
  @Output() exportData = new EventEmitter<ProgressEntry[]>();

  // Filter and sort properties
  selectedProgramId: string = '';
  selectedDateRange: string = 'all';
  selectedRating: number = 0;
  sortBy: string = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  showCompletedOnly: boolean = true;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Date range options
  dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  // Sort options
  sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'duration', label: 'Duration' },
    { value: 'rating', label: 'Rating' },
    { value: 'program', label: 'Program' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize with default filters
  }

  get filteredEntries(): ProgressEntry[] {
    let filtered = [...this.progressEntries];

    // Filter by program
    if (this.selectedProgramId) {
      filtered = filtered.filter(entry => entry.programId === this.selectedProgramId);
    }

    // Filter by date range
    if (this.selectedDateRange !== 'all') {
      const now = new Date();
      const startDate = this.getStartDate(this.selectedDateRange, now);
      filtered = filtered.filter(entry => new Date(entry.workoutDate) >= startDate);
    }

    // Filter by rating
    if (this.selectedRating > 0) {
      filtered = filtered.filter(entry => entry.rating === this.selectedRating);
    }

    // Filter by completion status
    if (this.showCompletedOnly) {
      filtered = filtered.filter(entry => entry.completed);
    }

    // Sort entries
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'date':
          comparison = new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime();
          break;
        case 'duration':
          comparison = a.totalDuration - b.totalDuration;
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'program':
          const programA = this.getProgramName(a.programId);
          const programB = this.getProgramName(b.programId);
          comparison = programA.localeCompare(programB);
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  get paginatedEntries(): ProgressEntry[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredEntries.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEntries.length / this.itemsPerPage);
  }

  get hasActiveFilters(): boolean {
    return this.selectedProgramId !== '' || 
           this.selectedDateRange !== 'all' || 
           this.selectedRating > 0 || 
           this.showCompletedOnly;
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.selectedProgramId !== '') count++;
    if (this.selectedDateRange !== 'all') count++;
    if (this.selectedRating > 0) count++;
    if (this.showCompletedOnly) count++;
    return count;
  }

  onProgramFilterChange(): void {
    this.currentPage = 1;
  }

  onDateRangeChange(): void {
    this.currentPage = 1;
  }

  onRatingFilterChange(): void {
    this.currentPage = 1;
  }

  onSortChange(): void {
    this.currentPage = 1;
  }

  onSortOrderToggle(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.currentPage = 1;
  }

  onCompletionFilterChange(): void {
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.selectedProgramId = '';
    this.selectedDateRange = 'all';
    this.selectedRating = 0;
    this.showCompletedOnly = true;
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onViewDetails(entry: ProgressEntry): void {
    this.viewDetails.emit(entry);
  }

  onDeleteEntry(entry: ProgressEntry): void {
    this.deleteEntry.emit(entry);
  }

  onExportData(): void {
    this.exportData.emit(this.filteredEntries);
  }

  getProgramName(programId: string): string {
    const program = this.programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  }

  getProgramDifficulty(programId: string): string {
    const program = this.programs.find(p => p.id === programId);
    return program ? program.difficulty : '';
  }

  getTotalExercises(entry: ProgressEntry): number {
    return entry.exercises.length;
  }

  getTotalSets(entry: ProgressEntry): number {
    return entry.exercises.reduce((total, exercise) => {
      return total + exercise.sets.length;
    }, 0);
  }

  getCompletedSets(entry: ProgressEntry): number {
    return entry.exercises.reduce((total, exercise) => {
      return total + exercise.sets.filter(set => set.completed).length;
    }, 0);
  }

  getAverageWeight(entry: ProgressEntry): number {
    const allWeights = entry.exercises.flatMap(exercise => 
      exercise.sets.map(set => set.weight)
    );
    
    if (allWeights.length === 0) return 0;
    
    const sum = allWeights.reduce((total, weight) => total + weight, 0);
    return Math.round(sum / allWeights.length);
  }

  getAverageReps(entry: ProgressEntry): number {
    const allReps = entry.exercises.flatMap(exercise => 
      exercise.sets.map(set => set.reps)
    );
    
    if (allReps.length === 0) return 0;
    
    const sum = allReps.reduce((total, reps) => total + reps, 0);
    return Math.round(sum / allReps.length);
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getFormattedTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFormattedDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  getRatingStars(rating: number | undefined): boolean[] {
    const stars = [false, false, false, false, false];
    if (rating) {
      for (let i = 0; i < rating; i++) {
        stars[i] = true;
      }
    }
    return stars;
  }

  getCompletionPercentage(entry: ProgressEntry): number {
    const totalSets = this.getTotalSets(entry);
    const completedSets = this.getCompletedSets(entry);
    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  }

  getCompletionColor(percentage: number): string {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'danger';
  }

  private getStartDate(range: string, now: Date): Date {
    const start = new Date(now);
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(start.getMonth() / 3);
        start.setMonth(quarter * 3);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
    }
    
    return start;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  getMath(): any {
    return Math;
  }
}
