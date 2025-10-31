import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Header -->
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">⚙️</span>
            <span class="logo-text">Admin Portal</span>
          </div>
          <h2>Admin Registration</h2>
          <p>Create your administrative account</p>
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
                [(ngModel)]="admin.firstName"
                required
                #firstName="ngModel"
                class="form-input"
                placeholder="Enter first name"
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
                [(ngModel)]="admin.lastName"
                required
                #lastName="ngModel"
                class="form-input"
                placeholder="Enter last name"
              >
              <div *ngIf="lastName.invalid && lastName.touched" class="error-message">
                Last name is required
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Admin Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="admin.email"
              required
              email
              #email="ngModel"
              class="form-input"
              placeholder="admin@company.com"
            >
            <div *ngIf="email.invalid && email.touched" class="error-message">
              <span *ngIf="email.errors?.['required']">Email is required</span>
              <span *ngIf="email.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <label for="department">Department</label>
            <select 
              id="department" 
              name="department"
              [(ngModel)]="admin.department"
              required
              #department="ngModel"
              class="form-input"
            >
              <option value="">Select Department</option>
              <option value="IT">Information Technology</option>
              <option value="Sales">Sales & Marketing</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="HR">Human Resources</option>
              <option value="Management">Management</option>
            </select>
            <div *ngIf="department.invalid && department.touched" class="error-message">
              Department is required
            </div>
          </div>

          <div class="form-group">
            <label for="role">Admin Role</label>
            <select 
              id="role" 
              name="role"
              [(ngModel)]="admin.role"
              required
              #role="ngModel"
              class="form-input"
            >
              <option value="">Select Role</option>
              <option value="super_admin">Super Administrator</option>
              <option value="store_manager">Store Manager</option>
              <option value="product_manager">Product Manager</option>
              <option value="order_manager">Order Manager</option>
              <option value="customer_support">Customer Support</option>
              <option value="analyst">Data Analyst</option>
            </select>
            <div *ngIf="role.invalid && role.touched" class="error-message">
              Role is required
            </div>
          </div>

          <div class="form-group">
            <label for="employeeId">Employee ID</label>
            <input 
              type="text" 
              id="employeeId" 
              name="employeeId"
              [(ngModel)]="admin.employeeId"
              required
              #employeeId="ngModel"
              class="form-input"
              placeholder="EMP-12345"
            >
            <div *ngIf="employeeId.invalid && employeeId.touched" class="error-message">
              Employee ID is required
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone"
              [(ngModel)]="admin.phone"
              required
              #phone="ngModel"
              class="form-input"
              placeholder="+1-555-0123"
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
              [(ngModel)]="admin.password"
              required
              minlength="8"
              #password="ngModel"
              class="form-input"
              placeholder="Create a strong password"
            >
            <div *ngIf="password.invalid && password.touched" class="error-message">
              <span *ngIf="password.errors?.['required']">Password is required</span>
              <span *ngIf="password.errors?.['minlength']">Password must be at least 8 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              [(ngModel)]="admin.confirmPassword"
              required
              #confirmPassword="ngModel"
              class="form-input"
              placeholder="Confirm your password"
            >
            <div *ngIf="confirmPassword.invalid && confirmPassword.touched" class="error-message">
              Confirm password is required
            </div>
            <div *ngIf="admin.password !== admin.confirmPassword && confirmPassword.touched" class="error-message">
              Passwords do not match
            </div>
          </div>

          <div class="form-group">
            <label for="accessCode">Admin Access Code</label>
            <input 
              type="text" 
              id="accessCode" 
              name="accessCode"
              [(ngModel)]="admin.accessCode"
              required
              #accessCode="ngModel"
              class="form-input"
              placeholder="Enter admin access code"
            >
            <div *ngIf="accessCode.invalid && accessCode.touched" class="error-message">
              Admin access code is required
            </div>
            <div class="help-text">
              Contact your system administrator for the access code
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                name="agreeTerms"
                [(ngModel)]="admin.agreeTerms"
                required
                #agreeTerms="ngModel"
              >
              <span class="checkmark"></span>
              I agree to the <a href="#" class="link">Admin Terms of Service</a> and <a href="#" class="link">Privacy Policy</a>
            </label>
            <div *ngIf="agreeTerms.invalid && agreeTerms.touched" class="error-message">
              You must agree to the terms
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                name="securityAcknowledgment"
                [(ngModel)]="admin.securityAcknowledgment"
                required
                #securityAcknowledgment="ngModel"
              >
              <span class="checkmark"></span>
              I acknowledge my responsibility for data security and confidentiality
            </label>
            <div *ngIf="securityAcknowledgment.invalid && securityAcknowledgment.touched" class="error-message">
              Security acknowledgment is required
            </div>
          </div>

          <button 
            type="submit" 
            class="auth-button primary"
            [disabled]="registerForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading">Create Admin Account</span>
            <span *ngIf="isLoading" class="loading-spinner">Creating Account...</span>
          </button>
        </form>

        <!-- Demo Access Code -->
        <div class="demo-section">
          <h4>Demo Access Code</h4>
          <p>For demonstration purposes, use: <strong>ADMIN2024</strong></p>
          <button class="demo-button" (click)="fillDemoData()">
            Fill Demo Data
          </button>
        </div>

        <!-- Login Link -->
        <div class="auth-footer">
          <p>Already have an admin account? <a routerLink="/login" class="link">Sign In</a></p>
          <p>Need customer account? <a routerLink="/register" class="link">Customer Registration</a></p>
        </div>
      </div>

      <!-- Admin Features -->
      <div class="features-section">
        <h3>Admin Capabilities</h3>
        <div class="features-grid">
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <h4>Analytics Dashboard</h4>
            <p>Comprehensive business insights and reports</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📦</span>
            <h4>Order Management</h4>
            <p>Process orders, manage shipping and returns</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📱</span>
            <h4>Product Control</h4>
            <p>Add, edit, and manage product catalog</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">👥</span>
            <h4>User Management</h4>
            <p>Manage customer accounts and permissions</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔒</span>
            <h4>Security Controls</h4>
            <p>Advanced security and access management</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📈</span>
            <h4>Sales Reports</h4>
            <p>Detailed sales analytics and forecasting</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .auth-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      padding: 40px;
      width: 100%;
      max-width: 500px;
      margin-right: 40px;
      max-height: 90vh;
      overflow-y: auto;
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
      border-color: #e74c3c;
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }

    .form-input.ng-invalid.ng-touched {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.8rem;
      margin-top: 5px;
    }

    .help-text {
      color: #7f8c8d;
      font-size: 0.8rem;
      margin-top: 5px;
      font-style: italic;
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
      background: #e74c3c;
      border-color: #e74c3c;
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
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
    }

    .auth-button.primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(231, 76, 60, 0.3);
    }

    .auth-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-spinner {
      display: inline-block;
    }

    .demo-section {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      text-align: center;
    }

    .demo-section h4 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    .demo-section p {
      margin: 0 0 15px 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .demo-button {
      padding: 10px 20px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .demo-button:hover {
      background: #2980b9;
      transform: translateY(-1px);
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
      color: #e74c3c;
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
export class AdminRegisterComponent {
  admin = {
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: '',
    employeeId: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accessCode: '',
    agreeTerms: false,
    securityAcknowledgment: false
  };

  isLoading = false;

  onRegister() {
    if (this.admin.password !== this.admin.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (this.admin.accessCode !== 'ADMIN2024') {
      alert('Invalid admin access code!');
      return;
    }

    this.isLoading = true;
    
    // Simulate registration process
    setTimeout(() => {
      this.isLoading = false;
      alert('Welcome Admin ' + this.admin.firstName + '! Your administrative account has been created successfully. You can now login to access the admin dashboard.');
      
      // Store admin data in localStorage for demo
      localStorage.setItem('registeredAdmin', JSON.stringify({
        firstName: this.admin.firstName,
        lastName: this.admin.lastName,
        email: this.admin.email,
        department: this.admin.department,
        role: this.admin.role,
        employeeId: this.admin.employeeId,
        phone: this.admin.phone,
        userRole: 'admin',
        registeredAt: new Date().toISOString()
      }));
      
      // Redirect to login
      window.location.href = '/login';
    }, 2000);
  }

  fillDemoData() {
    this.admin = {
      firstName: 'John',
      lastName: 'Admin',
      email: 'admin@shopeasy.com',
      department: 'IT',
      role: 'super_admin',
      employeeId: 'EMP-12345',
      phone: '+1-555-0123',
      password: 'admin123',
      confirmPassword: 'admin123',
      accessCode: 'ADMIN2024',
      agreeTerms: true,
      securityAcknowledgment: true
    };
  }
}