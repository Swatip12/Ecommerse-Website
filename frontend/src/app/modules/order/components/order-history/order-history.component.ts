import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus, PagedResponse } from '../../models/order.models';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  orders: Order[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  // Filtering
  statusFilter = new FormControl('');
  searchControl = new FormControl('');
  selectedStatus: OrderStatus | null = null;
  
  // Available status options for filtering
  statusOptions = [
    { value: '', label: 'All Orders' },
    { value: OrderStatus.PENDING, label: 'Pending' },
    { value: OrderStatus.CONFIRMED, label: 'Confirmed' },
    { value: OrderStatus.PROCESSING, label: 'Processing' },
    { value: OrderStatus.SHIPPED, label: 'Shipped' },
    { value: OrderStatus.DELIVERED, label: 'Delivered' },
    { value: OrderStatus.CANCELLED, label: 'Cancelled' },
    { value: OrderStatus.REFUNDED, label: 'Refunded' }
  ];

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters(): void {
    // Status filter
    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.selectedStatus = (status as OrderStatus) || null;
        this.currentPage = 0;
        this.loadOrders();
      });

    // Search filter (for future implementation)
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        // TODO: Implement search functionality
        console.log('Search term:', searchTerm);
      });
  }

  private loadOrders(): void {
    this.isLoading = true;
    this.error = null;

    const loadOrdersObservable = this.selectedStatus
      ? this.orderService.getMyOrders(this.currentPage, this.pageSize, this.selectedStatus)
      : this.orderService.getMyOrders(this.currentPage, this.pageSize);

    loadOrdersObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PagedResponse<Order>) => {
          this.orders = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.error = 'Failed to load orders. Please try again.';
          this.isLoading = false;
        }
      });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  // Navigation methods
  viewOrderDetails(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }

  trackOrder(order: Order): void {
    this.router.navigate(['/orders', order.id, 'tracking']);
  }

  reorderItems(order: Order): void {
    // TODO: Implement reorder functionality
    console.log('Reorder items from order:', order.orderNumber);
  }

  // Order actions
  cancelOrder(order: Order): void {
    if (!this.orderService.canCancelOrder(order)) {
      return;
    }

    const confirmCancel = confirm(`Are you sure you want to cancel order ${order.orderNumber}?`);
    if (!confirmCancel) {
      return;
    }

    this.orderService.cancelOrder(order.id, 'Cancelled by customer')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          // Update the order in the list
          const index = this.orders.findIndex(o => o.id === updatedOrder.id);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
          }
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('Failed to cancel order. Please try again.');
        }
      });
  }

  downloadInvoice(order: Order): void {
    // TODO: Implement invoice download
    console.log('Download invoice for order:', order.orderNumber);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getOrderStatusDisplayName(status: OrderStatus): string {
    return this.orderService.getOrderStatusDisplayName(status);
  }

  getOrderStatusColorClass(status: OrderStatus): string {
    return this.orderService.getOrderStatusColorClass(status);
  }

  canCancelOrder(order: Order): boolean {
    return this.orderService.canCancelOrder(order);
  }

  canRefundOrder(order: Order): boolean {
    return this.orderService.canRefundOrder(order);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);
    
    let startPage = Math.max(0, this.currentPage - halfRange);
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  refresh(): void {
    this.loadOrders();
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }
}