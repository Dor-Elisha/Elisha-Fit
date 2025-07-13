import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { 
  ProgressEntry, 
  Program, 
  ExerciseProgress,
  SetProgress
} from '../../models/program.interface';

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface AnalyticsSummary {
  totalWorkouts: number;
  totalDuration: number;
  averageRating: number;
  completionRate: number;
  totalExercises: number;
  totalSets: number;
  averageWeight: number;
  averageReps: number;
  mostUsedProgram: string;
  bestRatedWorkout: ProgressEntry | null;
  longestWorkout: ProgressEntry | null;
  recentTrend: 'improving' | 'declining' | 'stable';
}

@Component({
  selector: 'app-progress-analytics',
  templateUrl: './progress-analytics.component.html',
  styleUrls: ['./progress-analytics.component.scss']
})
export class ProgressAnalyticsComponent implements OnInit, OnChanges {
  @Input() progressEntries: ProgressEntry[] = [];
  @Input() programs: Program[] = [];
  @Input() loading: boolean = false;
  @Input() selectedTimeRange: string = 'month';
  @Output() timeRangeChange = new EventEmitter<string>();

  analyticsSummary: AnalyticsSummary | null = null;
  weightProgressChart: ChartData | null = null;
  repsProgressChart: ChartData | null = null;
  durationChart: ChartData | null = null;
  ratingChart: ChartData | null = null;
  programUsageChart: ChartData | null = null;
  completionRateChart: ChartData | null = null;

