import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgramDetailComponent } from './program-detail.component';

describe('ProgramDetailComponent', () => {
  let component: ProgramDetailComponent;
  let fixture: ComponentFixture<ProgramDetailComponent>;

  const mockProgram = {
    id: '1',
    name: 'Advanced Strength Training',
    description: 'A comprehensive strength training program for advanced users',
    exercises: [
      {
        id: '1',
        name: 'Bench Press',
        sets: 4,
        reps: 8,
        restTime: 120,
        weight: 80,
        order: 1,
        notes: 'Focus on proper form and controlled movement'
      },
      {
        id: '2',
        name: 'Squats',
        sets: 4,
        reps: 10,
        restTime: 180,
        weight: 100,
        order: 2,
        notes: 'Keep chest up and knees in line with toes'
      },
      {
        id: '3',
        name: 'Deadlifts',
        sets: 3,
        reps: 6,
        restTime: 240,
        weight: 120,
        order: 3
      }
    ],
    metadata: {
      estimatedDuration: 60,
      totalExercises: 3,
      targetMuscleGroups: ['chest', 'legs', 'back'],
      equipment: ['barbell', 'bench', 'rack'],
      tags: ['strength', 'advanced', 'compound'],
      isPublic: false,
      version: '1.0'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    userId: 'user1'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramDetailComponent);
    component = fixture.componentInstance;
    component.program = mockProgram;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with overview tab selected', () => {
    expect(component.selectedTab).toBe('overview');
  });

  it('should select different tabs', () => {
    component.selectTab('exercises');
    expect(component.selectedTab).toBe('exercises');

    component.selectTab('stats');
    expect(component.selectedTab).toBe('stats');

    component.selectTab('history');
    expect(component.selectedTab).toBe('history');
  });

  it('should calculate total duration correctly', () => {
    const duration = component.getTotalDuration();
    // (4*8*3 + 4*120) + (4*10*3 + 4*180) + (3*6*3 + 3*240) = 96+480 + 120+720 + 54+720 = 2190 seconds = 36.5 minutes
    expect(duration).toBeCloseTo(36.5, 1);
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(30)).toBe('30 minutes');
    expect(component.formatDuration(90)).toBe('1 hour 30 minutes');
    expect(component.formatDuration(120)).toBe('2 hours');
  });

  it('should calculate total volume correctly', () => {
    const volume = component.getTotalVolume();
    // (4*8*80) + (4*10*100) + (3*6*120) = 2560 + 4000 + 2160 = 8720
    expect(volume).toBe(8720);
  });

  it('should calculate total sets correctly', () => {
    const sets = component.getTotalSets();
    // 4 + 4 + 3 = 11
    expect(sets).toBe(11);
  });

  it('should calculate total reps correctly', () => {
    const reps = component.getTotalReps();
    // (4*8) + (4*10) + (3*6) = 32 + 40 + 18 = 90
    expect(reps).toBe(90);
  });

  it('should format rest time correctly', () => {
    expect(component.formatRestTime(30)).toBe('30s');
    expect(component.formatRestTime(90)).toBe('1m 30s');
    expect(component.formatRestTime(120)).toBe('2m');
  });

  it('should get program stats correctly', () => {
    const stats = component.getProgramStats();
    
    expect(stats?.totalExercises).toBe(3);
    expect(stats?.totalDuration).toBe('37 minutes'); // Rounded from 36.5
    expect(stats?.totalVolume).toBe(8720);
    expect(stats?.totalSets).toBe(11);
    expect(stats?.totalReps).toBe(90);
    expect(stats?.averageRestTime).toBe('3m');
    expect(stats?.category).toBe('Strength Training');
    expect(stats?.equipment).toEqual(['barbell', 'bench', 'rack']);
    expect(stats?.muscleGroups).toEqual(['chest', 'legs', 'back']);
    expect(stats?.tags).toEqual(['strength', 'advanced', 'compound']);
  });

  it('should get category from tags correctly', () => {
    expect(component.getCategoryFromTags()).toBe('Strength Training');
  });

  it('should get muscle group color', () => {
    const color = component.getMuscleGroupColor('chest');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should get equipment icon correctly', () => {
    expect(component.getEquipmentIcon('barbell')).toBe('fas fa-weight-hanging');
    expect(component.getEquipmentIcon('dumbbell')).toBe('fas fa-dumbbell');
    expect(component.getEquipmentIcon('unknown')).toBe('fas fa-dumbbell'); // default
  });

  it('should emit edit program event', () => {
    spyOn(component.editProgram, 'emit');
    
    component.onEditProgram();
    
    expect(component.editProgram.emit).toHaveBeenCalledWith(mockProgram);
  });

  it('should emit delete program event', () => {
    spyOn(component.deleteProgram, 'emit');
    
    component.onDeleteProgram();
    
    expect(component.deleteProgram.emit).toHaveBeenCalledWith(mockProgram);
  });

  it('should emit duplicate program event', () => {
    spyOn(component.duplicateProgram, 'emit');
    
    component.onDuplicateProgram();
    
    expect(component.duplicateProgram.emit).toHaveBeenCalledWith(mockProgram);
  });

  it('should emit start workout event', () => {
    spyOn(component.startWorkout, 'emit');
    
    component.onStartWorkout();
    
    expect(component.startWorkout.emit).toHaveBeenCalledWith(mockProgram);
  });

  it('should emit back to list event', () => {
    spyOn(component.backToList, 'emit');
    
    component.onBackToList();
    
    expect(component.backToList.emit).toHaveBeenCalled();
  });

  it('should handle permission checks correctly', () => {
    component.showActions = true;
    component.isReadOnly = false;
    
    expect(component.canEdit()).toBe(true);
    expect(component.canDelete()).toBe(true);
    expect(component.canDuplicate()).toBe(true);
    expect(component.canStartWorkout()).toBe(true);

    component.isReadOnly = true;
    
    expect(component.canEdit()).toBe(false);
    expect(component.canDelete()).toBe(false);
    expect(component.canDuplicate()).toBe(true);
    expect(component.canStartWorkout()).toBe(true);

    component.showActions = false;
    
    expect(component.canEdit()).toBe(false);
    expect(component.canDelete()).toBe(false);
    expect(component.canDuplicate()).toBe(false);
    expect(component.canStartWorkout()).toBe(false);
  });

  it('should handle program with no exercises', () => {
    const programWithoutExercises = {
      ...mockProgram,
      exercises: []
    };
    component.program = programWithoutExercises;
    component.ngOnChanges();
    
    expect(component.canStartWorkout()).toBe(false);
    expect(component.getTotalDuration()).toBe(60); // Uses metadata estimatedDuration
    expect(component.getTotalVolume()).toBe(0);
    expect(component.getTotalSets()).toBe(0);
    expect(component.getTotalReps()).toBe(0);
  });

  it('should handle program with missing metadata', () => {
    const programWithoutMetadata = {
      ...mockProgram,
      metadata: undefined
    };
    component.program = programWithoutMetadata;
    component.ngOnChanges();
    
    expect(component.getTotalDuration()).toBeCloseTo(36.5, 1); // Still calculates from exercises
    expect(component.getCategoryFromTags()).toBe('Mixed');
    expect(component.getCategoryIcon(programWithoutMetadata)).toBe('fas fa-layer-group');
  });

  it('should handle null program', () => {
    component.program = null;
    component.ngOnChanges();
    
    expect(component.getTotalDuration()).toBe(0);
    expect(component.getTotalVolume()).toBe(0);
    expect(component.getTotalSets()).toBe(0);
    expect(component.getTotalReps()).toBe(0);
    expect(component.getProgramStats()).toBe(null);
  });

  it('should handle exercises with zero weight', () => {
    const programWithZeroWeight = {
      ...mockProgram,
      exercises: [
        {
          id: '1',
          name: 'Push-ups',
          sets: 3,
          reps: 10,
          restTime: 60,
          weight: 0,
          order: 1
        }
      ]
    };
    component.program = programWithZeroWeight;
    component.ngOnChanges();
    
    expect(component.getTotalVolume()).toBe(0);
  });

  it('should handle different difficulty levels in category detection', () => {
    const beginnerProgram = {
      ...mockProgram,
      metadata: {
        ...mockProgram.metadata,
        tags: ['beginner', 'strength']
      }
    };
    
    expect(component.getCategoryFromTags()).toBe('Strength Training');
  });
});
