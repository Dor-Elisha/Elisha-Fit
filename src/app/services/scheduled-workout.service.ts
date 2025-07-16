import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ScheduledWorkout {
  _id?: string;
  userId: string;
  date: string; // ISO string
  programId: string;
  programSnapshot: any;
}

@Injectable({ providedIn: 'root' })
export class ScheduledWorkoutService {
  private readonly baseUrl = `${environment.apiUrl}/scheduled-workouts`;

  constructor(private http: HttpClient) {}

  getScheduledWorkout(date: string): Observable<ScheduledWorkout | null> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ScheduledWorkout | null>(this.baseUrl, { params });
  }

  /**
   * Get all scheduled workouts for a date range (inclusive)
   */
  getScheduledWorkoutsForRange(start: string, end: string): Observable<ScheduledWorkout[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<ScheduledWorkout[]>(`${this.baseUrl}/range`, { params });
  }

  scheduleWorkout(date: string, programId: string, programSnapshot: any): Observable<ScheduledWorkout> {
    return this.http.post<ScheduledWorkout>(this.baseUrl, { date, programId, programSnapshot });
  }

  /**
   * Remove a scheduled workout for a specific day (date string can be any time, backend matches the whole day)
   */
  removeScheduledWorkout(date: string): Observable<any> {
    const params = new HttpParams().set('date', date);
    return this.http.delete(this.baseUrl, { params });
  }
} 