import { Component, OnInit } from '@angular/core';
import { WorkoutService } from '../../services/workout.service';
import { Router } from '@angular/router';
import { AdapterService } from '../../services/adapter.service';

@Component({
  selector: 'app-start-workout',
  templateUrl: './start-workout.component.html',
  styleUrls: ['./start-workout.component.scss']
})
export class StartWorkoutComponent implements OnInit {
  workouts: any[] = [];
  loading = false;

  constructor(
    private programService: WorkoutService,
    private router: Router,
    private adapter: AdapterService
  ) {}

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.loading = true;
    this.programService.getWorkouts().subscribe({
      next: (workouts) => {
        this.workouts = this.adapter.toLegacyWorkoutArray(workouts);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  startWorkout(workout: any): void {
    this.router.navigate(['/workout-detail', workout._id], { queryParams: { start: 'true' } });
  }

  getWorkoutStats(workout: any): any {
    return {
      exercises: workout.exercises?.length || 0,
      estimatedDuration: workout.estimatedDuration || 0,
    };
  }

  getWorkoutCategory(workout: any): string {
    const tags = workout.tags || [];
    if (tags.includes('strength')) return 'strength';
    if (tags.includes('cardio')) return 'cardio';
    if (tags.includes('flexibility')) return 'flexibility';
    if (tags.includes('hiit')) return 'hiit';
    if (tags.includes('yoga')) return 'yoga';
    return 'mixed';
  }
} 