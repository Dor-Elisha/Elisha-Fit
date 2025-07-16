import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { RouteService } from './route.service';

export interface AuthResponse {
  user: any;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(
    private routeService: RouteService,
    private router: Router,
  ) {
    this.loadStoredAuth();
  }

  get currentUser(): any | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value && !!this.tokenSubject.value;
  }

  private loadStoredAuth(): void {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('authToken');
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.tokenSubject.next(storedToken);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      this.clearAuth();
    }
  }

  private storeAuth(user: any, token: string): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      this.currentUserSubject.next(user);
      this.tokenSubject.next(token);
    } catch (error) {
      console.error('Error storing auth:', error);
    }
  }

  private clearAuth(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('workoutHistory');
    localStorage.removeItem('programs');
    
    sessionStorage.clear();
    
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.routeService.login(email, password).pipe(
      tap((response: AuthResponse) => {
        if (response.user && response.token) {
          this.storeAuth(response.user, response.token);
        }
      }),
    );
  }

  register(email: string, password: string, name?: string): Observable<AuthResponse> {
    return this.routeService.register(email, password, name).pipe(
      tap((response: AuthResponse) => {
        if (response.user && response.token) {
          this.storeAuth(response.user, response.token);
        }
      }),
    );
  }

  logout(): void {
    // Call backend logout endpoint if we have a token
    if (this.token) {
      this.routeService.logout().subscribe({
        next: () => {
          console.log('Backend logout successful');
        },
        error: (error) => {
          console.error('Backend logout failed:', error);
        },
        complete: () => {
          this.performLogout();
        }
      });
    } else {
      this.performLogout();
    }
  }

  private performLogout(): void {
    this.clearAuth();
    
    // Navigate to login with a clean state
    this.router.navigate(['/login'], { 
      replaceUrl: true,
      queryParams: { logout: 'success' }
    });
  }

  // Method to refresh token (for future implementation)
  refreshToken(): Observable<AuthResponse> {
    return this.routeService.refreshToken().pipe(
      tap((response: AuthResponse) => {
        if (response.user && response.token) {
          this.storeAuth(response.user, response.token);
        }
      }),
    );
  }

  // Method to check if token is expired
  isTokenExpired(): boolean {
    const token = this.token;
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}
