import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  template: `
    <div style="padding: 20px; text-align: center;">
      <h1>🎉 Ecommerce Frontend is Working!</h1>
      
      <mat-card style="max-width: 600px; margin: 20px auto;">
        <mat-card-header>
          <mat-card-title>Welcome to the Ecommerce Platform</mat-card-title>
          <mat-card-subtitle>Frontend Development Mode</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <p>The Angular frontend is now running successfully!</p>
          <p><strong>Current Status:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li>✅ Angular 20 Application</li>
            <li>✅ Material UI Components</li>
            <li>✅ Routing Configuration</li>
            <li>✅ Authentication System (Demo Mode)</li>
            <li>✅ Standalone Components</li>
          </ul>
          
          <p><strong>Available Pages:</strong></p>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button mat-raised-button color="primary" routerLink="/dashboard">Dashboard</button>
            <button mat-raised-button color="accent" routerLink="/products">Products</button>
            <button mat-raised-button color="primary" routerLink="/cart">Cart</button>
            <button mat-raised-button color="accent" routerLink="/orders">Orders</button>
            <button mat-raised-button color="primary" routerLink="/admin">Admin</button>
            <button mat-raised-button color="warn" routerLink="/integration-test">Tests</button>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <p style="margin: 0; color: #666; font-size: 14px;">
            Backend services are not required for frontend demonstration
          </p>
        </mat-card-actions>
      </mat-card>
      
      <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <h3>🚀 Next Steps</h3>
        <p>To run the complete full-stack application:</p>
        <ol style="text-align: left; display: inline-block;">
          <li>Start the backend: <code>cd backend && mvn spring-boot:run</code></li>
          <li>Start database: <code>docker compose -f docker-compose.dev.yml up -d</code></li>
          <li>Access full features with real data</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    code {
      background: #e0e0e0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
    
    ul, ol {
      margin: 10px 0;
    }
    
    li {
      margin: 5px 0;
    }
  `]
})
export class TestPageComponent {}