  timeRangeOptions = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.calculateAnalytics();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['progressEntries'] || changes['selectedTimeRange']) {
      this.calculateAnalytics();
    }
  }

  onTimeRangeChange(): void {
    this.timeRangeChange.emit(this.selectedTimeRange);
    this.calculateAnalytics();
  }

  private calculateAnalytics(): void {
    if (!this.progressEntries.length) {
      this.resetCharts();
      return;
    }

    const filteredEntries = this.filterEntriesByTimeRange();
    this.analyticsSummary = this.calculateSummary(filteredEntries);
    this.generateCharts(filteredEntries);
  }

  private filterEntriesByTimeRange(): ProgressEntry[] {
    if (this.selectedTimeRange === 'all') {
      return this.progressEntries;
    }

    const now = new Date();
    const startDate = this.getStartDate(this.selectedTimeRange, now);
    
    return this.progressEntries.filter(entry => 
      new Date(entry.workoutDate) >= startDate
    );
  }

  private getStartDate(range: string, now: Date): Date {
    const start = new Date(now);
    
    switch (range) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    
    return start;
  }

  private calculateSummary(entries: ProgressEntry[]): AnalyticsSummary {
    const totalWorkouts = entries.length;
    const totalDuration = entries.reduce((sum, entry) => sum + entry.totalDuration, 0);
    const totalRating = entries.reduce((sum, entry) => sum + (entry.rating || 0), 0);
    const averageRating = totalWorkouts > 0 ? totalRating / totalWorkouts : 0;

    const totalSets = entries.reduce((sum, entry) => 
      sum + entry.exercises.reduce((exSum, exercise) => 
        exSum + exercise.sets.length, 0), 0
    );

    const completedSets = entries.reduce((sum, entry) => 
      sum + entry.exercises.reduce((exSum, exercise) => 
        exSum + exercise.sets.filter(set => set.completed).length, 0), 0
    );

    const completionRate = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

    const totalExercises = entries.reduce((sum, entry) => 
      sum + entry.exercises.length, 0
    );

    const allWeights = entries.flatMap(entry => 
      entry.exercises.flatMap(exercise => 
        exercise.sets.map(set => set.weight)
      )
    );
    const averageWeight = allWeights.length > 0 ? 
      allWeights.reduce((sum, weight) => sum + weight, 0) / allWeights.length : 0;

    const allReps = entries.flatMap(entry => 
      entry.exercises.flatMap(exercise => 
        exercise.sets.map(set => set.reps)
      )
    );
    const averageReps = allReps.length > 0 ? 
      allReps.reduce((sum, reps) => sum + reps, 0) / allReps.length : 0;

    const programUsage = this.calculateProgramUsage(entries);
    const mostUsedProgram = programUsage.length > 0 ? programUsage[0].programName : 'None';

    const bestRatedWorkout = entries.reduce((best, entry) => 
      (entry.rating || 0) > (best?.rating || 0) ? entry : best, null as ProgressEntry | null
    );

    const longestWorkout = entries.reduce((longest, entry) => 
      entry.totalDuration > (longest?.totalDuration || 0) ? entry : longest, null as ProgressEntry | null
    );

    const recentTrend = this.calculateTrend(entries);

    return {
      totalWorkouts,
      totalDuration,
      averageRating: Math.round(averageRating * 10) / 10,
      completionRate: Math.round(completionRate),
      totalExercises,
      totalSets,
      averageWeight: Math.round(averageWeight),
      averageReps: Math.round(averageReps),
      mostUsedProgram,
      bestRatedWorkout,
      longestWorkout,
      recentTrend
    };
  }

  private calculateProgramUsage(entries: ProgressEntry[]): Array<{programName: string, count: number}> {
    const usage: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      const programName = this.getProgramName(entry.programId);
      usage[programName] = (usage[programName] || 0) + 1;
    });

    return Object.entries(usage)
      .map(([programName, count]) => ({ programName, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateTrend(entries: ProgressEntry[]): 'improving' | 'declining' | 'stable' {
    if (entries.length < 2) return 'stable';

    const sortedEntries = entries.sort((a, b) => 
      new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime()
    );

    const midPoint = Math.floor(sortedEntries.length / 2);
    const firstHalf = sortedEntries.slice(0, midPoint);
    const secondHalf = sortedEntries.slice(midPoint);

    const firstHalfAvg = this.calculateAverageWeight(firstHalf);
    const secondHalfAvg = this.calculateAverageWeight(secondHalf);

    const difference = secondHalfAvg - firstHalfAvg;
    const threshold = firstHalfAvg * 0.05; // 5% threshold

    if (difference > threshold) return 'improving';
    if (difference < -threshold) return 'declining';
    return 'stable';
  }

  private calculateAverageWeight(entries: ProgressEntry[]): number {
    const allWeights = entries.flatMap(entry => 
      entry.exercises.flatMap(exercise => 
        exercise.sets.map(set => set.weight)
      )
    );
    
    return allWeights.length > 0 ? 
      allWeights.reduce((sum, weight) => sum + weight, 0) / allWeights.length : 0;
  }

  private generateCharts(entries: ProgressEntry[]): void {
    this.generateWeightProgressChart(entries);
    this.generateRepsProgressChart(entries);
    this.generateDurationChart(entries);
    this.generateRatingChart(entries);
    this.generateProgramUsageChart(entries);
    this.generateCompletionRateChart(entries);
  }

  private generateWeightProgressChart(entries: ProgressEntry[]): void {
    const sortedEntries = entries.sort((a, b) => 
      new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime()
    );

    const labels = sortedEntries.map(entry => 
      this.formatDate(new Date(entry.workoutDate))
    );

    const weightData = sortedEntries.map(entry => 
      this.calculateAverageWeight([entry])
    );

    this.weightProgressChart = {
      labels,
      datasets: [{
        label: 'Average Weight (kg)',
        data: weightData,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  }

  private generateRepsProgressChart(entries: ProgressEntry[]): void {
    const sortedEntries = entries.sort((a, b) => 
      new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime()
    );

    const labels = sortedEntries.map(entry => 
      this.formatDate(new Date(entry.workoutDate))
    );

    const repsData = sortedEntries.map(entry => {
      const allReps = entry.exercises.flatMap(exercise => 
        exercise.sets.map(set => set.reps)
      );
      return allReps.length > 0 ? 
        allReps.reduce((sum, reps) => sum + reps, 0) / allReps.length : 0;
    });

    this.repsProgressChart = {
      labels,
      datasets: [{
        label: 'Average Reps',
        data: repsData,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  }

  private generateDurationChart(entries: ProgressEntry[]): void {
    const sortedEntries = entries.sort((a, b) => 
      new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime()
    );

    const labels = sortedEntries.map(entry => 
      this.formatDate(new Date(entry.workoutDate))
    );

    const durationData = sortedEntries.map(entry => entry.totalDuration);

    this.durationChart = {
      labels,
      datasets: [{
        label: 'Workout Duration (minutes)',
        data: durationData,
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  }

  private generateRatingChart(entries: ProgressEntry[]): void {
    const ratingCounts = [0, 0, 0, 0, 0];
    
    entries.forEach(entry => {
      if (entry.rating && entry.rating >= 1 && entry.rating <= 5) {
        ratingCounts[entry.rating - 1]++;
      }
    });

    this.ratingChart = {
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      datasets: [{
        label: 'Number of Workouts',
        data: ratingCounts,
        backgroundColor: [
          '#dc3545',
          '#fd7e14',
          '#ffc107',
          '#20c997',
          '#28a745'
        ],
        borderWidth: 1
      }]
    };
  }

  private generateProgramUsageChart(entries: ProgressEntry[]): void {
    const programUsage = this.calculateProgramUsage(entries);
    
    this.programUsageChart = {
      labels: programUsage.map(p => p.programName),
      datasets: [{
        label: 'Number of Workouts',
        data: programUsage.map(p => p.count),
        backgroundColor: [
          '#007bff',
          '#28a745',
          '#ffc107',
          '#dc3545',
          '#6f42c1',
          '#fd7e14',
          '#20c997',
          '#e83e8c'
        ],
        borderWidth: 1
      }]
    };
  }

  private generateCompletionRateChart(entries: ProgressEntry[]): void {
    const sortedEntries = entries.sort((a, b) => 
      new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime()
    );

    const labels = sortedEntries.map(entry => 
      this.formatDate(new Date(entry.workoutDate))
    );

    const completionData = sortedEntries.map(entry => {
      const totalSets = entry.exercises.reduce((sum, exercise) => 
        sum + exercise.sets.length, 0
      );
      const completedSets = entry.exercises.reduce((sum, exercise) => 
        sum + exercise.sets.filter(set => set.completed).length, 0
      );
      return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
    });

    this.completionRateChart = {
      labels,
      datasets: [{
        label: 'Completion Rate (%)',
        data: completionData,
        borderColor: '#17a2b8',
        backgroundColor: 'rgba(23, 162, 184, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  }

  private resetCharts(): void {
    this.analyticsSummary = null;
    this.weightProgressChart = null;
    this.repsProgressChart = null;
    this.durationChart = null;
    this.ratingChart = null;
    this.programUsageChart = null;
    this.completionRateChart = null;
  }

  public getProgramName(programId: string): string {
    const program = this.programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  getMath(): any {
    return Math;
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving': return 'fas fa-arrow-up text-success';
      case 'declining': return 'fas fa-arrow-down text-danger';
      default: return 'fas fa-minus text-muted';
    }
  }

  getTrendText(trend: string): string {
    switch (trend) {
      case 'improving': return 'Improving';
      case 'declining': return 'Declining';
      default: return 'Stable';
    }
  }
}
