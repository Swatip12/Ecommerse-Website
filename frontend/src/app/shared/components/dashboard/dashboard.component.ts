import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../modules/user/services/auth.service';
import { User } from '../../../modules/user/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Ecommerce Dashboard</span>
      <span class="spacer"></span>
      <span *ngIf="currentUser">Welcome, {{ currentUser.firstName }}!</span>
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item routerLink="/profile">
          <mat-icon>person</mat-icon>
          <span>Profile</span>
        </button>
        <button mat-menu-item *ngIf="isAdmin" routerLink="/admin">
          <mat-icon>admin_panel_settings</mat-icon>
          <span>Admin Panel</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>

    <div class="dashboard-container">
      <div class="dashboard-grid">
        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-card-title>Products</mat-card-title>
            <mat-card-subtitle>Browse our catalog</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Discover amazing products in our store.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/products">
              View Products
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-card-title>Shopping Cart</mat-card-title>
            <mat-card-subtitle>Your selected items</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Review and manage your cart items.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/cart">
              View Cart
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-card-title>Orders</mat-card-title>
            <mat-card-subtitle>Track your purchases</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>View your order history and track shipments.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/orders">
              View Orders
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card" *ngIf="isAdmin">
          <mat-card-header>
            <mat-card-title>Admin Panel</mat-card-title>
            <mat-card-subtitle>Manage the store</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Access administrative functions.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="accent" routerLink="/admin">
              Admin Panel
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }

    .dashboard-container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: calc(100vh - 64px);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-card {
      height: fit-content;
    }

    mat-card-actions {
      padding: 16px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Even if logout fails on server, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });
  }
}