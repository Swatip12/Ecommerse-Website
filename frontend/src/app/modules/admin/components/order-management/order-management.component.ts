import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdminOrderService, FulfillOrderRequest, ShipOrderRequest, RefundOrderRequest, CancelOrderRequest } from '../../services/admin-order.service';
import { Order, OrderStatus, UpdateOrderStatusRequest } from '../../../order/models/order.models';

interface DialogData {
  order: Order;
}

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {
  order = signal<Order>({} as Order);
  loading = signal(false);
  
  // Forms for different actions
  statusForm: FormGroup;
  fulfillForm: FormGroup;
  shipForm: FormGroup;
  refundForm: FormGroup;
  cancelForm: FormGroup;
  
  // Available status transitions
  availableStatuses: OrderStatus[] = [];

  constructor(
    private dialogRef: MatDialogRef<OrderManagementComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private adminOrderService: AdminOrderService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.statusForm = this.createStatusForm();
    this.fulfillForm = this.createFulfillForm();
    this.shipForm = this.createShipForm();
    this.refundForm = this.createRefundForm();
    this.cancelForm = this.createCancelForm();
  }

  ngOnInit(): void {
    this.order.set(this.data.order);
    this.availableStatuses = this.adminOrderService.getAvailableStatusTransitions(this.order().status);
  }

  /**
   * Create status update form
   */
  private createStatusForm(): FormGroup {
    return this.fb.group({
      newStatus: ['', Validators.required],
      notes: ['']
    });
  }

  /**
   * Create fulfill order form
   */
  private createFulfillForm(): FormGroup {
    return this.fb.group({
      warehouseLocation: [''],
      fulfillmentMethod: [''],
      notes: ['']
    });
  }

  /**
   * Create ship order form
   */
  private createShipForm(): FormGroup {
    return this.fb.group({
      trackingNumber: ['', Validators.required],
      carrier: ['', Validators.required],
      shippingMethod: [''],
      notes: ['']
    });
  }

  /**
   * Create refund order form
   */
  private createRefundForm(): FormGroup {
    return this.fb.group({
      refundAmount: [this.order().totalAmount, [Validators.required, Validators.min(0.01)]],
      reason: ['', Validators.required],
      refundMethod: [''],
      notes: ['']
    });
  }

  /**
   * Create cancel order form
   */
  private createCancelForm(): FormGroup {
    return this.fb.group({
      reason: ['', Validators.required],
      refundPayment: [true],
      notes: ['']
    });
  }

  /**
   * Update order status
   */
  updateStatus(): void {
    if (this.statusForm.invalid) return;

    this.loading.set(true);
    const request: UpdateOrderStatusRequest = this.statusForm.value;

    this.adminOrderService.updateOrderStatus(this.order().id, request).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
        this.availableStatuses = this.adminOrderService.getAvailableStatusTransitions(updatedOrder.status);
        this.snackBar.open('Order status updated successfully', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.statusForm.reset();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.snackBar.open('Error updating order status', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  /**
   * Fulfill order
   */
  fulfillOrder(): void {
    if (this.fulfillForm.invalid) return;

    this.loading.set(true);
    const request: FulfillOrderRequest = this.fulfillForm.value;

    this.adminOrderService.fulfillOrder(this.order().id, request).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
        this.availableStatuses = this.adminOrderService.getAvailableStatusTransitions(updatedOrder.status);
        this.snackBar.open('Order fulfilled successfully', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.fulfillForm.reset();
      },
      error: (error) => {
        console.error('Error fulfilling order:', error);
        this.snackBar.open('Error fulfilling order', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  /**
   * Ship order
   */
  shipOrder(): void {
    if (this.shipForm.invalid) return;

    this.loading.set(true);
    const request: ShipOrderRequest = this.shipForm.value;

    this.adminOrderService.shipOrder(this.order().id, request).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
        this.availableStatuses = this.adminOrderService.getAvailableStatusTransitions(updatedOrder.status);
        this.snackBar.open('Order shipped successfully', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.shipForm.reset();
      },
      error: (error) => {
        console.error('Error shipping order:', error);
        this.snackBar.open('Error shipping order', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  /**
   * Refund order
   */
  refundOrder(): void {
    if (this.refundForm.invalid) return;

    this.loading.set(true);
    const request: RefundOrderRequest = this.refundForm.value;

    this.adminOrderService.refundOrder(this.order().id, request).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
        this.availableStatuses = this.adminOrderService.getAvailableStatusTransitions(updatedOrder.status);
        this.snackBar.open('Order refunded successfully', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.refundForm.reset();
      },
      error: (error) => {
        console.error('Error refunding order:', error);
        this.snackBar.open('Error refunding order', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  /**
   * Cancel order
   */
  cancelOrder(): void {
    if (this.cancelForm.invalid) return;

    this.loading.set(true);
    const request: CancelOrderRequest = this.cancelForm.value;

    this.adminOrderService.cancelOrder(this.order().id, request).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
        this.availableStatuses = this.adminOrderService.getAvailableStatusTransitions(updatedOrder.status);
        this.snackBar.open('Order cancelled successfully', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.cancelForm.reset();
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        this.snackBar.open('Error cancelling order', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  /**
   * Close dialog
   */
  close(): void {
    this.dialogRef.close(true);
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
   * Check if order can be fulfilled
   */
  canFulfill(): boolean {
    return this.adminOrderService.canFulfillOrder(this.order());
  }

  /**
   * Check if order can be shipped
   */
  canShip(): boolean {
    return this.adminOrderService.canShipOrder(this.order());
  }

  /**
   * Check if order can be refunded
   */
  canRefund(): boolean {
    return this.adminOrderService.canRefundOrder(this.order());
  }

  /**
   * Check if order can be cancelled
   */
  canCancel(): boolean {
    return this.adminOrderService.canCancelOrder(this.order());
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}