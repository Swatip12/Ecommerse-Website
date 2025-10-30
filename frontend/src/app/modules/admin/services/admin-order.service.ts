import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Order, 
  OrderStatus, 
  UpdateOrderStatusRequest,
  PagedResponse
} from '../../order/models/order.models';
import { environment } from '../../../../environments/environment';

export interface FulfillOrderRequest {
  notes?: string;
  warehouseLocation?: string;
  fulfillmentMethod?: string;
}

export interface ShipOrderRequest {
  trackingNumber?: string;
  carrier?: string;
  shippingMethod?: string;
  notes?: string;
}

export interface RefundOrderRequest {
  refundAmount: number;
  reason?: string;
  refundMethod?: string;
  notes?: string;
}

export interface CancelOrderRequest {
  reason?: string;
  notes?: string;
  refundPayment: boolean;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  averageOrderValue: number;
  ordersByStatus: { [key: string]: number };
  revenueByStatus: { [key: string]: number };
}

export interface OrderFilters {
  status?: OrderStatus;
  orderNumber?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private readonly apiUrl = `${environment.apiUrl}/admin/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Get all orders with filtering and pagination
   */
  getAllOrders(filters: OrderFilters = {}): Observable<PagedResponse<Order>> {
    let params = new HttpParams()
      .set('page', (filters.page || 0).toString())
      .set('size', (filters.size || 20).toString());

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.orderNumber) {
      params = params.set('orderNumber', filters.orderNumber);
    }
    if (filters.userId) {
      params = params.set('userId', filters.userId.toString());
    }
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<PagedResponse<Order>>(this.apiUrl, { params });
  }

  /**
   * Get order by ID (admin view)
   */
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: number, request: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, request);
  }

  /**
   * Fulfill order
   */
  fulfillOrder(orderId: number, request: FulfillOrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/fulfill`, request);
  }

  /**
   * Ship order
   */
  shipOrder(orderId: number, request: ShipOrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/ship`, request);
  }

  /**
   * Refund order
   */
  refundOrder(orderId: number, request: RefundOrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/refund`, request);
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: number, request: CancelOrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/cancel`, request);
  }

  /**
   * Get orders requiring attention
   */
  getOrdersRequiringAttention(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/requiring-attention`);
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: OrderStatus, page: number = 0, size: number = 20): Observable<PagedResponse<Order>> {
    const params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PagedResponse<Order>>(`${this.apiUrl}/by-status`, { params });
  }

  /**
   * Get order statistics
   */
  getOrderStatistics(startDate?: string, endDate?: string): Observable<OrderStatistics> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<OrderStatistics>(`${this.apiUrl}/statistics`, { params });
  }

  /**
   * Export orders to CSV
   */
  exportOrders(status?: OrderStatus, startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Helper methods

  /**
   * Get order status badge class
   */
  getOrderStatusBadgeClass(status: OrderStatus): string {
    const badgeClasses: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
      [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [OrderStatus.REFUNDED]: 'bg-gray-100 text-gray-800'
    };
    return badgeClasses[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get available status transitions for admin
   */
  getAvailableStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [OrderStatus.REFUNDED],
      [OrderStatus.REFUNDED]: []
    };
    return transitions[currentStatus] || [];
  }

  /**
   * Check if order can be fulfilled
   */
  canFulfillOrder(order: Order): boolean {
    return order.status === OrderStatus.CONFIRMED;
  }

  /**
   * Check if order can be shipped
   */
  canShipOrder(order: Order): boolean {
    return order.status === OrderStatus.PROCESSING;
  }

  /**
   * Check if order can be refunded
   */
  canRefundOrder(order: Order): boolean {
    return order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED;
  }

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(order: Order): boolean {
    return order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.REFUNDED;
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Download CSV file
   */
  downloadCSV(blob: Blob, filename: string = 'orders.csv'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}