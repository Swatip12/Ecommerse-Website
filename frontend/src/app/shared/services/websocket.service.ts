import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage, StompConfig, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as SockJS from 'sockjs-client';

export interface WebSocketMessage {
  destination: string;
  body: any;
  timestamp: number;
}

export interface WebSocketConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private messagesSubject = new Subject<WebSocketMessage>();
  private connectionStatusSubject = new BehaviorSubject<WebSocketConnectionStatus>({
    connected: false,
    connecting: false
  });

  private subscriptions = new Map<string, StompSubscription>();
  private readonly baseUrl = 'http://localhost:8080'; // Should be configurable
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private ngZone: NgZone) {}

  /**
   * Connect to WebSocket server
   */
  connect(token?: string): void {
    if (this.client && this.client.connected) {
      return;
    }

    this.connectionStatusSubject.next({
      connected: false,
      connecting: true
    });

    const stompConfig: StompConfig = {
      webSocketFactory: () => new SockJS(`${this.baseUrl}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (str: string) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.ngZone.run(() => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.connectionStatusSubject.next({
            connected: true,
            connecting: false
          });
          this.setupDefaultSubscriptions();
        });
      },
      onStompError: (frame) => {
        this.ngZone.run(() => {
          console.error('STOMP error:', frame);
          this.connectionStatusSubject.next({
            connected: false,
            connecting: false,
            error: frame.headers['message'] || 'Connection error'
          });
        });
      },
      onWebSocketError: (error) => {
        this.ngZone.run(() => {
          console.error('WebSocket error:', error);
          this.connectionStatusSubject.next({
            connected: false,
            connecting: false,
            error: 'WebSocket connection failed'
          });
        });
      },
      onDisconnect: () => {
        this.ngZone.run(() => {
          console.log('WebSocket disconnected');
          this.connectionStatusSubject.next({
            connected: false,
            connecting: false
          });
          this.clearSubscriptions();
        });
      }
    };

    this.client = new Client(stompConfig);
    this.client.activate();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.client) {
      this.clearSubscriptions();
      this.client.deactivate();
      this.client = null;
      this.connectionStatusSubject.next({
        connected: false,
        connecting: false
      });
    }
  }

  /**
   * Send message to server
   */
  send(destination: string, body: any, headers?: any): void {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
        headers
      });
    } else {
      console.error('WebSocket not connected. Cannot send message to:', destination);
    }
  }

  /**
   * Subscribe to a destination
   */
  subscribe(destination: string, callback: (message: any) => void): string {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected. Cannot subscribe to:', destination);
      return '';
    }

    const subscriptionId = `sub_${Date.now()}_${Math.random()}`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      this.ngZone.run(() => {
        try {
          const parsedBody = JSON.parse(message.body);
          callback(parsedBody);
          
          this.messagesSubject.next({
            destination,
            body: parsedBody,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
    });

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from a destination
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Get messages observable
   */
  getMessages(): Observable<WebSocketMessage> {
    return this.messagesSubject.asObservable();
  }

  /**
   * Get connection status observable
   */
  getConnectionStatus(): Observable<WebSocketConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connectionStatusSubject.value.connected;
  }

  /**
   * Cart synchronization methods
   */
  syncCart(cartData: any): void {
    this.send('/app/cart/sync', cartData);
  }

  addToCart(productId: number, productName: string, quantity: number, price: number): void {
    this.send('/app/cart/add', {
      productId,
      productName,
      quantity,
      price
    });
  }

  removeFromCart(productId: number, productName: string, quantity: number): void {
    this.send('/app/cart/remove', {
      productId,
      productName,
      quantity
    });
  }

  clearCart(): void {
    this.send('/app/cart/clear', {});
  }

  /**
   * Admin dashboard methods
   */
  updateAdminDashboard(type: string, data: any): void {
    this.send('/app/admin/dashboard', {
      type,
      data
    });
  }

  /**
   * Connection health check
   */
  ping(): void {
    this.send('/app/ping', {});
  }

  private setupDefaultSubscriptions(): void {
    // Subscribe to user-specific cart updates
    this.subscribe('/user/queue/cart-updates', (message) => {
      console.log('Cart update received:', message);
    });

    // Subscribe to user-specific inventory updates
    this.subscribe('/user/queue/inventory-updates', (message) => {
      console.log('Inventory update received:', message);
    });

    // Subscribe to connection status
    this.subscribe('/user/queue/connection', (message) => {
      console.log('Connection message received:', message);
    });

    // Subscribe to pong responses
    this.subscribe('/user/queue/pong', (message) => {
      console.log('Pong received:', message);
    });

    // Subscribe to system notifications
    this.subscribe('/topic/system-notifications', (message) => {
      console.log('System notification received:', message);
    });
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}