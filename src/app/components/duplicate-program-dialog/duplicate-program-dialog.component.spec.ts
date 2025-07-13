import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { DuplicateProgramDialogComponent, DuplicateProgramData } from './duplicate-program-dialog.component';
import { Program, ProgramDifficulty } from '../../models/program.interface';

describe('DuplicateProgramDialogComponent', () => {
  let component: DuplicateProgramDialogComponent;
  let fixture: ComponentFixture<DuplicateProgramDialogComponent>;

  const mockProgram: Program = {
    id: '1',
    name: 'Full Body Strength',
    description: 'Complete full body workout targeting all major muscle groups',
    difficulty: ProgramDifficulty.INTERMEDIATE,
    exercises: [
      {
        id: 'ex1',
        name: 'Barbell Squat',
        order: 1,
        sets: 3,
        reps: 8,
        weight: 60,
        restTime: 120,
        notes: 'Focus on form and depth'
      },
      {
        id: 'ex2',
        name: 'Bench Press',
        order: 2,
        sets: 3,
        reps: 8,
        weight: 50,
        restTime: 120,
        notes: 'Keep shoulders back and down'
      }
    ],
    metadata: {
      tags: ['strength', 'full-body'],
      targetMuscleGroups: ['legs', 'chest', 'back'],
      equipment: ['barbell', 'bench'],
      estimatedDuration: 45,
      totalExercises: 2,
      isPublic: false,
      version: '1.0.0'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    userId: 'user1'
  };

  const mockDialogData: DuplicateProgramData = {
    program: mockProgram,
    suggestedName: 'Full Body Strength (Copy)'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicateProgramDialogComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuplicateProgramDialogComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    component.data = mockDialogData;
    component.isVisible = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display dialog when isVisible is true', () => {
    component.isVisible = true;
    fixture.detectChanges();
    
    const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should hide dialog when isVisible is false', () => {
    component.isVisible = false;
    fixture.detectChanges();
    
    const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
    expect(overlay).toBeFalsy();
  });

  it('should display correct title', () => {
    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement.textContent).toContain('Duplicate Program');
  });

  it('should display program name in preview', () => {
    const programName = fixture.nativeElement.querySelector('.program-details h3');
    expect(programName.textContent).toContain('Full Body Strength');
  });

  it('should display program description in preview', () => {
    const description = fixture.nativeElement.querySelector('.description');
    expect(description.textContent).toContain('Complete full body workout');
  });

  it('should display program stats correctly', () => {
    const stats = component.getProgramStats();
    expect(stats.exercises).toBe(2);
    expect(stats.difficulty).toBe('Intermediate');
    expect(stats.duration).toContain('m');
  });

  it('should initialize form with suggested name', () => {
    expect(component.duplicateForm.get('programName')?.value).toBe('Full Body Strength (Copy)');
  });

  it('should emit confirm event with program name when form is valid', () => {
    spyOn(component.confirm, 'emit');
    
    component.duplicateForm.patchValue({ programName: 'New Program Name' });
    component.onConfirm();
    
    expect(component.confirm.emit).toHaveBeenCalledWith('New Program Name');
  });

  it('should not emit confirm event when form is invalid', () => {
    spyOn(component.confirm, 'emit');
    
    component.duplicateForm.patchValue({ programName: '' });
    component.onConfirm();
    
    expect(component.confirm.emit).not.toHaveBeenCalled();
  });

  it('should emit cancel event when cancel button is clicked', () => {
    spyOn(component.cancel, 'emit');
    
    const cancelButton = fixture.nativeElement.querySelector('.btn-secondary');
    cancelButton.click();
    
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should emit close event when close button is clicked', () => {
    spyOn(component.close, 'emit');
    
    const closeButton = fixture.nativeElement.querySelector('.close-button');
    closeButton.click();
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit close event when backdrop is clicked', () => {
    spyOn(component.close, 'emit');
    
    const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
    overlay.click();
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should not emit close event when dialog container is clicked', () => {
    spyOn(component.close, 'emit');
    
    const container = fixture.nativeElement.querySelector('.dialog-container');
    container.click();
    
    expect(component.close.emit).not.toHaveBeenCalled();
  });

  it('should disable confirm button when form is invalid', () => {
    component.duplicateForm.patchValue({ programName: '' });
    fixture.detectChanges();
    
    const confirmButton = fixture.nativeElement.querySelector('.btn-primary');
    expect(confirmButton.disabled).toBe(true);
  });

  it('should enable confirm button when form is valid', () => {
    component.duplicateForm.patchValue({ programName: 'Valid Name' });
    fixture.detectChanges();
    
    const confirmButton = fixture.nativeElement.querySelector('.btn-primary');
    expect(confirmButton.disabled).toBe(false);
  });

  it('should show validation error for empty name', () => {
    component.duplicateForm.patchValue({ programName: '' });
    component.duplicateForm.get('programName')?.markAsTouched();
    fixture.detectChanges();
    
    const errorMessage = fixture.nativeElement.querySelector('.invalid-feedback');
    expect(errorMessage.textContent).toContain('Program name is required');
  });

  it('should show validation error for short name', () => {
    component.duplicateForm.patchValue({ programName: 'ab' });
    component.duplicateForm.get('programName')?.markAsTouched();
    fixture.detectChanges();
    
    const errorMessage = fixture.nativeElement.querySelector('.invalid-feedback');
    expect(errorMessage.textContent).toContain('Program name must be at least 3 characters');
  });

  it('should get correct category icon for strength program', () => {
    const icon = component.getCategoryIcon(mockProgram);
    expect(icon).toBe('fas fa-dumbbell');
  });

  it('should get correct difficulty color for intermediate', () => {
    const color = component.getDifficultyColor('intermediate');
    expect(color).toBe('#ffc107');
  });

  it('should get correct difficulty color for beginner', () => {
    const color = component.getDifficultyColor('beginner');
    expect(color).toBe('#28a745');
  });

  it('should get correct difficulty color for advanced', () => {
    const color = component.getDifficultyColor('advanced');
    expect(color).toBe('#dc3545');
  });

  it('should handle program without description', () => {
    const programWithoutDescription = { ...mockProgram, description: undefined };
    component.data = { program: programWithoutDescription, suggestedName: 'Test' };
    fixture.detectChanges();
    
    const description = fixture.nativeElement.querySelector('.description');
    expect(description).toBeFalsy();
  });

  it('should handle program without exercises', () => {
    const programWithoutExercises = { ...mockProgram, exercises: [] };
    component.data = { program: programWithoutExercises, suggestedName: 'Test' };
    fixture.detectChanges();
    
    const stats = component.getProgramStats();
    expect(stats.exercises).toBe(0);
  });

  it('should calculate duration correctly for exercises', () => {
    const stats = component.getProgramStats();
    // Each exercise: (3 sets * 8 reps * 3) + (3 sets * 120 seconds) = 72 + 360 = 432 seconds
    // Total for 2 exercises: 864 seconds = 14.4 minutes
    expect(stats.duration).toContain('14m');
  });

  it('should handle long duration formatting', () => {
    const longProgram = {
      ...mockProgram,
      exercises: [
        {
          id: 'ex1',
          name: 'Long Exercise',
          order: 1,
          sets: 10,
          reps: 20,
          weight: 0,
          restTime: 300
        }
      ]
    };
    component.data = { program: longProgram, suggestedName: 'Test' };
    
    const stats = component.getProgramStats();
    // (10 sets * 20 reps * 3) + (10 sets * 300 seconds) = 600 + 3000 = 3600 seconds = 60 minutes = 1 hour
    expect(stats.duration).toContain('1h');
  });

  it('should handle null data gracefully', () => {
    component.data = null;
    fixture.detectChanges();
    
    const stats = component.getProgramStats();
    expect(stats.exercises).toBe(0);
    expect(stats.duration).toBe('0m');
    expect(stats.difficulty).toBe('Unknown');
  });

  it('should have proper accessibility attributes', () => {
    const closeButton = fixture.nativeElement.querySelector('.close-button');
    expect(closeButton.getAttribute('aria-label')).toBe('Close dialog');
  });

  it('should display info section with helpful text', () => {
    const infoItems = fixture.nativeElement.querySelectorAll('.info-item');
    expect(infoItems.length).toBe(2);
    
    const firstInfoText = infoItems[0].textContent;
    expect(firstInfoText).toContain('All exercises and settings will be copied');
    
    const secondInfoText = infoItems[1].textContent;
    expect(secondInfoText).toContain('The new program will have today\'s date');
  });
});
