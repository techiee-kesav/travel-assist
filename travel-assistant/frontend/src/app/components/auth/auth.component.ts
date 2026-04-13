import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth-shell">
    <div class="container" [class.active]="mode === 'register'">

      <!-- REGISTER -->
      <div class="form-container sign-up">
        <form (ngSubmit)="register()">
          <h1>Create Account</h1>

          <div class="social-icons">
            <a class="icon" (click)="socialLogin('google')">
              <i class="fa-brands fa-google"></i>
            </a>
            <a class="icon" (click)="socialLogin('facebook')">
              <i class="fa-brands fa-facebook-f"></i>
            </a>
            <a class="icon" (click)="socialLogin('microsoft')">
              <i class="fa-brands fa-microsoft"></i>
            </a>
            <a class="icon" (click)="socialLogin('apple')">
              <i class="fa-brands fa-apple"></i>
            </a>
          </div>

          <span>or use your email for registration</span>
          <input type="text" placeholder="Name"
                 [(ngModel)]="registerData.name" name="name" required>

          <input type="email" placeholder="Email"
                 [(ngModel)]="registerData.email" name="email" required>

          <input type="password" placeholder="Password"
                 [(ngModel)]="registerData.password" name="password"
                 required minlength="6">

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Sign Up' }}
          </button>

          <div *ngIf="mode==='register' && error" class="alert alert-error">
            {{ error }}
          </div>
        </form>
      </div>

      <!-- LOGIN -->
      <div class="form-container sign-in">
        <form (ngSubmit)="login()">
          <h1>Sign In</h1>

          <div class="social-icons">
            <a class="icon" (click)="socialLogin('google')">
              <i class="fa-brands fa-google"></i>
            </a>
            <a class="icon" (click)="socialLogin('facebook')">
              <i class="fa-brands fa-facebook-f"></i>
            </a>
            <a class="icon" (click)="socialLogin('microsoft')">
              <i class="fa-brands fa-microsoft"></i>
            </a>
            <a class="icon" (click)="socialLogin('apple')">
              <i class="fa-brands fa-apple"></i>
            </a>
          </div>

          <span>or use your email password</span>
          <input type="email" placeholder="Email"
                 [(ngModel)]="loginData.email" name="email" required>

          <input type="password" placeholder="Password"
                 [(ngModel)]="loginData.password" name="password" required>

          <a routerLink="/auth/resend-validation" class="text-link">
            Forgot Your Password?
          </a>

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>

          <div *ngIf="mode==='login' && error" class="alert alert-error">
            {{ error }}
          </div>
        </form>
      </div>

      <!-- TOGGLE -->
      <div class="toggle-container">
        <div class="toggle">
          <div class="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all site features</p>
            <button class="hidden" type="button"
                    (click)="setMode('login')">
              Sign In
            </button>
          </div>

          <div class="toggle-panel toggle-right">
            <h1>Hello, Friend!</h1>
            <p>Register with your details to use all site features</p>
            <button class="hidden" type="button"
                    (click)="setMode('register')">
              Sign Up
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
  `,
  styles: [`
    /* ✅ SAME STYLES YOU ALREADY HAD (UNCHANGED) */
    .social-icons {
      margin: 20px 0;
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    .social-icons .icon {
      width: 40px;
      height: 40px;
      border: 1px solid #ccc;
      border-radius: 20%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #512da8;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .social-icons .icon:hover {
      transform: scale(1.1);
      border-color: #512da8;
    }
  `]
})
export class AuthComponent implements OnInit {

  mode: 'login' | 'register' = 'login';
  loading = false;
  error = '';

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.mode = params['mode'] === 'register' ? 'register' : 'login';
    });
  }

  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.router.navigate(['/auth', mode], { replaceUrl: true });
  }

  /** ✅ SOCIAL LOGIN (NO GITHUB) */
  socialLogin(provider: 'google' | 'facebook' | 'microsoft' | 'apple'): void {
    const backendUrl = 'http://localhost:8080/oauth2/authorize';
    window.location.href = `${backendUrl}/${provider}`;
  }

  login(): void {
    this.loading = true;
    this.error = '';
    this.authService.login(this.loginData.email, this.loginData.password)
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: err => {
          this.error = err.error?.message || 'Login failed';
          this.loading = false;
        }
      });
  }

  register(): void {
    this.loading = true;
    this.error = '';
    this.authService.register(this.registerData)
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: err => {
          this.error = err.error?.message || 'Registration failed';
          this.loading = false;
        }
      });
  }
}
