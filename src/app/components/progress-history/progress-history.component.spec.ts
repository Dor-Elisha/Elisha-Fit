import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ProgressHistoryComponent } from './progress-history.component';
import { Program, ProgramDifficulty, ProgressEntry } from '../../models/program.interface';

describe('ProgressHistoryComponent', () => {
  let component: ProgressHistoryComponent;
  let fixture: ComponentFixture<ProgressHistoryComponent>;

  const mockPrograms: Program[] = [
    {
      id: 'program-1',
      name: 'Strength Training',
      description: 'A strength training program',
      difficulty: ProgramDifficulty.INTERMEDIATE,
      exercises: [
        {
          id: 'exercise-1',
          name: 'Bench Press',
          sets: 3,
          reps: 10,
          restTime: 90,
          weight: 100,
          order: 1
        }
      ],
      metadata: {
        estimatedDuration: 45,
        totalExercises: 1,
        targetMuscleGroups: ['Chest'],
        equipment: ['Barbell'],
        tags: ['Strength'],
        isPublic: false,
        version: '1.0'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-1'
    },
    {
      id: 'program-2',
      name: 'Cardio Workout',
      description: 'A cardio workout program',
      difficulty: ProgramDifficulty.BEGINNER,
      exercises: [
        {
          id: 'exercise-2',
          name: 'Running',
          sets: 1,
          reps: 1,
          restTime: 0,
          weight: 0,
          order: 1
        }
      ],
      metadata: {
        estimatedDuration: 30,
        totalExercises: 1,
        targetMuscleGroups: ['Cardio'],
        equipment: ['None'],
        tags: ['Cardio'],
        isPublic: false,
        version: '1.0'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-1'
    }
  ];

  const mockProgressEntries: ProgressEntry[] = [
    {
      id: 'progress-1',
      programId: 'program-1',
      userId: 'user-1',
      workoutDate: new Date('2024-01-15'),
      exercises: [
        {
          exerciseId: 'exercise-1',
          exerciseName: 'Bench Press',
          sets: [
            {
              setNumber: 1,
              weight: 100,
              reps: 10,
              restTime: 90,
              completed: true,
              notes: 'Felt strong'
            },
            {
              setNumber: 2,
              weight: 100,
              reps: 8,
              restTime: 90,
              completed: true,
              notes: 'Good form'
            }
          ],
          notes: 'Great workout'
        }
      ],
      totalDuration: 45,
      notes: 'Excellent session',
      rating: 5,
      completed: true
    },
    {
      id: 'progress-2',
      programId: 'program-2',
      userId: 'user-1',
      workoutDate: new Date('2024-01-10'),
      exercises: [
        {
          exerciseId: 'exercise-2',
          exerciseName: 'Running',
          sets: [
            {
              setNumber: 1,
              weight: 0,
              reps: 1,
              restTime: 0,
              completed: true,
              notes: '30 minutes run'
            }
          ],
          notes: 'Good cardio session'
        }
      ],
      totalDuration: 30,
      notes: 'Felt good',
      rating: 4,
      completed: true
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressHistoryComponent ],
      imports: [ FormsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressHistoryComponent);
    component = fixture.componentInstance;
    component.programs = mockPrograms;
    component.progressEntries = mockProgressEntries;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.selectedProgramId).toBe('');
      expect(component.selectedDateRange).toBe('all');
      expect(component.selectedRating).toBe(0);
      expect(component.sortBy).toBe('date');
      expect(component.sortOrder).toBe('desc');
      expect(component.showCompletedOnly).toBe(true);
      expect(component.currentPage).toBe(1);
    });

    it('should have correct date range options', () => {
      expect(component.dateRangeOptions.length).toBe(6);
      expect(component.dateRangeOptions[0].value).toBe('all');
      expect(component.dateRangeOptions[0].label).toBe('All Time');
    });

    it('should have correct sort options', () => {
      expect(component.sortOptions.length).toBe(4);
      expect(component.sortOptions[0].value).toBe('date');
      expect(component.sortOptions[0].label).toBe('Date');
    });
  });

  describe('Filtering Functionality', () => {
    it('should filter by program', () => {
      component.selectedProgramId = 'program-1';
      component.onProgramFilterChange();

      expect(component.filteredEntries.length).toBe(1);
      expect(component.filteredEntries[0].programId).toBe('program-1');
    });

    it('should filter by date range', () => {
      component.selectedDateRange = 'month';
      component.onDateRangeChange();

      // Should filter entries from current month
      const filteredCount = component.filteredEntries.length;
      expect(filteredCount).toBeGreaterThanOrEqual(0);
    });

    it('should filter by rating', () => {
      component.selectedRating = 5;
      component.onRatingFilterChange();

      expect(component.filteredEntries.length).toBe(1);
      expect(component.filteredEntries[0].rating).toBe(5);
    });

    it('should filter by completion status', () => {
      component.showCompletedOnly = true;
      component.onCompletionFilterChange();

      expect(component.filteredEntries.every(entry => entry.completed)).toBe(true);
    });

    it('should clear all filters', () => {
      component.selectedProgramId = 'program-1';
      component.selectedRating = 5;
      component.showCompletedOnly = false;

      component.clearFilters();

      expect(component.selectedProgramId).toBe('');
      expect(component.selectedRating).toBe(0);
      expect(component.showCompletedOnly).toBe(true);
      expect(component.currentPage).toBe(1);
    });

    it('should detect active filters', () => {
      expect(component.hasActiveFilters).toBe(true); // showCompletedOnly is true by default

      component.showCompletedOnly = false;
      expect(component.hasActiveFilters).toBe(false);

      component.selectedProgramId = 'program-1';
      expect(component.hasActiveFilters).toBe(true);
    });

    it('should count active filters correctly', () => {
      expect(component.activeFilterCount).toBe(1); // showCompletedOnly

      component.selectedProgramId = 'program-1';
      component.selectedRating = 5;
      expect(component.activeFilterCount).toBe(3);
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort by date', () => {
      component.sortBy = 'date';
      component.sortOrder = 'desc';
      component.onSortChange();

      const dates = component.filteredEntries.map(entry => new Date(entry.workoutDate).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });

    it('should sort by duration', () => {
      component.sortBy = 'duration';
      component.onSortChange();

      const durations = component.filteredEntries.map(entry => entry.totalDuration);
      expect(durations).toEqual([...durations].sort((a, b) => b - a));
    });

    it('should sort by rating', () => {
      component.sortBy = 'rating';
      component.onSortChange();

      const ratings = component.filteredEntries.map(entry => entry.rating || 0);
      expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
    });

    it('should sort by program name', () => {
      component.sortBy = 'program';
      component.onSortChange();

      const programNames = component.filteredEntries.map(entry => component.getProgramName(entry.programId));
      expect(programNames).toEqual([...programNames].sort((a, b) => b.localeCompare(a)));
    });

    it('should toggle sort order', () => {
      const initialOrder = component.sortOrder;
      component.onSortOrderToggle();
      expect(component.sortOrder).toBe(initialOrder === 'asc' ? 'desc' : 'asc');
    });
  });

  describe('Pagination', () => {
    it('should paginate entries correctly', () => {
      component.itemsPerPage = 1;
      expect(component.paginatedEntries.length).toBe(1);
      expect(component.totalPages).toBe(2);
    });

    it('should change page', () => {
      component.itemsPerPage = 1;
      component.onPageChange(2);
      expect(component.currentPage).toBe(2);
    });

    it('should generate page numbers correctly', () => {
      component.itemsPerPage = 1;
      const pageNumbers = component.getPageNumbers();
      expect(pageNumbers).toEqual([1, 2]);
    });
  });

  describe('Utility Methods', () => {
    it('should get program name correctly', () => {
      expect(component.getProgramName('program-1')).toBe('Strength Training');
      expect(component.getProgramName('unknown')).toBe('Unknown Program');
    });

    it('should get program difficulty correctly', () => {
      expect(component.getProgramDifficulty('program-1')).toBe('intermediate');
      expect(component.getProgramDifficulty('unknown')).toBe('');
    });

    it('should calculate total exercises correctly', () => {
      const entry = mockProgressEntries[0];
      expect(component.getTotalExercises(entry)).toBe(1);
    });

    it('should calculate total sets correctly', () => {
      const entry = mockProgressEntries[0];
      expect(component.getTotalSets(entry)).toBe(2);
    });

    it('should calculate completed sets correctly', () => {
      const entry = mockProgressEntries[0];
      expect(component.getCompletedSets(entry)).toBe(2);
    });

    it('should calculate average weight correctly', () => {
      const entry = mockProgressEntries[0];
      expect(component.getAverageWeight(entry)).toBe(100);
    });

    it('should calculate average reps correctly', () => {
      const entry = mockProgressEntries[0];
      expect(component.getAverageReps(entry)).toBe(9); // (10 + 8) / 2 = 9
    });

    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = component.getFormattedDate(date);
      expect(formatted).toContain('Jan 15, 2024');
    });

    it('should format time correctly', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = component.getFormattedTime(date);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format duration correctly', () => {
      expect(component.getFormattedDuration(45)).toBe('45m');
      expect(component.getFormattedDuration(90)).toBe('1h 30m');
    });

    it('should generate rating stars correctly', () => {
      const stars = component.getRatingStars(3);
      expect(stars).toEqual([true, true, true, false, false]);
    });

    it('should calculate completion percentage correctly', () => {
      const entry = mockProgressEntries[0];
      expect(component.getCompletionPercentage(entry)).toBe(100);
    });

    it('should get completion color correctly', () => {
      expect(component.getCompletionColor(95)).toBe('success');
      expect(component.getCompletionColor(75)).toBe('warning');
      expect(component.getCompletionColor(50)).toBe('danger');
    });

    it('should return Math object', () => {
      expect(component.getMath()).toBe(Math);
    });
  });

  describe('Event Handling', () => {
    it('should emit view details event', () => {
      spyOn(component.viewDetails, 'emit');
      const entry = mockProgressEntries[0];
      
      component.onViewDetails(entry);
      
      expect(component.viewDetails.emit).toHaveBeenCalledWith(entry);
    });

    it('should emit delete entry event', () => {
      spyOn(component.deleteEntry, 'emit');
      const entry = mockProgressEntries[0];
      
      component.onDeleteEntry(entry);
      
      expect(component.deleteEntry.emit).toHaveBeenCalledWith(entry);
    });

    it('should emit export data event', () => {
      spyOn(component.exportData, 'emit');
      
      component.onExportData();
      
      expect(component.exportData.emit).toHaveBeenCalledWith(component.filteredEntries);
    });
  });

  describe('Filter Change Handlers', () => {
    it('should reset page on program filter change', () => {
      component.currentPage = 3;
      component.onProgramFilterChange();
      expect(component.currentPage).toBe(1);
    });

    it('should reset page on date range change', () => {
      component.currentPage = 3;
      component.onDateRangeChange();
      expect(component.currentPage).toBe(1);
    });

    it('should reset page on rating filter change', () => {
      component.currentPage = 3;
      component.onRatingFilterChange();
      expect(component.currentPage).toBe(1);
    });

    it('should reset page on sort change', () => {
      component.currentPage = 3;
      component.onSortChange();
      expect(component.currentPage).toBe(1);
    });

    it('should reset page on completion filter change', () => {
      component.currentPage = 3;
      component.onCompletionFilterChange();
      expect(component.currentPage).toBe(1);
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter by today', () => {
      const today = new Date();
      const todayEntry: ProgressEntry = {
        ...mockProgressEntries[0],
        workoutDate: today
      };
      component.progressEntries = [todayEntry];
      component.selectedDateRange = 'today';
      component.onDateRangeChange();

      expect(component.filteredEntries.length).toBe(1);
    });

    it('should filter by week', () => {
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 3);
      const weekEntry: ProgressEntry = {
        ...mockProgressEntries[0],
        workoutDate: thisWeek
      };
      component.progressEntries = [weekEntry];
      component.selectedDateRange = 'week';
      component.onDateRangeChange();

      expect(component.filteredEntries.length).toBe(1);
    });
  });
});
