import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/v1/auth';

  constructor(private http: HttpClient) {}

  register(email: string, password: string) {
    return this.http.post(`${this.baseUrl}/register`, { email, password });
  }

  login(email: string, password: string) {
    return this.http.post(`${this.baseUrl}/login`, { email, password });
  }
}
