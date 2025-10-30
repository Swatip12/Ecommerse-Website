import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  DashboardMetrics,
  OrderStatistics,
  InventoryStatistics,
  UserStatistics,
  SalesReport,
  SystemConfiguration,
  UserManagement,
  UpdateUserRequest,
  CreateUserRequest
} from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private readonly orderApiUrl = `${environment.apiUrl}/admin/orders`;
  private readonly productApiUrl = `${environment.apiUrl}/admin/analytics`;
  private readonly userApiUrl = `${environment.apiUrl}/admin/users`;
  private readonly configApiUrl = `${environment.apiUrl}/admin/config`;

  constructor(private http: HttpClient) {}

  /**
   * Get comprehensive dashboard metrics
   */
  getDashboardMetrics(startDate?: string, endDate?: string): Observable<DashboardMetrics> {
    return forkJoin({
      orderStatistics: this.getOrderStatistics(startDate, endDate),
      inventoryStatistics: this.getInventoryStatistics(),
      userStatistics: this.getUserStatistics()
    });
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

    return this.http.get<OrderStatistics>(`${this.orderApiUrl}/statistics`, { params });
  }

  /**
   * Get inventory statistics
   */
  getInventoryStatistics(): Observable<InventoryStatistics> {
    return this.http.get<InventoryStatistics>(`${this.productApiUrl}/inventory`);
  }

  /**
   * Get user statistics
   */
  getUserStatistics(): Observable<UserStatistics> {
    return this.http.get<UserStatistics>(`${this.userApiUrl}/statistics`);
  }

  /**
   * Get sales report
   */
  getSalesReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly', startDate?: string, endDate?: string): Observable<SalesReport> {
    let params = new HttpParams().set('period', period);
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<SalesReport>(`${this.orderApiUrl}/sales-report`, { params });
  }

  /**
   * Get all users for management
   */
  getAllUsers(page: number = 0, size: number = 20, search?: string): Observable<{ content: UserManagement[], totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ content: UserManagement[], totalElements: number }>(`${this.userApiUrl}`, { params });
  }

  /**
   * Get user by ID
   */
  getUserById(userId: number): Observable<UserManagement> {
    return this.http.get<UserManagement>(`${this.userApiUrl}/${userId}`);
  }

  /**
   * Create new user
   */
  createUser(request: CreateUserRequest): Observable<UserManagement> {
    return this.http.post<UserManagement>(`${this.userApiUrl}`, request);
  }

  /**
   * Update user
   */
  updateUser(userId: number, request: UpdateUserRequest): Observable<UserManagement> {
    return this.http.put<UserManagement>(`${this.userApiUrl}/${userId}`, request);
  }

  /**
   * Delete user
   */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.userApiUrl}/${userId}`);
  }

  /**
   * Toggle user active status
   */
  toggleUserStatus(userId: number): Observable<UserManagement> {
    return this.http.put<UserManagement>(`${this.userApiUrl}/${userId}/toggle-status`, {});
  }

  /**
   * Reset user password
   */
  resetUserPassword(userId: number): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(`${this.userApiUrl}/${userId}/reset-password`, {});
  }

  /**
   * Get system configuration
   */
  getSystemConfiguration(): Observable<SystemConfiguration> {
    return this.http.get<SystemConfiguration>(`${this.configApiUrl}`);
  }

  /**
   * Update system configuration
   */
  updateSystemConfiguration(config: Partial<SystemConfiguration>): Observable<SystemConfiguration> {
    return this.http.put<SystemConfiguration>(`${this.configApiUrl}`, config);
  }

  /**
   * Export dashboard data
   */
  exportDashboardData(format: 'csv' | 'excel', startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get(`${this.orderApiUrl}/export-dashboard`, { 
      params, 
      responseType: 'blob' 
    });
  }

  /**
   * Helper methods for formatting and calculations
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  }

  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'CONFIRMED': 'text-blue-600 bg-blue-100',
      'PROCESSING': 'text-purple-600 bg-purple-100',
      'SHIPPED': 'text-indigo-600 bg-indigo-100',
      'DELIVERED': 'text-green-600 bg-green-100',
      'CANCELLED': 'text-red-600 bg-red-100',
      'REFUNDED': 'text-gray-600 bg-gray-100',
      'ACTIVE': 'text-green-600 bg-green-100',
      'INACTIVE': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}