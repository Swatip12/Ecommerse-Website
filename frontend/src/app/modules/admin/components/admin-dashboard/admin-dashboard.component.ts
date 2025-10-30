import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, interval, startWith, switchMap } from 'rxjs';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { 
  DashboardMetrics,
  OrderStatistics,
  InventoryStatistics,
  UserStatistics,
  SalesReport
} from '../../models/dashboard.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  metrics: DashboardMetrics | null = null;
  salesReport: SalesReport | null = null;
  loading = true;
  error: string | null = null;
  
  // Date range filters
  startDate: string = '';
  endDate: string = '';
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
  
  // Auto-refresh settings
  autoRefresh = true;
  refreshInterval = 30000; // 30 seconds
  
  constructor(private dashboardService: AdminDashboardService) {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = thirtyDaysAgo.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupAutoRefresh(): void {
    if (this.autoRefresh) {
      interval(this.refreshInterval)
        .pipe(
          startWith(0),
          switchMap(() => this.dashboardService.getDashboardMetrics(this.startDate, this.endDate)),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (metrics) => {
            this.metrics = metrics;
            this.loading = false;
            this.error = null;
          },
          error: (error) => {
            this.error = 'Failed to load dashboard data';
            this.loading = false;
            console.error('Dashboard error:', error);
          }
        });
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboardMetrics(this.startDate, this.endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => {
          this.metrics = metrics;
          this.loading = false;
          this.loadSalesReport();
        },
        error: (error) => {
          this.error = 'Failed to load dashboard data';
          this.loading = false;
          console.error('Dashboard error:', error);
        }
      });
  }

  loadSalesReport(): void {
    this.dashboardService.getSalesReport(this.selectedPeriod, this.startDate, this.endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.salesReport = report;
        },
        error: (error) => {
          console.error('Sales report error:', error);
        }
      });
  }

  onDateRangeChange(): void {
    this.loadDashboardData();
  }

  onPeriodChange(): void {
    this.loadSalesReport();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.setupAutoRefresh();
    }
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  exportData(format: 'csv' | 'excel'): void {
    this.dashboardService.exportDashboardData(format, this.startDate, this.endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const filename = `dashboard-report-${new Date().toISOString().split('T')[0]}.${format}`;
          this.dashboardService.downloadFile(blob, filename);
        },
        error: (error) => {
          console.error('Export error:', error);
        }
      });
  }

  // Helper methods for template
  formatCurrency(amount: number): string {
    return this.dashboardService.formatCurrency(amount);
  }

  formatPercentage(value: number, total: number): string {
    return this.dashboardService.formatPercentage(value, total);
  }

  getStatusColor(status: string): string {
    return this.dashboardService.getStatusColor(status);
  }

  calculateGrowthRate(current: number, previous: number): number {
    return this.dashboardService.calculateGrowthRate(current, previous);
  }

  getOrderStatusEntries(): Array<[string, number]> {
    return this.metrics?.orderStatistics.ordersByStatus 
      ? Object.entries(this.metrics.orderStatistics.ordersByStatus)
      : [];
  }

  getCategoryEntries(): Array<[string, number]> {
    return this.metrics?.inventoryStatistics.productsByCategory 
      ? Object.entries(this.metrics.inventoryStatistics.productsByCategory)
      : [];
  }

  getUserRoleEntries(): Array<[string, number]> {
    return this.metrics?.userStatistics.usersByRole 
      ? Object.entries(this.metrics.userStatistics.usersByRole)
      : [];
  }

  getTopProducts(): any[] {
    return this.salesReport?.topProducts || [];
  }

  getSalesTrend(): any[] {
    return this.salesReport?.salesTrend || [];
  }
}