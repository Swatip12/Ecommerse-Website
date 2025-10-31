import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.models';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;
  orderNumber: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.orderNumber = params['orderNumber'];
        if (this.orderNumber) {
          this.loadOrder();
        } else {
          this.error = 'Order number not provided';
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrder(): void {
    if (!this.orderNumber) return;

    this.orderService.getOrderByOrderNumber(this.orderNumber)
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

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  viewOrderDetails(): void {
    if (this.order) {
      this.router.navigate(['/orders', this.order.id]);
    }
  }

  trackOrder(): void {
    if (this.order) {
      this.router.navigate(['/orders', this.order.id, 'tracking']);
    }
  }

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

  getEstimatedDeliveryDate(): string {
    if (!this.order) return '';
    
    const orderDate = new Date(this.order.createdAt);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + 5); // 5 business days
    
    return estimatedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getOrderStatusDisplayName(): string {
    if (!this.order) return '';
    return this.orderService.getOrderStatusDisplayName(this.order.status);
  }

  getOrderStatusColorClass(): string {
    if (!this.order) return '';
    return this.orderService.getOrderStatusColorClass(this.order.status);
  }
}