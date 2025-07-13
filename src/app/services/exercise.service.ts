import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Exercise } from '../models/exercise.interface';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  categories: string[] = [];
  muscleGroups: string[] = [];
  exerciseLevels: string[] = [];

  constructor(private http: HttpClient) {}

  getExercises(): Observable<Exercise[]> {
    return this.http.get<{exercises: Exercise[]}>('assets/data/exercises.json').pipe(
      map(data => data.exercises)
    );
  }
}
