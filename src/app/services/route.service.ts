import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(data: unknown): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/login`, data);
  }

  // additional backend calls can be placed here
}
