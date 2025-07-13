import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Exercise } from '../models/exercise.interface';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private exercises$ = this.http.get<{exercises: Exercise[]}>('assets/data/exercises.json').pipe(
    map(data => data.exercises),
    shareReplay(1)
  );

  constructor(private http: HttpClient) {}

  getExercises(): Observable<Exercise[]> {
    return this.exercises$;
  }

  getCategories(): Observable<string[]> {
    return this.exercises$.pipe(
      map(exercises => [...new Set(exercises.map(e => e.category))].sort())
    );
  }

  getMuscleGroups(): Observable<string[]> {
    return this.exercises$.pipe(
      map(exercises => [...new Set(exercises.flatMap(e => [...e.primaryMuscles, ...e.secondaryMuscles]))].sort())
    );
  }

  getEquipment(): Observable<string[]> {
    return this.exercises$.pipe(
      map(exercises => [...new Set(exercises.map(e => e.equipment).filter(Boolean))].sort())
    );
  }

  getLevels(): Observable<string[]> {
    return this.exercises$.pipe(
      map(exercises => [...new Set(exercises.map(e => e.level))].sort())
    );
  }

  searchExercises(query: string): Observable<Exercise[]> {
    return this.exercises$.pipe(
      map(exercises => {
        const searchTerm = query.toLowerCase();
        return exercises.filter(exercise =>
          exercise.name.toLowerCase().includes(searchTerm) ||
          exercise.category.toLowerCase().includes(searchTerm) ||
          exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(searchTerm)) ||
          exercise.secondaryMuscles.some(muscle => muscle.toLowerCase().includes(searchTerm))
        );
      })
    );
  }

  getExercisesByCategory(category: string): Observable<Exercise[]> {
    return this.exercises$.pipe(
      map(exercises => exercises.filter(e => e.category === category))
    );
  }

  getExercisesByMuscleGroup(muscleGroup: string): Observable<Exercise[]> {
    return this.exercises$.pipe(
      map(exercises => exercises.filter(e => 
        e.primaryMuscles.includes(muscleGroup) || e.secondaryMuscles.includes(muscleGroup)
      ))
    );
  }
}
