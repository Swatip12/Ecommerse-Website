import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Import shared components
import { NotificationPanelComponent } from './shared/components/notification-panel/notification-panel.component';

// Import cart components
import { CartIconComponent } from './modules/cart/components/cart-icon/cart-icon.component';

// Import services
import { AuthService } from './modules/user/services/auth.service';
import { RealtimeConnectionService } from './shared/services/realtime-connection.service';
import { NotificationService } from './shared/services/notification.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NotificationPanelComponent,
    CartIconComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private realtimeConnectionService: RealtimeConnectionService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Initialize real-time connections when app starts
    this.initializeRealtimeConnections();
    
    // Listen for authentication state changes
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/auth/login']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up real-time connections
    this.realtimeConnectionService.disconnect();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private initializeRealtimeConnections(): void {
    // Initialize WebSocket and SSE connections
    this.realtimeConnectionService.connect();
    
    // Show connection status notifications
    this.realtimeConnectionService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        if (status === 'connected') {
          this.notificationService.showSuccess('Real-time connection established');
        } else if (status === 'disconnected') {
          this.notificationService.showWarning('Real-time connection lost. Attempting to reconnect...');
        }
      });
  }
}
