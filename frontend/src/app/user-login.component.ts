import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Header -->
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">🛒</span>
            <span class="logo-text">ShopEasy</span>
          </div>
          <h2>Welcome Back!</h2>
          <p>Sign in to continue shopping</p>
        </div>

        <!-- Login Form -->
        <form class="auth-form" (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="credentials.email"
              required
              email
              #email="ngModel"
              class="form-input"
              placeholder="Enter your email address"
            >
            <div *ngIf="email.invalid && email.touched" class="error-message">
              <span *ngIf="email.errors?.['required']">Email is required</span>
              <span *ngIf="email.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="credentials.password"
              required
              #password="ngModel"
              class="form-input"
              placeholder="Enter your password"
            >
            <div *ngIf="password.invalid && password.touched" class="error-message">
              Password is required
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                name="rememberMe"
                [(ngModel)]="credentials.rememberMe"
              >
              <span class="checkmark"></span>
              Remember me
            </label>
            <a href="#" class="link">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            class="auth-button primary"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading">Sign In</span>
            <span *ngIf="isLoading" class="loading-spinner">Signing In...</span>
          </button>
        </form>

        <!-- Demo Accounts -->
        <div class="demo-accounts">
          <h4>Demo Accounts (Click to auto-fill)</h4>
          <div class="demo-buttons">
            <button class="demo-button customer" (click)="fillCustomerDemo()">
              👤 Customer Demo
            </button>
            <button class="demo-button admin" (click)="fillAdminDemo()">
              ⚙️ Admin Demo
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div class="divider">
          <span>or</span>
        </div>

        <!-- Social Login -->
        <div class="social-auth">
          <button class="social-button google" (click)="loginWithGoogle()">
            <span class="social-icon">🔍</span>
            Continue with Google
          </button>
          <button class="social-button facebook" (click)="loginWithFacebook()">
            <span class="social-icon">📘</span>
            Continue with Facebook
          </button>
        </div>

        <!-- Register Link -->
        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register" class="link">Create Account</a></p>
          <p>Need admin access? <a routerLink="/admin-register" class="link">Admin Registration</a></p>
        </div>
      </div>

      <!-- Welcome Message -->
      <div class="welcome-section">
        <h3>Start Your Shopping Journey</h3>
        <div class="benefits-grid">
          <div class="benefit-item">
            <span class="benefit-icon">🎯</span>
            <h4>Personalized Experience</h4>
            <p>Get product recommendations tailored just for you</p>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">💳</span>
            <h4>Secure Payments</h4>
            <p>Shop with confidence using our secure payment system</p>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">📱</span>
            <h4>Mobile Friendly</h4>
            <p>Shop anywhere, anytime with our responsive design</p>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🏆</span>
            <h4>Premium Quality</h4>
            <p>Only the best products from trusted brands</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .auth-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      padding: 40px;
      width: 100%;
      max-width: 450px;
      margin-right: 40px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .logo-icon {
      font-size: 2.5rem;
    }

    .logo-text {
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .auth-header h2 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .auth-header p {
      color: #7f8c8d;
      margin: 0;
      font-size: 1rem;
    }

    .auth-form {
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #2c3e50;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.ng-invalid.ng-touched {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.8rem;
      margin-top: 5px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .checkbox-label input[type="checkbox"] {
      margin: 0;
    }

    .checkmark {
      width: 16px;
      height: 16px;
      border: 2px solid #ddd;
      border-radius: 4px;
      display: inline-block;
      position: relative;
    }

    .checkbox-label input[type="checkbox"]:checked + .checkmark {
      background: #667eea;
      border-color: #667eea;
    }

    .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
      content: '✓';
      position: absolute;
      top: -2px;
      left: 2px;
      color: white;
      font-size: 10px;
      font-weight: bold;
    }

    .auth-button {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 10px;
    }

    .auth-button.primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .auth-button.primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .auth-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-spinner {
      display: inline-block;
    }

    .demo-accounts {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .demo-accounts h4 {
      margin: 0 0 15px 0;
      color: #2c3e50;
      font-size: 0.9rem;
      text-align: center;
    }

    .demo-buttons {
      display: flex;
      gap: 10px;
    }

    .demo-button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .demo-button.customer {
      background: #28a745;
      color: white;
    }

    .demo-button.admin {
      background: #dc3545;
      color: white;
    }

    .demo-button:hover {
      transform: translateY(-1px);
      opacity: 0.9;
    }

    .divider {
      text-align: center;
      margin: 30px 0;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e9ecef;
    }

    .divider span {
      background: white;
      padding: 0 20px;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .social-auth {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 30px;
    }

    .social-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .social-button:hover {
      border-color: #667eea;
      transform: translateY(-1px);
    }

    .social-icon {
      font-size: 1.2rem;
    }

    .auth-footer {
      text-align: center;
    }

    .auth-footer p {
      color: #7f8c8d;
      margin: 5px 0;
      font-size: 0.9rem;
    }

    .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      text-decoration: underline;
    }

    .welcome-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      color: white;
      max-width: 400px;
    }

    .welcome-section h3 {
      text-align: center;
      margin-bottom: 25px;
      font-size: 1.5rem;
    }

    .benefits-grid {
      display: grid;
      gap: 20px;
    }

    .benefit-item {
      text-align: center;
    }

    .benefit-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 10px;
    }

    .benefit-item h4 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
    }

    .benefit-item p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .auth-container {
        flex-direction: column;
        padding: 10px;
      }

      .auth-card {
        margin-right: 0;
        margin-bottom: 20px;
        padding: 30px 20px;
      }

      .welcome-section {
        max-width: 100%;
      }
    }
  `]
})
export class UserLoginComponent {
  credentials = {
    email: '',
    password: '',
    rememberMe: false
  };

  isLoading = false;

  onLogin() {
    this.isLoading = true;
    
    // Simulate login process
    setTimeout(() => {
      this.isLoading = false;
      
      // Check if it's admin login
      if (this.credentials.email === 'admin@shopeasy.com') {
        alert('Welcome Admin! Redirecting to admin dashboard...');
        localStorage.setItem('currentUser', JSON.stringify({
          email: this.credentials.email,
          role: 'admin',
          name: 'Admin User',
          loginTime: new Date().toISOString()
        }));
        window.location.href = '/admin';
      } else {
        alert('Welcome back! Login successful.');
        localStorage.setItem('currentUser', JSON.stringify({
          email: this.credentials.email,
          role: 'customer',
          name: 'Customer User',
          loginTime: new Date().toISOString()
        }));
        window.location.href = '/status';
      }
    }, 1500);
  }

  fillCustomerDemo() {
    this.credentials = {
      email: 'customer@shopeasy.com',
      password: 'password123',
      rememberMe: true
    };
  }

  fillAdminDemo() {
    this.credentials = {
      email: 'admin@shopeasy.com',
      password: 'admin123',
      rememberMe: true
    };
  }

  loginWithGoogle() {
    alert('Google login would be implemented here. For demo, logging in as customer.');
    this.fillCustomerDemo();
    this.onLogin();
  }

  loginWithFacebook() {
    alert('Facebook login would be implemented here. For demo, logging in as customer.');
    this.fillCustomerDemo();
    this.onLogin();
  }
}