import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { ProgramEditComponent } from './program-edit.component';
import { ExerciseService } from '../../services/exercise.service';
import { GeneralService } from '../../services/general.service';
import { Program, ProgramDifficulty } from '../../models/program.interface';
import { Exercise } from '../../models/exercise.interface';

describe('ProgramEditComponent', () => {
  let component: ProgramEditComponent;
  let fixture: ComponentFixture<ProgramEditComponent>;
  let mockExerciseService: jasmine.SpyObj<ExerciseService>;
  let mockGeneralService: jasmine.SpyObj<GeneralService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockActivatedRoute: any;

  const mockExercises: Exercise[] = [
    {
      id: '1',
      name: 'Push-ups',
      force: 'push',
      level: 'beginner',
      mechanic: 'compound',
      equipment: 'body only',
      primaryMuscles: ['chest'],
      secondaryMuscles: ['triceps', 'shoulders'],
      instructions: ['Start in plank position', 'Lower body', 'Push back up'],
      category: 'strength',
      images: []
    },
    {
      id: '2',
      name: 'Squats',
      force: 'push',
      level: 'beginner',
      mechanic: 'compound',
      equipment: 'body only',
      primaryMuscles: ['quadriceps'],
      secondaryMuscles: ['glutes', 'hamstrings'],
      instructions: ['Stand with feet shoulder-width apart', 'Lower body', 'Stand back up'],
      category: 'strength',
      images: []
    },
    {
      id: '3',
      name: 'Running',
      force: 'push',
      level: 'beginner',
      mechanic: 'compound',
      equipment: 'body only',
      primaryMuscles: ['quadriceps'],
      secondaryMuscles: ['calves', 'hamstrings'],
      instructions: ['Start running', 'Maintain pace', 'Continue running'],
      category: 'cardio',
      images: []
    }
  ];

  const mockProgram: Program = {
    id: '1',
    name: 'Test Program',
    description: 'A test program',
    difficulty: ProgramDifficulty.BEGINNER,
    exercises: [],
    metadata: {
      estimatedDuration: 30,
      totalExercises: 0,
      targetMuscleGroups: [],
      equipment: [],
      tags: [],
      isPublic: false,
      version: '1.0'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1'
  };

  beforeEach(async () => {
    const exerciseServiceSpy = jasmine.createSpyObj('ExerciseService', ['getExercises']);
    const generalServiceSpy = jasmine.createSpyObj('GeneralService', ['saveProgram']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);

    mockActivatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      declarations: [ ProgramEditComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: ExerciseService, useValue: exerciseServiceSpy },
        { provide: GeneralService, useValue: generalServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    })
    .compileComponents();

    mockExerciseService = TestBed.inject(ExerciseService) as jasmine.SpyObj<ExerciseService>;
    mockGeneralService = TestBed.inject(GeneralService) as jasmine.SpyObj<GeneralService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  beforeEach(() => {
    mockExerciseService.getExercises.and.returnValue(of(mockExercises));
    
    fixture = TestBed.createComponent(ProgramEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    expect(component.programForm).toBeDefined();
    expect(component.programForm.get('name')).toBeDefined();
    expect(component.programForm.get('description')).toBeDefined();
    expect(component.programForm.get('difficulty')).toBeDefined();
    expect(component.programForm.get('exercises')).toBeDefined();
  });

  it('should load exercises on ngOnInit', () => {
    expect(mockExerciseService.getExercises).toHaveBeenCalled();
    expect(component.exercises).toEqual(mockExercises);
    expect(component.filteredExercises).toEqual(mockExercises);
    expect(component.exerciseCategories).toContain('strength');
    expect(component.exerciseCategories).toContain('cardio');
  });

  it('should load program and populate form', () => {
    expect(component.program).toBeDefined();
    expect(component.program?.name).toBe('Sample Program');
    expect(component.programForm.get('name')?.value).toBe('Sample Program');
  });

  it('should filter exercises by search term', () => {
    component.searchTerm = 'push';
    component.filterExercises();
    
    expect(component.filteredExercises.length).toBe(1);
    expect(component.filteredExercises[0].name).toBe('Push-ups');
  });

  it('should filter exercises by category', () => {
    component.selectedCategory = 'cardio';
    component.filterExercises();
    
    expect(component.filteredExercises.length).toBe(1);
    expect(component.filteredExercises[0].name).toBe('Running');
  });

  it('should filter exercises by both search and category', () => {
    component.searchTerm = 'squat';
    component.selectedCategory = 'strength';
    component.filterExercises();
    
    expect(component.filteredExercises.length).toBe(1);
    expect(component.filteredExercises[0].name).toBe('Squats');
  });

  it('should select exercise and add to form array', () => {
    const exercise = mockExercises[0];
    component.selectExercise(exercise);
    
    expect(component.exercisesArray.length).toBe(1);
    expect(component.exercisesArray.at(0).get('name')?.value).toBe('Push-ups');
    expect(component.exercisesArray.at(0).get('sets')?.value).toBe(3);
    expect(component.exercisesArray.at(0).get('reps')?.value).toBe(10);
    expect(mockToastr.success).toHaveBeenCalledWith('Push-ups added to program');
  });

  it('should not add duplicate exercise', () => {
    const exercise = mockExercises[0];
    component.selectExercise(exercise);
    component.selectExercise(exercise);
    
    expect(component.exercisesArray.length).toBe(1);
    expect(mockToastr.warning).toHaveBeenCalledWith('Exercise already added to program');
  });

  it('should remove exercise from form array', () => {
    const exercise = mockExercises[0];
    component.selectExercise(exercise);
    component.removeExercise(0);
    
    expect(component.exercisesArray.length).toBe(0);
    expect(mockToastr.info).toHaveBeenCalledWith('Push-ups removed from program');
  });

  it('should move exercise up', () => {
    component.selectExercise(mockExercises[0]);
    component.selectExercise(mockExercises[1]);
    
    const firstExerciseName = component.exercisesArray.at(0).get('name')?.value;
    const secondExerciseName = component.exercisesArray.at(1).get('name')?.value;
    
    component.moveExerciseUp(1);
    
    expect(component.exercisesArray.at(0).get('name')?.value).toBe(secondExerciseName);
    expect(component.exercisesArray.at(1).get('name')?.value).toBe(firstExerciseName);
  });

  it('should move exercise down', () => {
    component.selectExercise(mockExercises[0]);
    component.selectExercise(mockExercises[1]);
    
    const firstExerciseName = component.exercisesArray.at(0).get('name')?.value;
    const secondExerciseName = component.exercisesArray.at(1).get('name')?.value;
    
    component.moveExerciseDown(0);
    
    expect(component.exercisesArray.at(0).get('name')?.value).toBe(secondExerciseName);
    expect(component.exercisesArray.at(1).get('name')?.value).toBe(firstExerciseName);
  });

  it('should duplicate exercise', () => {
    component.selectExercise(mockExercises[0]);
    component.duplicateExercise(0);
    
    expect(component.exercisesArray.length).toBe(2);
    expect(component.exercisesArray.at(0).get('name')?.value).toBe('Push-ups');
    expect(component.exercisesArray.at(1).get('name')?.value).toBe('Push-ups');
    expect(mockToastr.success).toHaveBeenCalledWith('Exercise duplicated');
  });

  it('should validate form correctly', () => {
    expect(component.isFormValid).toBeFalse();
    
    component.programForm.patchValue({
      name: 'Valid Program',
      difficulty: ProgramDifficulty.BEGINNER
    });
    component.selectExercise(mockExercises[0]);
    
    expect(component.isFormValid).toBeTrue();
  });

  it('should detect form changes', () => {
    expect(component.hasChanges).toBeFalse();
    // Change the value to something different from the initial value
    component.programForm.get('name')?.setValue('Changed Name');
    component.programForm.get('name')?.markAsDirty();
    component.programForm.get('name')?.markAsTouched();
    fixture.detectChanges();
    expect(component.hasChanges).toBeTrue();
  });

  it('should save program successfully', fakeAsync(() => {
    component.program = mockProgram;
    component.programForm.patchValue({
      name: 'Updated Program',
      difficulty: ProgramDifficulty.INTERMEDIATE
    });
    component.selectExercise(mockExercises[0]);
    
    component.saveProgram();
    tick(1000);
    
    expect(mockToastr.success).toHaveBeenCalledWith('Program updated successfully');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/programs']);
  }));

  it('should show error when saving invalid form', () => {
    component.saveProgram();
    
    expect(mockToastr.error).toHaveBeenCalledWith('Please fix validation errors before saving');
  });

  it('should save as new program successfully', fakeAsync(() => {
    component.programForm.patchValue({
      name: 'New Program',
      difficulty: ProgramDifficulty.ADVANCED
    });
    component.selectExercise(mockExercises[0]);
    
    component.saveAsNew();
    tick(1000);
    
    expect(mockToastr.success).toHaveBeenCalledWith('Program saved as new successfully');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/programs']);
  }));

  it('should show error when saving as new with invalid form', () => {
    component.saveAsNew();
    
    expect(mockToastr.error).toHaveBeenCalledWith('Please fix validation errors before saving');
  });

  it('should cancel without changes', () => {
    component.cancel();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/programs']);
  });

  it('should show confirmation when canceling with changes', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.programForm.get('name')?.setValue('Changed Name');
    component.programForm.get('name')?.markAsDirty();
    component.programForm.get('name')?.markAsTouched();
    fixture.detectChanges();
    component.cancel();
    expect(window.confirm).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/programs']);
  });

  it('should handle exercise loading error', () => {
    mockExerciseService.getExercises.and.returnValue(throwError(() => new Error('Failed to load')));
    
    const newFixture = TestBed.createComponent(ProgramEditComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.ngOnInit();
    
    expect(mockToastr.error).toHaveBeenCalledWith('Failed to load exercises');
  });

  it('should get field error messages correctly', () => {
    const control = component.programForm.get('name');
    control?.setValue('');
    control?.markAsTouched();
    
    const error = component.getFieldError(control, 'Program name');
    expect(error).toBe('Program name is required');
  });

  it('should get category icon correctly', () => {
    expect(component.getCategoryIcon('strength')).toBe('fitness_center');
    expect(component.getCategoryIcon('cardio')).toBe('directions_run');
    expect(component.getCategoryIcon('flexibility')).toBe('accessibility');
    expect(component.getCategoryIcon('balance')).toBe('balance');
    expect(component.getCategoryIcon('sports')).toBe('sports_soccer');
    expect(component.getCategoryIcon('unknown')).toBe('fitness_center');
  });

  it('should get difficulty color correctly', () => {
    expect(component.getDifficultyColor(ProgramDifficulty.BEGINNER)).toBe('success');
    expect(component.getDifficultyColor(ProgramDifficulty.INTERMEDIATE)).toBe('warning');
    expect(component.getDifficultyColor(ProgramDifficulty.ADVANCED)).toBe('error');
  });

  it('should format rest time correctly', () => {
    expect(component.formatRestTime(30)).toBe('30s');
    expect(component.formatRestTime(90)).toBe('1m 30s');
    expect(component.formatRestTime(120)).toBe('2m');
  });

  it('should update selected exercises when form changes', () => {
    component.selectExercise(mockExercises[0]);
    
    expect(component.selectedExercises.length).toBe(1);
    expect(component.selectedExercises[0]).toEqual(mockExercises[0]);
  });

  it('should handle search input changes', () => {
    const event = { target: { value: 'test' } } as any;
    component.onSearchChange(event);
    
    expect(component.searchTerm).toBe('test');
  });

  it('should handle category filter changes', () => {
    component.onCategoryChange('strength');
    
    expect(component.selectedCategory).toBe('strength');
  });

  it('should not move exercise up when at top', () => {
    component.selectExercise(mockExercises[0]);
    const originalName = component.exercisesArray.at(0).get('name')?.value;
    
    component.moveExerciseUp(0);
    
    expect(component.exercisesArray.at(0).get('name')?.value).toBe(originalName);
  });

  it('should not move exercise down when at bottom', () => {
    component.selectExercise(mockExercises[0]);
    const originalName = component.exercisesArray.at(0).get('name')?.value;
    
    component.moveExerciseDown(0);
    
    expect(component.exercisesArray.at(0).get('name')?.value).toBe(originalName);
  });

  it('should handle form validation errors', () => {
    const control = component.programForm.get('name');
    control?.setValue('ab'); // Too short
    control?.markAsTouched();
    
    const error = component.getFieldError(control, 'Program name');
    expect(error).toBe('Program name must be at least 3 characters');
  });

  it('should handle exercise field validation errors', () => {
    component.selectExercise(mockExercises[0]);
    const exerciseControl = component.exercisesArray.at(0).get('sets');
    exerciseControl?.setValue(0); // Invalid value
    exerciseControl?.markAsTouched();
    
    const error = component.getExerciseFieldError(exerciseControl, 'Sets');
    expect(error).toBe('Sets must be at least 1');
  });

  it('should clean up subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
