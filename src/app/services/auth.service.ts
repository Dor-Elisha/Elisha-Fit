import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { RouteService } from './route.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private routeService: RouteService,
    private router: Router,
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUser(): any {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.routeService.login(email, password).pipe(
      tap((res: any) => {
        const user = res?.data?.user;
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      }),
    );
  }

  register(email: string, password: string): Observable<any> {
    return this.routeService.register(email, password).pipe(
      tap((res: any) => {
        const user = res?.data?.user;
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      }),
    );
  }

  logout(): void {
    // Clear all user-related data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('workoutHistory');
    localStorage.removeItem('programs');
    
    // Clear any session storage
    sessionStorage.clear();
    
    // Reset user state
    this.currentUserSubject.next(null);
    
    // Navigate to login with a clean state
    this.router.navigate(['/login'], { 
      replaceUrl: true,
      queryParams: { logout: 'success' }
    });
  }
}
