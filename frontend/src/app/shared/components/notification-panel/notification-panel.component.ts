import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil } from 'rxjs';
import { NotificationDisplayService, DisplayNotification } from '../../services/notification-display.service';
import { RealTimeConnectionService } from '../../services/realtime-connection.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatBadgeModule
  ],
  template: `
    <div class="notification-panel">
      <div class="notification-header">
        <mat-icon>notifications</mat-icon>
        <span>Notifications</span>
        <span class="notification-count" *ngIf="notifications.length > 0" 
              [matBadge]="notifications.length" matBadgeColor="accent">
        </span>
        <button mat-icon-button (click)="clearAll()" *ngIf="notifications.length > 0">
          <mat-icon>clear_all</mat-icon>
        </button>
      </div>

      <div class="connection-status" [class]="connectionStatusClass">
        <mat-icon>{{ connectionIcon }}</mat-icon>
        <span>{{ connectionStatusText }}</span>
      </div>

      <div class="notifications-list">
        <mat-card *ngFor="let notification of notifications; trackBy: trackByNotificationId" 
                  class="notification-card" 
                  [class]="'notification-' + notification.type">
          <mat-card-content>
            <div class="notification-content">
              <div class="notification-icon">
                <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
              </div>
              <div class="notification-text">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
              </div>
              <div class="notification-actions">
                <button mat-icon-button (click)="removeNotification(notification.id)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div *ngIf="notifications.length === 0" class="no-notifications">
          <mat-icon>notifications_none</mat-icon>
          <p>No new notifications</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-panel {
      width: 350px;
      max-height: 500px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .notification-header {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      gap: 8px;
    }

    .notification-header mat-icon {
      color: #666;
    }

    .notification-header span {
      font-weight: 500;
      flex: 1;
    }

    .connection-status {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      gap: 8px;
      font-size: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .connection-status.connected {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .connection-status.disconnected {
      background: #ffebee;
      color: #c62828;
    }

    .connection-status.connecting {
      background: #fff3e0;
      color: #ef6c00;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
      padding: 8px;
    }

    .notification-card {
      margin-bottom: 8px;
      padding: 0;
    }

    .notification-card.notification-info {
      border-left: 4px solid #2196f3;
    }

    .notification-card.notification-success {
      border-left: 4px solid #4caf50;
    }

    .notification-card.notification-warning {
      border-left: 4px solid #ff9800;
    }

    .notification-card.notification-error {
      border-left: 4px solid #f44336;
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
    }

    .notification-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .notification-text {
      flex: 1;
    }

    .notification-title {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .notification-message {
      font-size: 12px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .notification-time {
      font-size: 11px;
      color: #999;
    }

    .notification-actions button {
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .notification-actions mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .no-notifications {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .no-notifications mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .no-notifications p {
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  notifications: DisplayNotification[] = [];
  connectionStatusText = 'Connecting...';
  connectionStatusClass = 'connecting';
  connectionIcon = 'sync';

  private destroy$ = new Subject<void>();

  constructor(
    private notificationDisplayService: NotificationDisplayService,
    private realTimeConnectionService: RealTimeConnectionService
  ) {}

  ngOnInit(): void {
    // Subscribe to notifications
    this.notificationDisplayService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    // Subscribe to connection status
    this.realTimeConnectionService.getStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.updateConnectionStatus(status);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeNotification(id: string): void {
    this.notificationDisplayService.remove(id);
  }

  clearAll(): void {
    this.notificationDisplayService.clear();
  }

  trackByNotificationId(index: number, notification: DisplayNotification): string {
    return notification.id;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  }

  private updateConnectionStatus(status: any): void {
    if (status.overallConnected) {
      this.connectionStatusText = 'Connected';
      this.connectionStatusClass = 'connected';
      this.connectionIcon = 'wifi';
    } else if (status.sseConnected || status.webSocketConnected) {
      this.connectionStatusText = 'Partially connected';
      this.connectionStatusClass = 'connecting';
      this.connectionIcon = 'wifi_tethering';
    } else {
      this.connectionStatusText = 'Disconnected';
      this.connectionStatusClass = 'disconnected';
      this.connectionIcon = 'wifi_off';
    }
  }
}