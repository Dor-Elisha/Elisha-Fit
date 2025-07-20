import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(email: string, password: string, name?: string): Observable<AuthResponse> {
    const payload = name ? { email, password, name } : { email, password };
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {});
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, {});
  }

  updateUserName(userId: string, newName: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}/name`, { name: newName });
  }

  saveProgram(program: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/programs`, program);
  }

  getPrograms(): Observable<any> {
    return this.http.get(`${this.baseUrl}/programs`);
  }

  editProgram(programId: string, program: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/programs/${programId}`, program);
  }

  getInitialUserData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/initial-data`);
  }
}
