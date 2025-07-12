import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  constructor(private authService: AuthService) {}

  isSignup = false;
  loginData = { email: '', password: '' };
  signupData = { email: '', password: '', confirmPassword: '' };

  toggleMode() {
    this.isSignup = !this.isSignup;
  }

  login() {
    console.log('Logging in', this.loginData);
  }

  signup() {
    if (this.signupData.password !== this.signupData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.authService
      .register(this.signupData.email, this.signupData.password)
      .subscribe({
        next: (res) => {
          console.log('Signup successful', res);
          alert('Signup successful!');
        },
        error: (err) => {
          console.error('Signup failed', err);
          alert(err.error?.message || 'Signup failed');
        },
      });
  }
}
