import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, takeUntil } from 'rxjs';
import { NotificationService, NotificationMessage } from './notification.service';
import { WebSocketService, WebSocketMessage } from './websocket.service';

export interface RealTimeStatus {
  sseConnected: boolean;
  webSocketConnected: boolean;
  overallConnected: boolean;
  lastActivity?: Date;
}

export interface RealTimeMessage {
  source: 'sse' | 'websocket';
  type: string;
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class RealTimeConnectionService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private statusSubject = new BehaviorSubject<RealTimeStatus>({
    sseConnected: false,
    webSocketConnected: false,
    overallConnected: false
  });
  private messagesSubject = new Subject<RealTimeMessage>();

  private currentUserId: string | null = null;
  private authToken: string | null = null;
  private reconnectTimer: any;

  constructor(
    private notificationService: NotificationService,
    private webSocketService: WebSocketService
  ) {
    this.initializeConnectionMonitoring();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }

  /**
   * Initialize connection with user credentials
   */
  initialize(userId: string, authToken: string): void {
    this.currentUserId = userId;
    this.authToken = authToken;
    this.connect();
  }

  /**
   * Connect both SSE and WebSocket
   */
  connect(): void {
    if (!this.currentUserId || !this.authToken) {
      console.error('Cannot connect: missing user credentials');
      return;
    }

    console.log('Connecting real-time services...');
    
    // Connect SSE for notifications
    this.notificationService.connect(this.currentUserId);
    
    // Connect WebSocket for bidirectional communication
    this.webSocketService.connect(this.authToken);
  }

  /**
   * Disconnect both services
   */
  disconnect(): void {
    console.log('Disconnecting real-time services...');
    
    this.notificationService.disconnect();
    this.webSocketService.disconnect();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Reconnect both services
   */
  reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  /**
   * Get overall connection status
   */
  getStatus(): Observable<RealTimeStatus> {
    return this.statusSubject.asObservable();
  }

  /**
   * Get all real-time messages
   */
  getMessages(): Observable<RealTimeMessage> {
    return this.messagesSubject.asObservable();
  }

  /**
   * Check if any connection is active
   */
  isConnected(): boolean {
    return this.statusSubject.value.overallConnected;
  }

  /**
   * Cart synchronization methods
   */
  syncCart(cartData: any): void {
    if (this.webSocketService.isConnected()) {
      this.webSocketService.syncCart(cartData);
    }
  }

  addToCart(productId: number, productName: string, quantity: number, price: number): void {
    if (this.webSocketService.isConnected()) {
      this.webSocketService.addToCart(productId, productName, quantity, price);
    }
  }

  removeFromCart(productId: number, productName: string, quantity: number): void {
    if (this.webSocketService.isConnected()) {
      this.webSocketService.removeFromCart(productId, productName, quantity);
    }
  }

  clearCart(): void {
    if (this.webSocketService.isConnected()) {
      this.webSocketService.clearCart();
    }
  }

  /**
   * Subscribe to specific message types
   */
  subscribeToCartUpdates(): Observable<any> {
    const cartUpdates = new Subject<any>();
    
    this.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.type === 'cart_update' || 
            (message.source === 'websocket' && message.data?.action?.includes('cart'))) {
          cartUpdates.next(message.data);
        }
      });
    
    return cartUpdates.asObservable();
  }

  subscribeToOrderUpdates(): Observable<any> {
    const orderUpdates = new Subject<any>();
    
    this.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.type === 'order_status_update' || message.type === 'new_order') {
          orderUpdates.next(message.data);
        }
      });
    
    return orderUpdates.asObservable();
  }

  subscribeToInventoryUpdates(): Observable<any> {
    const inventoryUpdates = new Subject<any>();
    
    this.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.type === 'inventory_update' || message.type === 'low_inventory') {
          inventoryUpdates.next(message.data);
        }
      });
    
    return inventoryUpdates.asObservable();
  }

  subscribeToSystemNotifications(): Observable<any> {
    const systemNotifications = new Subject<any>();
    
    this.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.type === 'system' || message.type === 'promotional') {
          systemNotifications.next(message.data);
        }
      });
    
    return systemNotifications.asObservable();
  }

  /**
   * Admin-specific methods
   */
  subscribeToAdminUpdates(): Observable<any> {
    const adminUpdates = new Subject<any>();
    
    // Subscribe to WebSocket admin topics
    if (this.webSocketService.isConnected()) {
      this.webSocketService.subscribe('/topic/admin/dashboard', (message) => {
        adminUpdates.next(message);
      });
      
      this.webSocketService.subscribe('/topic/admin/orders', (message) => {
        adminUpdates.next(message);
      });
      
      this.webSocketService.subscribe('/topic/admin/inventory', (message) => {
        adminUpdates.next(message);
      });
    }
    
    return adminUpdates.asObservable();
  }

  updateAdminDashboard(type: string, data: any): void {
    if (this.webSocketService.isConnected()) {
      this.webSocketService.updateAdminDashboard(type, data);
    }
  }

  private initializeConnectionMonitoring(): void {
    // Monitor SSE connection status
    this.notificationService.getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(sseStatus => {
        this.updateOverallStatus();
      });

    // Monitor WebSocket connection status
    this.webSocketService.getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(wsStatus => {
        this.updateOverallStatus();
      });

    // Forward SSE messages
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        this.messagesSubject.next({
          source: 'sse',
          type: notification.type,
          data: notification.data,
          timestamp: notification.timestamp
        });
      });

    // Forward WebSocket messages
    this.webSocketService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(wsMessage => {
        this.messagesSubject.next({
          source: 'websocket',
          type: wsMessage.destination.split('/').pop() || 'unknown',
          data: wsMessage.body,
          timestamp: wsMessage.timestamp
        });
      });

    // Set up periodic health check
    this.setupHealthCheck();
  }

  private updateOverallStatus(): void {
    const sseConnected = this.notificationService.isConnected();
    const webSocketConnected = this.webSocketService.isConnected();
    const overallConnected = sseConnected || webSocketConnected;

    this.statusSubject.next({
      sseConnected,
      webSocketConnected,
      overallConnected,
      lastActivity: overallConnected ? new Date() : this.statusSubject.value.lastActivity
    });

    // Auto-reconnect if both connections are down
    if (!overallConnected && (this.currentUserId && this.authToken)) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect real-time services...');
      this.connect();
      this.reconnectTimer = null;
    }, 5000);
  }

  private setupHealthCheck(): void {
    // Ping WebSocket connection every 30 seconds
    setInterval(() => {
      if (this.webSocketService.isConnected()) {
        this.webSocketService.ping();
      }
    }, 30000);
  }
}