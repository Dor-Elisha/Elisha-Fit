import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  constructor(private http: HttpClient) {

  }

  exercises: any;
  categories: any;
  muscleGroups: any;
  exerciseLevels: any;

  getExercises(): Observable<any> {
    return this.http.get<any>('assets/data/exercises.json');
  }
}
