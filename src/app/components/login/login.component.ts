import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { LoadingService } from '../../services/loading.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private loadingService: LoadingService
  ) {
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  isSignup = false;
  showPassword = false;
  showConfirmPassword = false;
  loginForm: FormGroup;
  signupForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForms();
    this.checkLogoutMessage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  toggleMode(): void {
    this.isSignup = !this.isSignup;
    this.clearMessages();
    this.resetForms();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetForms(): void {
    this.loginForm.reset();
    this.signupForm.reset();
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.touched && field.errors);
  }

  login(): void {
    if (this.loginForm.valid) {
      this.loadingService.showForFormSubmission('Signing in...');
      this.clearMessages();
      
      const { email, password } = this.loginForm.value;
      
      this.auth.login(email, password).subscribe({
        next: (res: any) => {
          this.loadingService.hide();
          this.successMessage = 'Login successful!';
          console.log('Login successful', res);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        },
        error: (err: any) => {
          this.loadingService.hide();
          this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
          console.error('Login failed', err);
        },
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  signup(): void {
    if (this.signupForm.valid) {
      this.loadingService.showForFormSubmission('Creating account...');
      this.clearMessages();
      
      const { email, password } = this.signupForm.value;
      
      this.auth.register(email, password).subscribe({
        next: (res) => {
          this.loadingService.hide();
          this.successMessage = 'Account created successfully!';
          console.log('Signup successful', res);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        },
        error: (err) => {
          this.loadingService.hide();
          this.errorMessage = err.error?.message || 'Signup failed. Please try again.';
          console.error('Signup failed', err);
        },
      });
    } else {
      this.markFormGroupTouched(this.signupForm);
    }
  }

  private checkLogoutMessage(): void {
    this.route.queryParams.subscribe(params => {
      if (params['logout'] === 'success') {
        this.successMessage = 'You have been successfully logged out.';
        // Clear the query parameter
        this.router.navigate([], { 
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
