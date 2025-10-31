import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-register',
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
          <h2>Create Your Account</h2>
          <p>Join thousands of happy customers</p>
        </div>

        <!-- Registration Form -->
        <form class="auth-form" (ngSubmit)="onRegister()" #registerForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName"
                [(ngModel)]="user.firstName"
                required
                #firstName="ngModel"
                class="form-input"
                placeholder="Enter your first name"
              >
              <div *ngIf="firstName.invalid && firstName.touched" class="error-message">
                First name is required
              </div>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName"
                [(ngModel)]="user.lastName"
                required
                #lastName="ngModel"
                class="form-input"
                placeholder="Enter your last name"
              >
              <div *ngIf="lastName.invalid && lastName.touched" class="error-message">
                Last name is required
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="user.email"
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
            <label for="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone"
              [(ngModel)]="user.phone"
              required
              #phone="ngModel"
              class="form-input"
              placeholder="Enter your phone number"
            >
            <div *ngIf="phone.invalid && phone.touched" class="error-message">
              Phone number is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="user.password"
              required
              minlength="6"
              #password="ngModel"
              class="form-input"
              placeholder="Create a strong password"
            >
            <div *ngIf="password.invalid && password.touched" class="error-message">
              <span *ngIf="password.errors?.['required']">Password is required</span>
              <span *ngIf="password.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              [(ngModel)]="user.confirmPassword"
              required
              #confirmPassword="ngModel"
              class="form-input"
              placeholder="Confirm your password"
            >
            <div *ngIf="confirmPassword.invalid && confirmPassword.touched" class="error-message">
              Confirm password is required
            </div>
            <div *ngIf="user.password !== user.confirmPassword && confirmPassword.touched" class="error-message">
              Passwords do not match
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                name="agreeTerms"
                [(ngModel)]="user.agreeTerms"
                required
                #agreeTerms="ngModel"
              >
              <span class="checkmark"></span>
              I agree to the <a href="#" class="link">Terms of Service</a> and <a href="#" class="link">Privacy Policy</a>
            </label>
            <div *ngIf="agreeTerms.invalid && agreeTerms.touched" class="error-message">
              You must agree to the terms
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                name="newsletter"
                [(ngModel)]="user.newsletter"
              >
              <span class="checkmark"></span>
              Subscribe to our newsletter for exclusive offers
            </label>
          </div>

          <button 
            type="submit" 
            class="auth-button primary"
            [disabled]="registerForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading">Create Account</span>
            <span *ngIf="isLoading" class="loading-spinner">Creating Account...</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span>or</span>
        </div>

        <!-- Social Registration -->
        <div class="social-auth">
          <button class="social-button google" (click)="registerWithGoogle()">
            <span class="social-icon">🔍</span>
            Continue with Google
          </button>
          <button class="social-button facebook" (click)="registerWithFacebook()">
            <span class="social-icon">📘</span>
            Continue with Facebook
          </button>
        </div>

        <!-- Login Link -->
        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login" class="link">Sign In</a></p>
        </div>
      </div>

      <!-- Features -->
      <div class="features-section">
        <h3>Why Join ShopEasy?</h3>
        <div class="features-grid">
          <div class="feature-item">
            <span class="feature-icon">🚚</span>
            <h4>Free Shipping</h4>
            <p>Free delivery on orders over $50</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔒</span>
            <h4>Secure Shopping</h4>
            <p>Your data is protected with SSL encryption</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">⚡</span>
            <h4>Fast Checkout</h4>
            <p>Quick and easy one-click purchasing</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎁</span>
            <h4>Exclusive Deals</h4>
            <p>Member-only discounts and offers</p>
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
      max-width: 500px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
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

    .checkbox-group {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .checkbox-label input[type="checkbox"] {
      margin: 0;
    }

    .checkmark {
      width: 18px;
      height: 18px;
      border: 2px solid #ddd;
      border-radius: 4px;
      display: inline-block;
      position: relative;
      flex-shrink: 0;
      margin-top: 2px;
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
      font-size: 12px;
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
      margin: 0;
    }

    .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      text-decoration: underline;
    }

    .features-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      color: white;
      max-width: 400px;
    }

    .features-section h3 {
      text-align: center;
      margin-bottom: 25px;
      font-size: 1.5rem;
    }

    .features-grid {
      display: grid;
      gap: 20px;
    }

    .feature-item {
      text-align: center;
    }

    .feature-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 10px;
    }

    .feature-item h4 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
    }

    .feature-item p {
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

      .form-row {
        grid-template-columns: 1fr;
      }

      .features-section {
        max-width: 100%;
      }
    }
  `]
})
export class UserRegisterComponent {
  user = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    newsletter: false
  };

  isLoading = false;

  onRegister() {
    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.isLoading = true;
    
    // Simulate registration process
    setTimeout(() => {
      this.isLoading = false;
      alert('Welcome ' + this.user.firstName + '! Your account has been created successfully. You can now login to start shopping!');
      
      // Store user data in localStorage for demo
      localStorage.setItem('registeredUser', JSON.stringify({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone,
        role: 'customer',
        registeredAt: new Date().toISOString()
      }));
      
      // Redirect to login
      window.location.href = '/login';
    }, 2000);
  }

  registerWithGoogle() {
    alert('Google registration would be implemented here. For demo, this creates a sample account.');
    this.user = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      phone: '+1-555-0123',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true,
      newsletter: true
    };
  }

  registerWithFacebook() {
    alert('Facebook registration would be implemented here. For demo, this creates a sample account.');
    this.user = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@facebook.com',
      phone: '+1-555-0456',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true,
      newsletter: false
    };
  }
}