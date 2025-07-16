import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    // Check if user is logged in and token is valid
    if (this.auth.isLoggedIn && !this.auth.isTokenExpired()) {
      return true;
    }
    
    // If token is expired or user not logged in, clear auth and redirect
    if (this.auth.isTokenExpired()) {
      this.auth.logout();
    }
    
    return this.router.parseUrl('/login');
  }
}
