import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}auth/login`, { email, password })
      .pipe(
        tap((res: any) => {
          if (res && res.token) {
            localStorage.setItem('token', res.token);
          }
        })
      );
  }

  register(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}auth/register`, { email, password })
      .pipe(
        tap((res: any) => {
          if (res && res.token) {
            localStorage.setItem('token', res.token);
          }
        })
      );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
