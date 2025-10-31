import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

import { AdminOrderService, OrderFilters } from '../../services/admin-order.service';
import { Order, OrderStatus, PagedResponse } from '../../../order/models/order.models';
import { OrderManagementComponent } from '../order-management/order-management.component';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCardModule
  ],
  templateUrl: './admin-order-list.component.html',
  styleUrls: ['./admin-order-list.component.scss']
})
export class AdminOrderListComponent implements OnInit {
  // Signals for reactive state management
  orders = signal<Order[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = signal(20);
  
  // Filter form
  filterForm: FormGroup;
  
  // Table configuration
  displayedColumns: string[] = [
    'orderNumber', 
    'userId', 
    'status', 
    'totalAmount', 
    'createdAt', 
    'actions'
  ];
  
  // Order status options
  orderStatuses = Object.values(OrderStatus);
  
  // Computed properties
  hasOrders = computed(() => this.orders().length > 0);
  isEmpty = computed(() => !this.loading() && this.orders().length === 0);

  constructor(
    private adminOrderService: AdminOrderService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadOrders();
    this.setupFilterSubscription();
  }

  /**
   * Create filter form
   */
  private createFilterForm(): FormGroup {
    return this.fb.group({
      status: [''],
      orderNumber: [''],
      userId: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  /**
   * Setup filter form subscription
   */
  private setupFilterSubscription(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage.set(0);
      this.loadOrders();
    });
  }

  /**
   * Load orders with current filters
   */
  loadOrders(): void {
    this.loading.set(true);
    
    const filters: OrderFilters = {
      ...this.filterForm.value,
      page: this.currentPage(),
      size: this.pageSize(),
      startDate: this.formatDate(this.filterForm.value.startDate),
      endDate: this.formatDate(this.filterForm.value.endDate)
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof OrderFilters] === '' || filters[key as keyof OrderFilters] === null) {
        delete filters[key as keyof OrderFilters];
      }
    });

    this.adminOrderService.getAllOrders(filters).subscribe({
      next: (response: PagedResponse<Order>) => {
        this.orders.set(response.content);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadOrders();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage.set(0);
    this.loadOrders();
  }

  /**
   * Open order management dialog
   */
  openOrderManagement(order: Order): void {
    const dialogRef = this.dialog.open(OrderManagementComponent, {
      width: '800px',
      data: { order }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrders(); // Refresh the list
      }
    });
  }

  /**
   * Export orders to CSV
   */
  exportOrders(): void {
    const filters = this.filterForm.value;
    const status = filters.status || undefined;
    const startDate = this.formatDate(filters.startDate);
    const endDate = this.formatDate(filters.endDate);

    this.adminOrderService.exportOrders(status, startDate, endDate).subscribe({
      next: (blob: Blob) => {
        const filename = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        this.adminOrderService.downloadCSV(blob, filename);
        this.snackBar.open('Orders exported successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error exporting orders:', error);
        this.snackBar.open('Error exporting orders', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Get order status badge class
   */
  getStatusBadgeClass(status: OrderStatus): string {
    return this.adminOrderService.getOrderStatusBadgeClass(status);
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return this.adminOrderService.formatCurrency(amount, currency);
  }

  /**
   * Format date for API
   */
  private formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    return date.toISOString().split('T')[0];
  }

  /**
   * Format date for display
   */
  formatDisplayDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get order priority class
   */
  getOrderPriorityClass(order: Order): string {
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (order.status === OrderStatus.PENDING && hoursDiff > 24) {
      return 'priority-high';
    } else if (order.status === OrderStatus.PROCESSING && hoursDiff > 48) {
      return 'priority-medium';
    }
    return '';
  }

  /**
   * Check if order needs attention
   */
  needsAttention(order: Order): boolean {
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    return (order.status === OrderStatus.PENDING && hoursDiff > 24) ||
           (order.status === OrderStatus.PROCESSING && hoursDiff > 48);
  }
}