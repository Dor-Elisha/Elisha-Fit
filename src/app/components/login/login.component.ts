import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
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
    console.log('Signing up', this.signupData);
  }
}
