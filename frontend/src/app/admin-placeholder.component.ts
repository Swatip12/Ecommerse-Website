import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuthService } from './modules/user/services/auth.service';
import { User, UserRole } from './modules/user/models/auth.models';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
  lowStockItems: number;
  newUsersToday: number;
  revenueGrowth: number;
}

interface RecentActivity {
  id: number;
  type: 'order' | 'product' | 'user' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'info' | 'error';
}

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTabsModule, MatTableModule, MatProgressBarModule,
    MatChipsModule, MatMenuModule, MatBadgeModule, MatTooltipModule,
    MatDividerModule, MatSnackBarModule
  ],
  template: `
    <div class="admin-container">
      <!-- Access Denied for Non-Admins -->
      <div class="access-denied" *ngIf="!isAdminUser">
        <div class="access-denied-content">
          <div class="access-denied-icon">
            <mat-icon>security</mat-icon>
          </div>
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
          <div class="access-denied-actions">
            <button mat-raised-button color="primary" (click)="goToLogin()">
              <mat-icon>login</mat-icon>
              Login as Admin
            </button>
            <button mat-stroked-button routerLink="/dashboard">
              <mat-icon>home</mat-icon>
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <!-- Admin Dashboard Content -->
      <div class="admin-dashboard" *ngIf="isAdminUser">
        <!-- Modern Header -->
        <div class="admin-header">
          <div class="header-background"></div>
          <div class="header-content">
            <div class="header-left">
              <div class="admin-icon">
                <mat-icon>admin_panel_settings</mat-icon>
              </div>
              <div class="header-text">
                <h1>Admin Dashboard</h1>
                <p>Welcome back, {{ currentUser?.firstName }}! Manage your e-commerce platform</p>
              </div>
            </div>
            <div class="header-actions">
              <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
                <mat-icon matBadge="3" matBadgeColor="warn">notifications</mat-icon>
              </button>
              <mat-menu #userMenu="matMenu">
                <button mat-menu-item>
                  <mat-icon>notification_important</mat-icon>
                  <span>5 Pending Orders</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>warning</mat-icon>
                  <span>Low Stock Alert</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>person_add</mat-icon>
                  <span>New User Registrations</span>
                </button>
              </mat-menu>
              
              <button mat-icon-button [matMenuTriggerFor]="adminMenu" class="admin-avatar">
                <mat-icon>account_circle</mat-icon>
              </button>
              <mat-menu #adminMenu="matMenu">
                <div class="user-info">
                  <div class="user-details">
                    <div class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
                    <div class="user-role">Administrator</div>
                  </div>
                </div>
                <mat-divider></mat-divider>
                <button mat-menu-item>
                  <mat-icon>settings</mat-icon>
                  <span>Settings</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>person</mat-icon>
                  <span>Profile</span>
                </button>
                <button mat-menu-item (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  <span>Logout</span>
                </button>
              </mat-menu>
            </div>
          </div>
        </div>

        <!-- Dashboard Stats -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card products">
              <div class="stat-icon">
                <mat-icon>inventory</mat-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ dashboardStats.totalProducts }}</div>
                <div class="stat-label">Total Products</div>
                <div class="stat-change positive">
                  <mat-icon>trending_up</mat-icon>
                  +12% from last month
                </div>
              </div>
            </div>

            <div class="stat-card orders">
              <div class="stat-icon">
                <mat-icon>shopping_bag</mat-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ dashboardStats.totalOrders }}</div>
                <div class="stat-label">Total Orders</div>
                <div class="stat-change positive">
                  <mat-icon>trending_up</mat-icon>
                  +8% from last month
                </div>
              </div>
            </div>

            <div class="stat-card revenue">
              <div class="stat-icon">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">\${{ dashboardStats.totalRevenue.toLocaleString() }}</div>
                <div class="stat-label">Total Revenue</div>
                <div class="stat-change positive">
                  <mat-icon>trending_up</mat-icon>
                  +{{ dashboardStats.revenueGrowth }}% from last month
                </div>
              </div>
            </div>

            <div class="stat-card users">
              <div class="stat-icon">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ dashboardStats.totalUsers }}</div>
                <div class="stat-label">Total Users</div>
                <div class="stat-change positive">
                  <mat-icon>trending_up</mat-icon>
                  +{{ dashboardStats.newUsersToday }} new today
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions & Alerts -->
        <div class="quick-actions-section">
          <div class="alerts-panel">
            <h3>
              <mat-icon>priority_high</mat-icon>
              Alerts & Notifications
            </h3>
            <div class="alert-item" *ngIf="dashboardStats.pendingOrders > 0">
              <mat-icon class="alert-icon warning">notification_important</mat-icon>
              <div class="alert-content">
                <div class="alert-title">Pending Orders</div>
                <div class="alert-description">{{ dashboardStats.pendingOrders }} orders need processing</div>
              </div>
              <button mat-button color="warn">View Orders</button>
            </div>
            
            <div class="alert-item" *ngIf="dashboardStats.lowStockItems > 0">
              <mat-icon class="alert-icon error">warning</mat-icon>
              <div class="alert-content">
                <div class="alert-title">Low Stock Alert</div>
                <div class="alert-description">{{ dashboardStats.lowStockItems }} products running low</div>
              </div>
              <button mat-button color="accent">Manage Inventory</button>
            </div>
          </div>

          <div class="quick-actions-panel">
            <h3>
              <mat-icon>flash_on</mat-icon>
              Quick Actions
            </h3>
            <div class="action-grid">
              <button mat-raised-button class="action-btn add-product">
                <mat-icon>add_box</mat-icon>
                <span>Add Product</span>
              </button>
              <button mat-raised-button class="action-btn process-orders">
                <mat-icon>assignment</mat-icon>
                <span>Process Orders</span>
              </button>
              <button mat-raised-button class="action-btn view-reports">
                <mat-icon>analytics</mat-icon>
                <span>View Reports</span>
              </button>
              <button mat-raised-button class="action-btn manage-users">
                <mat-icon>group</mat-icon>
                <span>Manage Users</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Management Tabs -->
        <div class="management-section">
          <mat-tab-group class="admin-tabs" animationDuration="300ms">
            <mat-tab label="Products">
              <ng-template matTabContent>
                <div class="tab-content">
                  <div class="tab-header">
                    <h3>Product Management</h3>
                    <button mat-raised-button color="primary">
                      <mat-icon>add</mat-icon>
                      Add New Product
                    </button>
                  </div>
                  <div class="management-cards">
                    <div class="management-card">
                      <mat-icon>inventory_2</mat-icon>
                      <h4>View All Products</h4>
                      <p>Browse and edit your product catalog</p>
                      <button mat-button color="primary">Manage Products</button>
                    </div>
                    <div class="management-card">
                      <mat-icon>category</mat-icon>
                      <h4>Categories</h4>
                      <p>Organize products into categories</p>
                      <button mat-button color="primary">Manage Categories</button>
                    </div>
                    <div class="management-card">
                      <mat-icon>local_offer</mat-icon>
                      <h4>Promotions</h4>
                      <p>Create and manage promotional offers</p>
                      <button mat-button color="primary">Manage Promotions</button>
                    </div>
                  </div>
                </div>
              </ng-template>
            </mat-tab>

            <mat-tab label="Orders">
              <ng-template matTabContent>
                <div class="tab-content">
                  <div class="tab-header">
                    <h3>Order Management</h3>
                    <div class="order-stats">
                      <mat-chip-set>
                        <mat-chip color="warn">{{ dashboardStats.pendingOrders }} Pending</mat-chip>
                        <mat-chip color="primary">{{ dashboardStats.totalOrders - dashboardStats.pendingOrders }} Completed</mat-chip>
                      </mat-chip-set>
                    </div>
                  </div>
                  <div class="management-cards">
                    <div class="management-card">
                      <mat-icon>assignment</mat-icon>
                      <h4>All Orders</h4>
                      <p>View and manage all customer orders</p>
                      <button mat-button color="primary">View Orders</button>
                    </div>
                    <div class="management-card">
                      <mat-icon>hourglass_empty</mat-icon>
                      <h4>Pending Orders</h4>
                      <p>Process orders awaiting fulfillment</p>
                      <button mat-button color="warn">Process Now</button>
                    </div>
                    <div class="management-card">
                      <mat-icon>local_shipping</mat-icon>
                      <h4>Shipping</h4>
                      <p>Manage shipping and tracking</p>
                      <button mat-button color="primary">Manage Shipping</button>
                    </div>
                  </div>
                </div>
              </ng-template>
            </mat-tab>

            <mat-tab label="Users">
              <ng-template matTabContent>
                <div class="tab-content">
                  <div class="tab-header">
                    <h3>User Management</h3>
                    <button mat-raised-button color="primary">
                      <mat-icon>person_add</mat-icon>
                      Add Admin User
                    </button>
                  </div>
                  <div class="management-cards">
                    <div class="management-card">
                      <mat-icon>people</mat-icon>
                      <h4>All Users</h4>
                      <p>View and manage customer accounts</p>
                      <button mat-button color="primary">Manage Users</button>
                    </div>
                    <div class="management-card">
                      <mat-icon>admin_panel_settings</mat-icon>
                      <h4>Admin Accounts</h4>
                      <p>Manage administrator permissions</p>
                      <button mat-button color="primary">Admin Settings</button>
                    </div>
                    <div class="management-card">
                      <mat-icon>analytics</mat-icon>
                      <h4>User Analytics</h4>
                      <p>View user behavior and statistics</p>
                      <button mat-button color="primary">View Analytics</button>
                    </div>
                  </div>
                </div>
              </ng-template>
            </mat-tab>

            <mat-tab label="Analytics">
              <ng-template matTabContent>
                <div class="tab-content">
                  <div class="tab-header">
                    <h3>Reports & Analytics</h3>
                    <button mat-raised-button color="primary">
                      <mat-icon>download</mat-icon>
                      Export Reports
                    </button>
                  </div>
                  <div class="analytics-grid">
                    <div class="analytics-card">
                      <h4>Sales Performance</h4>
                      <div class="metric">
                        <span class="metric-value">\${{ dashboardStats.totalRevenue.toLocaleString() }}</span>
                        <span class="metric-label">Total Revenue</span>
                      </div>
                      <mat-progress-bar mode="determinate" value="75"></mat-progress-bar>
                      <div class="progress-label">75% of monthly target</div>
                    </div>
                    
                    <div class="analytics-card">
                      <h4>Order Trends</h4>
                      <div class="metric">
                        <span class="metric-value">{{ dashboardStats.totalOrders }}</span>
                        <span class="metric-label">Total Orders</span>
                      </div>
                      <mat-progress-bar mode="determinate" value="82" color="accent"></mat-progress-bar>
                      <div class="progress-label">+8% from last month</div>
                    </div>
                  </div>
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </div>

        <!-- Recent Activity -->
        <div class="activity-section">
          <h3>
            <mat-icon>history</mat-icon>
            Recent Activity
          </h3>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let activity of recentActivities">
              <div class="activity-icon" [class]="'activity-' + activity.status">
                <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-description">{{ activity.description }}</div>
                <div class="activity-time">{{ getTimeAgo(activity.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  `,
  styles: [`
    /* Ultra Modern Admin Dashboard Styles */
    .admin-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
    }

    /* Access Denied Styles */
    .access-denied {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }

    .access-denied-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 60px 40px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      max-width: 500px;
    }

    .access-denied-icon {
      margin-bottom: 30px;
    }

    .access-denied-icon mat-icon {
      font-size: 5rem;
      width: 5rem;
      height: 5rem;
      color: #ff6b6b;
    }

    .access-denied-content h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 15px;
    }

    .access-denied-content p {
      font-size: 1.1rem;
      color: #7f8c8d;
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .access-denied-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Admin Dashboard Styles */
    .admin-dashboard {
      position: relative;
      z-index: 1;
    }

    /* Modern Header */
    .admin-header {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .header-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.6));
      mix-blend-mode: overlay;
    }

    .header-content {
      position: relative;
      z-index: 2;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .admin-icon {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 15px;
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .admin-icon mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #ffd700;
    }

    .header-text h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 5px 0;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    .header-text p {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-menu-btn,
    .admin-avatar {
      background: rgba(255, 255, 255, 0.1) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .user-info {
      padding: 15px;
    }

    .user-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .user-role {
      font-size: 0.9rem;
      color: #667eea;
    }

    /* Stats Section */
    .stats-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 30px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.15);
    }

    .stat-icon {
      width: 70px;
      height: 70px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-card.products .stat-icon {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .stat-card.orders .stat-icon {
      background: linear-gradient(135deg, #2ed573, #17a2b8);
    }

    .stat-card.revenue .stat-icon {
      background: linear-gradient(135deg, #ffa502, #ff6348);
    }

    .stat-card.users .stat-icon {
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    }

    .stat-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: white;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 800;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 1rem;
      color: #7f8c8d;
      margin-bottom: 10px;
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .stat-change.positive {
      color: #2ed573;
    }

    .stat-change mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Quick Actions & Alerts */
    .quick-actions-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .alerts-panel,
    .quick-actions-panel {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .alerts-panel h3,
    .quick-actions-panel h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.3rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 20px 0;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 12px;
      margin-bottom: 15px;
    }

    .alert-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .alert-icon.warning {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }

    .alert-icon.error {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }

    .alert-content {
      flex: 1;
    }

    .alert-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .alert-description {
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .action-btn {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 20px !important;
      border-radius: 15px !important;
      font-weight: 600 !important;
      transition: all 0.3s ease;
    }

    .action-btn.add-product {
      background: linear-gradient(135deg, #2ed573, #17a2b8) !important;
      color: white !important;
    }

    .action-btn.process-orders {
      background: linear-gradient(135deg, #667eea, #764ba2) !important;
      color: white !important;
    }

    .action-btn.view-reports {
      background: linear-gradient(135deg, #ffa502, #ff6348) !important;
      color: white !important;
    }

    .action-btn.manage-users {
      background: linear-gradient(135deg, #ff6b6b, #ee5a24) !important;
      color: white !important;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    /* Management Section */
    .management-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px 40px;
    }

    .admin-tabs {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .tab-content {
      padding: 30px;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .tab-header h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;
    }

    .management-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .management-card {
      background: #f8f9fa;
      border-radius: 15px;
      padding: 25px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .management-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
    }

    .management-card mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #667eea;
      margin-bottom: 15px;
    }

    .management-card h4 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 10px 0;
    }

    .management-card p {
      color: #7f8c8d;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .order-stats {
      display: flex;
      gap: 10px;
    }

    /* Analytics Grid */
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
    }

    .analytics-card {
      background: #f8f9fa;
      border-radius: 15px;
      padding: 25px;
    }

    .analytics-card h4 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 20px 0;
    }

    .metric {
      margin-bottom: 15px;
    }

    .metric-value {
      display: block;
      font-size: 2rem;
      font-weight: 800;
      color: #2c3e50;
    }

    .metric-label {
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .progress-label {
      font-size: 0.9rem;
      color: #7f8c8d;
      margin-top: 10px;
    }

    /* Activity Section */
    .activity-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px 40px;
    }

    .activity-section h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      margin: 0 0 25px 0;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    .activity-list {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-success {
      background: rgba(46, 213, 115, 0.1);
      color: #2ed573;
    }

    .activity-warning {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }

    .activity-info {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .activity-error {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .activity-description {
      font-size: 0.9rem;
      color: #7f8c8d;
      margin-bottom: 5px;
    }

    .activity-time {
      font-size: 0.8rem;
      color: #95a5a6;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .header-content {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .quick-actions-section {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .admin-header {
        padding: 30px 15px;
      }

      .stats-section,
      .quick-actions-section,
      .management-section,
      .activity-section {
        padding-left: 15px;
        padding-right: 15px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .management-cards {
        grid-template-columns: 1fr;
      }

      .action-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .tab-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }
    }

    @media (max-width: 480px) {
      .access-denied-content {
        padding: 40px 20px;
      }

      .access-denied-actions {
        flex-direction: column;
      }

      .header-text h1 {
        font-size: 2rem;
      }

      .stat-card {
        padding: 20px;
      }

      .action-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminPlaceholderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdminUser = false;
  private subscription = new Subscription();

  dashboardStats: DashboardStats = {
    totalProducts: 24,
    totalOrders: 127,
    totalRevenue: 45230,
    totalUsers: 1234,
    pendingOrders: 5,
    lowStockItems: 3,
    newUsersToday: 12,
    revenueGrowth: 15
  };

  recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      description: 'Order #ORD-2024-003 - Dell XPS 13 Laptop ($1,299.99)',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      status: 'success'
    },
    {
      id: 2,
      type: 'product',
      title: 'Product Updated',
      description: 'iPhone 15 Pro inventory updated',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'info'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Low Stock Alert',
      description: 'Dell XPS 13 Laptop - Only 3 units remaining',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      status: 'warning'
    },
    {
      id: 4,
      type: 'user',
      title: 'New User Registration',
      description: 'john.doe@example.com registered',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'info'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isAdminUser = user?.role === UserRole.ADMIN;
      })
    );

    // For demo purposes, simulate admin login if no user is logged in
    if (!this.currentUser) {
      this.simulateAdminLogin();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private simulateAdminLogin() {
    // Create a mock admin user for demo
    const mockAdmin: User = {
      id: 1,
      email: 'admin@shopeasy.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simulate setting the admin user
    this.currentUser = mockAdmin;
    this.isAdminUser = true;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if logout fails, redirect to login
        this.router.navigate(['/login']);
      }
    });
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      order: 'shopping_bag',
      product: 'inventory',
      user: 'person_add',
      alert: 'warning'
    };
    return icons[type] || 'info';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }
}