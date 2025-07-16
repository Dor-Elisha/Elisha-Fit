import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, shareReplay, catchError, of } from 'rxjs';
import { AdapterService } from './adapter.service';
import { environment } from '../../environments/environment';

export interface ExerciseResponse {
  exercises: any[]; // Changed from LegacyExercise to any[] as LegacyExercise is removed
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private readonly baseUrl = `${environment.apiUrl}/exercises`;

  constructor(
    private http: HttpClient,
    private adapter: AdapterService
  ) {}

  /**
   * Get all exercises with optional filtering and pagination
   */
  getExercises(filters: any) {
    let params = new HttpParams();
    
    // Add filter parameters
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<any>(this.baseUrl, { params }).pipe( // Changed ExerciseListResponse to any
      map(response => this.adapter.toLegacyExerciseResponse(response)),
      catchError(error => {
        console.error('Error fetching exercises:', error);
        return of({
          exercises: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0
        });
      })
    );
  }

  /**
   * Get a specific exercise by ID
   */
  getExerciseById(id: string): Observable<any | null> { // Changed LegacyExercise to any
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe( // Changed SingleExerciseResponse to any
      map(response => response.data ? this.adapter.toLegacyExercise(response.data) : null),
      catchError(error => {
        console.error(`Error fetching exercise ${id}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Get all exercise categories
   */
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]);
      })
    );
  }

  /**
   * Get all muscle groups
   */
  getMuscleGroups(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/muscles`).pipe(
      catchError(error => {
        console.error('Error fetching muscle groups:', error);
        return of([]);
      })
    );
  }

  /**
   * Get all equipment types
   */
  getEquipment(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/equipment`).pipe(
      catchError(error => {
        console.error('Error fetching equipment:', error);
        return of([]);
      })
    );
  }

  /**
   * Search exercises by query
   */
  searchExercises(query: string): Observable<ExerciseResponse> {
    return this.getExercises({ search: query });
  }

  /**
   * Get exercises by category
   */
  getExercisesByCategory(category: string): Observable<ExerciseResponse> {
    return this.getExercises({ category });
  }

  /**
   * Get exercises by muscle group
   */
  getExercisesByMuscleGroup(muscle: string): Observable<ExerciseResponse> {
    return this.getExercises({ muscle });
  }

  /**
   * Get exercises by equipment
   */
  getExercisesByEquipment(equipment: string): Observable<ExerciseResponse> {
    return this.getExercises({ equipment });
  }

  /**
   * Create a new exercise (admin only)
   */
  createExercise(exercise: Omit<any, '_id' | 'createdAt' | 'updatedAt'>): Observable<any> { // Changed Exercise to any
    return this.http.post<any>(this.baseUrl, exercise).pipe( // Changed SingleExerciseResponse to any
      catchError(error => {
        console.error('Error creating exercise:', error);
        return of({
          success: false,
          error: 'Failed to create exercise',
          timestamp: new Date().toISOString()
        });
      })
    );
  }

  /**
   * Update an existing exercise (admin only)
   */
  updateExercise(id: string, exercise: Partial<any>): Observable<any> { // Changed Exercise to any
    return this.http.put<any>(`${this.baseUrl}/${id}`, exercise).pipe( // Changed SingleExerciseResponse to any
      catchError(error => {
        console.error(`Error updating exercise ${id}:`, error);
        return of({
          success: false,
          error: 'Failed to update exercise',
          timestamp: new Date().toISOString()
        });
      })
    );
  }

  /**
   * Delete an exercise (admin only)
   */
  deleteExercise(id: string): Observable<any> { // Changed ApiResponse<void> to any
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe( // Changed ApiResponse<void> to any
      catchError(error => {
        console.error(`Error deleting exercise ${id}:`, error);
        return of({
          success: false,
          error: 'Failed to delete exercise',
          timestamp: new Date().toISOString()
        });
      })
    );
  }
}
