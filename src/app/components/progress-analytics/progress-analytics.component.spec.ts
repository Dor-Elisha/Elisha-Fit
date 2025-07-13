import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ProgressAnalyticsComponent } from './progress-analytics.component';
import { ProgressEntry, Program, ExerciseProgress, SetProgress, ProgramDifficulty } from '../../models/program.interface';

describe('ProgressAnalyticsComponent', () => {
  let component: ProgressAnalyticsComponent;
  let fixture: ComponentFixture<ProgressAnalyticsComponent>;

  const mockPrograms: Program[] = [
    {
      id: '1',
      name: 'Strength Training',
      description: 'Build muscle and strength',
      difficulty: ProgramDifficulty.INTERMEDIATE,
      exercises: [],
      metadata: {
        estimatedDuration: 60,
        totalExercises: 5,
        targetMuscleGroups: ['chest', 'back'],
        equipment: ['barbell', 'dumbbell'],
        tags: ['strength', 'muscle'],
        isPublic: true,
        version: '1.0'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1'
    },
    {
      id: '2',
      name: 'Cardio Blast',
      description: 'High intensity cardio',
      difficulty: ProgramDifficulty.ADVANCED,
      exercises: [],
      metadata: {
        estimatedDuration: 45,
        totalExercises: 3,
        targetMuscleGroups: ['cardio'],
        equipment: ['bodyweight'],
        tags: ['cardio', 'hiit'],
        isPublic: true,
        version: '1.0'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1'
    }
  ];

  const mockProgressEntries: ProgressEntry[] = [
    {
      id: '1',
      programId: '1',
      userId: 'user1',
      workoutDate: new Date('2024-01-01'),
      totalDuration: 60,
      rating: 4,
      notes: 'Great workout',
      completed: true,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          sets: [
            { setNumber: 1, weight: 100, reps: 8, restTime: 90, completed: true },
            { setNumber: 2, weight: 100, reps: 8, restTime: 90, completed: true },
            { setNumber: 3, weight: 95, reps: 6, restTime: 90, completed: true }
          ]
        }
      ]
    },
    {
      id: '2',
      programId: '1',
      userId: 'user1',
      workoutDate: new Date('2024-01-03'),
      totalDuration: 65,
      rating: 5,
      notes: 'Excellent session',
      completed: true,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          sets: [
            { setNumber: 1, weight: 105, reps: 8, restTime: 90, completed: true },
            { setNumber: 2, weight: 105, reps: 8, restTime: 90, completed: true },
            { setNumber: 3, weight: 100, reps: 7, restTime: 90, completed: false }
          ]
        }
      ]
    },
    {
      id: '3',
      programId: '2',
      userId: 'user1',
      workoutDate: new Date('2024-01-05'),
      totalDuration: 45,
      rating: 3,
      notes: 'Tough cardio',
      completed: true,
      exercises: [
        {
          exerciseId: 'running',
          exerciseName: 'Running',
          sets: [
            { setNumber: 1, weight: 0, reps: 20, restTime: 60, completed: true },
            { setNumber: 2, weight: 0, reps: 18, restTime: 60, completed: true }
          ]
        }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressAnalyticsComponent ],
      imports: [ FormsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressAnalyticsComponent);
    component = fixture.componentInstance;
    component.programs = mockPrograms;
    component.progressEntries = mockProgressEntries;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedTimeRange).toBe('month');
    expect(component.loading).toBe(false);
    expect(component.progressEntries).toEqual(mockProgressEntries);
    expect(component.programs).toEqual(mockPrograms);
  });

  it('should calculate analytics summary correctly', () => {
    expect(component.analyticsSummary).toBeTruthy();
    if (component.analyticsSummary) {
      expect(component.analyticsSummary.totalWorkouts).toBe(3);
      expect(component.analyticsSummary.totalDuration).toBe(170);
      expect(component.analyticsSummary.averageRating).toBe(4);
      expect(component.analyticsSummary.totalExercises).toBe(3);
      expect(component.analyticsSummary.totalSets).toBe(8);
      expect(component.analyticsSummary.mostUsedProgram).toBe('Strength Training');
    }
  });

  it('should generate weight progress chart', () => {
    expect(component.weightProgressChart).toBeTruthy();
    if (component.weightProgressChart) {
      expect(component.weightProgressChart.labels.length).toBe(3);
      expect(component.weightProgressChart.datasets[0].data.length).toBe(3);
      expect(component.weightProgressChart.datasets[0].label).toBe('Average Weight (kg)');
    }
  });

  it('should generate reps progress chart', () => {
    expect(component.repsProgressChart).toBeTruthy();
    if (component.repsProgressChart) {
      expect(component.repsProgressChart.labels.length).toBe(3);
      expect(component.repsProgressChart.datasets[0].data.length).toBe(3);
      expect(component.repsProgressChart.datasets[0].label).toBe('Average Reps');
    }
  });

  it('should generate duration chart', () => {
    expect(component.durationChart).toBeTruthy();
    if (component.durationChart) {
      expect(component.durationChart.labels.length).toBe(3);
      expect(component.durationChart.datasets[0].data).toEqual([60, 65, 45]);
      expect(component.durationChart.datasets[0].label).toBe('Workout Duration (minutes)');
    }
  });

  it('should generate rating chart', () => {
    expect(component.ratingChart).toBeTruthy();
    if (component.ratingChart) {
      expect(component.ratingChart.labels).toEqual(['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']);
      expect(component.ratingChart.datasets[0].data).toEqual([0, 0, 1, 1, 1]);
    }
  });

  it('should generate program usage chart', () => {
    expect(component.programUsageChart).toBeTruthy();
    if (component.programUsageChart) {
      expect(component.programUsageChart.labels).toContain('Strength Training');
      expect(component.programUsageChart.labels).toContain('Cardio Blast');
      expect(component.programUsageChart.datasets[0].data).toEqual([2, 1]);
    }
  });

  it('should generate completion rate chart', () => {
    expect(component.completionRateChart).toBeTruthy();
    if (component.completionRateChart) {
      expect(component.completionRateChart.labels.length).toBe(3);
      expect(component.completionRateChart.datasets[0].data.length).toBe(3);
      expect(component.completionRateChart.datasets[0].label).toBe('Completion Rate (%)');
    }
  });

  it('should filter entries by time range', () => {
    component.selectedTimeRange = 'week';
    component.onTimeRangeChange();
    
    // Should filter to recent entries only
    expect(component.analyticsSummary).toBeTruthy();
  });

  it('should handle empty progress entries', () => {
    component.progressEntries = [];
    fixture.detectChanges();
    
    expect(component.analyticsSummary).toBeNull();
    expect(component.weightProgressChart).toBeNull();
    expect(component.repsProgressChart).toBeNull();
    expect(component.durationChart).toBeNull();
    expect(component.ratingChart).toBeNull();
    expect(component.programUsageChart).toBeNull();
    expect(component.completionRateChart).toBeNull();
  });

  it('should format duration correctly', () => {
    expect(component.getFormattedDuration(90)).toBe('1h 30m');
    expect(component.getFormattedDuration(45)).toBe('45m');
    expect(component.getFormattedDuration(0)).toBe('0m');
  });

  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    const formatted = component.getFormattedDate(date);
    expect(formatted).toContain('Jan 15, 2024');
  });

  it('should get trend icon correctly', () => {
    expect(component.getTrendIcon('improving')).toBe('fas fa-arrow-up text-success');
    expect(component.getTrendIcon('declining')).toBe('fas fa-arrow-down text-danger');
    expect(component.getTrendIcon('stable')).toBe('fas fa-minus text-muted');
  });

  it('should get trend text correctly', () => {
    expect(component.getTrendText('improving')).toBe('Improving');
    expect(component.getTrendText('declining')).toBe('Declining');
    expect(component.getTrendText('stable')).toBe('Stable');
  });

  it('should get program name correctly', () => {
    expect(component['getProgramName']('1')).toBe('Strength Training');
    expect(component['getProgramName']('2')).toBe('Cardio Blast');
    expect(component['getProgramName']('unknown')).toBe('Unknown Program');
  });

  it('should calculate trend correctly', () => {
    const improvingEntries = [
      { ...mockProgressEntries[0], exercises: [{ ...mockProgressEntries[0].exercises[0], sets: [{ setNumber: 1, weight: 100, reps: 8, restTime: 90, completed: true }] }] },
      { ...mockProgressEntries[1], exercises: [{ ...mockProgressEntries[1].exercises[0], sets: [{ setNumber: 1, weight: 120, reps: 8, restTime: 90, completed: true }] }] }
    ];
    
    const trend = component['calculateTrend'](improvingEntries);
    expect(trend).toBe('improving');
  });

  it('should emit time range change', () => {
    spyOn(component.timeRangeChange, 'emit');
    component.selectedTimeRange = 'quarter';
    component.onTimeRangeChange();
    
    expect(component.timeRangeChange.emit).toHaveBeenCalledWith('quarter');
  });

  it('should show loading state', () => {
    component.loading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeTruthy();
  });

  it('should show empty state when no entries', () => {
    component.progressEntries = [];
    fixture.detectChanges();
    
    const emptyElement = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyElement).toBeTruthy();
  });

  it('should display summary cards', () => {
    const summaryCards = fixture.nativeElement.querySelectorAll('.summary-card');
    expect(summaryCards.length).toBe(8); // 8 summary cards
  });

  it('should display chart containers', () => {
    const chartContainers = fixture.nativeElement.querySelectorAll('.chart-container');
    expect(chartContainers.length).toBe(6); // 6 chart containers
  });

  it('should display highlights section', () => {
    const highlightsSection = fixture.nativeElement.querySelector('.highlights-section');
    expect(highlightsSection).toBeTruthy();
  });

  it('should display insights section', () => {
    const insightsSection = fixture.nativeElement.querySelector('.insights-section');
    expect(insightsSection).toBeTruthy();
  });

  it('should handle time range selector change', () => {
    const selectElement = fixture.nativeElement.querySelector('#time-range');
    expect(selectElement).toBeTruthy();
    
    // Test that all time range options are present
    const options = selectElement.querySelectorAll('option');
    expect(options.length).toBe(5); // 5 time range options
  });

  it('should calculate completion rate correctly', () => {
    if (component.analyticsSummary) {
      // 7 completed sets out of 8 total sets = 87.5%
      expect(component.analyticsSummary.completionRate).toBe(88); // Rounded
    }
  });

  it('should calculate average weight correctly', () => {
    if (component.analyticsSummary) {
      // (100+100+95+105+105+100+0+0) / 8 = 75.625
      expect(component.analyticsSummary.averageWeight).toBe(76); // Rounded
    }
  });

  it('should calculate average reps correctly', () => {
    if (component.analyticsSummary) {
      // (8+8+6+8+8+7+20+18) / 8 = 10.375
      expect(component.analyticsSummary.averageReps).toBe(10); // Rounded
    }
  });

  it('should find best rated workout', () => {
    if (component.analyticsSummary && component.analyticsSummary.bestRatedWorkout) {
      expect(component.analyticsSummary.bestRatedWorkout.rating).toBe(5);
    }
  });

  it('should find longest workout', () => {
    if (component.analyticsSummary && component.analyticsSummary.longestWorkout) {
      expect(component.analyticsSummary.longestWorkout.totalDuration).toBe(65);
    }
  });
});
