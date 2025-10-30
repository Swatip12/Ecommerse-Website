import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DisplayNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationDisplayService {
  private notificationsSubject = new BehaviorSubject<DisplayNotification[]>([]);
  private maxNotifications = 5;

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a notification
   */
  show(notification: Omit<DisplayNotification, 'id' | 'timestamp'>): void {
    const fullNotification: DisplayNotification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date()
    };

    // Add to notifications list
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [fullNotification, ...currentNotifications]
      .slice(0, this.maxNotifications);
    
    this.notificationsSubject.next(updatedNotifications);

    // Show snackbar
    this.showSnackBar(fullNotification);
  }

  /**
   * Show info notification
   */
  showInfo(title: string, message: string, persistent = false): void {
    this.show({
      type: 'info',
      title,
      message,
      persistent
    });
  }

  /**
   * Show success notification
   */
  showSuccess(title: string, message: string, persistent = false): void {
    this.show({
      type: 'success',
      title,
      message,
      persistent
    });
  }

  /**
   * Show warning notification
   */
  showWarning(title: string, message: string, persistent = true): void {
    this.show({
      type: 'warning',
      title,
      message,
      persistent
    });
  }

  /**
   * Show error notification
   */
  showError(title: string, message: string, persistent = true): void {
    this.show({
      type: 'error',
      title,
      message,
      persistent
    });
  }

  /**
   * Show order status update notification
   */
  showOrderUpdate(orderNumber: string, status: string, message: string): void {
    this.show({
      type: 'info',
      title: `Order ${orderNumber}`,
      message: `Status: ${status} - ${message}`,
      persistent: false
    });
  }

  /**
   * Show inventory update notification
   */
  showInventoryUpdate(productName: string, availableQuantity: number): void {
    const type = availableQuantity <= 5 ? 'warning' : 'info';
    const title = availableQuantity <= 5 ? 'Low Stock Alert' : 'Inventory Update';
    
    this.show({
      type,
      title,
      message: `${productName} - ${availableQuantity} units available`,
      persistent: availableQuantity <= 5
    });
  }

  /**
   * Show promotional notification
   */
  showPromotional(title: string, message: string, actionLabel?: string, actionCallback?: () => void): void {
    this.show({
      type: 'info',
      title,
      message,
      persistent: true,
      actionLabel,
      actionCallback
    });
  }

  /**
   * Show cart synchronization notification
   */
  showCartSync(action: string, productName?: string): void {
    let message = '';
    switch (action) {
      case 'item_added':
        message = `${productName} added to cart`;
        break;
      case 'item_removed':
        message = `${productName} removed from cart`;
        break;
      case 'cart_cleared':
        message = 'Cart cleared';
        break;
      case 'sync':
        message = 'Cart synchronized across devices';
        break;
      default:
        message = 'Cart updated';
    }

    this.show({
      type: 'success',
      title: 'Cart Update',
      message,
      persistent: false
    });
  }

  /**
   * Show connection status notification
   */
  showConnectionStatus(connected: boolean): void {
    if (connected) {
      this.show({
        type: 'success',
        title: 'Connected',
        message: 'Real-time updates are active',
        persistent: false
      });
    } else {
      this.show({
        type: 'warning',
        title: 'Connection Lost',
        message: 'Attempting to reconnect...',
        persistent: true
      });
    }
  }

  /**
   * Remove notification by ID
   */
  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Get notifications observable
   */
  getNotifications(): Observable<DisplayNotification[]> {
    return this.notificationsSubject.asObservable();
  }

  private showSnackBar(notification: DisplayNotification): void {
    const config: MatSnackBarConfig = {
      duration: notification.persistent ? 0 : this.getDuration(notification.type),
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`snackbar-${notification.type}`]
    };

    const action = notification.actionLabel || (notification.persistent ? 'Dismiss' : undefined);
    
    const snackBarRef = this.snackBar.open(
      `${notification.title}: ${notification.message}`,
      action,
      config
    );

    if (notification.actionCallback && notification.actionLabel) {
      snackBarRef.onAction().subscribe(() => {
        notification.actionCallback!();
      });
    } else if (notification.persistent) {
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    }
  }

  private getDuration(type: string): number {
    switch (type) {
      case 'error':
        return 8000;
      case 'warning':
        return 6000;
      case 'success':
        return 4000;
      case 'info':
      default:
        return 5000;
    }
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}