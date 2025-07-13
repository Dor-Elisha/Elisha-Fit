import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { GoalManagementComponent } from './goal-management.component';
import { Goal, GoalType, ProgressEntry } from '../../models/program.interface';

describe('GoalManagementComponent', () => {
  let component: GoalManagementComponent;
  let fixture: ComponentFixture<GoalManagementComponent>;

  const mockGoals: Goal[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'Workout 3 times per week',
      description: 'Build consistency',
      type: GoalType.WORKOUTS_PER_WEEK,
      target: 3,
      current: 2,
      unit: 'workouts/week',
      startDate: new Date('2024-01-01'),
      targetDate: new Date('2024-02-01'),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Complete 20 workouts',
      description: 'Reach milestone',
      type: GoalType.TOTAL_WORKOUTS,
      target: 20,
      current: 15,
      unit: 'workouts',
      startDate: new Date('2024-01-01'),
      targetDate: new Date('2024-03-01'),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockProgressEntries: ProgressEntry[] = [
    {
      id: '1',
      programId: '1',
      userId: 'user1',
      workoutDate: new Date('2024-01-15'),
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
            { setNumber: 2, weight: 100, reps: 8, restTime: 90, completed: true }
          ]
        }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoalManagementComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalManagementComponent);
    component = fixture.componentInstance;
    component.goals = mockGoals;
    component.progressEntries = mockProgressEntries;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.goals).toEqual(mockGoals);
    expect(component.progressEntries).toEqual(mockProgressEntries);
    expect(component.loading).toBe(false);
    expect(component.showForm).toBe(false);
    expect(component.isEditing).toBe(false);
  });

  it('should have correct goal types', () => {
    expect(component.goalTypes.length).toBe(7);
    expect(component.goalTypes[0].value).toBe(GoalType.WORKOUTS_PER_WEEK);
    expect(component.goalTypes[1].value).toBe(GoalType.TOTAL_WORKOUTS);
  });

  it('should calculate goal progress correctly', () => {
    expect(component.goalProgress.length).toBe(2);
    const progress = component.goalProgress[0];
    expect(progress.goalId).toBe('1');
    expect(progress.targetValue).toBe(3);
    expect(progress.percentage).toBeGreaterThanOrEqual(0);
    expect(progress.percentage).toBeLessThanOrEqual(100);
  });

  it('should get current value for workouts per week goal', () => {
    const goal = mockGoals[0];
    const currentValue = component['getCurrentValue'](goal);
    expect(currentValue).toBeGreaterThanOrEqual(0);
  });

  it('should get current value for total workouts goal', () => {
    const goal = mockGoals[1];
    const currentValue = component['getCurrentValue'](goal);
    expect(currentValue).toBe(1); // Based on mock progress entries
  });

  it('should get current value for total duration goal', () => {
    const goal: Goal = {
      ...mockGoals[0],
      type: GoalType.TOTAL_DURATION,
      target: 100,
      unit: 'minutes'
    };
    const currentValue = component['getCurrentValue'](goal);
    expect(currentValue).toBe(60); // Based on mock progress entries
  });

  it('should get max weight from progress entries', () => {
    const maxWeight = component['getMaxWeight']();
    expect(maxWeight).toBe(100); // Based on mock data
  });

  it('should get max reps from progress entries', () => {
    const maxReps = component['getMaxReps']();
    expect(maxReps).toBe(8); // Based on mock data
  });

  it('should calculate current streak', () => {
    const streak = component['getCurrentStreak']();
    expect(streak).toBeGreaterThanOrEqual(0);
  });

  it('should calculate remaining days', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const remainingDays = component['getRemainingDays'](futureDate);
    expect(remainingDays).toBeGreaterThan(0);
  });

  it('should update unit when goal type changes', () => {
    component.goalForm.patchValue({ type: GoalType.TOTAL_WORKOUTS });
    component.onGoalTypeChange();
    expect(component.goalForm.get('unit')?.value).toBe('workouts');
  });

  it('should open create goal form', () => {
    component.onCreateGoal();
    expect(component.showForm).toBe(true);
    expect(component.isEditing).toBe(false);
    expect(component.editingGoalId).toBeNull();
  });

  it('should open edit goal form', () => {
    const goal = mockGoals[0];
    component.onEditGoal(goal);
    expect(component.showForm).toBe(true);
    expect(component.isEditing).toBe(true);
    expect(component.editingGoalId).toBe(goal.id);
    expect(component.goalForm.get('title')?.value).toBe(goal.title);
  });

  it('should close form on cancel', () => {
    component.showForm = true;
    component.onCancel();
    expect(component.showForm).toBe(false);
    expect(component.goalForm.pristine).toBe(true);
  });

  it('should emit save goal event', () => {
    spyOn(component.saveGoal, 'emit');
    component.goalForm.patchValue({
      title: 'New Goal',
      type: GoalType.WORKOUTS_PER_WEEK,
      target: 3,
      unit: 'workouts/week',
      targetDate: new Date()
    });
    component.onSaveGoal();
    expect(component.saveGoal.emit).toHaveBeenCalled();
  });

  it('should emit update goal event when editing', () => {
    spyOn(component.updateGoal, 'emit');
    component.isEditing = true;
    component.editingGoalId = '1';
    component.goalForm.patchValue({
      title: 'Updated Goal',
      type: GoalType.WORKOUTS_PER_WEEK,
      target: 4,
      unit: 'workouts/week',
      targetDate: new Date()
    });
    component.onSaveGoal();
    expect(component.updateGoal.emit).toHaveBeenCalled();
  });

  it('should emit delete goal event', () => {
    spyOn(component.deleteGoal, 'emit');
    spyOn(window, 'confirm').and.returnValue(true);
    component.onDeleteGoal('1');
    expect(component.deleteGoal.emit).toHaveBeenCalledWith('1');
  });

  it('should emit complete goal event', () => {
    spyOn(component.completeGoal, 'emit');
    component.onCompleteGoal('1');
    expect(component.completeGoal.emit).toHaveBeenCalledWith('1');
  });

  it('should get goal progress by id', () => {
    const progress = component.getGoalProgress('1');
    expect(progress).toBeDefined();
    expect(progress?.goalId).toBe('1');
  });

  it('should get goal type label', () => {
    const label = component.getGoalTypeLabel(GoalType.WORKOUTS_PER_WEEK);
    expect(label).toBe('Workouts per Week');
  });

  it('should get progress color based on percentage', () => {
    expect(component.getProgressColor(100)).toBe('success');
    expect(component.getProgressColor(80)).toBe('info');
    expect(component.getProgressColor(60)).toBe('warning');
    expect(component.getProgressColor(30)).toBe('danger');
  });

  it('should validate form fields', () => {
    const titleControl = component.goalForm.get('title');
    const targetControl = component.goalForm.get('target');
    
    expect(titleControl?.valid).toBe(false);
    expect(targetControl?.valid).toBe(true);
    
    titleControl?.setValue('Valid Title');
    expect(titleControl?.valid).toBe(true);
  });

  it('should show loading state', () => {
    component.loading = true;
    fixture.detectChanges();
    
    const loadingElement = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingElement).toBeTruthy();
  });

  it('should show empty state when no goals', () => {
    component.goals = [];
    fixture.detectChanges();
    
    const emptyElement = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyElement).toBeTruthy();
  });

  it('should display goals list when goals exist', () => {
    const goalsList = fixture.nativeElement.querySelector('.goals-list');
    expect(goalsList).toBeTruthy();
    
    const goalCards = fixture.nativeElement.querySelectorAll('.goal-card');
    expect(goalCards.length).toBe(2);
  });

  it('should show goal form modal when creating goal', () => {
    component.onCreateGoal();
    fixture.detectChanges();
    
    const modal = fixture.nativeElement.querySelector('.goal-form-modal');
    expect(modal).toBeTruthy();
  });

  it('should generate unique goal id', () => {
    const id1 = component['generateId']();
    const id2 = component['generateId']();
    expect(id1).not.toBe(id2);
    expect(id1).toContain('goal_');
  });
});
