import { Injectable, OnDestroy } from '@angular/core';
// import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { BehaviorSubject, Subject, fromEvent, merge } from 'rxjs';
import { takeUntil, filter, map, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private updateAvailable$ = new BehaviorSubject<boolean>(false);
  private networkStatus$ = new BehaviorSubject<boolean>(navigator.onLine);
  private performanceMetrics$ = new BehaviorSubject<PerformanceMetrics | null>(null);

  constructor() {
    // this.initializeServiceWorker();
    this.initializeNetworkMonitoring();
    this.initializePerformanceMonitoring();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Service Worker Management
  private initializeServiceWorker(): void {
    // Service worker functionality disabled for now
    // if (this.swUpdate.isEnabled) {
    //   // Check for updates
    //   this.swUpdate.versionUpdates
    //     .pipe(
    //       filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
    //       takeUntil(this.destroy$)
    //     )
    //     .subscribe(() => {
    //       this.updateAvailable$.next(true);
    //     });

    //   // Check for updates every 6 hours
    //   setInterval(() => {
    //     this.swUpdate.checkForUpdate();
    //   }, 6 * 60 * 60 * 1000);
    // }
  }

  // Network Status Monitoring
  private initializeNetworkMonitoring(): void {
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        this.networkStatus$.next(isOnline);
      });
  }

  // Performance Monitoring
  private initializePerformanceMonitoring(): void {
    if ('performance' in window) {
      // Monitor page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.collectPerformanceMetrics();
        }, 0);
      });

      // Monitor navigation performance
      if ('PerformanceObserver' in window) {
        this.observePerformanceEntries();
      }
    }
  }

  private collectPerformanceMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    if (navigation) {
      const metrics: PerformanceMetrics = {
        // Core Web Vitals
        firstContentfulPaint: this.getMetricValue(paint, 'first-contentful-paint'),
        largestContentfulPaint: 0, // Will be updated by observer
        cumulativeLayoutShift: 0, // Will be updated by observer
        firstInputDelay: 0, // Will be updated by observer

        // Navigation Timing
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,

        // Resource Timing
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnection: navigation.connectEnd - navigation.connectStart,
        serverResponse: navigation.responseEnd - navigation.requestStart,

        // Memory (if available)
        usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0,

        timestamp: Date.now()
      };

      this.performanceMetrics$.next(metrics);
    }
  }

  private observePerformanceEntries(): void {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.updateMetric('largestContentfulPaint', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.updateMetric('firstInputDelay', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.updateMetric('cumulativeLayoutShift', clsValue);
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  private getMetricValue(entries: PerformanceEntry[], name: string): number {
    const entry = entries.find(e => e.name === name);
    return entry ? entry.startTime : 0;
  }

  private updateMetric(metricName: keyof PerformanceMetrics, value: number): void {
    const currentMetrics = this.performanceMetrics$.value;
    if (currentMetrics) {
      const updatedMetrics = { ...currentMetrics, [metricName]: value };
      this.performanceMetrics$.next(updatedMetrics);
    }
  }

  // Public API
  get updateAvailable() {
    return this.updateAvailable$.asObservable();
  }

  get networkStatus() {
    return this.networkStatus$.asObservable();
  }

  get performanceMetrics() {
    return this.performanceMetrics$.asObservable();
  }

  get isOnline(): boolean {
    return this.networkStatus$.value;
  }

  activateUpdate(): Promise<boolean> {
    // Service worker functionality disabled for now
    // if (this.swUpdate.isEnabled) {
    //   return this.swUpdate.activateUpdate().then(() => {
    //     window.location.reload();
    //     return true;
    //   });
    // }
    return Promise.resolve(false);
  }

  // Image Lazy Loading Helper
  createIntersectionObserver(callback: (entries: IntersectionObserverEntry[]) => void): IntersectionObserver {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    return new IntersectionObserver(callback, options);
  }

  // Preload Critical Resources
  preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font' = 'script'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
    }

    document.head.appendChild(link);
  }

  // Bundle Size Optimization
  loadModuleDynamically<T>(moduleLoader: () => Promise<T>): Promise<T> {
    return moduleLoader().catch(error => {
      console.error('Failed to load module dynamically:', error);
      throw error;
    });
  }

  // Performance Budget Monitoring
  checkPerformanceBudget(): PerformanceBudgetStatus {
    const metrics = this.performanceMetrics$.value;
    if (!metrics) {
      return { withinBudget: true, violations: [] };
    }

    const violations: string[] = [];
    const budgets = {
      firstContentfulPaint: 1500, // 1.5s
      largestContentfulPaint: 2500, // 2.5s
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1, // 0.1
      totalLoadTime: 3000 // 3s
    };

    Object.entries(budgets).forEach(([metric, budget]) => {
      const value = metrics[metric as keyof PerformanceMetrics];
      if (typeof value === 'number' && value > budget) {
        violations.push(`${metric}: ${value}ms exceeds budget of ${budget}ms`);
      }
    });

    return {
      withinBudget: violations.length === 0,
      violations
    };
  }

  // Memory Usage Monitoring
  getMemoryUsage(): MemoryUsage | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  // Critical Resource Hints
  addResourceHints(): void {
    // DNS prefetch for external domains
    this.addResourceHint('dns-prefetch', '//fonts.googleapis.com');
    this.addResourceHint('dns-prefetch', '//fonts.gstatic.com');
    
    // Preconnect to critical origins
    this.addResourceHint('preconnect', 'https://api.example.com');
  }

  private addResourceHint(rel: string, href: string): void {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  }
}

// Interfaces
export interface PerformanceMetrics {
  // Core Web Vitals
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;

  // Navigation Timing
  domContentLoaded: number;
  loadComplete: number;
  totalLoadTime: number;

  // Resource Timing
  dnsLookup: number;
  tcpConnection: number;
  serverResponse: number;

  // Memory
  usedJSHeapSize: number;
  totalJSHeapSize: number;

  timestamp: number;
}

export interface PerformanceBudgetStatus {
  withinBudget: boolean;
  violations: string[];
}

export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}