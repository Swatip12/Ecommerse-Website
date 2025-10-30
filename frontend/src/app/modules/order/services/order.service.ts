import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Order, 
  CreateOrderRequest, 
  CreateOrderItemRequest,
  UpdateOrderStatusRequest, 
  OrderStatusHistory, 
  OrderStatus,
  PagedResponse
} from '../models/order.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new order
   */
  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Get order by order number
   */
  getOrderByOrderNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`);
  }

  /**
   * Get current user's orders with pagination
   */
  getMyOrders(page: number = 0, size: number = 10, status?: OrderStatus): Observable<PagedResponse<Order>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PagedResponse<Order>>(`${this.apiUrl}/my-orders`, { params });
  }

  /**
   * Get recent orders for current user
   */
  getMyRecentOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders/recent`);
  }

  /**
   * Get cancellable orders for current user
   */
  getMyCancellableOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders/cancellable`);
  }

  /**
   * Get refundable orders for current user
   */
  getMyRefundableOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders/refundable`);
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: number, request: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, request);
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: number, reason?: string): Observable<Order> {
    const body = reason ? { reason } : {};
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/cancel`, body);
  }

  /**
   * Get order status history
   */
  getOrderStatusHistory(orderId: number): Observable<OrderStatusHistory[]> {
    return this.http.get<OrderStatusHistory[]>(`${this.apiUrl}/${orderId}/status-history`);
  }

  // Admin endpoints (if user has admin role)

  /**
   * Get orders by status (Admin only)
   */
  getOrdersByStatus(status: OrderStatus, page: number = 0, size: number = 20): Observable<PagedResponse<Order>> {
    const params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PagedResponse<Order>>(`${this.apiUrl}/admin/by-status`, { params });
  }

  /**
   * Get orders requiring attention (Admin only)
   */
  getOrdersRequiringAttention(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin/requiring-attention`);
  }

  /**
   * Admin update order status (Admin only)
   */
  adminUpdateOrderStatus(orderId: number, request: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/admin/${orderId}/status`, request);
  }

  // Helper methods

  /**
   * Get order status display name
   */
  getOrderStatusDisplayName(status: OrderStatus): string {
    const statusNames: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pending',
      [OrderStatus.CONFIRMED]: 'Confirmed',
      [OrderStatus.PROCESSING]: 'Processing',
      [OrderStatus.SHIPPED]: 'Shipped',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]: 'Cancelled',
      [OrderStatus.REFUNDED]: 'Refunded'
    };
    return statusNames[status] || status;
  }

  /**
   * Get order status color class
   */
  getOrderStatusColorClass(status: OrderStatus): string {
    const colorClasses: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'text-yellow-600',
      [OrderStatus.CONFIRMED]: 'text-blue-600',
      [OrderStatus.PROCESSING]: 'text-purple-600',
      [OrderStatus.SHIPPED]: 'text-indigo-600',
      [OrderStatus.DELIVERED]: 'text-green-600',
      [OrderStatus.CANCELLED]: 'text-red-600',
      [OrderStatus.REFUNDED]: 'text-gray-600'
    };
    return colorClasses[status] || 'text-gray-600';
  }

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(order: Order): boolean {
    return order.canBeCancelled && 
           (order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED);
  }

  /**
   * Check if order can be refunded
   */
  canRefundOrder(order: Order): boolean {
    return order.canBeRefunded && 
           order.status === OrderStatus.DELIVERED;
  }

  /**
   * Calculate order summary from cart items
   */
  calculateOrderSummary(items: CreateOrderItemRequest[]): { subtotal: number; taxAmount: number; shippingAmount: number; totalAmount: number } {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const taxAmount = subtotal * 0.08; // 8% tax
    const shippingAmount = subtotal >= 50 ? 0 : 9.99; // Free shipping over $50
    const totalAmount = subtotal + taxAmount + shippingAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      shippingAmount: Math.round(shippingAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  }
}