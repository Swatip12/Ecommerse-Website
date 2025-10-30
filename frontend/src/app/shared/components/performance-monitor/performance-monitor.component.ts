import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { PerformanceService, PerformanceMetrics, MemoryUsage } from '../../services/performance.service';

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="performance-monitor" *ngIf="showMonitor">
      <!-- Toggle Button -->
      <button 
        class="monitor-toggle"
        (click)="toggleMonitor()"
        [attr.aria-label]="isExpanded ? 'Collapse performance monitor' : 'Expand performance monitor'"
      >
        <i class="fas" [class.fa-chevron-up]="isExpanded" [class.fa-chevron-down]="!isExpanded"></i>
        Performance
      </button>

      <!-- Monitor Panel -->
      <div class="monitor-panel" [class.expanded]="isExpanded">
        <!-- Network Status -->
        <div class="status-section">
          <div class="status-item" [class.online]="isOnline" [class.offline]="!isOnline">
            <i class="fas" [class.fa-wifi]="isOnline" [class.fa-wifi-slash]="!isOnline"></i>
            <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
          </div>

          <!-- Update Available -->
          <div class="status-item update" *ngIf="updateAvailable" (click)="activateUpdate()">
            <i class="fas fa-download"></i>
            <span>Update Available</span>
          </div>
        </div>

        <!-- Core Web Vitals -->
        <div class="metrics-section" *ngIf="performanceMetrics">
          <h4>Core Web Vitals</h4>
          <div class="metrics-grid">
            <div class="metric-item" [class]="getMetricStatus('fcp')">
              <div class="metric-label">FCP</div>
              <div class="metric-value">{{ formatTime(performanceMetrics.firstContentfulPaint) }}</div>
            </div>
            <div class="metric-item" [class]="getMetricStatus('lcp')">
              <div class="metric-label">LCP</div>
              <div class="metric-value">{{ formatTime(performanceMetrics.largestContentfulPaint) }}</div>
            </div>
            <div class="metric-item" [class]="getMetricStatus('fid')">
              <div class="metric-label">FID</div>
              <div class="metric-value">{{ formatTime(performanceMetrics.firstInputDelay) }}</div>
            </div>
            <div class="metric-item" [class]="getMetricStatus('cls')">
              <div class="metric-label">CLS</div>
              <div class="metric-value">{{ formatScore(performanceMetrics.cumulativeLayoutShift) }}</div>
            </div>
          </div>
        </div>

        <!-- Memory Usage -->
        <div class="memory-section" *ngIf="memoryUsage">
          <h4>Memory Usage</h4>
          <div class="memory-bar">
            <div 
              class="memory-fill" 
              [style.width.%]="memoryUsage.usagePercentage"
              [class.warning]="memoryUsage.usagePercentage > 70"
              [class.critical]="memoryUsage.usagePercentage > 90"
            ></div>
          </div>
          <div class="memory-details">
            <span>{{ formatBytes(memoryUsage.usedJSHeapSize) }} / {{ formatBytes(memoryUsage.jsHeapSizeLimit) }}</span>
            <span class="percentage">{{ memoryUsage.usagePercentage.toFixed(1) }}%</span>
          </div>
        </div>

        <!-- Performance Budget -->
        <div class="budget-section" *ngIf="budgetStatus">
          <h4>Performance Budget</h4>
          <div class="budget-status" [class.within-budget]="budgetStatus.withinBudget" [class.over-budget]="!budgetStatus.withinBudget">
            <i class="fas" [class.fa-check-circle]="budgetStatus.withinBudget" [class.fa-exclamation-triangle]="!budgetStatus.withinBudget"></i>
            <span>{{ budgetStatus.withinBudget ? 'Within Budget' : 'Over Budget' }}</span>
          </div>
          <div class="budget-violations" *ngIf="budgetStatus.violations.length > 0">
            <div class="violation" *ngFor="let violation of budgetStatus.violations">
              {{ violation }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <button class="action-btn" (click)="refreshMetrics()">
            <i class="fas fa-sync-alt"></i>
            Refresh
          </button>
          <button class="action-btn" (click)="exportMetrics()">
            <i class="fas fa-download"></i>
            Export
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .performance-monitor {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }

    .monitor-toggle {
      background: #333;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px 4px 0 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .monitor-panel {
      background: rgba(0, 0, 0, 0.9);
      color: white;
      border-radius: 4px 0 4px 4px;
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
      width: 300px;
    }

    .monitor-panel.expanded {
      max-height: 500px;
      padding: 15px;
    }

    .status-section {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: bold;
    }

    .status-item.online {
      background: #28a745;
    }

    .status-item.offline {
      background: #dc3545;
    }

    .status-item.update {
      background: #ffc107;
      color: #212529;
      cursor: pointer;
    }

    .metrics-section h4,
    .memory-section h4,
    .budget-section h4 {
      margin: 0 0 10px 0;
      font-size: 11px;
      color: #ccc;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 15px;
    }

    .metric-item {
      background: #444;
      padding: 8px;
      border-radius: 3px;
      text-align: center;
    }

    .metric-item.good {
      border-left: 3px solid #28a745;
    }

    .metric-item.needs-improvement {
      border-left: 3px solid #ffc107;
    }

    .metric-item.poor {
      border-left: 3px solid #dc3545;
    }

    .metric-label {
      font-size: 9px;
      color: #ccc;
      margin-bottom: 2px;
    }

    .metric-value {
      font-size: 11px;
      font-weight: bold;
    }

    .memory-section {
      margin-bottom: 15px;
    }

    .memory-bar {
      background: #444;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 5px;
    }

    .memory-fill {
      height: 100%;
      background: #28a745;
      transition: width 0.3s ease;
    }

    .memory-fill.warning {
      background: #ffc107;
    }

    .memory-fill.critical {
      background: #dc3545;
    }

    .memory-details {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #ccc;
    }

    .budget-section {
      margin-bottom: 15px;
    }

    .budget-status {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 5px;
    }

    .budget-status.within-budget {
      color: #28a745;
    }

    .budget-status.over-budget {
      color: #dc3545;
    }

    .budget-violations {
      font-size: 10px;
      color: #ffc107;
    }

    .violation {
      margin-bottom: 2px;
    }

    .actions-section {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 6px 10px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 10px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-btn:hover {
      background: #0056b3;
    }

    @media (max-width: 768px) {
      .performance-monitor {
        bottom: 10px;
        right: 10px;
      }

      .monitor-panel {
        width: 250px;
      }
    }
  `]
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  showMonitor = false;
  isExpanded = false;
  isOnline = true;
  updateAvailable = false;
  performanceMetrics: PerformanceMetrics | null = null;
  memoryUsage: MemoryUsage | null = null;
  budgetStatus: any = null;

  constructor(
    private performanceService: PerformanceService,
    private cdr: ChangeDetectorRef
  ) {
    // Only show in development or when explicitly enabled
    this.showMonitor = !environment.production || localStorage.getItem('showPerformanceMonitor') === 'true';
  }

  ngOnInit(): void {
    if (this.showMonitor) {
      this.initializeMonitoring();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeMonitoring(): void {
    // Subscribe to performance service observables
    combineLatest([
      this.performanceService.networkStatus,
      this.performanceService.updateAvailable,
      this.performanceService.performanceMetrics
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isOnline, updateAvailable, metrics]) => {
        this.isOnline = isOnline;
        this.updateAvailable = updateAvailable;
        this.performanceMetrics = metrics;
        
        if (metrics) {
          this.budgetStatus = this.performanceService.checkPerformanceBudget();
        }
        
        this.cdr.markForCheck();
      });

    // Update memory usage periodically
    setInterval(() => {
      this.memoryUsage = this.performanceService.getMemoryUsage();
      this.cdr.markForCheck();
    }, 5000);
  }

  toggleMonitor(): void {
    this.isExpanded = !this.isExpanded;
  }

  activateUpdate(): void {
    this.performanceService.activateUpdate();
  }

  refreshMetrics(): void {
    // Trigger a new performance measurement
    window.location.reload();
  }

  exportMetrics(): void {
    if (this.performanceMetrics) {
      const data = {
        performanceMetrics: this.performanceMetrics,
        memoryUsage: this.memoryUsage,
        budgetStatus: this.budgetStatus,
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-metrics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  getMetricStatus(metric: string): string {
    if (!this.performanceMetrics) return '';

    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };

    let value: number;
    switch (metric) {
      case 'fcp':
        value = this.performanceMetrics.firstContentfulPaint;
        break;
      case 'lcp':
        value = this.performanceMetrics.largestContentfulPaint;
        break;
      case 'fid':
        value = this.performanceMetrics.firstInputDelay;
        break;
      case 'cls':
        value = this.performanceMetrics.cumulativeLayoutShift;
        break;
      default:
        return '';
    }

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  formatTime(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  }

  formatScore(score: number): string {
    return score.toFixed(3);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}

// Environment interface (you might need to adjust this based on your environment setup)
declare const environment: {
  production: boolean;
};