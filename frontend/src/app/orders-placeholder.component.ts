import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  shippingAddress: string;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-orders-placeholder',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatBadgeModule, MatTooltipModule, MatProgressBarModule,
    MatTabsModule, MatDividerModule
  ],
  template: `
    <div class="orders-container">
      <!-- Ultra Modern Header -->
      <div class="orders-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="header-icon">
            <mat-icon>receipt_long</mat-icon>
            <div class="icon-glow"></div>
          </div>
          <h1 class="main-title">My Orders</h1>
          <p class="subtitle">Track and manage your order history</p>
          
          <!-- Quick Stats -->
          <div class="quick-stats">
            <div class="stat-item">
              <div class="stat-number">{{ orders.length }}</div>
              <div class="stat-label">Total Orders</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ getActiveOrders() }}</div>
              <div class="stat-label">Active</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">\${{ getTotalSpent().toFixed(2) }}</div>
              <div class="stat-label">Total Spent</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="orders-main">
        <!-- Filters and Search -->
        <div class="filters-section">
          <div class="search-filter">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search orders</mat-label>
              <input matInput [(ngModel)]="searchTerm" placeholder="Order number, product name...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="status-filter">
              <mat-label>Filter by status</mat-label>
              <mat-select [(ngModel)]="statusFilter">
                <mat-option value="all">All Orders</mat-option>
                <mat-option value="processing">Processing</mat-option>
                <mat-option value="confirmed">Confirmed</mat-option>
                <mat-option value="shipped">Shipped</mat-option>
                <mat-option value="delivered">Delivered</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <!-- Orders List -->
        <div class="orders-list">
          <div class="order-card" *ngFor="let order of getFilteredOrders(); trackBy: trackByOrder">
            <!-- Order Header -->
            <div class="order-header">
              <div class="order-info">
                <h3 class="order-number">{{ order.orderNumber }}</h3>
                <div class="order-meta">
                  <span class="order-date">
                    <mat-icon>calendar_today</mat-icon>
                    {{ order.date | date:'MMM dd, yyyy' }}
                  </span>
                  <span class="order-total">
                    <mat-icon>attach_money</mat-icon>
                    \${{ order.total.toFixed(2) }}
                  </span>
                </div>
              </div>
              
              <div class="order-status">
                <div class="status-badge" [class]="'status-' + order.status">
                  <mat-icon>{{ getStatusIcon(order.status) }}</mat-icon>
                  {{ getStatusLabel(order.status) }}
                </div>
                <div class="progress-indicator" *ngIf="order.status !== 'cancelled'">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="getProgressPercentage(order.status)"></div>
                  </div>
                  <div class="progress-steps">
                    <div class="step" [class.active]="isStepActive('processing', order.status)">
                      <mat-icon>shopping_cart</mat-icon>
                    </div>
                    <div class="step" [class.active]="isStepActive('confirmed', order.status)">
                      <mat-icon>check_circle</mat-icon>
                    </div>
                    <div class="step" [class.active]="isStepActive('shipped', order.status)">
                      <mat-icon>local_shipping</mat-icon>
                    </div>
                    <div class="step" [class.active]="isStepActive('delivered', order.status)">
                      <mat-icon>home</mat-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Order Items -->
            <div class="order-items">
              <div class="item-preview" *ngFor="let item of order.items.slice(0, 3)">
                <div class="item-image">
                  <img [src]="item.image" [alt]="item.name" (error)="onImageError($event)">
                </div>
                <div class="item-details">
                  <h4 class="item-name">{{ item.name }}</h4>
                  <p class="item-category">{{ item.category }}</p>
                  <div class="item-pricing">
                    <span class="item-price">\${{ item.price.toFixed(2) }}</span>
                    <span class="item-quantity">Qty: {{ item.quantity }}</span>
                  </div>
                </div>
              </div>
              
              <div class="more-items" *ngIf="order.items.length > 3">
                <div class="more-indicator">
                  <mat-icon>more_horiz</mat-icon>
                  <span>+{{ order.items.length - 3 }} more items</span>
                </div>
              </div>
            </div>

            <!-- Order Details -->
            <div class="order-details" *ngIf="order.trackingNumber || order.estimatedDelivery">
              <div class="detail-item" *ngIf="order.trackingNumber">
                <mat-icon>local_shipping</mat-icon>
                <span>Tracking: {{ order.trackingNumber }}</span>
              </div>
              <div class="detail-item" *ngIf="order.estimatedDelivery">
                <mat-icon>schedule</mat-icon>
                <span>Est. Delivery: {{ order.estimatedDelivery | date:'MMM dd, yyyy' }}</span>
              </div>
              <div class="detail-item">
                <mat-icon>location_on</mat-icon>
                <span>{{ order.shippingAddress }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Order Actions -->
            <div class="order-actions">
              <button mat-stroked-button class="action-btn" (click)="viewOrderDetails(order)">
                <mat-icon>visibility</mat-icon>
                View Details
              </button>
              
              <button mat-stroked-button class="action-btn" 
                      *ngIf="order.trackingNumber" 
                      (click)="trackOrder(order)">
                <mat-icon>track_changes</mat-icon>
                Track Package
              </button>
              
              <button mat-stroked-button class="action-btn" 
                      *ngIf="order.status === 'delivered'" 
                      (click)="reorderItems(order)">
                <mat-icon>refresh</mat-icon>
                Reorder
              </button>
              
              <button mat-stroked-button class="action-btn danger" 
                      *ngIf="order.status === 'processing'" 
                      (click)="cancelOrder(order)">
                <mat-icon>cancel</mat-icon>
                Cancel
              </button>
              
              <button mat-raised-button color="primary" class="primary-action" 
                      *ngIf="order.status === 'delivered'" 
                      (click)="leaveReview(order)">
                <mat-icon>star</mat-icon>
                Leave Review
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-orders" *ngIf="getFilteredOrders().length === 0">
          <div class="empty-content">
            <div class="empty-icon">
              <mat-icon>receipt_long</mat-icon>
            </div>
            <h2>No orders found</h2>
            <p *ngIf="searchTerm || statusFilter !== 'all'">
              Try adjusting your search or filter criteria
            </p>
            <p *ngIf="!searchTerm && statusFilter === 'all'">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            
            <div class="empty-actions">
              <button mat-raised-button color="primary" routerLink="/products" class="shop-btn">
                <mat-icon>shopping_bag</mat-icon>
                Start Shopping
              </button>
              <button mat-stroked-button (click)="clearFilters()" 
                      *ngIf="searchTerm || statusFilter !== 'all'">
                <mat-icon>clear</mat-icon>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Actions Panel -->
        <div class="quick-actions-panel">
          <h3>Quick Actions</h3>
          <div class="action-grid">
            <button mat-raised-button class="quick-action" (click)="trackAllOrders()">
              <mat-icon>track_changes</mat-icon>
              <span>Track All Orders</span>
            </button>
            <button mat-raised-button class="quick-action" routerLink="/products">
              <mat-icon>shopping_bag</mat-icon>
              <span>Continue Shopping</span>
            </button>
            <button mat-raised-button class="quick-action" (click)="downloadInvoices()">
              <mat-icon>download</mat-icon>
              <span>Download Invoices</span>
            </button>
            <button mat-raised-button class="quick-action" (click)="contactSupport()">
              <mat-icon>support_agent</mat-icon>
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Ultra Modern Orders Styles */
    .orders-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow-x: hidden;
    }

    .orders-container::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Ultra Modern Header */
    .orders-header {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 20px 60px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 1;
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
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-icon {
      position: relative;
      display: inline-block;
      margin-bottom: 20px;
    }

    .header-icon mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ffd700;
      filter: drop-shadow(0 4px 20px rgba(255, 215, 0, 0.3));
    }

    .icon-glow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .main-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 10px;
      text-shadow: 0 4px 20px rgba(0,0,0,0.3);
      background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 40px;
      font-weight: 300;
    }

    /* Quick Stats */
    .quick-stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 30px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 800;
      color: #ffd700;
      text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Main Content */
    .orders-main {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    /* Filters Section */
    .filters-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .search-filter {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
    }

    .status-filter {
      min-width: 200px;
    }

    /* Orders List */
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 25px;
      margin-bottom: 40px;
    }

    .order-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      animation: slideInUp 0.6s ease-out;
    }

    .order-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.15);
    }

    /* Order Header */
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      gap: 20px;
    }

    .order-info {
      flex: 1;
    }

    .order-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 10px 0;
    }

    .order-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .order-date,
    .order-total {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .order-total {
      color: #2c3e50;
      font-weight: 600;
    }

    .order-date mat-icon,
    .order-total mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Order Status */
    .order-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 15px;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-processing {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.3);
    }

    .status-confirmed {
      background: rgba(23, 162, 184, 0.1);
      color: #17a2b8;
      border: 1px solid rgba(23, 162, 184, 0.3);
    }

    .status-shipped {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border: 1px solid rgba(102, 126, 234, 0.3);
    }

    .status-delivered {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
      border: 1px solid rgba(40, 167, 69, 0.3);
    }

    .status-cancelled {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
      border: 1px solid rgba(220, 53, 69, 0.3);
    }

    /* Progress Indicator */
    .progress-indicator {
      width: 200px;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(0,0,0,0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .progress-steps {
      display: flex;
      justify-content: space-between;
    }

    .step {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .step mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: rgba(0,0,0,0.4);
    }

    .step.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .step.active mat-icon {
      color: white;
    }

    /* Order Items */
    .order-items {
      display: flex;
      gap: 20px;
      margin: 20px 0;
      flex-wrap: wrap;
    }

    .item-preview {
      display: flex;
      gap: 12px;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 12px;
      flex: 1;
      min-width: 250px;
    }

    .item-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details {
      flex: 1;
    }

    .item-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 4px 0;
      line-height: 1.3;
    }

    .item-category {
      font-size: 0.8rem;
      color: #667eea;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .item-pricing {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-price {
      font-weight: 600;
      color: #2c3e50;
    }

    .item-quantity {
      font-size: 0.8rem;
      color: #7f8c8d;
    }

    .more-items {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 12px;
      padding: 15px;
      min-width: 150px;
    }

    .more-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      color: #667eea;
      font-size: 0.8rem;
      font-weight: 600;
    }

    /* Order Details */
    .order-details {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin: 20px 0;
      padding: 15px;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 12px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .detail-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    /* Order Actions */
    .order-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .action-btn {
      border-radius: 20px !important;
      padding: 8px 16px !important;
      font-weight: 500 !important;
      border-color: rgba(102, 126, 234, 0.3) !important;
      color: #667eea !important;
    }

    .action-btn:hover {
      background: rgba(102, 126, 234, 0.1) !important;
      border-color: #667eea !important;
    }

    .action-btn.danger {
      border-color: rgba(220, 53, 69, 0.3) !important;
      color: #dc3545 !important;
    }

    .action-btn.danger:hover {
      background: rgba(220, 53, 69, 0.1) !important;
      border-color: #dc3545 !important;
    }

    .primary-action {
      border-radius: 20px !important;
      padding: 8px 16px !important;
      font-weight: 600 !important;
    }

    /* Empty State */
    .empty-orders {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .empty-content {
      text-align: center;
      color: white;
      max-width: 500px;
    }

    .empty-icon {
      margin-bottom: 30px;
    }

    .empty-icon mat-icon {
      font-size: 5rem;
      width: 5rem;
      height: 5rem;
      opacity: 0.7;
    }

    .empty-content h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 15px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    .empty-content p {
      font-size: 1.1rem;
      opacity: 0.9;
      margin-bottom: 30px;
      line-height: 1.5;
    }

    .empty-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .shop-btn {
      padding: 15px 30px !important;
      font-size: 1.1rem !important;
      font-weight: 600 !important;
      border-radius: 25px !important;
      background: linear-gradient(135deg, #ffd700, #ffed4e) !important;
      color: #2c3e50 !important;
    }

    /* Quick Actions Panel */
    .quick-actions-panel {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .quick-actions-panel h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 20px 0;
      text-align: center;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .quick-action {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 20px !important;
      border-radius: 15px !important;
      background: rgba(102, 126, 234, 0.1) !important;
      color: #667eea !important;
      font-weight: 600 !important;
      transition: all 0.3s ease;
    }

    .quick-action:hover {
      background: #667eea !important;
      color: white !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .quick-action mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .order-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .order-status {
        align-items: flex-start;
        width: 100%;
      }

      .progress-indicator {
        width: 100%;
        max-width: 300px;
      }

      .quick-stats {
        gap: 20px;
      }
    }

    @media (max-width: 768px) {
      .main-title {
        font-size: 2.5rem;
      }

      .orders-main {
        padding: 20px 15px;
      }

      .search-filter {
        flex-direction: column;
        gap: 15px;
      }

      .search-field,
      .status-filter {
        width: 100%;
        max-width: none;
      }

      .order-card {
        padding: 20px;
      }

      .order-items {
        flex-direction: column;
      }

      .item-preview {
        min-width: auto;
      }

      .order-actions {
        justify-content: center;
      }

      .action-grid {
        grid-template-columns: 1fr;
      }

      .quick-stats {
        flex-direction: column;
        gap: 15px;
      }
    }

    @media (max-width: 480px) {
      .orders-header {
        padding: 60px 15px 40px;
      }

      .main-title {
        font-size: 2rem;
      }

      .filters-section,
      .order-card,
      .quick-actions-panel {
        padding: 20px;
        border-radius: 15px;
      }

      .order-meta {
        flex-direction: column;
        gap: 8px;
      }

      .progress-steps {
        gap: 5px;
      }

      .step {
        width: 20px;
        height: 20px;
      }

      .step mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
      }
    }
  `]
})
export class OrdersPlaceholderComponent implements OnInit {
  orders: Order[] = [];
  searchTerm = '';
  statusFilter = 'all';

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    // Sample orders data
    this.orders = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        date: new Date('2024-10-28'),
        status: 'delivered',
        total: 1199.99,
        shippingAddress: '123 Main St, New York, NY 10001',
        trackingNumber: 'TRK123456789',
        paymentMethod: 'Credit Card',
        items: [
          {
            id: 1,
            name: 'iPhone 15 Pro Max',
            image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
            price: 1199.99,
            quantity: 1,
            category: 'Electronics'
          }
        ]
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        date: new Date('2024-10-30'),
        status: 'shipped',
        total: 549.98,
        shippingAddress: '123 Main St, New York, NY 10001',
        trackingNumber: 'TRK987654321',
        estimatedDelivery: new Date('2024-11-05'),
        paymentMethod: 'Credit Card',
        items: [
          {
            id: 2,
            name: 'Nike Air Max 270',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
            price: 199.99,
            quantity: 1,
            category: 'Footwear'
          },
          {
            id: 3,
            name: 'Sony WH-1000XM5 Headphones',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            price: 349.99,
            quantity: 1,
            category: 'Electronics'
          }
        ]
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        date: new Date('2024-10-31'),
        status: 'processing',
        total: 1299.99,
        shippingAddress: '123 Main St, New York, NY 10001',
        estimatedDelivery: new Date('2024-11-10'),
        paymentMethod: 'Credit Card',
        items: [
          {
            id: 4,
            name: 'Dell XPS 13 Laptop',
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
            price: 1299.99,
            quantity: 1,
            category: 'Electronics'
          }
        ]
      }
    ];
  }

  trackByOrder(index: number, order: Order): string {
    return order.id;
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
  }

  getFilteredOrders(): Order[] {
    return this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = this.statusFilter === 'all' || order.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  getActiveOrders(): number {
    return this.orders.filter(order => 
      order.status === 'processing' || order.status === 'confirmed' || order.status === 'shipped'
    ).length;
  }

  getTotalSpent(): number {
    return this.orders.reduce((total, order) => total + order.total, 0);
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      processing: 'hourglass_empty',
      confirmed: 'check_circle',
      shipped: 'local_shipping',
      delivered: 'home',
      cancelled: 'cancel'
    };
    return icons[status] || 'help';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      processing: 'Processing',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  }

  getProgressPercentage(status: string): number {
    const percentages: { [key: string]: number } = {
      processing: 25,
      confirmed: 50,
      shipped: 75,
      delivered: 100,
      cancelled: 0
    };
    return percentages[status] || 0;
  }

  isStepActive(step: string, currentStatus: string): boolean {
    const steps = ['processing', 'confirmed', 'shipped', 'delivered'];
    const stepIndex = steps.indexOf(step);
    const currentIndex = steps.indexOf(currentStatus);
    return stepIndex <= currentIndex;
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = 'all';
  }

  viewOrderDetails(order: Order) {
    alert(`Viewing details for ${order.orderNumber}`);
  }

  trackOrder(order: Order) {
    alert(`Tracking order ${order.orderNumber} with tracking number: ${order.trackingNumber}`);
  }

  reorderItems(order: Order) {
    alert(`Reordering items from ${order.orderNumber}`);
  }

  cancelOrder(order: Order) {
    if (confirm(`Are you sure you want to cancel ${order.orderNumber}?`)) {
      order.status = 'cancelled';
      alert('Order cancelled successfully');
    }
  }

  leaveReview(order: Order) {
    alert(`Leave a review for items in ${order.orderNumber}`);
  }

  trackAllOrders() {
    alert('Opening order tracking dashboard...');
  }

  downloadInvoices() {
    alert('Downloading all invoices...');
  }

  contactSupport() {
    alert('Opening support chat...');
  }
}