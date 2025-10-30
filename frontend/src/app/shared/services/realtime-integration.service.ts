import { Injectable, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RealTimeConnectionService } from './realtime-connection.service';
import { NotificationDisplayService } from './notification-display.service';

@Injectable({
  providedIn: 'root'
})
export class RealTimeIntegrationService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private isInitialized = false;

  constructor(
    private realTimeConnectionService: RealTimeConnectionService,
    private notificationDisplayService: NotificationDisplayService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize real-time integration
   */
  initialize(userId: string, authToken: string): void {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing real-time integration...');
    
    // Initialize connection service
    this.realTimeConnectionService.initialize(userId, authToken);
    
    // Set up message handlers
    this.setupMessageHandlers();
    
    // Set up connection status monitoring
    this.setupConnectionMonitoring();
    
    this.isInitialized = true;
  }

  /**
   * Shutdown real-time integration
   */
  shutdown(): void {
    if (!this.isInitialized) {
      return;
    }

    console.log('Shutting down real-time integration...');
    
    this.realTimeConnectionService.disconnect();
    this.isInitialized = false;
  }

  /**
   * Cart synchronization methods
   */
  syncCart(cartData: any): void {
    this.realTimeConnectionService.syncCart(cartData);
  }

  addToCart(productId: number, productName: string, quantity: number, price: number): void {
    this.realTimeConnectionService.addToCart(productId, productName, quantity, price);
  }

  removeFromCart(productId: number, productName: string, quantity: number): void {
    this.realTimeConnectionService.removeFromCart(productId, productName, quantity);
  }

  clearCart(): void {
    this.realTimeConnectionService.clearCart();
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.realTimeConnectionService.isConnected();
  }

  /**
   * Manual reconnection
   */
  reconnect(): void {
    this.realTimeConnectionService.reconnect();
  }

  private setupMessageHandlers(): void {
    // Handle order status updates
    this.realTimeConnectionService.subscribeToOrderUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(orderUpdate => {
        this.handleOrderUpdate(orderUpdate);
      });

    // Handle cart updates
    this.realTimeConnectionService.subscribeToCartUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cartUpdate => {
        this.handleCartUpdate(cartUpdate);
      });

    // Handle inventory updates
    this.realTimeConnectionService.subscribeToInventoryUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(inventoryUpdate => {
        this.handleInventoryUpdate(inventoryUpdate);
      });

    // Handle system notifications
    this.realTimeConnectionService.subscribeToSystemNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(systemNotification => {
        this.handleSystemNotification(systemNotification);
      });
  }

  private setupConnectionMonitoring(): void {
    this.realTimeConnectionService.getStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        // Show connection status changes
        if (status.overallConnected && status.lastActivity) {
          const timeSinceLastActivity = Date.now() - status.lastActivity.getTime();
          if (timeSinceLastActivity < 5000) { // Only show if recently connected
            this.notificationDisplayService.showConnectionStatus(true);
          }
        } else {
          this.notificationDisplayService.showConnectionStatus(false);
        }
      });
  }

  private handleOrderUpdate(orderUpdate: any): void {
    console.log('Handling order update:', orderUpdate);
    
    if (orderUpdate.orderNumber && orderUpdate.status) {
      this.notificationDisplayService.showOrderUpdate(
        orderUpdate.orderNumber,
        orderUpdate.status,
        orderUpdate.message || 'Order status updated'
      );
    }
  }

  private handleCartUpdate(cartUpdate: any): void {
    console.log('Handling cart update:', cartUpdate);
    
    if (cartUpdate.action) {
      const productName = cartUpdate.metadata?.productName || 'Item';
      this.notificationDisplayService.showCartSync(cartUpdate.action, productName);
    }
  }

  private handleInventoryUpdate(inventoryUpdate: any): void {
    console.log('Handling inventory update:', inventoryUpdate);
    
    if (inventoryUpdate.productName && inventoryUpdate.availableQuantity !== undefined) {
      this.notificationDisplayService.showInventoryUpdate(
        inventoryUpdate.productName,
        inventoryUpdate.availableQuantity
      );
    }
  }

  private handleSystemNotification(systemNotification: any): void {
    console.log('Handling system notification:', systemNotification);
    
    if (systemNotification.type === 'promotional') {
      this.notificationDisplayService.showPromotional(
        systemNotification.title || 'Promotion',
        systemNotification.message || 'New promotion available!'
      );
    } else {
      const level = systemNotification.level || 'info';
      const message = systemNotification.message || 'System notification';
      
      switch (level) {
        case 'error':
          this.notificationDisplayService.showError('System Alert', message);
          break;
        case 'warning':
          this.notificationDisplayService.showWarning('System Notice', message);
          break;
        case 'success':
          this.notificationDisplayService.showSuccess('System Update', message);
          break;
        default:
          this.notificationDisplayService.showInfo('System Info', message);
      }
    }
  }
}