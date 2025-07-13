import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProgressEntryComponent } from './progress-entry.component';
import { Program, ProgramDifficulty, ProgressEntry } from '../../models/program.interface';

describe('ProgressEntryComponent', () => {
  let component: ProgressEntryComponent;
  let fixture: ComponentFixture<ProgressEntryComponent>;

  const mockProgram: Program = {
    id: 'program-1',
    name: 'Test Program',
    description: 'A test program',
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
      },
      {
        id: 'exercise-2',
        name: 'Squats',
        sets: 4,
        reps: 12,
        restTime: 120,
        weight: 80,
        order: 2
      }
    ],
    metadata: {
      estimatedDuration: 45,
      totalExercises: 2,
      targetMuscleGroups: ['Chest', 'Legs'],
      equipment: ['Barbell', 'Squat Rack'],
      tags: ['Strength', 'Compound'],
      isPublic: false,
      version: '1.0'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user-1'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressEntryComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with empty form when no program is provided', () => {
      expect(component.progressForm).toBeTruthy();
      expect(component.progressForm.get('programId')?.value).toBe('');
      expect(component.exercisesArray.length).toBe(0);
    });

    it('should initialize form with program data when program is provided', () => {
      component.program = mockProgram;
      component.isVisible = true;
      component.ngOnChanges();

      expect(component.progressForm.get('programId')?.value).toBe(mockProgram.id);
      expect(component.exercisesArray.length).toBe(2);
    });

    it('should set today date correctly', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(component.today).toBe(today);
    });
  });

  describe('Form Structure', () => {
    beforeEach(() => {
      component.program = mockProgram;
      component.isVisible = true;
      component.ngOnChanges();
    });

    it('should create form controls for each exercise', () => {
      expect(component.exercisesArray.length).toBe(2);
      expect(component.exercisesArray.at(0).get('exerciseName')?.value).toBe('Bench Press');
      expect(component.exercisesArray.at(1).get('exerciseName')?.value).toBe('Squats');
    });

    it('should create form controls for each set', () => {
      const firstExerciseSets = component.getSetsArray(0);
      const secondExerciseSets = component.getSetsArray(1);

      expect(firstExerciseSets.length).toBe(3); // Bench Press has 3 sets
      expect(secondExerciseSets.length).toBe(4); // Squats has 4 sets
    });

    it('should initialize set data with exercise defaults', () => {
      const firstSet = component.getSetsArray(0).at(0);
      expect(firstSet.get('weight')?.value).toBe(100);
      expect(firstSet.get('reps')?.value).toBe(10);
      expect(firstSet.get('restTime')?.value).toBe(90);
      expect(firstSet.get('completed')?.value).toBe(true);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      component.program = mockProgram;
      component.isVisible = true;
      component.ngOnChanges();
    });

    it('should be valid when all required fields are filled', () => {
      expect(component.progressForm.valid).toBe(true);
    });

    it('should validate weight range', () => {
      const firstSet = component.getSetsArray(0).at(0);
      
      firstSet.get('weight')?.setValue(-1);
      expect(firstSet.get('weight')?.errors?.['min']).toBeTruthy();

      firstSet.get('weight')?.setValue(1001);
      expect(firstSet.get('weight')?.errors?.['max']).toBeTruthy();

      firstSet.get('weight')?.setValue(100);
      expect(firstSet.get('weight')?.errors).toBeNull();
    });

    it('should validate reps range', () => {
      const firstSet = component.getSetsArray(0).at(0);
      
      firstSet.get('reps')?.setValue(0);
      expect(firstSet.get('reps')?.errors?.['min']).toBeTruthy();

      firstSet.get('reps')?.setValue(101);
      expect(firstSet.get('reps')?.errors?.['max']).toBeTruthy();

      firstSet.get('reps')?.setValue(10);
      expect(firstSet.get('reps')?.errors).toBeNull();
    });

    it('should validate rest time range', () => {
      const firstSet = component.getSetsArray(0).at(0);
      
      firstSet.get('restTime')?.setValue(-1);
      expect(firstSet.get('restTime')?.errors?.['min']).toBeTruthy();

      firstSet.get('restTime')?.setValue(601);
      expect(firstSet.get('restTime')?.errors?.['max']).toBeTruthy();

      firstSet.get('restTime')?.setValue(90);
      expect(firstSet.get('restTime')?.errors).toBeNull();
    });

    it('should validate rating range', () => {
      component.progressForm.get('rating')?.setValue(0);
      expect(component.progressForm.get('rating')?.errors?.['min']).toBeTruthy();

      component.progressForm.get('rating')?.setValue(6);
      expect(component.progressForm.get('rating')?.errors?.['max']).toBeTruthy();

      component.progressForm.get('rating')?.setValue(5);
      expect(component.progressForm.get('rating')?.errors).toBeNull();
    });
  });

  describe('Save Functionality', () => {
    beforeEach(() => {
      component.program = mockProgram;
      component.isVisible = true;
      component.ngOnChanges();
    });

    it('should emit save event with valid progress entry', () => {
      spyOn(component.save, 'emit');
      
      component.onSave();

      expect(component.save.emit).toHaveBeenCalled();
      const emittedValue = (component.save.emit as jasmine.Spy).calls.first().args[0];
      
      expect(emittedValue.programId).toBe(mockProgram.id);
      expect(emittedValue.exercises.length).toBe(2);
      expect(emittedValue.completed).toBe(true);
      expect(emittedValue.id).toMatch(/^progress_\d+_[a-z0-9]+$/);
    });

    it('should calculate total duration correctly', () => {
      const firstSet = component.getSetsArray(0).at(0);
      const secondSet = component.getSetsArray(0).at(1);
      
      firstSet.get('restTime')?.setValue(60);
      secondSet.get('restTime')?.setValue(90);
      secondSet.get('completed')?.setValue(false);

      component.onSave();
      
      const emittedValue = (component.save.emit as jasmine.Spy).calls.first().args[0];
      expect(emittedValue.totalDuration).toBe(1); // 60 seconds = 1 minute
    });

    it('should handle validation errors', () => {
      const firstSet = component.getSetsArray(0).at(0);
      firstSet.get('weight')?.setValue(-1);
      firstSet.get('weight')?.markAsTouched();

      spyOn(component.save, 'emit');
      
      component.onSave();

      expect(component.save.emit).not.toHaveBeenCalled();
      expect(component.validationErrors.length).toBeGreaterThan(0);
      expect(component.validationErrors[0]).toContain('Weight');
    });
  });

  describe('Event Handling', () => {
    it('should emit cancel event', () => {
      spyOn(component.cancel, 'emit');
      component.onCancel();
      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should emit close event', () => {
      spyOn(component.close, 'emit');
      component.onClose();
      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should format rest time correctly', () => {
      expect(component.getFormattedRestTime(90)).toBe('1:30');
      expect(component.getFormattedRestTime(45)).toBe('0:45');
      expect(component.getFormattedRestTime(125)).toBe('2:05');
    });

    it('should format weight correctly', () => {
      expect(component.getFormattedWeight(100)).toBe('100 kg');
      expect(component.getFormattedWeight(75.5)).toBe('75.5 kg');
    });

    it('should generate unique IDs', () => {
      const id1 = component['generateId']();
      const id2 = component['generateId']();
      
      expect(id1).toMatch(/^progress_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^progress_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component.program = mockProgram;
      component.isVisible = true;
      component.ngOnChanges();
    });

    it('should handle save errors gracefully', () => {
      spyOn(component.save, 'emit').and.throwError('Test error');
      spyOn(console, 'error');
      
      component.onSave();

      expect(component.validationErrors).toContain('An error occurred while saving progress.');
      expect(console.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('should collect validation errors correctly', () => {
      const firstSet = component.getSetsArray(0).at(0);
      firstSet.get('weight')?.setValue(-1);
      firstSet.get('reps')?.setValue(0);
      firstSet.get('weight')?.markAsTouched();
      firstSet.get('reps')?.markAsTouched();

      component['collectValidationErrors']();

      expect(component.validationErrors.length).toBeGreaterThan(0);
      expect(component.validationErrors.some(error => error.includes('Weight'))).toBe(true);
      expect(component.validationErrors.some(error => error.includes('Reps'))).toBe(true);
    });
  });
});
