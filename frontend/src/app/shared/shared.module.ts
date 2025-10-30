import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';

// Real-time services
import { NotificationService } from './services/notification.service';
import { WebSocketService } from './services/websocket.service';
import { RealTimeConnectionService } from './services/realtime-connection.service';
import { NotificationDisplayService } from './services/notification-display.service';
import { RealTimeIntegrationService } from './services/realtime-integration.service';

// Components
import { NotificationPanelComponent } from './components/notification-panel/notification-panel.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatSnackBarModule,
    MatBadgeModule,
    NotificationPanelComponent
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatSnackBarModule,
    MatBadgeModule,
    NotificationPanelComponent
  ],
  providers: [
    NotificationService,
    WebSocketService,
    RealTimeConnectionService,
    NotificationDisplayService,
    RealTimeIntegrationService
  ]
})
export class SharedModule { }