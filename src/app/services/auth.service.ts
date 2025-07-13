import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { RouteService } from './route.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(private routeService: RouteService, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser).data);
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
        localStorage.setItem('currentUser', JSON.stringify(res));
        this.currentUserSubject.next(res.data?.user);
      })
    );
  }

  register(email: string, password: string): Observable<any> {
    return this.routeService.register(email, password).pipe(
      tap((res: any) => {
        localStorage.setItem('currentUser', JSON.stringify(res));
        this.currentUserSubject.next(res.data?.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
