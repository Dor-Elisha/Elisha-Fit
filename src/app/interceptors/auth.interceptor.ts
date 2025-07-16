import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add auth token to request if available
    const token = this.authService.token;
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // If we're already trying to refresh, don't try again
    if (this.isRefreshing) {
      // Clear auth and redirect to login
      this.authService.logout();
      return throwError(() => new Error('Authentication failed'));
    }

    this.isRefreshing = true;

    // Check if token is expired
    if (this.authService.isTokenExpired()) {
      this.isRefreshing = false;
      this.authService.logout();
      return throwError(() => new Error('Token expired'));
    }

    // Try to refresh the token
    return this.authService.refreshToken().pipe(
      switchMap((response) => {
        this.isRefreshing = false;
        // Retry the original request with new token
        return next.handle(this.addToken(request, response.token));
      }),
      catchError((error) => {
        this.isRefreshing = false;
        // If refresh fails, logout and redirect
        this.authService.logout();
        return throwError(() => error);
      })
    );
  }
} 