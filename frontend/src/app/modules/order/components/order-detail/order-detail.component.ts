import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatusHistory, UpdateOrderStatusRequest, OrderStatus } from '../../models/order.models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  order: Order | null = null;
  statusHistory: OrderStatusHistory[] = [];
  isLoading = true;
  isLoadingHistory = false;
  error: string | null = null;
  orderId: number | null = null;
  
  // Order actions
  isCancelling = false;
  showCancelDialog = false;
  cancelReason = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.orderId = +params['id'];
        if (this.orderId) {
          this.loadOrder();
          this.loadStatusHistory();
        } else {
          this.error = 'Invalid order ID';
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrder(): void {
    if (!this.orderId) return;

    this.orderService.getOrderById(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading order:', error);
          this.error = 'Failed to load order details';
          this.isLoading = false;
        }
      });
  }

  private loadStatusHistory(): void {
    if (!this.orderId) return;

    this.isLoadingHistory = true;
    this.orderService.getOrderStatusHistory(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          this.statusHistory = history;
          this.isLoadingHistory = false;
        },
        error: (error) => {
          console.error('Error loading status history:', error);
          this.isLoadingHistory = false;
        }
      });
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/orders']);
  }

  trackOrder(): void {
    if (this.order) {
      this.router.navigate(['/orders', this.order.id, 'tracking']);
    }
  }

  reorderItems(): void {
    if (this.order) {
      // TODO: Implement reorder functionality
      console.log('Reorder items from order:', this.order.orderNumber);
    }
  }

  downloadInvoice(): void {
    if (this.order) {
      // TODO: Implement invoice download
      console.log('Download invoice for order:', this.order.orderNumber);
    }
  }

  // Order actions
  openCancelDialog(): void {
    this.showCancelDialog = true;
    this.cancelReason = '';
  }

  closeCancelDialog(): void {
    this.showCancelDialog = false;
    this.cancelReason = '';
  }

  confirmCancelOrder(): void {
    if (!this.order || !this.cancelReason.trim()) {
      return;
    }

    this.isCancelling = true;
    this.orderService.cancelOrder(this.order.id, this.cancelReason.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.closeCancelDialog();
          this.loadStatusHistory(); // Refresh status history
          this.isCancelling = false;
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('Failed to cancel order. Please try again.');
          this.isCancelling = false;
        }
      });
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getOrderStatusDisplayName(status: OrderStatus): string {
    return this.orderService.getOrderStatusDisplayName(status);
  }

  getOrderStatusColorClass(status: OrderStatus): string {
    return this.orderService.getOrderStatusColorClass(status);
  }

  canCancelOrder(): boolean {
    return this.order ? this.orderService.canCancelOrder(this.order) : false;
  }

  canRefundOrder(): boolean {
    return this.order ? this.orderService.canRefundOrder(this.order) : false;
  }

  getEstimatedDeliveryDate(): string {
    if (!this.order) return '';
    
    const orderDate = new Date(this.order.createdAt);
    const estimatedDate = new Date(orderDate);
    
    // Add business days based on status
    let daysToAdd = 7; // Default 7 days
    switch (this.order.status) {
      case OrderStatus.PENDING:
      case OrderStatus.CONFIRMED:
        daysToAdd = 7;
        break;
      case OrderStatus.PROCESSING:
        daysToAdd = 5;
        break;
      case OrderStatus.SHIPPED:
        daysToAdd = 2;
        break;
      default:
        return '';
    }
    
    estimatedDate.setDate(orderDate.getDate() + daysToAdd);
    
    return estimatedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusIcon(status: string): string {
    const statusIcons: Record<string, string> = {
      'PENDING': 'schedule',
      'CONFIRMED': 'check_circle',
      'PROCESSING': 'settings',
      'SHIPPED': 'local_shipping',
      'DELIVERED': 'done_all',
      'CANCELLED': 'cancel',
      'REFUNDED': 'money_off'
    };
    return statusIcons[status] || 'info';
  }

  getStatusIconColor(status: string): string {
    const statusColors: Record<string, string> = {
      'PENDING': 'text-yellow-500',
      'CONFIRMED': 'text-blue-500',
      'PROCESSING': 'text-purple-500',
      'SHIPPED': 'text-indigo-500',
      'DELIVERED': 'text-green-500',
      'CANCELLED': 'text-red-500',
      'REFUNDED': 'text-gray-500'
    };
    return statusColors[status] || 'text-gray-500';
  }

  isStatusUpgrade(historyItem: OrderStatusHistory): boolean {
    return historyItem.statusUpgrade;
  }

  isSystemChange(historyItem: OrderStatusHistory): boolean {
    return historyItem.systemChange;
  }
}