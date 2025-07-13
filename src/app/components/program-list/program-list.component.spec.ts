import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ProgramListComponent } from './program-list.component';
import { Program, ProgramDifficulty } from '../../models/program.interface';

describe('ProgramListComponent', () => {
  let component: ProgramListComponent;
  let fixture: ComponentFixture<ProgramListComponent>;

  const mockPrograms: Program[] = [
    {
      id: '1',
      name: 'Beginner Strength',
      description: 'A basic strength training program',
      difficulty: ProgramDifficulty.BEGINNER,
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
      ],
      metadata: {
        estimatedDuration: 30,
        totalExercises: 1,
        targetMuscleGroups: ['chest', 'triceps'],
        equipment: ['bodyweight'],
        tags: ['strength', 'beginner'],
        isPublic: false,
        version: '1.0'
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      userId: 'user1'
    },
    {
      id: '2',
      name: 'Advanced Cardio',
      description: 'High-intensity cardio workout',
      difficulty: ProgramDifficulty.ADVANCED,
      exercises: [
        {
          id: '2',
          name: 'Burpees',
          sets: 5,
          reps: 20,
          restTime: 30,
          weight: 0,
          order: 1
        }
      ],
      metadata: {
        estimatedDuration: 45,
        totalExercises: 1,
        targetMuscleGroups: ['full body'],
        equipment: ['bodyweight'],
        tags: ['cardio', 'hiit', 'advanced'],
        isPublic: false,
        version: '1.0'
      },
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      userId: 'user1'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramListComponent ],
      imports: [ FormsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramListComponent);
    component = fixture.componentInstance;
    component.programs = [...mockPrograms];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with all programs', () => {
    expect(component.filteredPrograms.length).toBe(2);
    // Default sort is by createdAt desc, so newer program comes first
    expect(component.filteredPrograms[0].name).toBe('Advanced Cardio');
    expect(component.filteredPrograms[1].name).toBe('Beginner Strength');
  });

  it('should filter programs by search term', () => {
    component.searchTerm = 'strength';
    component.applyFilters();
    
    expect(component.filteredPrograms.length).toBe(1);
    expect(component.filteredPrograms[0].name).toBe('Beginner Strength');
  });

  it('should filter programs by difficulty', () => {
    component.selectedDifficulty = ProgramDifficulty.BEGINNER;
    component.applyFilters();
    
    expect(component.filteredPrograms.length).toBe(1);
    expect(component.filteredPrograms[0].difficulty).toBe(ProgramDifficulty.BEGINNER);
  });

  it('should sort programs by name', () => {
    component.sortBy = 'name';
    component.sortOrder = 'asc';
    component.applyFilters();
    
    expect(component.filteredPrograms[0].name).toBe('Advanced Cardio');
    expect(component.filteredPrograms[1].name).toBe('Beginner Strength');
  });

  it('should sort programs by creation date', () => {
    component.sortBy = 'createdAt';
    component.sortOrder = 'desc';
    component.applyFilters();
    
    expect(component.filteredPrograms[0].name).toBe('Advanced Cardio');
    expect(component.filteredPrograms[1].name).toBe('Beginner Strength');
  });

  it('should sort programs by difficulty', () => {
    component.sortBy = 'difficulty';
    component.sortOrder = 'asc';
    component.applyFilters();
    
    expect(component.filteredPrograms[0].difficulty).toBe(ProgramDifficulty.BEGINNER);
    expect(component.filteredPrograms[1].difficulty).toBe(ProgramDifficulty.ADVANCED);
  });

  it('should calculate total duration correctly', () => {
    const duration = component.getTotalDuration(mockPrograms[0]);
    // 3 sets * 10 reps * 3 seconds + 3 sets * 60 seconds rest = 90 + 180 = 270 seconds = 4.5 minutes
    expect(duration).toBeCloseTo(4.5, 1);
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(30)).toBe('30m');
    expect(component.formatDuration(90)).toBe('1h 30m');
    expect(component.formatDuration(120)).toBe('2h 0m');
  });

  it('should get program stats correctly', () => {
    const stats = component.getProgramStats(mockPrograms[0]);
    
    expect(stats.exercises).toBe(1);
    expect(stats.difficulty).toBe('Beginner');
    expect(stats.duration).toBe('5m'); // Rounded from 4.5m
  });

  it('should get difficulty color correctly', () => {
    expect(component.getDifficultyColor(ProgramDifficulty.BEGINNER)).toBe('#28a745');
    expect(component.getDifficultyColor(ProgramDifficulty.INTERMEDIATE)).toBe('#ffc107');
    expect(component.getDifficultyColor(ProgramDifficulty.ADVANCED)).toBe('#dc3545');
  });

  it('should get category icon based on tags', () => {
    expect(component.getCategoryIcon(mockPrograms[0])).toBe('fas fa-dumbbell'); // strength tag
    expect(component.getCategoryIcon(mockPrograms[1])).toBe('fas fa-fire'); // hiit tag
  });

  it('should emit edit program event', () => {
    spyOn(component.editProgram, 'emit');
    
    component.onEditProgram(mockPrograms[0]);
    
    expect(component.editProgram.emit).toHaveBeenCalledWith(mockPrograms[0]);
  });

  it('should emit delete program event', () => {
    spyOn(component.deleteProgram, 'emit');
    
    component.onDeleteProgram(mockPrograms[0]);
    
    expect(component.deleteProgram.emit).toHaveBeenCalledWith(mockPrograms[0]);
  });

  it('should emit duplicate program event', () => {
    spyOn(component.duplicateProgram, 'emit');
    
    component.onDuplicateProgram(mockPrograms[0]);
    
    expect(component.duplicateProgram.emit).toHaveBeenCalledWith(mockPrograms[0]);
  });

  it('should emit view program event', () => {
    spyOn(component.viewProgram, 'emit');
    
    component.onViewProgram(mockPrograms[0]);
    
    expect(component.viewProgram.emit).toHaveBeenCalledWith(mockPrograms[0]);
  });

  it('should emit start workout event', () => {
    spyOn(component.startWorkout, 'emit');
    
    component.onStartWorkout(mockPrograms[0]);
    
    expect(component.startWorkout.emit).toHaveBeenCalledWith(mockPrograms[0]);
  });

  it('should clear filters correctly', () => {
    component.searchTerm = 'test';
    component.selectedDifficulty = ProgramDifficulty.ADVANCED;
    component.sortBy = 'name';
    component.sortOrder = 'asc';
    
    component.clearFilters();
    
    expect(component.searchTerm).toBe('');
    expect(component.selectedDifficulty).toBe('all');
    expect(component.sortBy).toBe('createdAt');
    expect(component.sortOrder).toBe('desc');
    expect(component.filteredPrograms.length).toBe(2);
  });

  it('should detect active filters', () => {
    expect(component.hasActiveFilters()).toBe(false);
    
    component.searchTerm = 'test';
    expect(component.hasActiveFilters()).toBe(true);
    
    component.searchTerm = '';
    component.selectedDifficulty = ProgramDifficulty.BEGINNER;
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should toggle sort order', () => {
    expect(component.sortOrder).toBe('desc');
    
    component.toggleSortOrder();
    expect(component.sortOrder).toBe('asc');
    
    component.toggleSortOrder();
    expect(component.sortOrder).toBe('desc');
  });

  it('should handle empty programs array', () => {
    component.programs = [];
    component.ngOnChanges();
    
    expect(component.filteredPrograms.length).toBe(0);
  });

  it('should handle programs with missing metadata', () => {
    const programWithoutMetadata = {
      ...mockPrograms[0],
      metadata: undefined
    };
    component.programs = [programWithoutMetadata];
    component.ngOnChanges();
    
    // Should still calculate duration from exercises even without metadata
    const duration = component.getTotalDuration(programWithoutMetadata);
    expect(duration).toBeCloseTo(4.5, 1);
    expect(component.getCategoryIcon(programWithoutMetadata)).toBe('fas fa-layer-group');
  });

  it('should handle search with case insensitivity', () => {
    component.searchTerm = 'STRENGTH';
    component.applyFilters();
    
    expect(component.filteredPrograms.length).toBe(1);
    expect(component.filteredPrograms[0].name).toBe('Beginner Strength');
  });

  it('should search in both name and description', () => {
    component.searchTerm = 'basic';
    component.applyFilters();
    
    expect(component.filteredPrograms.length).toBe(1);
    expect(component.filteredPrograms[0].name).toBe('Beginner Strength');
  });
});
