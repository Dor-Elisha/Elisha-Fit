import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private readonly baseUrl = `${environment.apiUrl}/programs`;

  constructor(private http: HttpClient) {}

  /**
   * Get all programs for the current user
   * HTTP Method: GET
   */
  getPrograms(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      catchError(error => {
        console.error('Error fetching programs:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a specific program by ID
   * HTTP Method: GET
   */
  getProgramById(id: string): Observable<any | null> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching program ${id}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Create a new program
   * HTTP Method: POST
   */
  createProgram(program: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, program).pipe(
      catchError(error => {
        console.error('Error creating program:', error);
        return throwError(() => new Error('Failed to create program'));
      })
    );
  }

  /**
   * Update an existing program
   * HTTP Method: PUT
   */
  updateProgram(id: string, updates: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, updates).pipe(
      catchError(error => {
        console.error(`Error updating program ${id}:`, error);
        return throwError(() => new Error('Failed to update program'));
      })
    );
  }

  /**
   * Delete a program
   * HTTP Method: DELETE
   */
  deleteProgram(id: string): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error deleting program ${id}:`, error);
        return throwError(() => new Error('Failed to delete program'));
      }),
      map(() => true)
    );
  }

  /**
   * Duplicate a program (creates a copy)
   * HTTP Method: POST (creates new resource)
   */
  duplicateProgram(id: string, customName?: string): Observable<any> {
    return this.getProgramById(id).pipe(
      catchError(error => {
        console.error(`Error fetching program ${id} for duplication:`, error);
        return throwError(() => new Error('Program not found'));
      }),
      map(originalProgram => {
        if (!originalProgram) {
          throw new Error('Program not found');
        }

        // Deep clone to avoid mutating the original
        const duplicatedProgram = JSON.parse(JSON.stringify(originalProgram));

        // Remove top-level fields
        delete duplicatedProgram._id;
        delete duplicatedProgram.createdAt;
        delete duplicatedProgram.updatedAt;

        // Remove unwanted fields from nested exercises, if present
        if (Array.isArray(duplicatedProgram.exercises)) {
          duplicatedProgram.exercises = duplicatedProgram.exercises.map((ex: any) => {
            const { _id, createdAt, updatedAt, ...rest } = ex;
            return rest;
          });
        }

        // Set new name and description
        duplicatedProgram.name = customName || `${originalProgram.name} (Copy)`;
        duplicatedProgram.description = originalProgram.description
          ? `${originalProgram.description} (Duplicated)`
          : undefined;

        return duplicatedProgram;
      }),
      switchMap(duplicatedProgram => this.createProgram(duplicatedProgram))
    );
  }
} 