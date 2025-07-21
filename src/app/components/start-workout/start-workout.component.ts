import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeneralService } from '../../services/general.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-start-workout',
  templateUrl: './start-workout.component.html',
  styleUrls: ['./start-workout.component.scss']
})
export class StartWorkoutComponent implements OnInit, OnDestroy {
  workouts: any[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    public gs: GeneralService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.gs.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        this.workouts = userInfo?.workouts || [];
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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