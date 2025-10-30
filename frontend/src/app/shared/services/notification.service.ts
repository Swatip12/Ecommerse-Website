import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface NotificationMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private eventSource: EventSource | null = null;
  private notificationsSubject = new Subject<NotificationMessage>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>({
    connected: false,
    reconnecting: false
  });

  private readonly baseUrl = 'http://localhost:8080'; // Should be configurable
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  constructor(private ngZone: NgZone) {}

  /**
   * Connect to SSE stream for notifications
   */
  connect(userId?: string): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const url = userId 
      ? `${this.baseUrl}/api/notifications/stream?userId=${userId}`
      : `${this.baseUrl}/api/notifications/stream`;

    this.eventSource = new EventSource(url, {
      withCredentials: true
    });

    this.eventSource.onopen = () => {
      this.ngZone.run(() => {
        console.log('SSE connection opened');
        this.reconnectAttempts = 0;
        this.connectionStatusSubject.next({
          connected: true,
          reconnecting: false,
          lastConnected: new Date()
        });
      });
    };

    this.eventSource.onmessage = (event) => {
      this.ngZone.run(() => {
        try {
          const data = JSON.parse(event.data);
          this.notificationsSubject.next({
            type: 'message',
            data: data,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      });
    };

    this.eventSource.onerror = (error) => {
      this.ngZone.run(() => {
        console.error('SSE connection error:', error);
        this.connectionStatusSubject.next({
          connected: false,
          reconnecting: true
        });
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          console.error('Max reconnection attempts reached');
          this.connectionStatusSubject.next({
            connected: false,
            reconnecting: false
          });
        }
      });
    };

    // Listen for specific event types
    this.addEventListener('order_status_update');
    this.addEventListener('inventory_update');
    this.addEventListener('promotional');
    this.addEventListener('system');
    this.addEventListener('connection');
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connectionStatusSubject.next({
        connected: false,
        reconnecting: false
      });
    }
  }

  /**
   * Get notifications observable
   */
  getNotifications(): Observable<NotificationMessage> {
    return this.notificationsSubject.asObservable();
  }

  /**
   * Get connection status observable
   */
  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connectionStatusSubject.value.connected;
  }

  /**
   * Manually trigger reconnection
   */
  reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  private addEventListener(eventType: string): void {
    if (!this.eventSource) return;

    this.eventSource.addEventListener(eventType, (event: any) => {
      this.ngZone.run(() => {
        try {
          const data = JSON.parse(event.data);
          this.notificationsSubject.next({
            type: eventType,
            data: data,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error(`Error parsing ${eventType} event:`, error);
        }
      });
    });
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.connectionStatusSubject.value.connected) {
        this.connect();
      }
    }, delay);
  }
}