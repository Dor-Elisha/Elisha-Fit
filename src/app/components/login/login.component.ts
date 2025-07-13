import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouteService } from '../../services/route.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  constructor(private router: Router, private rs: RouteService) {}

  isSignup = false;
  loginData = { email: '', password: '' };
  signupData = { email: '', password: '', confirmPassword: '' };

  toggleMode() {
    this.isSignup = !this.isSignup;
  }

  login() {
    this.rs.login(this.loginData.email, this.loginData.password).subscribe({
      next: (res: any) => {
        console.log('Login successful', res);
        this.router.navigate(['/'], { state: { user: res.data } });
      },
      error: (err: any) => {
        console.error('Login failed', err);
        alert(err.error?.message || 'Login failed');
      },
    });
  }


  signup() {
    if (this.signupData.password !== this.signupData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.rs
      .register(this.signupData.email, this.signupData.password)
      .subscribe({
        next: (res) => {
          console.log('Signup successful', res);
          alert('Signup successful!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Signup failed', err);
          alert(err.error?.message || 'Signup failed');
        },
      });
  }
}
