import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Goal, GoalType, GoalFormData, GoalProgress, ProgressEntry } from '../../models/program.interface';

@Component({
  selector: 'app-goal-management',
  templateUrl: './goal-management.component.html',
  styleUrls: ['./goal-management.component.scss']
})
export class GoalManagementComponent implements OnInit {
  @Input() goals: Goal[] = [];
  @Input() progressEntries: ProgressEntry[] = [];
  @Input() loading: boolean = false;
  @Output() saveGoal = new EventEmitter<Goal>();
  @Output() updateGoal = new EventEmitter<Goal>();
  @Output() deleteGoal = new EventEmitter<string>();
  @Output() completeGoal = new EventEmitter<string>();

  goalForm: FormGroup;
  isEditing: boolean = false;
  editingGoalId: string | null = null;
  showForm: boolean = false;
  goalProgress: GoalProgress[] = [];
  today: string;

  goalTypes = [
    { value: GoalType.WORKOUTS_PER_WEEK, label: 'Workouts per Week', unit: 'workouts/week' },
    { value: GoalType.TOTAL_WORKOUTS, label: 'Total Workouts', unit: 'workouts' },
    { value: GoalType.TOTAL_DURATION, label: 'Total Duration', unit: 'minutes' },
    { value: GoalType.WEIGHT_GOAL, label: 'Weight Goal', unit: 'kg' },
    { value: GoalType.REPS_GOAL, label: 'Reps Goal', unit: 'reps' },
    { value: GoalType.STREAK_GOAL, label: 'Streak Goal', unit: 'days' },
    { value: GoalType.CUSTOM, label: 'Custom Goal', unit: 'custom' }
  ];

  constructor(private fb: FormBuilder) {
    this.goalForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      type: [GoalType.WORKOUTS_PER_WEEK, Validators.required],
      target: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
      unit: ['', Validators.required],
      targetDate: ['', Validators.required]
    });
    
    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.calculateGoalProgress();
  }

  ngOnChanges(): void {
    this.calculateGoalProgress();
  }

  private calculateGoalProgress(): void {
    this.goalProgress = this.goals.map(goal => {
      const currentValue = this.getCurrentValue(goal);
      const percentage = Math.min((currentValue / goal.target) * 100, 100);
      const remainingDays = this.getRemainingDays(goal.targetDate);
      
      return {
        goalId: goal.id,
        currentValue,
        targetValue: goal.target,
        percentage: Math.round(percentage),
        isCompleted: currentValue >= goal.target,
        remainingDays
      };
    });
  }

  private getCurrentValue(goal: Goal): number {
    const now = new Date();
    const startDate = new Date(goal.startDate);
    
    switch (goal.type) {
      case GoalType.WORKOUTS_PER_WEEK:
        return this.getWorkoutsThisWeek();
      case GoalType.TOTAL_WORKOUTS:
        return this.progressEntries.length;
      case GoalType.TOTAL_DURATION:
        return this.progressEntries.reduce((sum, entry) => sum + entry.totalDuration, 0);
      case GoalType.WEIGHT_GOAL:
        return this.getMaxWeight();
      case GoalType.REPS_GOAL:
        return this.getMaxReps();
      case GoalType.STREAK_GOAL:
        return this.getCurrentStreak();
      case GoalType.CUSTOM:
        return goal.current;
      default:
        return 0;
    }
  }

  private getWorkoutsThisWeek(): number {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return this.progressEntries.filter(entry => 
      new Date(entry.workoutDate) >= startOfWeek
    ).length;
  }

  private getMaxWeight(): number {
    let maxWeight = 0;
    this.progressEntries.forEach(entry => {
      entry.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.weight > maxWeight) {
            maxWeight = set.weight;
          }
        });
      });
    });
    return maxWeight;
  }

  private getMaxReps(): number {
    let maxReps = 0;
    this.progressEntries.forEach(entry => {
      entry.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.reps > maxReps) {
            maxReps = set.reps;
          }
        });
      });
    });
    return maxReps;
  }

  private getCurrentStreak(): number {
    if (!this.progressEntries.length) return 0;
    
    const dates = this.progressEntries
      .map(e => new Date(e.workoutDate))
      .sort((a, b) => a.getTime() - b.getTime());
    
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const diff = Math.floor((today.getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0 || diff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  }

  private getRemainingDays(targetDate: Date): number {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  onGoalTypeChange(): void {
    const selectedType = this.goalForm.get('type')?.value;
    const goalType = this.goalTypes.find(t => t.value === selectedType);
    if (goalType) {
      this.goalForm.patchValue({ unit: goalType.unit });
    }
  }

  onCreateGoal(): void {
    this.isEditing = false;
    this.editingGoalId = null;
    this.showForm = true;
    this.goalForm.reset({
      type: GoalType.WORKOUTS_PER_WEEK,
      target: 1,
      unit: 'workouts/week',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
  }

  onEditGoal(goal: Goal): void {
    this.isEditing = true;
    this.editingGoalId = goal.id;
    this.showForm = true;
    this.goalForm.patchValue({
      title: goal.title,
      description: goal.description,
      type: goal.type,
      target: goal.target,
      unit: goal.unit,
      targetDate: new Date(goal.targetDate)
    });
  }

  onSaveGoal(): void {
    if (this.goalForm.valid) {
      const formData = this.goalForm.value;
      
      if (this.isEditing && this.editingGoalId) {
        const updatedGoal: Goal = {
          ...this.goals.find(g => g.id === this.editingGoalId)!,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          target: formData.target,
          unit: formData.unit,
          targetDate: new Date(formData.targetDate),
          updatedAt: new Date()
        };
        this.updateGoal.emit(updatedGoal);
      } else {
        const newGoal: Goal = {
          id: this.generateId(),
          userId: 'current-user', // This should come from auth service
          title: formData.title,
          description: formData.description,
          type: formData.type,
          target: formData.target,
          current: 0,
          unit: formData.unit,
          startDate: new Date(),
          targetDate: new Date(formData.targetDate),
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.saveGoal.emit(newGoal);
      }
      
      this.showForm = false;
      this.goalForm.reset();
    }
  }

  onCancel(): void {
    this.showForm = false;
    this.goalForm.reset();
  }

  onDeleteGoal(goalId: string): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.deleteGoal.emit(goalId);
    }
  }

  onCompleteGoal(goalId: string): void {
    this.completeGoal.emit(goalId);
  }

  private generateId(): string {
    return 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getGoalProgress(goalId: string): GoalProgress | undefined {
    return this.goalProgress.find(p => p.goalId === goalId);
  }

  getGoalTypeLabel(type: GoalType): string {
    return this.goalTypes.find(t => t.value === type)?.label || type;
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 50) return 'warning';
    return 'danger';
  }
}
